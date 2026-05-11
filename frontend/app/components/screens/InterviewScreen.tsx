"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AgentPersona, StateLabel } from "../AgentPersona";
import { useSpeech } from "../hooks/useSpeech";
import type { Route } from "../Sidebar";
import { useMultimodal } from "../hooks/useMultimodal";
import { MultimodalHud, HudBars } from "../MultimodalHud";


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
  difficulty_history: number[];
};

type ScoreResult = {
  correctness: number;
  depth: number;
  structure: number;
  overall: number;
  rationale: string;
};

type Persona = "mira" | "marcus" | "priya";

const PERSONALITY_VOICES: Record<Persona, string[]> = {
  mira: ["Samantha", "Karen", "Tessa", "Victoria"],
  marcus: ["Daniel", "Alex", "Fred", "Bruce"],
  priya: ["Tessa", "Karen", "Moira", "Veena"],
};

const PERSONALITY_NAMES: Record<Persona, string> = {
  mira: "Mira",
  marcus: "Marcus",
  priya: "Priya",
};

export type MultimodalAvgs = {
  eye_contact: number;
  posture: number;
  engagement: number;
  stress: number;
  filler_words_per_answer: number;
  avg_words_per_answer: number;
  avg_words_per_minute: number;
};

export function InterviewScreen({
  sessionId,
  initialQuestion,
  initialState,
  personality,
  setRoute,
  onEndInterview,
}: {
  sessionId: string;
  initialQuestion: string;
  initialState: StateSummary;
  personality: Persona;
  setRoute: (r: Route) => void;
  onEndInterview: (avgs: MultimodalAvgs) => void;
}) {
  // Voice
  const speech = useSpeech();
  const voiceList = PERSONALITY_VOICES[personality];
  const personaName = PERSONALITY_NAMES[personality];

  const multimodal = useMultimodal();
  // Track multimodal session averages so we can pass them to the feedback report
  const multimodalSumRef = useRef({
    eyeContact: 0,
    posture: 0,
    engagement: 0,
    stress: 0,
    samples: 0,
  });
  const sessionStatsRef = useRef({
    totalFillers: 0,
    totalWords: 0,
    totalDurationSec: 0,
    answerCount: 0,
  });
  const talkStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!multimodal.scores.faceDetected) return;
    multimodalSumRef.current.eyeContact += multimodal.scores.eyeContact;
    multimodalSumRef.current.posture += multimodal.scores.posture;
    multimodalSumRef.current.engagement += multimodal.scores.engagement;
    multimodalSumRef.current.stress += multimodal.scores.stress;
    multimodalSumRef.current.samples += 1;
  }, [multimodal.scores]);

  // Auto-start camera once on mount
  useEffect(() => {
    multimodal.start();
    return () => {
      multimodal.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setTimeout(() => speech.speak(initialQuestion, { voiceList }), 500);
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

      // Session stats — fillers + word count
      const fillerCount = speech.countFillers(answerText);
      const wordCount = answerText.trim().split(/\s+/).length;
      sessionStatsRef.current.totalFillers += fillerCount;
      sessionStatsRef.current.totalWords += wordCount;
      sessionStatsRef.current.answerCount += 1;

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
          speech.speak(wrapText, { voiceList });
        } else if (data.next_question) {
          const nextQ = data.next_question.text;
          setCurrentQuestion(nextQ);
          setTranscript((t) => [
            ...t,
            { who: "agent", text: nextQ, time: formatTime(elapsed) },
          ]);
          speech.speak(nextQ, { voiceList });
        }
      } catch (e) {
        console.error("Answer submit failed:", e);
        speech.setState("idle");
      }
    },
    [sessionId, elapsed, speech, voiceList],
  );

  // Toggle-to-talk: click once to start, click again to stop + submit
  const handleTalkToggle = () => {
    if (speech.state === "listening") {
      // Currently recording → stop and submit
      const finalText = speech.stopListening();
      const durationSec = (Date.now() - talkStartTimeRef.current) / 1000;
      if (finalText.trim()) {
        sessionStatsRef.current.totalDurationSec += durationSec;
        submitAnswer(finalText);
      }
    } else {
      // Not recording → start
      if (speech.state === "speaking") speech.cancelSpeak();
      talkStartTimeRef.current = Date.now();
      speech.startListening();
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
              const s = multimodalSumRef.current;
              const n = Math.max(1, s.samples);
              const stats = sessionStatsRef.current;
              const wpm =
                stats.totalDurationSec > 0
                  ? (stats.totalWords / stats.totalDurationSec) * 60
                  : 130;
              onEndInterview({
                eye_contact: s.eyeContact / n,
                posture: s.posture / n,
                engagement: s.engagement / n,
                stress: s.stress / n,
                filler_words_per_answer:
                  stats.answerCount > 0
                    ? stats.totalFillers / stats.answerCount
                    : 0,
                avg_words_per_answer:
                  stats.answerCount > 0
                    ? stats.totalWords / stats.answerCount
                    : 0,
                avg_words_per_minute: wpm,
              });
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
        {/* CAMERA — live webcam + MediaPipe overlay */}
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0908",
          }}
        >
          <video
            ref={multimodal.videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)", // mirror — feels natural
            }}
          />
          <canvas
            ref={multimodal.canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              transform: "scaleX(-1)", // mirror to match video
            }}
          />

          {/* "You" badge */}
          <div style={{ position: "absolute", top: 14, left: 14, zIndex: 5 }}>
            <span className="chip" style={{ fontSize: 10 }}>You</span>
          </div>

          {/* HUD pills */}
          {multimodal.isActive && <MultimodalHud scores={multimodal.scores} />}

          {/* Loading / error overlays */}
          {multimodal.isLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink-3)",
                fontSize: 13,
                background: "rgba(0,0,0,0.4)",
                zIndex: 10,
              }}
            >
              Loading multimodal models…
            </div>
          )}
          {multimodal.error && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--bad)",
                fontSize: 12,
                padding: 20,
                textAlign: "center",
                background: "rgba(0,0,0,0.7)",
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>⚠</div>
              <div>{multimodal.error}</div>
              <div style={{ marginTop: 8, color: "var(--ink-3)", fontSize: 11 }}>
                Allow camera access in Chrome settings, then refresh.
              </div>
            </div>
          )}
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
              {personaName} · interviewer
            </span>
          </div>

          <AgentPersona state={speech.state} size={180} personality={personality} />

          <StateLabel state={speech.state} personality={personality} />

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

         {/* Toggle-to-talk */}
          {!interviewComplete && (
            <button
              onClick={handleTalkToggle}
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
                animation:
                  speech.state === "listening"
                    ? "pulseRec 1.5s ease-in-out infinite"
                    : "none",
              }}
            >
              {speech.state === "listening" ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "white",
                      animation: "blink 1s ease-in-out infinite",
                    }}
                  />
                  Recording — click to stop & submit
                </span>
              ) : speech.state === "speaking" ? (
                `${personaName} is speaking…`
              ) : speech.state === "thinking" ? (
                "Scoring your answer…"
              ) : (
                "Click to start recording"
              )}
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
              onClick={() => {
                const s = multimodalSumRef.current;
                const n = Math.max(1, s.samples);
                const stats = sessionStatsRef.current;
                const wpm =
                  stats.totalDurationSec > 0
                    ? (stats.totalWords / stats.totalDurationSec) * 60
                    : 130;
                onEndInterview({
                  eye_contact: s.eyeContact / n,
                  posture: s.posture / n,
                  engagement: s.engagement / n,
                  stress: s.stress / n,
                  filler_words_per_answer:
                    stats.answerCount > 0
                      ? stats.totalFillers / stats.answerCount
                      : 0,
                  avg_words_per_answer:
                    stats.answerCount > 0
                      ? stats.totalWords / stats.answerCount
                      : 0,
                  avg_words_per_minute: wpm,
                });
              }}
            >
              See feedback →
            </button>
          )}
        </div>

        {/* RIGHT COLUMN: HUD + Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          {/* Live multimodal bars */}
          {multimodal.isActive && <HudBars scores={multimodal.scores} />}

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
            {stateSummary.difficulty_history.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span
                  className="uppercase mono"
                  style={{
                    fontSize: 9,
                    color: "var(--ink-4)",
                    letterSpacing: ".15em",
                  }}
                >
                  Trajectory
                </span>
                <DifficultySparkline history={stateSummary.difficulty_history} />
              </div>
            )}
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
                    {m.who === "agent" ? personaName : "You"}
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

function DifficultySparkline({ history }: { history: number[] }) {
  const W = 120;
  const H = 24;
  const PAD = 2;
  const n = history.length;
  // Map difficulty 1..5 to y; 5 sits at the top.
  const yFor = (d: number) => {
    const clamped = Math.max(1, Math.min(5, d));
    return PAD + ((5 - clamped) / 4) * (H - PAD * 2);
  };
  const xFor = (i: number) => {
    if (n <= 1) return W / 2;
    return PAD + (i / (n - 1)) * (W - PAD * 2);
  };

  const points = history.map((d, i) => `${xFor(i)},${yFor(d)}`).join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block" }}
      aria-label="Difficulty trajectory"
    >
      {n > 1 && (
        <polyline
          points={points}
          fill="none"
          stroke="var(--acc)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {history.map((d, i) => (
        <circle
          key={i}
          cx={xFor(i)}
          cy={yFor(d)}
          r={i === n - 1 ? 3 : 2}
          fill="var(--acc)"
        />
      ))}
    </svg>
  );
}
