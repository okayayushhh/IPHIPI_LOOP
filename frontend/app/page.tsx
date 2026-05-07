"use client";

import { useState } from "react";
import { Sidebar, type Route } from "./components/Sidebar";
import { BackendStatus } from "./components/BackendStatus";
import { LandingScreen, type ParseResult } from "./components/screens/LandingScreen";
import { RolesScreen } from "./components/screens/RolesScreen";

type InferredRole = ParseResult["inferred_roles"][number];

export default function Home() {
  const [route, setRoute] = useState<Route>("landing");
  const [resume, setResume] = useState<ParseResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<InferredRole | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <main style={{ minWidth: 0, background: "var(--bg)", position: "relative" }}>
        {route === "landing" && (
          <LandingScreen setRoute={setRoute} setResume={setResume} />
        )}
        {route === "roles" && resume && (
          <RolesScreen
            resume={resume}
            setRoute={setRoute}
            onRoleSelected={setSelectedRole}
          />
        )}
        {route === "roles" && !resume && (
          <PlaceholderScreen
            title="Upload a resume first"
            num="02"
            sub="Go back to step 01 to drop a PDF."
          />
        )}
        {route === "setup" && (
          <SetupPlaceholder
            resume={resume}
            role={selectedRole}
            setRoute={setRoute}
            setSessionId={setSessionId}
          />
        )}
        {route === "interview" && (
          <PlaceholderScreen
            title="Live interview"
            num="04"
            sub={
              sessionId
                ? `Session ${sessionId} ready. Interview UI lands in chunk 7.`
                : "Set up camera/mic in step 03 first."
            }
          />
        )}
        {route === "feedback" && <PlaceholderScreen title="Feedback report" num="05" />}
        {route === "jobs" && <PlaceholderScreen title="Recommended jobs" num="06" />}
        {route === "history" && <PlaceholderScreen title="Past sessions" num="07" />}
      </main>
      <BackendStatus />
    </div>
  );
}

function SetupPlaceholder({
  resume,
  role,
  setRoute,
  setSessionId,
}: {
  resume: ParseResult | null;
  role: InferredRole | null;
  setRoute: (r: Route) => void;
  setSessionId: (id: string) => void;
}) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null);

  if (!resume || !role) {
    return (
      <PlaceholderScreen
        title="Pick a role first"
        num="03"
        sub="Go back to step 02 to choose a role."
      />
    );
  }

  async function startInterview() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, target_role: role, max_questions: 6 }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setSessionId(data.session_id);
      setFirstQuestion(data.first_question.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="pageEnter" style={{ padding: "56px 48px", maxWidth: 980, margin: "0 auto" }}>
      <div className="chip" style={{ marginBottom: 14 }}>
        SCREEN 03 · interview ready
      </div>
      <h1
        className="serif"
        style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: "-.025em", margin: "0 0 16px" }}
      >
        Ready to interview for <em style={{ color: "var(--acc)" }}>{role.title}</em>?
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-2)", marginBottom: 32, maxWidth: 600 }}>
        Camera/mic check coming in chunk 7. For now, click below to start the orchestrator
        and get the first question — proves the agent works.
      </p>

      <button className="btn btn-pri" disabled={starting} onClick={startInterview}>
        {starting ? "Starting…" : "Start interview (test orchestrator) →"}
      </button>

      {error && (
        <div
          className="card"
          style={{
            marginTop: 16,
            padding: 14,
            borderColor: "var(--bad)",
            color: "var(--bad)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {firstQuestion && (
        <div className="card pageEnter" style={{ marginTop: 24, padding: 24 }}>
          <div
            className="uppercase"
            style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 10 }}
          >
            First question from the agent
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.5 }}>{firstQuestion}</div>
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-3)" }}>
            ✓ Orchestrator working. Full interview UI lands next chunk.
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceholderScreen({
  title,
  num,
  sub,
}: {
  title: string;
  num: string;
  sub?: string;
}) {
  return (
    <div className="pageEnter" style={{ padding: "56px 48px", maxWidth: 980, margin: "0 auto" }}>
      <div className="chip" style={{ marginBottom: 14 }}>
        SCREEN {num}
      </div>
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
