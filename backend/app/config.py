"""Application configuration loaded from environment variables."""
import os
from dotenv import load_dotenv

# Load .env from the backend/ directory
load_dotenv()


class Settings:
    """Centralized settings. Add new env vars here."""

    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Hot path: question gen, scoring, fast turn-by-turn (most calls)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Cold path: final feedback report (1 call, quality matters)
    GEMINI_MODEL_PRO: str = os.getenv("GEMINI_MODEL_PRO", "gemini-2.5-pro")

    # App
    APP_NAME: str = "Mock Interview Agent"
    APP_VERSION: str = "0.1.0"

    # CORS — allow our Next.js frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    def validate(self):
        """Raise if anything critical is missing."""
        if not self.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is missing. Add it to backend/.env"
            )


settings = Settings()
