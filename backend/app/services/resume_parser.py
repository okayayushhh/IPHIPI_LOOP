"""Parse resumes: PDF → text → structured candidate data via Gemini."""
import io
import json
import re
import fitz  # pymupdf
from app.services.gemini_client import gemini
from app.models.resume import ResumeParseResult


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF byte stream."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()
    return "\n".join(text_parts).strip()


def _build_extraction_prompt(resume_text: str) -> str:
    """Build the Gemini prompt for structured resume extraction."""
    return f"""You are an expert technical recruiter and career coach. Analyze the resume below and extract structured information AND infer the 3 most realistic job roles this candidate could land RIGHT NOW.

Return ONLY valid JSON matching this exact schema. No markdown, no commentary, no code fences.

{{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "2-line professional summary in your own words",
  "skills": [
    {{"name": "string", "level": 0.0-1.0}}
  ],
  "experience": [
    {{
      "role": "string",
      "organization": "string",
      "period": "string e.g. 'May-Aug 2025'",
      "bullets": ["string"]
    }}
  ],
  "projects": [
    {{"name": "string", "blurb": "string", "tags": ["string"]}}
  ],
  "education": [
    {{"school": "string", "degree": "string", "period": "string", "gpa": "string or null"}}
  ],
  "seniority": "Entry / New-grad | Mid | Senior",
  "domains": ["Backend", "Data", "etc"],
  "years_of_experience": 0.0,
  "inferred_roles": [
    {{
      "id": "kebab-case-id",
      "title": "Display Title (Seniority)",
      "fit": 0.0-1.0,
      "why": ["3 specific evidence-based reasons from the resume"],
      "gaps": ["3 areas to probe in interview where resume is thin"]
    }}
  ]
}}

CRITICAL RULES:
1. Skill levels: 0.9+ for skills with multiple production-shipped projects, 0.6-0.8 for solid work usage, 0.4-0.6 for academic/light usage, <0.4 for mentioned only.
2. Inferred roles must be REALISTIC for the candidate's current level — don't suggest "Senior X" for a new-grad.
3. Each "why" reason must cite specific evidence from the resume (project name, internship, metric).
4. Each "gap" must be something a real interviewer would actually probe for that role.
5. Order inferred_roles by fit score descending. Return exactly 3.
6. If the resume is sparse, lower the fit scores — don't inflate.
7. years_of_experience: count only professional/internship time, not coursework. Convert months to fractional years (e.g. 8 months = 0.67).

RESUME TEXT:
---
{resume_text}
---

Return only the JSON object."""


def _strip_code_fences(text: str) -> str:
    """Remove markdown code fences if Gemini wrapped JSON in them despite instructions."""
    text = text.strip()
    # Strip ```json ... ``` or ``` ... ```
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def parse_resume_pdf(pdf_bytes: bytes) -> ResumeParseResult:
    """Full pipeline: PDF bytes → ResumeParseResult."""
    # Step 1: extract text
    resume_text = extract_text_from_pdf(pdf_bytes)
    if len(resume_text) < 50:
        raise ValueError("PDF appears empty or unreadable. Is it a scanned image?")

    # Step 2: send to Gemini with structured prompt
    prompt = _build_extraction_prompt(resume_text)
    raw_response = gemini.generate_json(prompt, temperature=0.3, max_tokens=8192)

    # Step 3: clean and parse JSON
    cleaned = _strip_code_fences(raw_response)
    try:
        parsed_dict = json.loads(cleaned)
    except json.JSONDecodeError as e:
        # Log the bad response for debugging
        print(f"[resume_parser] JSON parse failed. Raw response:\n{cleaned[:500]}")
        raise ValueError(f"Gemini returned invalid JSON: {e}")

    # Step 4: validate against our Pydantic schema
    result = ResumeParseResult(**parsed_dict)
    return result
