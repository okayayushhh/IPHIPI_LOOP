"use client";

type AgentState = "idle" | "asking" | "listening" | "thinking";

export function AgentPersona({
  state = "idle",
  size = 200,
}: {
  state?: AgentState;
  size?: number;
}) {
  const speaking = state === "asking";
  const listening = state === "listening";
  const thinking = state === "thinking";
  const tilt = listening ? -3 : thinking ? 2 : 0;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id="bgG" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#FFF1E0" />
            <stop offset="55%" stopColor="#FFD9BD" />
            <stop offset="100%" stopColor="#FFBE94" />
          </radialGradient>
          <linearGradient id="hairG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5a3520" />
            <stop offset="100%" stopColor="#2e1a0e" />
          </linearGradient>
          <linearGradient id="skinG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fae0c4" />
            <stop offset="100%" stopColor="#e3b88f" />
          </linearGradient>
          <linearGradient id="shirtG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9DBEFF" />
            <stop offset="100%" stopColor="#7B9EE8" />
          </linearGradient>
          <radialGradient id="cheekG" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,140,120,.55)" />
            <stop offset="100%" stopColor="rgba(255,140,120,0)" />
          </radialGradient>
        </defs>

        {/* warm gradient bg circle */}
        <circle cx="100" cy="100" r="100" fill="url(#bgG)" />

        {/* halo when speaking */}
        {speaking && (
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(107,142,14,.5)" strokeWidth="1.5">
            <animate attributeName="r" values="86;96;86" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".5;.1;.5" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
        {!speaking && (
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(107,142,14,.25)" />
        )}

        {/* sparkles */}
        <g opacity="0.7">
          <circle cx="40" cy="50" r="1.5" fill="#FFD66B">
            <animate attributeName="opacity" values=".3;1;.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="55" r="1.2" fill="#FFB6E0">
            <animate attributeName="opacity" values="1;.3;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="170" cy="140" r="1" fill="#9DD9FF">
            <animate attributeName="opacity" values=".4;1;.4" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* shoulders */}
        <g style={{ transformOrigin: "100px 200px", animation: "blob 4s ease-in-out infinite" }}>
          <path d="M28 200 Q 60 150 100 138 Q 140 150 172 200 Z" fill="url(#shirtG)" />
          <path d="M88 142 Q 100 152 112 142 L 108 138 Q 100 145 92 138 Z" fill="url(#skinG)" opacity="0.85" />
          <circle cx="125" cy="170" r="2.2" fill="#6b8e0e" />
        </g>

        {/* head — tilts based on state */}
        <g style={{
          transformOrigin: "100px 110px",
          transform: `rotate(${tilt}deg)`,
          transition: "transform .6s cubic-bezier(.4,1.6,.5,1)",
        }}>
          {/* neck */}
          <path d="M88 132 L 88 148 Q 100 154 112 148 L 112 132 Z" fill="url(#skinG)" />
          <path d="M88 148 Q 100 154 112 148" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1" />

          {/* face */}
          <ellipse cx="100" cy="106" rx="38" ry="42" fill="url(#skinG)" />
          {/* hair */}
          <path
            d="M62 102 Q 56 64 100 58 Q 144 64 138 104 Q 138 86 122 80 Q 116 96 100 96 Q 84 96 78 88 Q 66 88 62 102 Z"
            fill="url(#hairG)"
          />
          <path d="M78 70 Q 95 62 115 66" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" strokeLinecap="round" />

          {/* cheeks */}
          <ellipse cx="78" cy="120" rx="7" ry="4.5" fill="url(#cheekG)" />
          <ellipse cx="122" cy="120" rx="7" ry="4.5" fill="url(#cheekG)" />

          {/* eyebrows — vary by state */}
          <path
            d={
              thinking
                ? "M76 94 Q 86 90 96 94"
                : listening
                ? "M76 96 Q 86 93 96 96"
                : speaking
                ? "M76 92 Q 86 88 96 92"
                : "M76 95 Q 86 92 96 95"
            }
            fill="none"
            stroke="#3a2418"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ transition: "d .4s ease" }}
          />
          <path
            d={
              thinking
                ? "M104 90 Q 114 86 124 92"
                : listening
                ? "M104 96 Q 114 93 124 96"
                : speaking
                ? "M104 92 Q 114 88 124 92"
                : "M104 95 Q 114 92 124 95"
            }
            fill="none"
            stroke="#3a2418"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ transition: "d .4s ease" }}
          />

          {/* eyes */}
          <g>
            <circle cx={86} cy={108} r="3.4" fill="#3a2418" />
            <circle cx={114} cy={108} r="3.4" fill="#3a2418" />
            <circle cx={86} cy={108} r="1.6" fill="#0d0703" />
            <circle cx={114} cy={108} r="1.6" fill="#0d0703" />
            <circle cx="87.5" cy="106.5" r="1.3" fill="#fff" />
            <circle cx="115.5" cy="106.5" r="1.3" fill="#fff" />
            {/* periodic blink */}
            <rect x="81.5" y="103.5" width="9" height="9" fill="url(#skinG)">
              <animate
                attributeName="height"
                values="0;0;9;0;0"
                keyTimes="0;0.95;0.965;0.985;1"
                dur="5.5s"
                repeatCount="indefinite"
              />
            </rect>
            <rect x="109.5" y="103.5" width="9" height="9" fill="url(#skinG)">
              <animate
                attributeName="height"
                values="0;0;9;0;0"
                keyTimes="0;0.95;0.965;0.985;1"
                dur="5.5s"
                repeatCount="indefinite"
              />
            </rect>
          </g>

          {/* nose */}
          <path
            d="M100 115 Q 97 122 100 125 Q 103 125 100 121"
            fill="none"
            stroke="rgba(0,0,0,.18)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* mouth — varies by state */}
          {speaking ? (
            <g>
              <path d="M88 130 Q 100 142 112 130 Q 100 134 88 130 Z" fill="#7a2410">
                <animate
                  attributeName="d"
                  values="M88 130 Q 100 142 112 130 Q 100 134 88 130 Z;
                          M89 130 Q 100 138 111 130 Q 100 132 89 130 Z;
                          M88 130 Q 100 144 112 130 Q 100 135 88 130 Z;
                          M88 130 Q 100 142 112 130 Q 100 134 88 130 Z"
                  dur="0.7s"
                  repeatCount="indefinite"
                />
              </path>
              <path d="M91 131 Q 100 135 109 131 L 108 132 Q 100 134 92 132 Z" fill="#fff" />
            </g>
          ) : thinking ? (
            <path
              d="M89 132 Q 100 137 110 130"
              fill="none"
              stroke="#7a2410"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M88 130 Q 100 140 112 130"
                fill="none"
                stroke="#7a2410"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="86" cy="129" r="0.8" fill="rgba(0,0,0,.12)" />
              <circle cx="114" cy="129" r="0.8" fill="rgba(0,0,0,.12)" />
            </>
          )}

          {/* earrings */}
          <circle cx="62" cy="118" r="2.2" fill="#FFD66B" stroke="#C49A2A" strokeWidth="0.5" />
          <circle cx="138" cy="118" r="2.2" fill="#FFD66B" stroke="#C49A2A" strokeWidth="0.5" />
        </g>

        {/* listening waveform under chin */}
        {listening && (
          <g transform="translate(82,168)">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={i} x={i * 5} y={-4} width="3" height="8" rx="1.5" fill="#6b8e0e">
                <animate
                  attributeName="height"
                  values="3;14;5;11;3"
                  dur={`${0.6 + i * 0.05}s`}
                  begin={`${i * 0.04}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="y"
                  values="-1;-7;-2;-5;-1"
                  dur={`${0.6 + i * 0.05}s`}
                  begin={`${i * 0.04}s`}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </g>
        )}

        {/* thinking dots */}
        {thinking && (
          <g transform="translate(146,56)">
            <ellipse cx="9" cy="0" rx="14" ry="9" fill="#fff" opacity="0.88" stroke="rgba(107,142,14,.3)" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={i * 6 + 3} cy="0" r="1.8" fill="#6b8e0e">
                <animate
                  attributeName="opacity"
                  values="0.2;1;0.2"
                  dur="1.2s"
                  begin={`${i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export function StateLabel({ state }: { state: AgentState }) {
  const map = {
    idle: { txt: "READY", col: "var(--ink-3)" },
    asking: { txt: "SPEAKING", col: "var(--acc)" },
    listening: { txt: "LISTENING", col: "var(--good)" },
    thinking: { txt: "THINKING", col: "var(--warn)" },
  };
  const s = map[state] ?? map.idle;
  return (
    <div
      className="uppercase mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 10,
        letterSpacing: ".18em",
        color: s.col,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.col,
          animation: state !== "idle" ? "blink 1.2s infinite" : "none",
        }}
      />
      {s.txt}
    </div>
  );
}
