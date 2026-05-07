"use client";

import { useState } from "react";
import { Sidebar, type Route } from "./components/Sidebar";
import { BackendStatus } from "./components/BackendStatus";
import { LandingScreen, type ParseResult } from "./components/screens/LandingScreen";

export default function Home() {
  const [route, setRoute] = useState<Route>("landing");
  const [resume, setResume] = useState<ParseResult | null>(null);

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <main style={{ minWidth: 0, background: "var(--bg)", position: "relative" }}>
        {route === "landing" && (
          <LandingScreen setRoute={setRoute} setResume={setResume} />
        )}
        {route === "roles" && <RolesPlaceholder resume={resume} />}
        {route === "setup" && <PlaceholderScreen title="Camera & mic check" num="03" />}
        {route === "interview" && <PlaceholderScreen title="Live interview" num="04" />}
        {route === "feedback" && <PlaceholderScreen title="Feedback report" num="05" />}
        {route === "jobs" && <PlaceholderScreen title="Recommended jobs" num="06" />}
        {route === "history" && <PlaceholderScreen title="Past sessions" num="07" />}
      </main>
      <BackendStatus />
    </div>
  );
}

function RolesPlaceholder({ resume }: { resume: ParseResult | null }) {
  if (!resume) {
    return (
      <PlaceholderScreen
        title="Upload a resume first"
        num="02"
      />
    );
  }
  return (
    <div className="pageEnter" style={{ padding: "56px 48px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="chip chip-acc" style={{ marginBottom: 14 }}>
        ✓ Parsed in real time
      </div>
      <h1
        className="serif"
        style={{ fontSize: 52, letterSpacing: "-.025em", lineHeight: 1, margin: "0 0 12px" }}
      >
        Here's what we read on you, {resume.name.split(" ")[0]}.
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-2)", maxWidth: 680, margin: "0 0 32px" }}>
        {resume.skills.length} skills · {resume.experience.length} roles ·{" "}
        {resume.inferred_roles.length} inferred targets. Full role-card UI lands in the next chunk.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 12 }}>
          Inferred roles (raw — proper UI coming)
        </div>
        {resume.inferred_roles.map((r) => (
          <div
            key={r.id}
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--line)",
              display: "grid",
              gridTemplateColumns: "60px 1fr",
              gap: 18,
              alignItems: "center",
            }}
          >
            <div
              className="num"
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "var(--acc)",
                letterSpacing: "-.04em",
              }}
            >
              {Math.round(r.fit * 100)}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                Why: {r.why.slice(0, 2).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderScreen({ title, num }: { title: string; num: string }) {
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
        This screen will be built in an upcoming chunk.
      </p>
    </div>
  );
}
