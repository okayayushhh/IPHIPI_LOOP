"use client";

import { useState } from "react";
import { Sidebar, type Route } from "./components/Sidebar";
import { BackendStatus } from "./components/BackendStatus";
import { LandingScreen, type ParseResult } from "./components/screens/LandingScreen";
import { RolesScreen } from "./components/screens/RolesScreen";
import { PersonalityPickerScreen } from "./components/screens/PersonalityPickerScreen";
import { InterviewScreen } from "./components/screens/InterviewScreen";
import { FeedbackScreen } from "./components/screens/FeedbackScreen";
import type { MultimodalAvgs } from "./components/screens/InterviewScreen";
import { JobsScreen } from "./components/screens/JobsScreen";
import { HistoryScreen } from "./components/screens/HistoryScreen";

type InferredRole = ParseResult["inferred_roles"][number];

type StateSummary = {
  session_id: string;
  questions_asked: number;
  max_questions: number;
  current_difficulty: number;
  technical_running_avg: number;
  topics_covered: string[];
  last_decision: string | null;
  status: string;
  difficulty_history: number[];
};

export default function Home() {
  const [route, setRoute] = useState<Route>("landing");
  const [resume, setResume] = useState<ParseResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<InferredRole | null>(null);
  const [personality, setPersonality] = useState<"mira" | "marcus" | "priya">("mira");

  // Interview session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<StateSummary | null>(null);
  const [multimodalAvgs, setMultimodalAvgs] = useState<MultimodalAvgs>({
    eye_contact: 0.7,
    posture: 0.7,
    engagement: 0.7,
    stress: 0.3,
    filler_words_per_answer: 0,
    avg_words_per_answer: 0,
    avg_words_per_minute: 130,
  });
  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} userName={resume?.name} />
      <main style={{ minWidth: 0, background: "var(--bg)", position: "relative" }}>
        {route === "landing" && (
          <LandingScreen setRoute={setRoute} setResume={setResume} />
        )}
        {route === "roles" && resume && (
          <RolesScreen resume={resume} setRoute={setRoute} onRoleSelected={setSelectedRole} />
        )}
        {route === "roles" && !resume && (
  <PlaceholderScreen
    title="Drop your résumé first"
    num="02"
    sub="We need to see what's on your résumé before we can suggest target roles to interview for. Click 01 Upload to start."
  />
)}
        {route === "personality" && (
          <PersonalityPickerScreen
            role={selectedRole}
            setRoute={setRoute}
            onPersonalitySelected={(id) =>
              setPersonality(id as "mira" | "marcus" | "priya")
            }
          />
        )}
        {route === "setup" && (
          <SetupScreen
            resume={resume}
            role={selectedRole}
            personality={personality}
            setRoute={setRoute}
            onSessionReady={(sid, q, st) => {
              setSessionId(sid);
              setFirstQuestion(q);
              setInitialState(st);
            }}
          />
        )}
        {route === "interview" && sessionId && firstQuestion && initialState && (
          <InterviewScreen
            sessionId={sessionId}
            initialQuestion={firstQuestion}
            initialState={initialState}
            personality={personality}
            setRoute={setRoute}
            onEndInterview={(avgs) => {
              setMultimodalAvgs(avgs);
              setRoute("feedback");
            }}
          />
        )}
        {route === "interview" && !sessionId && (
  <PlaceholderScreen
    title="Start a session first"
    num="04"
    sub="The interview live screen needs an active session. Go back to step 03 to choose your interviewer."
  />
)}
        {route === "feedback" && sessionId && (
          <FeedbackScreen
            sessionId={sessionId}
            multimodalAvgs={multimodalAvgs}
            setRoute={setRoute}
          />
        )}
        {route === "feedback" && !sessionId && (
  <PlaceholderScreen
    title="Run an interview first"
    num="05"
    sub="Feedback shows after you complete a session. Start at step 01."
  />
)}
        {route === "jobs" && (
          <JobsScreen resume={resume} role={selectedRole} setRoute={setRoute} />
        )}
        {route === "history" && <HistoryScreen setRoute={setRoute} />}
      </main>
      <BackendStatus />
    </div>
  );
}

function SetupScreen({
  resume,
  role,
  personality,
  setRoute,
  onSessionReady,
}: {
  resume: ParseResult | null;
  role: InferredRole | null;
  personality: "mira" | "marcus" | "priya";
  setRoute: (r: Route) => void;
  onSessionReady: (sessionId: string, firstQuestion: string, state: StateSummary) => void;
}) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!resume || !role) {
    return <PlaceholderScreen title="Pick a role first" num="03" sub="Go back to step 02." />;
  }

  async function startInterview() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, target_role: role, max_questions: 6, personality }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      onSessionReady(data.session_id, data.first_question.text, data.state_summary);
      setRoute("interview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start session");
      setStarting(false);
    }
  }

  return (
    <div className="pageEnter" style={{ padding: "56px 48px", maxWidth: 980, margin: "0 auto" }}>
      <div className="chip" style={{ marginBottom: 14 }}>SCREEN 03 · interview ready</div>
      <h1
        className="serif"
        style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: "-.025em", margin: "0 0 16px" }}
      >
        Ready to interview for <em style={{ color: "var(--acc)" }}>{role.title}</em>?
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-2)", marginBottom: 24, maxWidth: 600 }}>
        We'll run an adaptive 6-question interview tuned to your resume gaps. Use Chrome
        — speech recognition isn't supported in Safari/Firefox.
      </p>

      <div className="card" style={{ padding: 20, marginBottom: 32, maxWidth: 600 }}>
        <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 12 }}>
          How it works
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)" }}>
          <li>Your interviewer asks a question (you'll hear them)</li>
          <li>Hold the green button to record your answer</li>
          <li>Release — the agent scores and decides what to ask next</li>
          <li>Difficulty adapts based on your answers</li>
        </ol>
      </div>

      <button className="btn btn-pri" disabled={starting} onClick={startInterview}>
        {starting ? "Starting…" : "Begin interview →"}
      </button>

      {error && (
        <div
          className="card"
          style={{ marginTop: 16, padding: 14, borderColor: "var(--bad)", color: "var(--bad)" }}
        >
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

function PlaceholderScreen({ title, num, sub }: { title: string; num: string; sub?: string }) {
  return (
    <div className="pageEnter" style={{ padding: "56px 48px", maxWidth: 980, margin: "0 auto" }}>
      <div className="chip" style={{ marginBottom: 14 }}>SCREEN {num}</div>
      <h1
        className="serif"
        style={{ fontSize: 56, lineHeight: 1.05, letterSpacing: "-.025em", margin: "0 0 16px" }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-2)", maxWidth: 580 }}>
        {sub ?? "This screen will be built in an upcoming chunk."}
      </p>
    </div>
  );
}
