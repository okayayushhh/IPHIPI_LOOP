# Loop — AI Mock Interview Agent

> The interview that knows what to ask you.

A multi-agent platform that parses your résumé, infers realistic target roles,
runs an adaptive voice-driven mock interview while continuously watching your
eye contact and posture, and ships a five-dimension feedback report with live
job recommendations.

**~60% of inference runs on-device. Free-tier APIs only. Built solo for the
IPHIPI Hackathon, May 2026.**

📐 [Architecture](docs/ARCHITECTURE.pdf) · 🎥 [Demo](docs/demo.mp4) · 📊 [Sample I/O](docs/sample_outputs/)

---

## What it does

1. **Parse résumé** — extract skills, experience, projects from PDF
2. **Infer roles** — propose 3 target roles with evidence citations
3. **Pick interviewer** — Mira (warm), Marcus (FAANG drill), or Priya (behavioural)
4. **Live voice interview** — adaptive question generation via LangGraph orchestrator
5. **Watch the candidate** — MediaPipe tracks eye contact, posture, engagement, stress
6. **Score every answer** — 3-dim scoring, difficulty adapts in real time
7. **Synthesise feedback** — 5-dim radar, STAR analysis, coaching plan
8. **Match jobs** — semantic similarity over live Adzuna postings

---

## Tech stack

**Frontend:** Next.js 15 (App Router), TypeScript, Tailwind, MediaPipe Tasks JS, Web Speech API

**Backend:** FastAPI, Python 3.13, LangGraph, sentence-transformers, SQLAlchemy + SQLite

**LLMs:** Gemini 2.5 Flash → Groq Llama 3.3 70B → Together AI (triple fallback)

**External APIs:** Adzuna (jobs)

---

## Prerequisites

- Python 3.11+ (3.13 recommended)
- Node.js 18+ and npm
- Chrome browser (Web Speech API is Chrome-only)
- Webcam + microphone with browser permissions

---

## One-time setup

### 1. Clone the repo

    git clone https://github.com/YOUR_USERNAME/loop.git
    cd loop

### 2. Backend setup

    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

(On Windows, use `venv\Scripts\activate` instead of `source venv/bin/activate`.)

### 3. Configure API keys

    cp .env.example .env

Then open `.env` in a text editor and paste your real keys. You need at minimum
a **Gemini API key** (free tier: 1000 requests/day). Optional but recommended:
Groq + Together AI as fallbacks. See `.env.example` for sign-up links.

### 4. Frontend setup

    cd ../frontend
    npm install

---

## Running the app

You need **two terminals running in parallel**.

### Terminal 1 — backend

    cd backend
    source venv/bin/activate
    uvicorn app.main:app --reload --port 8000

You should see `Uvicorn running on http://127.0.0.1:8000`.

Test it: `curl http://127.0.0.1:8000/health` should return `{"status":"ok"}`.

### Terminal 2 — frontend

    cd frontend
    npm run dev

Open `http://localhost:3000` in Chrome.

---

## Project structure

The project is split into a Python backend and a TypeScript frontend.

### Top level

| Path         | Purpose                                       |
| ------------ | --------------------------------------------- |
| `README.md`  | This file                                     |
| `.gitignore` | Files git should never track                  |
| `backend/`   | Python FastAPI service                        |
| `frontend/`  | Next.js client application                    |
| `docs/`      | Architecture document + demo + sample outputs |

### Backend (`backend/`)

| Path                                   | Purpose                                              |
| -------------------------------------- | ---------------------------------------------------- |
| `.env.example`                         | Template for API keys — copy to `.env` and fill in   |
| `requirements.txt`                     | Python dependencies                                  |
| `sample_data/sample_resume.pdf`        | Test résumé for demos                                |
| `app/main.py`                          | FastAPI application entry point                      |
| `app/config.py`                        | Environment variable loading                         |
| `app/api/resume.py`                    | Résumé upload + parse endpoints                      |
| `app/api/interview.py`                 | Interview start, answer, feedback, history endpoints |
| `app/api/jobs.py`                      | Job matching endpoint                                |
| `app/agents/question_generator.py`     | LLM agent — generates the next question              |
| `app/agents/answer_evaluator.py`       | LLM agent — scores each answer                       |
| `app/agents/orchestrator.py`           | LangGraph state machine — runs the loop              |
| `app/models/resume.py`                 | Pydantic schema for parsed résumé                    |
| `app/models/interview.py`              | Interview session state                              |
| `app/models/feedback.py`               | Final feedback report schema                         |
| `app/models/jobs.py`                   | Job match schema                                     |
| `app/models/personalities.py`          | Interviewer personality definitions                  |
| `app/services/gemini_client.py`        | LLM client with triple-provider fallback             |
| `app/services/resume_parser.py`        | PDF text extraction + LLM-driven role inference      |
| `app/services/feedback_synthesizer.py` | Cold-path feedback synthesis                         |
| `app/services/session_store.py`        | In-memory store for live sessions                    |
| `app/services/db_store.py`             | SQLite persistence for completed sessions            |
| `app/services/adzuna_client.py`        | Adzuna API wrapper                                   |
| `app/services/job_matcher.py`          | Semantic match via sentence-transformers             |

### Frontend (`frontend/`)

