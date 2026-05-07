"""Pydantic schemas for parsed resume data."""
from pydantic import BaseModel, Field
from typing import Optional


class Skill(BaseModel):
    name: str = Field(description="Name of the skill")
    level: float = Field(
        ge=0.0, le=1.0,
        description="Estimated proficiency 0.0–1.0 based on resume evidence"
    )


class Experience(BaseModel):
    role: str
    organization: str
    period: str = Field(description="e.g. 'May–Aug 2025' or 'Jan 2024–Present'")
    bullets: list[str] = Field(default_factory=list)


class Project(BaseModel):
    name: str
    blurb: str
    tags: list[str] = Field(default_factory=list)


class Education(BaseModel):
    school: str
    degree: str
    period: str
    gpa: Optional[str] = None


class InferredRole(BaseModel):
    """A role we believe this candidate could realistically land."""
    id: str = Field(description="kebab-case id e.g. 'backend', 'data-engineer'")
    title: str = Field(description="Display title e.g. 'Backend Engineer (New-grad)'")
    fit: float = Field(ge=0.0, le=1.0, description="How well the resume matches")
    why: list[str] = Field(description="3 reasons from the resume that justify this role")
    gaps: list[str] = Field(description="3 areas to probe in the interview")


class ResumeParseResult(BaseModel):
    """Complete parsed resume + role inference."""
    # Identity
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: str = Field(description="2-line professional summary")

    # Content
    skills: list[Skill] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)

    # Signals
    seniority: str = Field(description="e.g. 'Entry / New-grad', 'Mid', 'Senior'")
    domains: list[str] = Field(description="e.g. ['Backend', 'Data', 'Cloud']")
    years_of_experience: float = Field(ge=0.0)

    # Inferred roles (the agentic part)
    inferred_roles: list[InferredRole] = Field(
        description="Top 3 roles this candidate could realistically land"
    )
