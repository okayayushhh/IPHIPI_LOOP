"""Match candidate resume → live job listings via semantic embeddings.

Pipeline:
  1. Build a candidate "profile" string from resume
  2. Build per-job "profile" strings
  3. Embed both with sentence-transformers (local, free)
  4. Cosine-similarity rank
  5. LLM rationale for top-k
"""
import json
import re
from sentence_transformers import SentenceTransformer
import numpy as np
from app.models.resume import ResumeParseResult, InferredRole
from app.models.jobs import JobListing
from app.services.adzuna_client import adzuna
from app.services.gemini_client import gemini


# Lazy-load the embedding model — only on first use
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        # all-MiniLM-L6-v2: 384-dim, fast, good for short/medium texts
        # First call downloads ~80MB, then cached locally forever
        print("[job_matcher] Loading embedding model (first-time download ~80MB)...")
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        print("[job_matcher] Embedding model loaded.")
    return _model


def _candidate_profile_text(resume: ResumeParseResult, role: InferredRole) -> str:
    """Build a single string representation of the candidate for embedding."""
    skill_text = ", ".join(s.name for s in resume.skills[:15])
    exp_text = ". ".join(
        f"{e.role} at {e.organization}: {' '.join(e.bullets[:2])}"
        for e in resume.experience[:3]
    )
    proj_text = ". ".join(
        f"{p.name}: {p.blurb}"
        for p in resume.projects[:3]
    )
    return (
        f"Target role: {role.title}. "
        f"Skills: {skill_text}. "
        f"Experience: {exp_text}. "
        f"Projects: {proj_text}. "
        f"Domains: {', '.join(resume.domains)}."
    )


def _job_profile_text(job: dict) -> str:
    """Strip HTML and condense the JD into a clean embedding input."""
    title = job.get("title", "")
    company = job.get("company", {}).get("display_name", "")
    desc = job.get("description", "")
    # Strip tags + collapse whitespace
    desc = re.sub(r"<[^>]+>", " ", desc)
    desc = re.sub(r"\s+", " ", desc).strip()
    desc = desc[:600]  # truncate
    return f"{title} at {company}. {desc}"


def _format_salary(job: dict) -> str | None:
    sal_min = job.get("salary_min")
    sal_max = job.get("salary_max")
    if not sal_min and not sal_max:
        return None
    # Adzuna returns INR amounts as actual numbers (e.g. 1400000)
    if sal_min and sal_max:
        if sal_min >= 100000:
            return f"₹{sal_min/100000:.1f}–{sal_max/100000:.1f} LPA"
        return f"${int(sal_min/1000)}k–${int(sal_max/1000)}k"
    return None


def _format_age(job: dict) -> str | None:
    created = job.get("created", "")
    if not created:
        return None
    # Adzuna returns ISO 8601. We just show the date — close enough for demo.
    return created[:10]


def _build_query(role: InferredRole, resume: ResumeParseResult) -> str:
    """Build the Adzuna search query from role + top skills.

    We keep it short — Adzuna is keyword-based and long queries return nothing.
    """
    title_keyword = role.title.split("(")[0].strip()  # "Backend Engineer Intern"
    return title_keyword


async def _generate_rationale(
    candidate_profile: str,
    job_text: str,
) -> list[str]:
    """One LLM call → 2-3 short bullet reasons why this job fits."""
    prompt = f"""Given a candidate profile and a job posting, generate 2-3 short reasons (each <12 words) why this candidate should apply for this job.

Be specific. Cite skills or experience matches when possible.
Don't be generic ("good fit").
Don't lie ("perfect match" if it's not).

CANDIDATE PROFILE
{candidate_profile}

JOB POSTING
{job_text}

Return JSON only:
{{"reasons": ["reason 1", "reason 2", "reason 3"]}}"""

    try:
        raw = gemini.generate_json(prompt, temperature=0.4, max_tokens=300)
        data = json.loads(raw)
        return data.get("reasons", [])[:3]
    except Exception as e:
        print(f"[job_matcher] Rationale gen failed: {e}")
        return []


async def find_matching_jobs(
    resume: ResumeParseResult,
    role: InferredRole,
    top_k: int = 6,
) -> list[JobListing]:
    """Pull live jobs, rank by similarity, return top-k with rationale."""

    if not adzuna.is_configured:
        print("[job_matcher] Adzuna not configured — returning empty list")
        return []

    # 1. Search Adzuna
    query = _build_query(role, resume)
    location = resume.location or ""
    raw_jobs = await adzuna.search(query, location=location, results_per_page=20)

    if not raw_jobs:
        # Retry without location — broader net
        raw_jobs = await adzuna.search(query, results_per_page=20)

    if not raw_jobs:
        return []

    # 2. Embed the candidate profile
    model = _get_model()
    cand_profile = _candidate_profile_text(resume, role)
    cand_emb = model.encode(cand_profile, convert_to_numpy=True, normalize_embeddings=True)

    # 3. Embed all job texts in one batch (fast)
    job_texts = [_job_profile_text(j) for j in raw_jobs]
    job_embs = model.encode(job_texts, convert_to_numpy=True, normalize_embeddings=True)

    # 4. Cosine similarity (since we normalized, just dot product)
    similarities = job_embs @ cand_emb  # shape: (n_jobs,)

    # 5. Rank, take top-k
    top_indices = np.argsort(similarities)[::-1][:top_k]

    listings: list[JobListing] = []
    for idx in top_indices:
        job = raw_jobs[int(idx)]
        sim = float(similarities[int(idx)])
        # Convert cosine similarity (-1 to 1) to a 0-100 match score
        # Most resume↔JD similarities land in 0.3-0.8 range, so we rescale
        match_score = int(max(0, min(100, (sim - 0.2) * 130)))

        # Generate rationale (one LLM call per job — could parallelize later)
        rationale = await _generate_rationale(cand_profile, job_texts[int(idx)])

        listings.append(JobListing(
            id=str(job.get("id", "")),
            company=job.get("company", {}).get("display_name", "Unknown"),
            title=job.get("title", "Untitled"),
            location=job.get("location", {}).get("display_name", ""),
            description=re.sub(r"<[^>]+>", " ", job.get("description", ""))[:300] + "...",
            salary_text=_format_salary(job),
            url=job.get("redirect_url", ""),
            match_score=match_score,
            why_fits=rationale,
            posted_age=_format_age(job),
        ))

    return listings
