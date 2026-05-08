"use client";

import { useEffect, useState } from "react";
import type { Route } from "../Sidebar";

type Dimension = {
  name: string;
  score: number;
  label: string;
  rationale: string;
};

type Strength = { title: string; detail: string };
type Improvement = {
  title: string;
  detail: string;
  severity: "low" | "med" | "high";
};
type StarAnalysis = {
  question: string;
  situation: number;
  task: number;
  action: number;
  result: number;
  note: string;
};

type FeedbackReport = {
  overall_score: number;
  headline: string;
  summary: string;
  dimensions: Dimension[];
  strengths: Strength[];
  improvements: Improvement[];
  star_analysis: StarAnalysis[];
  coaching_plan: string[];
};

export function FeedbackScreen({
  sessionId,
  multimodalAvgs,
  setRoute,
}: {
  sessionId: string;
  multimodalAvgs: { eye_contact: number; posture: number; engagement: number; stress: number };
  setRoute: (r: Route) => void;
}) {
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/interview/${sessionId}/feedback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(multimodalAvgs),
          },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: "Unknown error" }));
          throw new Error(err.detail || `Server returned ${res.status}`);
        }
        const data: FeedbackReport = await res.json();
        if (!cancelled) {
          setReport(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load report");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading) {
    return (
      <div className="pageEnter" style={{ padding: "80px 48px", textAlign: "center" }}>
        <div className="chip chip-acc" style={{ marginBottom: 18 }}>
          ✓ Synthesizing your feedback report
        </div>
        <h1
          className="serif"
          style={{ fontSize: 42, letterSpacing: "-.025em", margin: "0 0 14px" }}
        >
          Analyzing the conversation…
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
          This takes about 10 seconds. Synthesis runs through the whole session,
          STAR-scores your behavioral answers, and folds in multimodal observations.
        </p>
        <div
          style={{
            margin: "32px auto 0",
            maxWidth: 320,
            height: 3,
            background: "var(--bg-3)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "60%",
              background: "var(--acc)",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <style>{`
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(80%); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pageEnter" style={{ padding: "80px 48px", maxWidth: 700, margin: "0 auto" }}>
        <div className="card" style={{ padding: 24, borderColor: "var(--bad)" }}>
          <div className="uppercase" style={{ fontSize: 10, color: "var(--bad)", marginBottom: 10 }}>
            Could not load feedback
          </div>
          <p style={{ color: "var(--ink)", fontSize: 14, marginBottom: 16 }}>{error}</p>
          <button className="btn" onClick={() => setRoute("interview")}>
            Back to interview
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;
  const F = report;

  return (
    <div
      className="pageEnter"
      style={{ padding: "40px 48px", maxWidth: 1200, margin: "0 auto" }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div className="chip">Session {sessionId}</div>
            <div className="chip chip-good">Synthesized · {F.dimensions.length} dimensions</div>
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 52,
              letterSpacing: "-.025em",
              lineHeight: 1.05,
              margin: "0 0 12px",
              maxWidth: 780,
            }}
          >
            {F.headline}
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--ink-2)",
              lineHeight: 1.5,
              maxWidth: 680,
              margin: 0,
            }}
          >
            {F.summary}
          </p>
        </div>
        <ScoreRing value={F.overall_score} size={140} />
      </div>

      {/* RADAR + dimensions row */}
      <div
        className="card"
        style={{
          padding: 28,
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 32,
          alignItems: "center",
        }}
      >
        <RadarChart dimensions={F.dimensions} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", fontWeight: 500 }}>
            Multimodal scorecard
          </div>
          {F.dimensions.map((d) => (
            <DimensionRow key={d.name} dim={d} />
          ))}
        </div>
      </div>

      {/* STRENGTHS + IMPROVEMENTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--good)" }} />
            <span className="uppercase" style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>
              What worked
            </span>
          </div>
          {F.strengths.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "14px 0",
                borderBottom: i < F.strengths.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55 }}>{s.detail}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warn)" }} />
            <span className="uppercase" style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>
              What to work on
            </span>
          </div>
          {F.improvements.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "14px 0",
                borderBottom: i < F.improvements.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 4,
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s.title}</div>
                <span
                  className={
                    s.severity === "high"
                      ? "chip chip-bad"
                      : s.severity === "med"
                      ? "chip chip-warn"
                      : "chip"
                  }
                  style={{ fontSize: 9, flexShrink: 0 }}
                >
                  {s.severity}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55 }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STAR ANALYSIS (if any) */}
      {F.star_analysis.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 18 }}>
            STAR analysis · behavioral answers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {F.star_analysis.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 360px",
                  gap: 24,
                  paddingTop: i > 0 ? 18 : 0,
                  borderTop: i > 0 ? "1px solid var(--line)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 8 }}>
                    "{s.question}"
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55 }}>{s.note}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <StarBar label="Situation" value={s.situation} />
                  <StarBar label="Task" value={s.task} />
                  <StarBar label="Action" value={s.action} />
                  <StarBar label="Result" value={s.result} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COACHING PLAN */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 14 }}>
          Coaching plan · next 2 weeks
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {F.coaching_plan.map((step, i) => (
            <div
              key={i}
              style={{
                padding: 18,
                background: "var(--bg-2)",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div className="num" style={{ fontSize: 11, color: "var(--acc)", letterSpacing: ".1em" }}>
                STEP 0{i + 1}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button className="btn" onClick={() => window.print()}>
          Print / save as PDF
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={() => setRoute("landing")}>
            Re-run interview
          </button>
          <button className="btn btn-pri" onClick={() => setRoute("jobs")}>
            See matched jobs →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ScoreRing ───────────────────────────────────────────
function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--bg-3)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--acc)"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={off}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: size * 0.32,
            fontWeight: 600,
            letterSpacing: "-.04em",
          }}
        >
          {value}
        </div>
      </div>
      <span className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)" }}>
        Overall
      </span>
    </div>
  );
}

// ─── Radar Chart (pure SVG) ─────────────────────────────
function RadarChart({ dimensions }: { dimensions: Dimension[] }) {
  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 30;
  const angleStep = (Math.PI * 2) / dimensions.length;

  // Polygon points for the data
  const dataPoints = dimensions.map((d, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (d.score / 100) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      labelX: center + Math.cos(angle) * (radius + 24),
      labelY: center + Math.sin(angle) * (radius + 24),
      label: d.label,
      score: d.score,
    };
  });

  const polygonPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  // Concentric grid rings (25, 50, 75, 100)
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* Grid rings */}
      {rings.map((r, i) => {
        const points = Array.from({ length: dimensions.length }, (_, j) => {
          const angle = -Math.PI / 2 + j * angleStep;
          return `${center + Math.cos(angle) * radius * r},${center + Math.sin(angle) * radius * r}`;
        }).join(" ");
        return (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray={i === rings.length - 1 ? "0" : "2 3"}
          />
        );
      })}

      {/* Spokes */}
      {dimensions.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        );
      })}

      {/* Data polygon */}
      <path
        d={polygonPath}
        fill="rgba(107, 142, 14, 0.18)"
        stroke="var(--acc)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--acc)" />
      ))}

      {/* Labels */}
      {dataPoints.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontFamily="var(--font-mono)"
          fill="var(--ink-3)"
          style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          {p.label.split(" ")[0]}
        </text>
      ))}
    </svg>
  );
}

// ─── DimensionRow ────────────────────────────────────────
function DimensionRow({ dim }: { dim: Dimension }) {
  const tone =
    dim.score > 75 ? "var(--good)" : dim.score > 60 ? "var(--acc)" : "var(--warn)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{dim.label}</span>
        <span className="num" style={{ fontSize: 14, fontWeight: 600, color: tone }}>
          {dim.score}
          <span style={{ color: "var(--ink-4)", fontWeight: 400, fontSize: 10 }}>/100</span>
        </span>
      </div>
      <div style={{ height: 3, background: "var(--bg-3)", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${dim.score}%`,
            background: tone,
            transition: "width 1s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </div>
      <div style={{ fontSize: 10, color: "var(--ink-4)", lineHeight: 1.5, marginTop: 2 }}>
        {dim.rationale}
      </div>
    </div>
  );
}

// ─── StarBar ─────────────────────────────────────────────
function StarBar({ label, value }: { label: string; value: number }) {
  const tone = value > 0.7 ? "var(--good)" : value > 0.4 ? "var(--acc)" : "var(--warn)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 70, fontSize: 10, color: "var(--ink-3)" }}>{label}</div>
      <div
        style={{
          flex: 1,
          height: 4,
          background: "var(--bg-3)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value * 100}%`,
            background: tone,
          }}
        />
      </div>
      <div className="num" style={{ fontSize: 11, color: tone, width: 32, textAlign: "right" }}>
        {Math.round(value * 100)}
      </div>
    </div>
  );
}
