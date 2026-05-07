"use client";

import { useEffect, useState } from "react";

export function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((r) => r.json())
      .then((d) => setStatus(d.status === "healthy" ? "ok" : "down"))
      .catch(() => setStatus("down"));
  }, []);

  const color =
    status === "ok" ? "var(--good)" : status === "down" ? "var(--bad)" : "var(--warn)";
  const label =
    status === "ok" ? "backend ok" : status === "down" ? "backend down" : "checking…";

  return (
    <div
      className="chip mono"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        fontSize: 10,
        borderColor: color,
        color,
        zIndex: 100,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          animation: status === "checking" ? "blink 1.2s infinite" : "none",
        }}
      />
      {label}
    </div>
  );
}
