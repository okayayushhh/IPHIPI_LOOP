"""Feedback report schemas — what the post-interview synthesizer returns."""
from pydantic import BaseModel, Field
from typing import Literal


class DimensionScore(BaseModel):
    """One axis of the 5-dimension radar chart."""
    name: str
    score: int = Field(ge=0, le=100)
    label: str = Field(description="e.g. 'Technical correctness'")
    rationale: str = Field(description="One sentence explaining the score")


class Strength(BaseModel):
    title: str = Field(description="Short label (3-6 words)")
    detail: str = Field(description="Specific evidence from the interview")


class Improvement(BaseModel):
    title: str
    detail: str
    severity: Literal["low", "med", "high"]


class StarAnalysis(BaseModel):
    """STAR breakdown of a behavioral answer."""
    question: str
    situation: float = Field(ge=0.0, le=1.0)
    task: float = Field(ge=0.0, le=1.0)
    action: float = Field(ge=0.0, le=1.0)
    result: float = Field(ge=0.0, le=1.0)
    note: str = Field(description="What was missing or strong")


class FeedbackReport(BaseModel):
    """End-of-interview synthesized report. Renders as the feedback screen."""
    overall_score: int = Field(ge=0, le=100)
    headline: str = Field(description="A single sentence summary, written to the candidate")
    summary: str = Field(description="2-3 sentences expanding on the headline")

    dimensions: list[DimensionScore] = Field(min_length=5, max_length=5)
    strengths: list[Strength] = Field(min_length=2)
    improvements: list[Improvement] = Field(min_length=2)
    star_analysis: list[StarAnalysis] = Field(default_factory=list)
    coaching_plan: list[str] = Field(
        description="3 specific actionable next steps",
        min_length=3,
        max_length=3,
    )
