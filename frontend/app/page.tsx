"use client";

import { useState } from "react";
import { Sidebar, type Route } from "./components/Sidebar";
import { BackendStatus } from "./components/BackendStatus";

export default function Home() {
  const [route, setRoute] = useState<Route>("landing");

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <main style={{ minWidth: 0, background: "var(--bg)", position: "relative" }}>
        {route === "landing" && <PlaceholderScreen title="Upload your résumé" num="01" />}
        {route === "roles" && <PlaceholderScreen title="Inferred roles" num="02" />}
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
        This screen will be built in an upcoming chunk. The design system,
        sidebar navigation, and routing all work — click around to verify.
      </p>
    </div>
  );
}
