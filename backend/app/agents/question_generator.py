"""Generates the next interview question based on session state."""
import json
import random
import uuid
from app.services.gemini_client import gemini
from app.models.interview import InterviewState, Question
from app.models.personalities import PersonalityId, PERSONALITIES


ENCOURAGEMENT_PREFIXES = [
    "No worries — let's try a different angle. ",
    "That's a tough one. Let me ask something more grounded — ",
    "Totally fine. Let's pivot to something you might find easier — ",
    "Take a breath. Here's a different question — ",
]

# Marcus stays cold — no validation, just a curt redirect.
MARCUS_HARDER_PROBE_PREFIX = "Let me dig into the basics — "


QUESTION_INTENT_GUIDE = {
    1: "warmup",   # first question always warmup
    2: "technical",
    3: "technical",
    4: "probe-gap",
    5: "technical",
    6: "system-design",
    7: "behavioral",
    8: "behavioral",
}


def _build_prompt(state: InterviewState) -> str:
    """Construct a prompt that gives Gemini all the context it needs."""

    personality = PERSONALITIES[state.personality]
    n = len(state.questions)
    intent = QUESTION_INTENT_GUIDE.get(n + 1, "technical")

    # Last 3 turns of history (keep prompt size sane)
    history_lines = []
    for q, a in zip(state.questions[-3:], state.answers[-3:]):
        history_lines.append(f"Q: {q.text}")
        history_lines.append(f"A: {a.text}")
        if a.score:
            history_lines.append(f"(scored {a.score.overall:.2f}: {a.score.rationale})")
    history_str = "\n".join(history_lines) or "[interview just started]"

    skills_str = ", ".join(s.name for s in state.resume.skills[:10])
    gaps_str = ", ".join(state.target_role.gaps)
    why_str = " · ".join(state.target_role.why[:2])

    return f"""{personality.tone_directive}

You are running a mock interview in this persona. Stay in character.

CANDIDATE
- Name: {state.resume.name}
- Seniority: {state.resume.seniority}
- Top skills: {skills_str}
- Resume highlights: {why_str}

TARGET ROLE
- {state.target_role.title}
- Areas to probe (from resume gaps): {gaps_str}

SESSION SO FAR
- Question {n + 1} of max {state.max_questions}
- Current difficulty: {state.current_difficulty}/5
- Running technical score: {state.technical_running_avg:.2f}
- Topics covered: {', '.join(state.topics_covered) or 'none yet'}
- Last decision rationale: {state.last_decision or 'first question'}

RECENT EXCHANGE
{history_str}

YOUR TASK
Generate the NEXT question following these rules:
1. Intent for this question: "{intent}"
2. Difficulty must match current_difficulty={state.current_difficulty} (1=basic concepts, 3=intermediate, 5=senior-level depth)
3. If "probe-gap": pick an UNCOVERED gap from the target role and probe it
4. If "system-design": ask a small scoped design question, not a full architecture
5. If "behavioral": use STAR-prompting language ("tell me about a time…")
6. Reference specific projects/work from the resume when natural — show you read it
7. Keep the question to 1-2 sentences. No preamble.

Return JSON only:
{{
  "text": "the question",
  "topic": "short kebab-case topic (e.g. 'redis-internals', 'multi-region-design')",
  "intent": "{intent}"
}}"""


def generate_question(state: InterviewState) -> Question:
    """Generate the next question for this interview state."""
    prompt = _build_prompt(state)
    raw = gemini.generate_json(prompt, temperature=0.7, max_tokens=500)
    data = json.loads(raw)

    text = data["text"]
    if state.needs_encouragement and text:
        if state.personality == PersonalityId.MARCUS:
            # Marcus never softens — uses a cold redirect instead.
            prefix = MARCUS_HARDER_PROBE_PREFIX
        else:
            prefix = random.choice(ENCOURAGEMENT_PREFIXES)
        text = prefix + text[0].lower() + text[1:]
        # Consume the flag so the prefix doesn't repeat unless the next score is also low.
        state.needs_encouragement = False

    return Question(
        id=str(uuid.uuid4())[:8],
        text=text,
        topic=data.get("topic", "general"),
        difficulty=state.current_difficulty,
        intent=data.get("intent", "technical"),
    )
