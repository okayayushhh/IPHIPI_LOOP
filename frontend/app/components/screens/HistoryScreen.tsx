"use client";

import { useEffect, useState } from "react";
import type { Route } from "../Sidebar";

type SessionSummary = {
  id: string;
  candidate_name: string;
  target_role: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  engagement_score: number;
  structure_score: number;
  headline: string;
  questions_asked: number;
  avg_difficulty: number;
  created_at: string;
};

export function HistoryScreen({ setRoute }: { setRoute: (r: Route) => void }) {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/interview/history");
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setSessions(data.sessions ?? []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className="pageEnter"
        style={{
          padding: "40px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          color: "var(--ink-3)",
          fontSize: 14,
        }}
      >
        Loading history…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="pageEnter"
        style={{ padding: "40px 48px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div className="chip" style={{ marginBottom: 14 }}>SCREEN 07 · history</div>
        <div
          className="card"
          style={{
            padding: 18,
            borderColor: "var(--bad)",
            color: "var(--bad)",
            fontSize: 13,
          }}
        >
          ⚠ {error}
        </div>
      </div>
    );
  }

  const data = sessions ?? [];

  if (data.length === 0) {
    return (
      <div
        className="pageEnter"
        style={{ padding: "40px 48px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div className="chip" style={{ marginBottom: 14 }}>SCREEN 07 · history</div>
        <h1
          className="serif"
          style={{
            fontSize: 48,
            lineHeight: 1.05,
            letterSpacing: "-.025em",
            margin: "0 0 16px",
          }}
        >
          No past sessions yet.
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-2)", maxWidth: 600, marginBottom: 24 }}>
          Your interview history is stored locally in SQLite. Once you finish
          your first interview and view the feedback report, it'll show up
          here with score trends across attempts.
        </p>
        <button className="btn btn-pri" onClick={() => setRoute("landing")}>
          Start your first interview →
        </button>
      </div>
    );
  }

  // API returns newest-first; trend chart wants oldest-first
  const trendData = [...data].reverse();

  return (
    <div
      className="pageEnter"
      style={{ padding: "40px 48px", maxWidth: 1100, margin: "0 auto" }}
    >
      <div className="chip" style={{ marginBottom: 14 }}>SCREEN 07 · history</div>
      <h1
        className="serif"
        style={{
          fontSize: 48,
          lineHeight: 1.05,
          letterSpacing: "-.025em",
          margin: "0 0 12px",
        }}
      >
        Your interview history.
      </h1>
      <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 28 }}>
        {data.length} {data.length === 1 ? "session" : "sessions"} stored locally.
      </p>

      {data.length >= 2 && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div
            className="uppercase"
            style={{
              fontSize: 10,
              color: "var(--ink-4)",
              fontWeight: 500,
              marginBottom: 12,
              letterSpacing: ".15em",
            }}
          >
            Score trend
          </div>
          <TrendChart data={trendData} />
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr 100px 90px 100px",
            gap: 12,
            padding: "12px 18px",
            background: "var(--bg-2)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          {["Date", "Role", "Score", "Q's", "Avg diff"].map((label) => (
            <span
              key={label}
              className="uppercase mono"
              style={{
                fontSize: 9,
                color: "var(--ink-4)",
                letterSpacing: ".15em",
                textAlign:
                  label === "Score" || label === "Q's" || label === "Avg diff"
                    ? "center"
                    : "left",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {data.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr 100px 90px 100px",
              gap: 12,
              padding: "14px 18px",
              alignItems: "center",
              borderBottom: i < data.length - 1 ? "1px solid var(--line)" : "none",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                {formatDate(s.created_at)}
              </span>
              <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                {s.candidate_name}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                {s.target_role}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--ink-4)",
                  lineHeight: 1.4,
                }}
              >
                {truncate(s.headline, 65)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ScoreBadge value={s.overall_score} />
            </div>
            <div
              className="num"
              style={{
                fontSize: 14,
                color: "var(--ink-2)",
                textAlign: "center",
              }}
            >
              {s.questions_asked}
            </div>
            <div
              className="num"
              style={{
                fontSize: 14,
                color: "var(--ink-2)",
                textAlign: "center",
              }}
            >
              {s.avg_difficulty.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

function truncate(s: string, max: number): string {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

function ScoreBadge({ value }: { value: number }) {
  const color =
    value >= 75 ? "var(--good)" : value >= 50 ? "var(--acc)" : "var(--warn)";
  return (
    <span
      className="num"
      style={{
        fontSize: 16,
        fontWeight: 600,
        color,
        letterSpacing: "-.02em",
      }}
    >
      {value}
    </span>
  );
}

function TrendChart({ data }: { data: SessionSummary[] }) {
  const W = 800;
  const H = 160;
  const PAD_T = 16;
  const PAD_R = 16;
  const PAD_B = 24;
  const PAD_L = 30;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const n = data.length;
  const xFor = (i: number) =>
    PAD_L + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yFor = (v: number) =>
    PAD_T + ((100 - Math.max(0, Math.min(100, v))) / 100) * innerH;

  const series: { key: keyof SessionSummary; label: string; color: string }[] = [
    { key: "overall_score", label: "Overall", color: "var(--acc)" },
    { key: "technical_score", label: "Technical", color: "#5b8def" },
    { key: "communication_score", label: "Communication", color: "#e8b34c" },
  ];

  const gridYs = [0, 25, 50, 75, 100];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        style={{ display: "block" }}
        aria-label="Score trend across sessions"
      >
        {/* Grid lines + y labels */}
        {gridYs.map((g) => {
          const y = yFor(g);
          return (
            <g key={g}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={PAD_L - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={9}
                fill="var(--ink-4)"
                fontFamily="var(--font-mono)"
              >
                {g}
              </text>
            </g>
          );
        })}

        {/* Series */}
        {series.map((s) => {
          const points = data
            .map((d, i) => `${xFor(i)},${yFor(d[s.key] as number)}`)
            .join(" ");
          return (
            <g key={s.key as string}>
              {n > 1 && (
                <polyline
                  points={points}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={xFor(i)}
                  cy={yFor(d[s.key] as number)}
                  r={3}
                  fill={s.color}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 18,
          marginTop: 8,
          paddingLeft: PAD_L,
          flexWrap: "wrap",
        }}
      >
        {series.map((s) => (
          <div
            key={s.key as string}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span
              className="uppercase mono"
              style={{
                fontSize: 9,
                color: "var(--ink-3)",
                letterSpacing: ".15em",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
