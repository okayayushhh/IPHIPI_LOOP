"use client";

import { useEffect, useState } from "react";
import type { Route } from "../Sidebar";
import { AgentPersona } from "../AgentPersona";

type PersonalityOption = {
  id: string;
  name: string;
  role_label: string;
  tagline: string;
  color_accent: string;
};

export function PersonalityPickerScreen({
  role,
  setRoute,
  onPersonalitySelected,
}: {
  role: { title: string } | null;
  setRoute: (r: Route) => void;
  onPersonalitySelected: (personalityId: string) => void;
}) {
  const [personalities, setPersonalities] = useState<PersonalityOption[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/interview/personalities",
        );
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setPersonalities(data.personalities ?? []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load personalities");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleChoose(id: string) {
    setChosen(id);
    onPersonalitySelected(id);
    setRoute("setup");
  }

  return (
    <div
      className="pageEnter"
      style={{ padding: "56px 48px", maxWidth: 1100, margin: "0 auto" }}
    >
      <div className="chip" style={{ marginBottom: 14 }}>SCREEN 03 · interviewer</div>
      <h1
        className="serif"
        style={{
          fontSize: 48,
          lineHeight: 1.05,
          letterSpacing: "-.025em",
          margin: "0 0 12px",
        }}
      >
        Pick your interviewer.
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "var(--ink-2)",
          maxWidth: 640,
          marginBottom: 32,
        }}
      >
        Same questions, different style. Choose the one that matches the
        interview you're preparing for
        {role ? ` — currently targeting ${role.title}` : ""}.
      </p>

      {error && (
        <div
          className="card"
          style={{
            padding: 14,
            borderColor: "var(--bad)",
            color: "var(--bad)",
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {!personalities && !error && (
        <div style={{ color: "var(--ink-3)", fontSize: 14 }}>
          Loading personalities…
        </div>
      )}

      {personalities && personalities.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {personalities.map((p) => {
            const isHovered = hovered === p.id;
            const isChosen = chosen === p.id;
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                className="card"
                style={{
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  borderColor: isChosen
                    ? p.color_accent
                    : isHovered
                    ? p.color_accent
                    : "var(--line-2)",
                  borderWidth: isChosen ? 2 : 1,
                  background: isChosen
                    ? hexToRgba(p.color_accent, 0.06)
                    : "var(--bg-1)",
                  transform: isHovered ? "scale(1.015)" : "scale(1)",
                  transition: "transform .15s ease, border-color .15s ease, background .15s ease",
                }}
                onClick={() => handleChoose(p.id)}
              >
                <AgentPersona
                  personality={p.id as "mira" | "marcus" | "priya"}
                  size={96}
                  state="idle"
                />

                <div style={{ textAlign: "center" }}>
                  <div
                    className="serif"
                    style={{
                      fontSize: 24,
                      letterSpacing: "-.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    className="uppercase mono"
                    style={{
                      fontSize: 9,
                      color: "var(--ink-4)",
                      letterSpacing: ".18em",
                      marginTop: 6,
                    }}
                  >
                    {p.role_label}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-2)",
                    lineHeight: 1.5,
                    textAlign: "center",
                    minHeight: 56,
                    margin: 0,
                  }}
                >
                  {p.tagline}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoose(p.id);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: p.color_accent,
                    color: "#fff",
                    border: `1px solid ${p.color_accent}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Choose →
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <button
          className="btn btn-sm"
          onClick={() => setRoute("roles")}
          style={{ background: "transparent" }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
