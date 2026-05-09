"""HTTP endpoint for job recommendations."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.resume import ResumeParseResult, InferredRole
from app.models.jobs import JobsResponse
from app.services.job_matcher import find_matching_jobs
from app.services.adzuna_client import adzuna


router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class JobsRequest(BaseModel):
    resume: ResumeParseResult
    target_role: InferredRole
    top_k: int = 6


@router.post("/match", response_model=JobsResponse)
async def match_jobs(req: JobsRequest):
    """Return live job listings matching the candidate's resume + target role."""
    if not adzuna.is_configured:
        raise HTTPException(
            status_code=503,
            detail="Job search not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to backend/.env",
        )

    try:
        jobs = await find_matching_jobs(req.resume, req.target_role, top_k=req.top_k)
    except Exception as e:
        print(f"[/api/jobs/match] Error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Job match error: {e}")

    if not jobs:
        return JobsResponse(jobs=[], total_found=0, sources=["adzuna"])

    return JobsResponse(
        jobs=jobs,
        total_found=len(jobs),
        sources=["adzuna"],
    )
