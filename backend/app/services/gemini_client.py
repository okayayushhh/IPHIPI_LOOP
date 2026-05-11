"""Thin wrapper around Google Gemini API with hot/cold model tiers."""
import google.generativeai as genai
import httpx
from app.config import settings


class GeminiClient:
    """Single source of truth for talking to Gemini.

    Hot path (default `generate`): fast Flash model for high-frequency calls.
    Cold path (`generate_pro`): Pro model for high-stakes single calls.
    """

    def __init__(self):
        settings.validate()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._flash = genai.GenerativeModel(settings.GEMINI_MODEL)
        self._pro = genai.GenerativeModel(settings.GEMINI_MODEL_PRO)

    def generate(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        ) -> str:
        """Fast path — use for question gen, per-turn scoring, etc."""
        response = self._flash.generate_content(
            prompt,
                generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            },
        )
        return response.text.strip()

    def generate_pro(self, prompt: str, temperature: float = 0.5) -> str:
        """Quality path — use for final feedback report only."""
        response = self._pro.generate_content(
            prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": 4096,
            },
        )
        return response.text.strip()

    def generate_json(
        self,
        prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 8192,
    ) -> str:
        """JSON-mode generation — Gemini guarantees valid JSON output.

        Use this for any structured extraction task.
        """
        response = self._flash.generate_content(
            prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
                "response_mime_type": "application/json",
            },
        )
        return response.text.strip()


# Singleton — import this everywhere
gemini = GeminiClient()