| Path                                                 | Purpose                                         |
| ---------------------------------------------------- | ----------------------------------------------- |
| `package.json`                                       | Node dependencies + scripts                     |
| `next.config.ts`                                     | Next.js configuration                           |
| `speech.d.ts`                                        | TypeScript types for Web Speech API             |
| `app/layout.tsx`                                     | Root layout                                     |
| `app/page.tsx`                                       | Top-level route state machine                   |
| `app/globals.css`                                    | Design system tokens + animations               |
| `app/components/Sidebar.tsx`                         | Left navigation rail                            |
| `app/components/AgentPersona.tsx`                    | Interviewer SVG avatars (Mira / Marcus / Priya) |
| `app/components/MultimodalHud.tsx`                   | Live eye-contact / posture HUD pills            |
| `app/components/hooks/useSpeech.ts`                  | Web Speech API wrapper (STT + TTS)              |
| `app/components/hooks/useMultimodal.ts`              | MediaPipe face + pose detection                 |
| `app/components/screens/LandingScreen.tsx`           | Step 01 — résumé upload                         |
| `app/components/screens/RolesScreen.tsx`             | Step 02 — pick target role                      |
| `app/components/screens/PersonalityPickerScreen.tsx` | Step 03 — pick interviewer                      |
| `app/components/screens/SetupScreen.tsx`             | Camera + mic permission check                   |
| `app/components/screens/InterviewScreen.tsx`         | Step 04 — live interview                        |
| `app/components/screens/FeedbackScreen.tsx`          | Step 05 — feedback report                       |
| `app/components/screens/JobsScreen.tsx`              | Step 06 — job recommendations                   |
| `app/components/screens/HistoryScreen.tsx`           | Step 07 — past sessions                         |

### Documentation (`docs/`)

| Path               | Purpose                           |
| ------------------ | --------------------------------- |
| `ARCHITECTURE.pdf` | Six-page architecture document    |
| `ARCHITECTURE.tex` | LaTeX source                      |
| `demo.mp4`         | Three-minute platform walkthrough |
| `sample_outputs/`  | Real API outputs from a demo run  |

---

## How the agents interact

The system runs a cyclic state machine. After the candidate uploads a résumé
and picks a role, the orchestrator alternates between three nodes:

**Phase 1 — Parsing (one-shot, before interview)**

The candidate uploads a PDF. The résumé parser extracts text, calls Gemini in
JSON mode, and returns a structured profile: skills, experience, projects,
plus three candidate roles ranked by fit with evidence citations.

**Phase 2 — The interview loop (cyclic, while interview is active)**

The LangGraph orchestrator runs three nodes in sequence, then a router decides
whether to terminate or loop:

1. **generate_q** — Question generator agent reads current session state
   (difficulty, previous answers, topics covered, personality directive)
   and calls the LLM for the next question.
2. **await_answer** — Candidate records their answer by voice. Web Speech API
   transcribes in the browser. Meanwhile, MediaPipe tracks the candidate's
   eye contact, posture, engagement, and stress.
3. **score_a** — Answer evaluator agent scores the transcript on correctness,
   depth, and structure.
4. **adapt_router** — Conditional edge. If the answer scored below 0.4,
   reduce difficulty and flag the next question for encouragement. If above
   0.8, raise difficulty. Otherwise hold. Then either loop back to step 1
   or terminate.

**Phase 3 — Synthesis (one-shot, after interview)**

The feedback synthesiser receives the full transcript, the per-answer scores,
and the multimodal averages, then makes one LLM call to produce the final
five-dimension report with STAR analysis and coaching plan.

**Phase 4 — Job matching (one-shot, after feedback)**

The job matcher hits the Adzuna API for postings matching the inferred role,
computes semantic similarity between each posting and the candidate's
résumé using sentence-transformers, then calls the LLM for a one-sentence
rationale per top match.

Full architecture document with diagrams: [`docs/ARCHITECTURE.pdf`](docs/ARCHITECTURE.pdf).

---

## Sample inputs and outputs

For quick evaluation, `docs/sample_outputs/` contains real outputs from
running this code on `backend/sample_data/sample_resume.pdf`:

| File                                | Endpoint                            | Shows                                       |
| ----------------------------------- | ----------------------------------- | ------------------------------------------- |
| `01_resume_parse_output.json`       | `POST /api/resume/parse`            | Extracted skills, projects, candidate roles |
| `02_interview_start_output.json`    | `POST /api/interview/start`         | Initial session state + first question      |
| `03_interview_answer_output.json`   | `POST /api/interview/answer`        | Scored answer + next question               |
| `04_feedback_synthesis_output.json` | `POST /api/interview/{id}/feedback` | Final 5-dim report + STAR + coaching plan   |

LLM responses are non-deterministic. If you run the platform yourself against
the same résumé, you'll get _similar_ outputs, but exact scores and phrasings
will vary by run.

---

## API endpoints

All under `http://127.0.0.1:8000/api/`:

| Endpoint                   | Method | Purpose                                             |
| -------------------------- | ------ | --------------------------------------------------- |
| `/resume/parse`            | POST   | Upload PDF, get structured résumé + role candidates |
| `/interview/personalities` | GET    | List interviewer personalities                      |
| `/interview/start`         | POST   | Begin a session, get first question                 |
| `/interview/answer`        | POST   | Submit answer, get next question                    |
| `/interview/{id}/feedback` | POST   | Synthesise the final report                         |
| `/interview/history`       | GET    | List past sessions                                  |
| `/interview/history/{id}`  | GET    | Get one past session's full report                  |
| `/jobs/match`              | POST   | Get ranked job matches                              |
| `/health`                  | GET    | Backend liveness check                              |

Interactive API docs: `http://127.0.0.1:8000/docs` (FastAPI auto-generated).

---

## Known limitations

- Computer-vision scoring is heuristic, not learned. Accuracy degrades in poor lighting.
- English prompts only (Web Speech API supports more languages, prompts don't).
- Résumé PDFs must be text-extractable (no OCR yet).
- Live session state is in-memory; only completed sessions persist to SQLite.

See [`docs/ARCHITECTURE.pdf`](docs/ARCHITECTURE.pdf) §6 for full limitations and roadmap.

---

## Author

Built solo by **Ayush** for the IPHIPI Hackathon, May 2026.
