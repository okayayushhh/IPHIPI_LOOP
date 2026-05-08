"""HTTP endpoints for running an adaptive interview."""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.interview import InterviewState, Answer
from app.models.resume import ResumeParseResult, InferredRole
from app.services.session_store import sessions
from app.agents.question_generator import generate_question
from app.agents.answer_evaluator import evaluate_answer
from app.services.feedback_synthesizer import synthesize_feedback
from app.models.feedback import FeedbackReport


router = APIRouter(prefix="/api/interview", tags=["interview"])


# ─── Request/response shapes ─────────────────────────────────
class StartSessionRequest(BaseModel):
    resume: ResumeParseResult
    target_role: InferredRole
    max_questions: int = 6  # tighter default for hackathon demos


class StartSessionResponse(BaseModel):
    session_id: str
    first_question: dict
    state_summary: dict


class SubmitAnswerRequest(BaseModel):
    session_id: str
    answer_text: str


class SubmitAnswerResponse(BaseModel):
    score: dict
    next_question: dict | None
    last_decision: str
    state_summary: dict
    is_complete: bool


def _state_summary(state: InterviewState) -> dict:
    """Lightweight snapshot for the frontend HUD."""
    return {
        "session_id": state.session_id,
        "questions_asked": len(state.questions),
        "max_questions": state.max_questions,
        "current_difficulty": state.current_difficulty,
        "technical_running_avg": round(state.technical_running_avg, 2),
        "topics_covered": state.topics_covered,
        "last_decision": state.last_decision,
        "status": state.status,
    }


# ─── Endpoints ──────────────────────────────────────────────
@router.post("/start", response_model=StartSessionResponse)
async def start_session(req: StartSessionRequest):
    """Kick off a new interview, get the first question."""
    session_id = str(uuid.uuid4())[:8]

    state = InterviewState(
        session_id=session_id,
        resume=req.resume,
        target_role=req.target_role,
        max_questions=req.max_questions,
        last_decision="Session started — generating warmup question.",
    )

    # Generate first question
    try:
        first_q = generate_question(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question gen failed: {e}")

    state.questions.append(first_q)
    state.topics_covered.append(first_q.topic)
    sessions.save(state)

    return StartSessionResponse(
        session_id=session_id,
        first_question=first_q.model_dump(mode="json"),
        state_summary=_state_summary(state),
    )


@router.post("/answer", response_model=SubmitAnswerResponse)
async def submit_answer(req: SubmitAnswerRequest):
    """Submit an answer, get scored, get the next question (or end)."""
    state = sessions.get(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    if not state.questions:
        raise HTTPException(status_code=400, detail="No active question")

    last_q = state.questions[-1]

    # Score the answer
    try:
        score = evaluate_answer(last_q, req.answer_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eval failed: {e}")

    # Append answer
    state.answers.append(Answer(
        question_id=last_q.id,
        text=req.answer_text,
        score=score,
    ))

    # Update running average
    all_scores = [a.score.overall for a in state.answers if a.score]
    state.technical_running_avg = sum(all_scores) / len(all_scores)

    # Adaptive difficulty (the agentic decision)
    if score.overall < 0.4 and state.current_difficulty > 1:
        new_diff = max(1, state.current_difficulty - 1)
        state.last_decision = (
            f"Scored {score.overall:.2f} on '{last_q.topic}' — struggled. "
            f"Dropping difficulty {state.current_difficulty}→{new_diff}, shifting to fundamentals."
        )
        state.current_difficulty = new_diff
    elif score.overall > 0.8 and state.current_difficulty < 5:
        new_diff = min(5, state.current_difficulty + 1)
        state.last_decision = (
            f"Scored {score.overall:.2f} on '{last_q.topic}' — strong. "
            f"Ramping difficulty {state.current_difficulty}→{new_diff}."
        )
        state.current_difficulty = new_diff
    else:
        state.last_decision = (
            f"Scored {score.overall:.2f}. Holding difficulty at {state.current_difficulty}."
        )

    # End or continue?
    is_complete = len(state.questions) >= state.max_questions
    next_q = None

    if not is_complete:
        try:
            nq = generate_question(state)
            state.questions.append(nq)
            if nq.topic not in state.topics_covered:
                state.topics_covered.append(nq.topic)
            next_q = nq.model_dump(mode="json")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Next-Q gen failed: {e}")
    else:
        state.status = "completed"

    sessions.save(state)

    return SubmitAnswerResponse(
        score=score.model_dump(mode="json"),
        next_question=next_q,
        last_decision=state.last_decision,
        state_summary=_state_summary(state),
        is_complete=is_complete,
    )


@router.get("/{session_id}")
async def get_session(session_id: str):
    """Fetch full session state — for feedback report later."""
    state = sessions.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    return state.model_dump(mode="json")

class MultimodalAvgsRequest(BaseModel):
    eye_contact: float = 0.7
    posture: float = 0.7
    engagement: float = 0.7
    stress: float = 0.3


@router.post("/{session_id}/feedback", response_model=FeedbackReport)
async def get_feedback(session_id: str, multimodal: MultimodalAvgsRequest | None = None):
    """Synthesize the feedback report for a completed (or paused) session."""
    state = sessions.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    if not state.answers:
        raise HTTPException(
            status_code=400,
            detail="No answers in this session yet — answer at least one question first.",
        )

    multimodal_dict = (
        multimodal.model_dump() if multimodal else None
    )

    try:
        report = synthesize_feedback(state, multimodal_dict)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"[/feedback] Error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Synthesis error: {e}")

    # Mark session complete
    state.status = "completed"
    sessions.save(state)

    return report
