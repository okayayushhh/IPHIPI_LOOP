"""FastAPI entry point for the Mock Interview Agent backend."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.gemini_client import gemini
from app.api.resume import router as resume_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Allow Next.js frontend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resume_router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "alive",
    }


@app.get("/health")
def health():
    """Quick health check + verifies Gemini works."""
    try:
        reply = gemini.generate("Say 'pong' and nothing else.", temperature=0.0)
        return {"status": "healthy", "gemini": reply}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
