"""Interview session state — flows through the LangGraph orchestrator."""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from app.models.resume import ResumeParseResult, InferredRole


# ─── Question + answer types ────────────────────────────────
class Question(BaseModel):
    """A single question the agent asks."""
    id: str
    text: str
    topic: str = Field(description="e.g. 'systems-design', 'behavioral', 'project-deepdive'")
    difficulty: int = Field(ge=1, le=5, description="1=easy, 5=hard")
    intent: Literal["warmup", "technical", "system-design", "behavioral", "probe-gap"] = "technical"
    asked_at: datetime = Field(default_factory=datetime.utcnow)


class AnswerScore(BaseModel):
    """The evaluator's verdict on a single answer."""
    correctness: float = Field(ge=0.0, le=1.0)
    depth: float = Field(ge=0.0, le=1.0)
    structure: float = Field(ge=0.0, le=1.0)
    overall: float = Field(ge=0.0, le=1.0)
    rationale: str = Field(description="1-2 sentence explanation of the score")
    keywords_hit: list[str] = Field(default_factory=list)


class Answer(BaseModel):
    """The candidate's answer to a question."""
    question_id: str
    text: str
    answered_at: datetime = Field(default_factory=datetime.utcnow)
    score: Optional[AnswerScore] = None


# ─── Orchestrator state ─────────────────────────────────────
class InterviewState(BaseModel):
    """Everything the LangGraph orchestrator passes between nodes."""

    # Session identity
    session_id: str
    started_at: datetime = Field(default_factory=datetime.utcnow)

    # Inputs (set once at start)
    resume: ResumeParseResult
    target_role: InferredRole
    max_questions: int = 8

    # Interview history
    questions: list[Question] = Field(default_factory=list)
    answers: list[Answer] = Field(default_factory=list)

    # Live agent decisions
    current_difficulty: int = Field(default=2, ge=1, le=5)
    topics_covered: list[str] = Field(default_factory=list)
    weak_spots_probed: list[str] = Field(default_factory=list)

    # Running averages (the adaptive signal)
    technical_running_avg: float = Field(default=0.0, ge=0.0, le=1.0)
    confidence_running_avg: float = Field(default=0.7, ge=0.0, le=1.0)

    # Status
    status: Literal["active", "paused", "completed"] = "active"
    last_decision: Optional[str] = Field(
        default=None,
        description="Why the orchestrator chose its last action — for explainability",
    )

    # Adaptive flags
    needs_encouragement: bool = Field(
        default=False,
        description="Set after a low-scoring answer so the next question opens with a softer tone.",
    )
    difficulty_history: list[int] = Field(
        default_factory=list,
        description="Difficulty level used for each question asked, in order — for the frontend sparkline.",
    )
