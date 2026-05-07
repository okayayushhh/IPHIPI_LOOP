"use client";

import { useState } from "react";
import type { ParseResult } from "./LandingScreen";
import type { Route } from "../Sidebar";

export function RolesScreen({
  resume,
  setRoute,
  onRoleSelected,
}: {
  resume: ParseResult;
  setRoute: (r: Route) => void;
  onRoleSelected: (role: ParseResult["inferred_roles"][number]) => void;
}) {
  const [picked, setPicked] = useState(resume.inferred_roles[0].id);
  const pickedRole = resume.inferred_roles.find((r) => r.id === picked)!;

  return (
    <div
      className="pageEnter"
      style={{ padding: "40px 48px", maxWidth: 1280, margin: "0 auto" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div className="chip chip-acc">✓ Parsed</div>
        <div className="chip">
          {resume.skills.length} skills · {resume.experience.length} roles ·{" "}
          {resume.inferred_roles.length} inferred targets
        </div>
      </div>

      <h1
        className="serif"
        style={{ fontSize: 52, letterSpacing: "-.025em", lineHeight: 1, margin: "0 0 12px" }}
      >
        Here's what we read on you, {resume.name.split(" ")[0]}.
      </h1>
      <p style={{ fontSize: 16, color: "var(--ink-2)", maxWidth: 680, margin: "0 0 32px" }}>
        Three roles look reachable from where you are right now. Pick one to interview for —
        we'll tune questions to its core skills and to the gaps in your resume.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>
        {/* Resume snapshot panel */}
        <div className="card" style={{ padding: 24, position: "sticky", top: 24 }}>
          <div
            className="uppercase"
            style={{ fontSize: 10, color: "var(--ink-4)", fontWeight: 500, marginBottom: 14 }}
          >
            Resume snapshot
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-.01em" }}>
            {resume.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 18 }}>
            {/* @ts-expect-error - location is optional on ParseResult */}
            {resume.location ?? "Location unknown"}
          </div>
          <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 8 }}>
            Top skills (extracted)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {resume.skills.slice(0, 8).map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 100, fontSize: 11, color: "var(--ink-2)" }}>{s.name}</div>
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: "var(--bg-3)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${s.level * 100}%`,
                      background: "var(--acc)",
                    }}
                  />
                </div>
                <div
                  className="num"
                  style={{ fontSize: 10, color: "var(--ink-4)", width: 24, textAlign: "right" }}
                >
                  {Math.round(s.level * 100)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }} />
          <div className="uppercase" style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 8 }}>
            Experience
          </div>
          {resume.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>
                {e.role} ·{" "}
                <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>
                  {e.organization}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Roles cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="uppercase"
            style={{ fontSize: 10, color: "var(--ink-4)", fontWeight: 500 }}
          >
            3 inferred roles · ranked by fit
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {resume.inferred_roles.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setPicked(r.id)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  background: picked === r.id ? "var(--bg-2)" : "var(--bg-1)",
                  border: `1px solid ${picked === r.id ? "var(--acc)" : "var(--line)"}`,
                  borderRadius: 14,
                  padding: 20,
                  gap: 14,
                  position: "relative",
                  overflow: "hidden",
                  animation: `rise .5s ease-out ${i * 0.08}s both`,
                  transition: "all .15s",
                }}
              >
                {picked === r.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "var(--acc)",
                    }}
                  />
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    className="num"
                    style={{
                      fontSize: 36,
                      fontWeight: 600,
                      letterSpacing: "-.04em",
                      lineHeight: 1,
                      color: "var(--acc)",
                    }}
                  >
                    {Math.round(r.fit * 100)}
                  </div>
                  <span className="mono uppercase" style={{ fontSize: 9, color: "var(--ink-4)" }}>
                    fit
                  </span>
                </div>
                <div
                  style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-.01em", lineHeight: 1.2 }}
                >
                  {r.title}
                </div>
                <div style={{ height: 1, background: "var(--line)" }} />
                <div>
                  <div
                    className="uppercase"
                    style={{ fontSize: 9, color: "var(--ink-4)", marginBottom: 6 }}
                  >
                    Why we matched
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {r.why.map((w, j) => (
                      <li
                        key={j}
                        style={{
                          fontSize: 11,
                          color: "var(--ink-2)",
                          display: "flex",
                          gap: 6,
                          lineHeight: 1.4,
                        }}
                      >
                        <span style={{ color: "var(--acc)", marginTop: 2 }}>+</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div
                    className="uppercase"
                    style={{ fontSize: 9, color: "var(--ink-4)", marginBottom: 6 }}
                  >
                    Probe areas
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {r.gaps.map((g, j) => (
                      <span
                        key={j}
                        style={{
                          fontSize: 10,
                          padding: "3px 7px",
                          borderRadius: 4,
                          background: "var(--bg-3)",
                          color: "var(--ink-3)",
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button
              className="btn btn-pri"
              onClick={() => {
                onRoleSelected(pickedRole);
                setRoute("setup");
              }}
            >
              Interview for {pickedRole.title.split("(")[0].trim()} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
