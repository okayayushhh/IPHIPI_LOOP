"""HTTP endpoints for resume parsing."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_parser import parse_resume_pdf
from app.models.resume import ResumeParseResult

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/parse", response_model=ResumeParseResult)
async def parse_resume(file: UploadFile = File(...)) -> ResumeParseResult:
    """Upload a PDF resume, get back structured candidate data + inferred roles."""

    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Validate size (5 MB max)
    pdf_bytes = await file.read()
    if len(pdf_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB.")
    if len(pdf_bytes) < 100:
        raise HTTPException(status_code=400, detail="File appears to be empty.")

    # Parse
    try:
        result = parse_resume_pdf(pdf_bytes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Surface unexpected errors clearly during dev
        print(f"[/api/resume/parse] Unexpected error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Parser error: {str(e)}")
