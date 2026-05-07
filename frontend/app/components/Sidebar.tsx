"use client";

import { clsx } from "clsx";

type Route =
  | "landing"
  | "roles"
  | "setup"
  | "interview"
  | "feedback"
  | "jobs"
  | "history";

const FLOW: { id: Route; num: string; label: string }[] = [
  { id: "landing",   num: "01", label: "Upload" },
  { id: "roles",     num: "02", label: "Roles" },
  { id: "setup",     num: "03", label: "Camera" },
  { id: "interview", num: "04", label: "Interview" },
  { id: "feedback",  num: "05", label: "Feedback" },
  { id: "jobs",      num: "06", label: "Jobs" },
  { id: "history",   num: "07", label: "History" },
];

export function Sidebar({
  route,
  setRoute,
}: {
  route: Route;
  setRoute: (r: Route) => void;
}) {
  const activeIdx = FLOW.findIndex((f) => f.id === route);

  return (
    <aside
      style={{
        borderRight: "1px solid var(--line)",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        padding: "22px 18px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
        <div className="logo-dot" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="serif" style={{ fontSize: 22, letterSpacing: "-.02em", lineHeight: 1 }}>
            Loop
          </span>
          <span
            className="mono uppercase"
            style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: ".15em", marginTop: 2 }}
          >
            Interview agent
          </span>
        </div>
      </div>

      {/* Flow */}
      <div
        className="uppercase"
        style={{
          fontSize: 10,
          color: "var(--ink-4)",
          fontWeight: 500,
          marginBottom: 10,
          paddingLeft: 8,
        }}
      >
        Flow
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {FLOW.map((it, i) => {
          const active = route === it.id;
          const done = activeIdx > i;
          return (
            <button
              key={it.id}
              onClick={() => setRoute(it.id)}
              className={clsx("nav-btn")}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "9px 10px",
                borderRadius: 8,
                background: active ? "var(--bg-2)" : "transparent",
                border: active ? "1px solid var(--line-2)" : "1px solid transparent",
                transition: "background .15s",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: active ? "var(--acc)" : done ? "var(--ink-3)" : "var(--ink-4)",
                  width: 20,
                }}
              >
                {done ? "✓" : it.num}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: active ? "var(--ink)" : "var(--ink-2)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User card */}
      <div
        className="card"
        style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#FF6B35,#7C5CFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ?
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Guest</span>
            <span style={{ fontSize: 10, color: "var(--ink-4)" }}>Hackathon build · v0.1</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export type { Route };
