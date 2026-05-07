"""LangGraph orchestrator — the adaptive interview brain.

Flow:
    [generate_question] → [wait_for_answer] → [evaluate_and_route] → ...

The interesting node is `evaluate_and_route`: it scores the answer, updates running
averages, decides whether to ramp difficulty up/down, and either generates the next
question or ends the interview.
"""
from langgraph.graph import StateGraph, END
from app.models.interview import InterviewState, Answer
from app.agents.question_generator import generate_question
from app.agents.answer_evaluator import evaluate_answer


# ─── Node implementations ────────────────────────────────────
def node_generate_question(state: InterviewState) -> dict:
    """Generate the next question and append it to state."""
    question = generate_question(state)
    return {
        "questions": state.questions + [question],
        "topics_covered": state.topics_covered + [question.topic]
        if question.topic not in state.topics_covered
        else state.topics_covered,
    }


def node_wait_for_answer(state: InterviewState) -> dict:
    """No-op pass-through. Real answer comes in via API call between turns.

    In a streaming setup this would block on user input. In our request/response
    architecture, the API caller invokes the graph again with the answer attached.
    """
    return {}


def node_evaluate_and_route(state: InterviewState) -> dict:
    """The adaptive brain.

    Scores the latest answer, updates running averages, decides difficulty change.
    """
    if not state.answers:
        # Shouldn't happen, but defensive
        return {"last_decision": "no answer to evaluate, holding"}

    last_q = state.questions[-1]
    last_a = state.answers[-1]

    # Step 1: score the answer if not already scored
    if last_a.score is None:
        score = evaluate_answer(last_q, last_a.text)
        # Mutate the answer in-place (Pydantic-safe via dict)
        scored_answer = last_a.model_copy(update={"score": score})
        new_answers = state.answers[:-1] + [scored_answer]
    else:
        score = last_a.score
        new_answers = state.answers

    # Step 2: update running averages
    all_scores = [a.score.overall for a in new_answers if a.score]
    new_tech_avg = sum(all_scores) / len(all_scores) if all_scores else 0.0

    # Step 3: adaptive difficulty decision
    new_difficulty = state.current_difficulty
    decision_reason = ""

    if score.overall < 0.4 and state.current_difficulty > 1:
        new_difficulty = max(1, state.current_difficulty - 1)
        decision_reason = (
            f"Candidate scored {score.overall:.2f} on '{last_q.topic}' (struggled). "
            f"Dropping difficulty {state.current_difficulty}→{new_difficulty} and "
            f"shifting to fundamentals."
        )
    elif score.overall > 0.8 and state.current_difficulty < 5:
        new_difficulty = min(5, state.current_difficulty + 1)
        decision_reason = (
            f"Candidate scored {score.overall:.2f} on '{last_q.topic}' (strong). "
            f"Ramping difficulty {state.current_difficulty}→{new_difficulty}."
        )
    else:
        decision_reason = (
            f"Candidate scored {score.overall:.2f} on '{last_q.topic}'. "
            f"Holding difficulty at {state.current_difficulty}."
        )

    return {
        "answers": new_answers,
        "current_difficulty": new_difficulty,
        "technical_running_avg": new_tech_avg,
        "last_decision": decision_reason,
    }


def route_after_eval(state: InterviewState) -> str:
    """Conditional edge: should we ask another question or end?"""
    if len(state.questions) >= state.max_questions:
        return "end"
    if state.status == "completed":
        return "end"
    return "next_question"


# ─── Graph assembly ─────────────────────────────────────────
def build_interview_graph():
    """Wire up the LangGraph state machine."""
    graph = StateGraph(InterviewState)

    graph.add_node("generate_question", node_generate_question)
    graph.add_node("wait_for_answer", node_wait_for_answer)
    graph.add_node("evaluate_and_route", node_evaluate_and_route)

    graph.set_entry_point("generate_question")
    graph.add_edge("generate_question", "wait_for_answer")
    graph.add_edge("wait_for_answer", "evaluate_and_route")
    graph.add_conditional_edges(
        "evaluate_and_route",
        route_after_eval,
        {
            "next_question": "generate_question",
            "end": END,
        },
    )

    return graph.compile()


# Singleton compiled graph
INTERVIEW_GRAPH = build_interview_graph()
