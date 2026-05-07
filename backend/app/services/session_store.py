"""In-memory session storage. Replace with SQLite for persistence."""
from app.models.interview import InterviewState


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, InterviewState] = {}

    def save(self, state: InterviewState) -> None:
        self._sessions[state.session_id] = state

    def get(self, session_id: str) -> InterviewState | None:
        return self._sessions.get(session_id)

    def all_ids(self) -> list[str]:
        return list(self._sessions.keys())


# Singleton
sessions = SessionStore()
