"""SQLite session storage. Persists across backend restarts.

This replaces the in-memory dict for completed sessions only — active
sessions still live in memory while the interview is running.
"""
import json
from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from app.models.feedback import FeedbackReport
from app.models.interview import InterviewState


DB_PATH = Path(__file__).parent.parent.parent / "loop.db"
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class StoredSession(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True)
    candidate_name = Column(String)
    target_role = Column(String)
    overall_score = Column(Integer)
    technical_score = Column(Integer)
    communication_score = Column(Integer)
    confidence_score = Column(Integer)
    engagement_score = Column(Integer)
    structure_score = Column(Integer)
    headline = Column(Text)
    questions_asked = Column(Integer)
    avg_difficulty = Column(Float)
    feedback_json = Column(Text)  # full FeedbackReport JSON
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def save_session(
    session_id: str,
    state: InterviewState,
    report: FeedbackReport,
) -> None:
    """Persist a completed session + its feedback report."""
    db = SessionLocal()
    try:
        # Build per-dimension lookup
        dim_scores = {d.name: d.score for d in report.dimensions}

        # Calculate avg difficulty
        avg_diff = (
            sum(state.difficulty_history) / len(state.difficulty_history)
            if state.difficulty_history
            else 0
        )

        # Upsert
        existing = db.query(StoredSession).filter_by(id=session_id).first()
        if existing:
            db.delete(existing)
            db.flush()

        record = StoredSession(
            id=session_id,
            candidate_name=state.resume.name or "Unknown",
            target_role=state.target_role.title,
            overall_score=report.overall_score,
            technical_score=dim_scores.get("technical", 0),
            communication_score=dim_scores.get("communication", 0),
            confidence_score=dim_scores.get("confidence", 0),
            engagement_score=dim_scores.get("engagement", 0),
            structure_score=dim_scores.get("structure", 0),
            headline=report.headline,
            questions_asked=len(state.questions),
            avg_difficulty=avg_diff,
            feedback_json=report.model_dump_json(),
            created_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
    finally:
        db.close()


def list_sessions(limit: int = 20) -> list[dict]:
    """Return recent sessions as dicts (newest first)."""
    db = SessionLocal()
    try:
        rows = (
            db.query(StoredSession)
            .order_by(StoredSession.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": r.id,
                "candidate_name": r.candidate_name,
                "target_role": r.target_role,
                "overall_score": r.overall_score,
                "technical_score": r.technical_score,
                "communication_score": r.communication_score,
                "confidence_score": r.confidence_score,
                "engagement_score": r.engagement_score,
                "structure_score": r.structure_score,
                "headline": r.headline,
                "questions_asked": r.questions_asked,
                "avg_difficulty": r.avg_difficulty,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]
    finally:
        db.close()


def get_session_full(session_id: str) -> dict | None:
    """Return full session including the stored feedback JSON."""
    db = SessionLocal()
    try:
        r = db.query(StoredSession).filter_by(id=session_id).first()
        if not r:
            return None
        return {
            "id": r.id,
            "candidate_name": r.candidate_name,
            "target_role": r.target_role,
            "overall_score": r.overall_score,
            "headline": r.headline,
            "feedback": json.loads(r.feedback_json),
            "created_at": r.created_at.isoformat(),
        }
    finally:
        db.close()
