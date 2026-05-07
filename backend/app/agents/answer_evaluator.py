"""Scores a candidate's answer on multiple dimensions."""
import json
from app.services.gemini_client import gemini
from app.models.interview import Question, Answer, AnswerScore


def _build_prompt(question: Question, answer_text: str) -> str:
    return f"""You are a strict but fair technical interview evaluator.

QUESTION (intent={question.intent}, difficulty={question.difficulty}/5):
{question.text}

CANDIDATE'S ANSWER:
{answer_text}

EVALUATE the answer on three dimensions, each 0.0–1.0:
1. correctness — Is the answer technically right? (For behavioral, is it a real specific story?)
2. depth — Does it go beyond surface-level? Mentions tradeoffs, edge cases, why-not-this?
3. structure — Is it organized? STAR for behavioral, clear progression for technical?

Then compute overall = weighted average:
- For technical/system-design: 0.5*correctness + 0.3*depth + 0.2*structure
- For behavioral/warmup: 0.3*correctness + 0.3*depth + 0.4*structure

Also extract keywords_hit: technical terms or concepts the candidate mentioned correctly.

Be honest. A vague answer scores ~0.4, a strong answer scores ~0.8, exceptional ~0.95.
Don't inflate scores to be encouraging — the candidate needs accurate feedback.

Return JSON only:
{{
  "correctness": 0.0-1.0,
  "depth": 0.0-1.0,
  "structure": 0.0-1.0,
  "overall": 0.0-1.0,
  "rationale": "one sentence explaining the score, citing what was good/missing",
  "keywords_hit": ["term1", "term2"]
}}"""


def evaluate_answer(question: Question, answer_text: str) -> AnswerScore:
    """Score a single answer."""
    prompt = _build_prompt(question, answer_text)
    raw = gemini.generate_json(prompt, temperature=0.3, max_tokens=400)
    data = json.loads(raw)
    return AnswerScore(**data)
