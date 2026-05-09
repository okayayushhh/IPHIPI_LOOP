"""Thin wrapper around Adzuna's job search API.

Free tier: 250 calls/day. Plenty for the hackathon.
Docs: https://developer.adzuna.com/docs
"""
import httpx
from app.config import settings


class AdzunaClient:
    """Search jobs from Adzuna by query string + location."""

    def __init__(self):
        self.app_id = settings.ADZUNA_APP_ID
        self.app_key = settings.ADZUNA_APP_KEY
        self.country = settings.JOB_COUNTRY

    @property
    def is_configured(self) -> bool:
        return bool(self.app_id and self.app_key)

    async def search(
        self,
        query: str,
        location: str = "",
        results_per_page: int = 20,
        page: int = 1,
    ) -> list[dict]:
        """Returns raw Adzuna result list. Empty list on failure or missing config."""
        if not self.is_configured:
            print("[Adzuna] Skipping — credentials not configured")
            return []

        url = f"https://api.adzuna.com/v1/api/jobs/{self.country}/search/{page}"
        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "results_per_page": results_per_page,
            "what": query,
            "content-type": "application/json",
        }
        if location:
            params["where"] = location

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                return data.get("results", [])
        except Exception as e:
            print(f"[Adzuna] Error: {type(e).__name__}: {e}")
            return []


adzuna = AdzunaClient()
