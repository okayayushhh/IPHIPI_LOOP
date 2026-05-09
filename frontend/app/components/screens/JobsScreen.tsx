"use client";

import { useState, useEffect } from "react";
import type { ParseResult } from "./LandingScreen";
import type { Route } from "../Sidebar";

type InferredRole = ParseResult["inferred_roles"][number];

type JobListing = {
  id: string;
  company: string;
  title: string;
  location: string;
  description: string;
  salary_text: string | null;
  url: string;
  match_score: number;
  why_fits: string[];
  posted_age: string | null;
};

type JobsResponse = {
  jobs: JobListing[];
  total_found: number;
  sources: string[];
};

export function JobsScreen({
  resume,
  role,
  setRoute,
}: {
  resume: ParseResult | null;
  role: InferredRole | null;
  setRoute: (r: Route) => void;
}) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickedIdx, setPickedIdx] = useState(0);

  useEffect(() => {
    if (!resume || !role) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/jobs/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, target_role: role, top_k: 6 }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: "Unknown error" }));
          throw new Error(err.detail || `Server returned ${res.status}`);
        }
        const data: JobsResponse = await res.json();
        if (!cancelled) {
          setJobs(data.jobs);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load jobs");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [resume, role]);

  if (!resume || !role) {
    return (
      <div className="pageEnter" style={{ padding: "56px 48px", maxWidth: 980, margin: "0 auto" }}>
        <h1 className="serif" style={{ fontSize: 48, letterSpacing: "-.025em", margin: "0 0 16px" }}>
          Run an interview first
        </h1>
        <p style={{ color: "var(--ink-2)" }}>
          Upload a resume and pick a role from the home screen, then come back here for matched jobs.
        </p>
        <button className="btn btn-pri" style={{ marginTop: 20 }} onClick={() => setRoute("landing")}>
          Start →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pageEnter" style={{ padding: "80px 48px", textAlign: "center" }}>
        <div className="chip chip-acc" style={{ marginBottom: 18 }}>
          ✓ Searching live job boards
        </div>
        <h1 className="serif" style={{ fontSize: 42, letterSpacing: "-.025em", margin: "0 0 14px" }}>
          Finding roles you should apply to today…
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, maxWidth: 600, margin: "0 auto" }}>
          Searching Adzuna's India listings, embedding your résumé and each posting,
          and ranking by semantic match score.
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
            Could not load jobs
          </div>
          <p style={{ color: "var(--ink)", fontSize: 14, marginBottom: 16 }}>{error}</p>
          <p style={{ color: "var(--ink-3)", fontSize: 12 }}>
            Most likely: ADZUNA_APP_ID or ADZUNA_APP_KEY missing in backend/.env. See README.
          </p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="pageEnter" style={{ padding: "80px 48px", maxWidth: 700, margin: "0 auto" }}>
        <h1 className="serif" style={{ fontSize: 42, letterSpacing: "-.025em", margin: "0 0 14px" }}>
          No matches found.
        </h1>
        <p style={{ color: "var(--ink-3)" }}>
          Adzuna returned no postings for "{role.title}". Try a different role from the Roles screen.
        </p>
      </div>
    );
  }

  const picked = jobs[pickedIdx];

  return (
    <div
      className="pageEnter"
      style={{ padding: "40px 48px", maxWidth: 1280, margin: "0 auto" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div className="chip chip-acc">Live · Adzuna</div>
        <div className="chip">{jobs.length} matches found</div>
      </div>
      <h1
        className="serif"
        style={{
          fontSize: 48,
          letterSpacing: "-.025em",
          lineHeight: 1,
          margin: "0 0 8px",
        }}
      >
        Roles you should apply to today.
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "var(--ink-2)",
          margin: "0 0 28px",
          maxWidth: 680,
        }}
      >
        Aggregated from public listings, ranked by semantic match between your résumé
        and each job posting. Click a role to see why it fits.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, alignItems: "start" }}>
        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {jobs.map((j, i) => (
            <button
              key={j.id || i}
              onClick={() => setPickedIdx(i)}
              style={{
                all: "unset",
                cursor: "pointer",
                background: pickedIdx === i ? "var(--bg-2)" : "var(--bg-1)",
                border: `1px solid ${pickedIdx === i ? "var(--line-2)" : "var(--line)"}`,
                borderRadius: 12,
                padding: "16px 18px",
                display: "grid",
                gridTemplateColumns: "40px minmax(0,1fr) 110px 130px",
                gap: 18,
                alignItems: "center",
                animation: `rise .3s ease-out ${i * 0.04}s both`,
                transition: "all .15s",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--bg-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                {j.company[0] || "?"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {j.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-3)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {j.company} · {j.location || "—"}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{j.salary_text ?? "—"}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 3,
                    background: "var(--bg-3)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${j.match_score}%`,
                      background:
                        j.match_score >= 75
                          ? "var(--good)"
                          : j.match_score >= 60
                          ? "var(--acc)"
                          : "var(--warn)",
                    }}
                  />
                </div>
                <span
                  className="num"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color:
                      j.match_score >= 75
                        ? "var(--good)"
                        : j.match_score >= 60
                        ? "var(--acc)"
                        : "var(--warn)",
                  }}
                >
                  {j.match_score}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div
          className="card"
          style={{
            padding: 22,
            position: "sticky",
            top: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: "var(--bg-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {picked.company[0] || "?"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{picked.title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {picked.company} · {picked.location || "—"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "14px 0",
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <ScoreRingMini value={picked.match_score} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 11, color: "var(--ink-4)" }}>Match score</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {picked.match_score >= 80
                  ? "Excellent fit"
                  : picked.match_score >= 65
                  ? "Strong fit"
                  : "Worth applying"}
              </div>
              {picked.salary_text && (
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{picked.salary_text}</div>
              )}
            </div>
          </div>

          {picked.why_fits.length > 0 && (
            <div>
              <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 10 }}>
                Why this fits
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {picked.why_fits.map((w, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--ink-2)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "var(--acc)", marginTop: 2 }}>+</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 8 }}>
              Description
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.6 }}>
              {picked.description}
            </div>
          </div>

          {picked.posted_age && (
            <div style={{ fontSize: 10, color: "var(--ink-4)" }}>Posted: {picked.posted_age}</div>
          )}

          <a
            href={picked.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-pri"
            style={{ justifyContent: "center", textDecoration: "none" }}
          >
            View on Adzuna
          </a>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button className="btn" onClick={() => setRoute("feedback")}>
          ← Back to feedback
        </button>
      </div>
    </div>
  );
}

function ScoreRingMini({ value }: { value: number }) {
  const size = 64;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color =
    value >= 80 ? "var(--good)" : value >= 65 ? "var(--acc)" : "var(--warn)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
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
          fontSize: 16,
          fontWeight: 600,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}
