"use client";

import type { MultimodalScores } from "./hooks/useMultimodal";

export function MultimodalHud({ scores }: { scores: MultimodalScores }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 5,
      }}
    >
      <HudPill
        label="eye contact"
        value={`${Math.round(scores.eyeContact * 100)}%`}
        tone={scores.eyeContact > 0.7 ? "good" : scores.eyeContact > 0.4 ? "warn" : "bad"}
      />
      <HudPill
        label="posture"
        value={scores.posture > 0.7 ? "open" : scores.posture > 0.4 ? "ok" : "slouched"}
        tone={scores.posture > 0.7 ? "good" : scores.posture > 0.4 ? "warn" : "bad"}
      />
      <HudPill
        label="engagement"
        value={scores.engagement > 0.7 ? "high" : scores.engagement > 0.4 ? "mid" : "low"}
        tone={scores.engagement > 0.7 ? "good" : scores.engagement > 0.4 ? "warn" : "bad"}
      />
      {scores.stress > 0.5 && (
        <HudPill
          label="stress"
          value="elevated"
          tone="warn"
        />
      )}
    </div>
  );
}

function HudPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad";
}) {
  const color =
    tone === "good"
      ? "var(--good)"
      : tone === "warn"
      ? "var(--warn)"
      : "var(--bad)";
  return (
    <div
      className="mono"
      style={{
        fontSize: 10,
        padding: "4px 8px",
        background: "rgba(0,0,0,0.65)",
        borderRadius: 4,
        color: "var(--ink-2)",
        backdropFilter: "blur(4px)",
        whiteSpace: "nowrap",
      }}
    >
      {label}: <span style={{ color }}>{value}</span>
    </div>
  );
}

export function HudBars({ scores }: { scores: MultimodalScores }) {
  return (
    <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", fontWeight: 500 }}>
        Live multimodal signals
      </div>
      <BarRow label="Eye contact" value={scores.eyeContact} good />
      <BarRow label="Posture" value={scores.posture} good />
      <BarRow label="Engagement" value={scores.engagement} good />
      <BarRow label="Stress" value={scores.stress} good={false} />
    </div>
  );
}

function BarRow({
  label,
  value,
  good, // if true: high = good. if false: high = bad (stress).
}: {
  label: string;
  value: number;
  good: boolean;
}) {
  const tone = good
    ? value > 0.7
      ? "var(--good)"
      : value > 0.4
      ? "var(--acc)"
      : "var(--warn)"
    : value < 0.3
    ? "var(--good)"
    : value < 0.5
    ? "var(--acc)"
    : "var(--warn)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, color: "var(--ink-2)" }}>{label}</span>
        <span className="num" style={{ fontSize: 13, fontWeight: 500, color: tone }}>
          {Math.round(value * 100)}
        </span>
      </div>
      <div
        style={{
          height: 3,
          background: "var(--bg-3)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, value * 100)}%`,
            background: tone,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
