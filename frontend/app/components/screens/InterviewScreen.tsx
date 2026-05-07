"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AgentPersona, StateLabel } from "../AgentPersona";
import { useSpeech } from "../hooks/useSpeech";
import type { Route } from "../Sidebar";

type TranscriptEntry = {
  who: "agent" | "user";
  text: string;
  time: string;
  flag?: "probe" | "soft";
};

type StateSummary = {
  session_id: string;
  questions_asked: number;
  max_questions: number;
  current_difficulty: number;
  technical_running_avg: number;
  topics_covered: string[];
  last_decision: string | null;
  status: string;
};

type ScoreResult = {
  correctness: number;
  depth: number;
  structure: number;
  overall: number;
  rationale: string;
};

export function InterviewScreen({
  sessionId,
  initialQuestion,
  initialState,
  setRoute,
}: {
  sessionId: string;
  initialQuestion: string;
  initialState: StateSummary;
  setRoute: (r: Route) => void;
}) {
  // Voice
  const speech = useSpeech();

  // Conversation state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { who: "agent", text: initialQuestion, time: "00:00" },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [stateSummary, setStateSummary] = useState<StateSummary>(initialState);
  const [lastScore, setLastScore] = useState<ScoreResult | null>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-speak the first question once on mount
  const spokeFirstRef = useRef(false);
  useEffect(() => {
    if (!spokeFirstRef.current && initialQuestion) {
      spokeFirstRef.current = true;
      // small delay so the page has time to render first
      setTimeout(() => speech.speak(initialQuestion), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  // Auto-scroll transcript
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, speech.interimTranscript]);

  // Submit answer to backend
  const submitAnswer = useCallback(
    async (answerText: string) => {
      if (!answerText.trim()) return;

      // Add user turn to transcript
      const time = formatTime(elapsed);
      setTranscript((t) => [...t, { who: "user", text: answerText, time }]);

      speech.setState("thinking");

      try {
        const res = await fetch("http://127.0.0.1:8000/api/interview/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            answer_text: answerText,
          }),
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();

        setLastScore(data.score);
        setStateSummary(data.state_summary);

        if (data.is_complete) {
          setInterviewComplete(true);
          const wrapText =
            "Thanks — that's all the questions for this session. Click 'See feedback' on the right when you're ready.";
          setTranscript((t) => [
            ...t,
            { who: "agent", text: wrapText, time: formatTime(elapsed) },
          ]);
          speech.speak(wrapText);
        } else if (data.next_question) {
          const nextQ = data.next_question.text;
          setCurrentQuestion(nextQ);
          setTranscript((t) => [
            ...t,
            { who: "agent", text: nextQ, time: formatTime(elapsed) },
          ]);
          speech.speak(nextQ);
        }
      } catch (e) {
        console.error("Answer submit failed:", e);
        speech.setState("idle");
      }
    },
    [sessionId, elapsed, speech],
  );

  // Push-to-talk handlers
  const handleTalkStart = () => {
    if (speech.state === "speaking") speech.cancelSpeak();
    speech.startListening();
  };
  const handleTalkEnd = () => {
    const finalText = speech.stopListening();
    if (finalText.trim()) {
      submitAnswer(finalText);
    }
  };

  return (
    <div
      className="pageEnter"
      style={{
        padding: "22px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100vh",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LiveDot />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              Mock Interview · adaptive
            </span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>
              session {sessionId}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div className="mono" style={{ fontSize: 13, letterSpacing: ".05em" }}>
            {formatTime(elapsed)}{" "}
            <span style={{ color: "var(--ink-4)" }}>
              · Q{stateSummary.questions_asked} / {stateSummary.max_questions}
            </span>
          </div>
          <button
            className="btn btn-sm"
            onClick={() => {
              speech.cancelSpeak();
              setRoute("feedback");
            }}
          >
            End & review →
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr 1.1fr",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* CAMERA placeholder */}
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a1814",
          }}
        >
          <div
            style={{
              color: "var(--ink-3)",
              fontSize: 13,
              textAlign: "center",
              padding: 32,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>📷</div>
            <div>Camera + multimodal HUD</div>
            <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
              Live MediaPipe overlay lands in next chunk
            </div>
          </div>
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <span className="chip" style={{ fontSize: 10 }}>You</span>
          </div>
        </div>

        {/* AGENT */}
        <div
          className="card"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="logo-dot" style={{ width: 8, height: 8 }} />
            <span
              className="uppercase mono"
              style={{
                fontSize: 10,
                color: "var(--ink-3)",
                letterSpacing: ".15em",
              }}
            >
              Mira · interviewer
            </span>
          </div>

          <AgentPersona state={speech.state} size={180} />

          <StateLabel state={speech.state} />

          <div
            className="card"
            style={{
              padding: 14,
              width: "100%",
              background: "var(--bg-2)",
              border: "1px solid var(--line-2)",
            }}
          >
            <div
              className="uppercase"
              style={{
                fontSize: 9,
                color: "var(--ink-4)",
                marginBottom: 6,
              }}
            >
              current question
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "var(--ink)",
              }}
            >
              {currentQuestion}
            </div>
          </div>

          {/* Push-to-talk */}
          {!interviewComplete && (
            <button
              onMouseDown={handleTalkStart}
              onMouseUp={handleTalkEnd}
              onMouseLeave={() => {
                if (speech.state === "listening") handleTalkEnd();
              }}
              onTouchStart={handleTalkStart}
              onTouchEnd={handleTalkEnd}
              disabled={!speech.isSupported || speech.state === "speaking" || speech.state === "thinking"}
              className="btn btn-pri"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "14px 20px",
                fontSize: 14,
                background:
                  speech.state === "listening" ? "var(--bad)" : "var(--acc)",
                borderColor:
                  speech.state === "listening" ? "var(--bad)" : "var(--acc)",
                cursor: !speech.isSupported ? "not-allowed" : "pointer",
              }}
            >
              {speech.state === "listening"
                ? "● Recording… release to submit"
                : speech.state === "speaking"
                ? "Mira is speaking…"
                : speech.state === "thinking"
                ? "Scoring your answer…"
                : "Hold to speak"}
            </button>
          )}

          {!speech.isSupported && (
            <div style={{ fontSize: 10, color: "var(--bad)", textAlign: "center" }}>
              Browser doesn't support speech recognition. Use Chrome.
            </div>
          )}
          {speech.error && (
            <div style={{ fontSize: 10, color: "var(--bad)", textAlign: "center" }}>
              {speech.error}
            </div>
          )}

          {interviewComplete && (
            <button
              className="btn btn-pri"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setRoute("feedback")}
            >
              See feedback →
            </button>
          )}
        </div>

        {/* RIGHT COLUMN: HUD + Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          {/* Adaptive decision card — THE WOW */}
          <div className="card" style={{ padding: 16 }}>
            <div
              className="uppercase"
              style={{
                fontSize: 10,
                color: "var(--ink-4)",
                fontWeight: 500,
                marginBottom: 10,
              }}
            >
              Live agent decision
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <Stat label="Difficulty" value={`${stateSummary.current_difficulty}/5`} />
              <Stat
                label="Avg score"
                value={(stateSummary.technical_running_avg * 100).toFixed(0)}
              />
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-2)",
                lineHeight: 1.5,
                fontStyle: stateSummary.last_decision ? "normal" : "italic",
              }}
            >
              {stateSummary.last_decision ?? "Waiting for first answer…"}
            </div>
          </div>

          {/* Last answer score */}
          {lastScore && (
            <div className="card" style={{ padding: 16 }}>
              <div
                className="uppercase"
                style={{
                  fontSize: 10,
                  color: "var(--ink-4)",
                  fontWeight: 500,
                  marginBottom: 10,
                }}
              >
                Last answer score
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  className="num"
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    letterSpacing: "-.04em",
                    color:
                      lastScore.overall > 0.75
                        ? "var(--good)"
                        : lastScore.overall > 0.5
                        ? "var(--acc)"
                        : "var(--warn)",
                  }}
                >
                  {Math.round(lastScore.overall * 100)}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>/100</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>
                {lastScore.rationale}
              </div>
            </div>
          )}

          {/* Transcript */}
          <div
            className="card scroll"
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            <div
              className="uppercase"
              style={{ fontSize: 10, color: "var(--ink-4)", fontWeight: 500 }}
            >
              Transcript
            </div>
            {transcript.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--ink-4)",
                    width: 36,
                    flexShrink: 0,
                    paddingTop: 2,
                  }}
                >
                  {m.time}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    className="uppercase mono"
                    style={{
                      fontSize: 9,
                      color: m.who === "agent" ? "var(--acc)" : "var(--ink-3)",
                      letterSpacing: ".15em",
                    }}
                  >
                    {m.who === "agent" ? "Mira" : "You"}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: m.who === "agent" ? "var(--ink)" : "var(--ink-2)",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.text}
                  </span>
                </div>
              </div>
            ))}
            {/* live interim transcript while listening */}
            {speech.state === "listening" && speech.interimTranscript && (
              <div style={{ display: "flex", gap: 10, opacity: 0.6 }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--ink-4)",
                    width: 36,
                    flexShrink: 0,
                    paddingTop: 2,
                  }}
                >
                  live
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    className="uppercase mono"
                    style={{
                      fontSize: 9,
                      color: "var(--ink-3)",
                      letterSpacing: ".15em",
                    }}
                  >
                    You · live
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                    {speech.interimTranscript}
                  </span>
                </div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function LiveDot() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 8, height: 8 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "var(--bad)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "1px solid var(--bad)",
            animation: "pulseRing 1.4s ease-out infinite",
          }}
        />
      </div>
      <span
        className="uppercase mono"
        style={{ fontSize: 10, letterSpacing: ".15em", color: "var(--bad)" }}
      >
        LIVE
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, color: "var(--ink-4)" }}>{label}</span>
      <span className="num" style={{ fontSize: 16, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}
