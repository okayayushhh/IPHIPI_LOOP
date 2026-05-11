"use client";

// "asking" and "speaking" both mean the agent is talking — accept either
// so this can take speech.state directly.
type AgentState = "idle" | "asking" | "speaking" | "listening" | "thinking";
type Persona = "mira" | "marcus" | "priya";

const PERSONAS: Record<
  Persona,
  {
    bgGradient: [string, string, string];
    skinGradient: [string, string];
    hairGradient: [string, string];
    shirtGradient: [string, string];
    pulseColor: string;
    accentColor: string;
    hasEarrings: boolean;
    hasBindi: boolean;
    mouthIdle: string;
    eyebrowColor: string;
    name: string;
  }
> = {
  mira: {
    bgGradient: ["#FFF1E0", "#FFD9BD", "#FFBE94"],
    skinGradient: ["#fae0c4", "#e3b88f"],
    hairGradient: ["#5a3520", "#2e1a0e"],
    shirtGradient: ["#9DBEFF", "#7B9EE8"],
    pulseColor: "rgba(107,142,14,.5)",
    accentColor: "#6b8e0e",
    hasEarrings: true,
    hasBindi: false,
    mouthIdle: "M88 130 Q 100 140 112 130",
    eyebrowColor: "#3a2418",
    name: "MIRA",
  },
  marcus: {
    bgGradient: ["#dde6f2", "#a8c5e8", "#7da8d4"],
    skinGradient: ["#f0d4ba", "#c69876"],
    hairGradient: ["#1a1a1a", "#0a0a0a"],
    shirtGradient: ["#3a5274", "#243a52"],
    pulseColor: "rgba(46,94,143,.5)",
    accentColor: "#2e5e8f",
    hasEarrings: false,
    hasBindi: false,
    mouthIdle: "M88 132 L 112 132",
    eyebrowColor: "#0a0a0a",
    name: "MARCUS",
  },
  priya: {
    bgGradient: ["#f9dde8", "#e8a8c4", "#c87aa0"],
    skinGradient: ["#e8b896", "#c2876a"],
    hairGradient: ["#3d1a25", "#1a0810"],
    shirtGradient: ["#8a2e5a", "#5e1a3a"],
    pulseColor: "rgba(160,68,152,.5)",
    accentColor: "#a04498",
    hasEarrings: true,
    hasBindi: true,
    mouthIdle: "M88 130 Q 100 138 112 130",
    eyebrowColor: "#3d1a25",
    name: "PRIYA",
  },
};

export function AgentPersona({
  state = "idle",
  size = 200,
  personality = "mira",
}: {
  state?: AgentState;
  size?: number;
  personality?: Persona;
}) {
  const p = PERSONAS[personality];
  const speaking = state === "asking" || state === "speaking";
  const listening = state === "listening";
  const thinking = state === "thinking";
  const tilt = listening ? -3 : thinking ? 2 : 0;

  // Marcus stays stoic — his eyebrows don't soften when speaking.
  const angularBrows = personality === "marcus";

  const idBg = `bgG-${personality}`;
  const idHair = `hairG-${personality}`;
  const idSkin = `skinG-${personality}`;
  const idShirt = `shirtG-${personality}`;
  const idCheek = `cheekG-${personality}`;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id={idBg} cx="50%" cy="40%">
            <stop offset="0%" stopColor={p.bgGradient[0]} />
            <stop offset="55%" stopColor={p.bgGradient[1]} />
            <stop offset="100%" stopColor={p.bgGradient[2]} />
          </radialGradient>
          <linearGradient id={idHair} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={p.hairGradient[0]} />
            <stop offset="100%" stopColor={p.hairGradient[1]} />
          </linearGradient>
          <linearGradient id={idSkin} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={p.skinGradient[0]} />
            <stop offset="100%" stopColor={p.skinGradient[1]} />
          </linearGradient>
          <linearGradient id={idShirt} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={p.shirtGradient[0]} />
            <stop offset="100%" stopColor={p.shirtGradient[1]} />
          </linearGradient>
          <radialGradient id={idCheek} cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,140,120,.55)" />
            <stop offset="100%" stopColor="rgba(255,140,120,0)" />
          </radialGradient>
        </defs>

        {/* gradient bg circle */}
        <circle cx="100" cy="100" r="100" fill={`url(#${idBg})`} />

        {/* halo when speaking */}
        {speaking && (
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke={p.pulseColor}
            strokeWidth="1.5"
          >
            <animate
              attributeName="r"
              values="86;96;86"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values=".5;.1;.5"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}
        {!speaking && (
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke={p.pulseColor}
            strokeOpacity="0.5"
          />
        )}

        {/* sparkles */}
        <g opacity="0.7">
          <circle cx="40" cy="50" r="1.5" fill="#FFD66B">
            <animate
              attributeName="opacity"
              values=".3;1;.3"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="160" cy="55" r="1.2" fill="#FFB6E0">
            <animate
              attributeName="opacity"
              values="1;.3;1"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="170" cy="140" r="1" fill="#9DD9FF">
            <animate
              attributeName="opacity"
              values=".4;1;.4"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* shoulders */}
        <g
          style={{
            transformOrigin: "100px 200px",
            animation: "blob 4s ease-in-out infinite",
          }}
        >
          <path
            d="M28 200 Q 60 150 100 138 Q 140 150 172 200 Z"
            fill={`url(#${idShirt})`}
          />
          <path
            d="M88 142 Q 100 152 112 142 L 108 138 Q 100 145 92 138 Z"
            fill={`url(#${idSkin})`}
            opacity="0.85"
          />
          <circle cx="125" cy="170" r="2.2" fill={p.accentColor} />
        </g>

        {/* head */}
        <g
          style={{
            transformOrigin: "100px 110px",
            transform: `rotate(${tilt}deg)`,
            transition: "transform .6s cubic-bezier(.4,1.6,.5,1)",
          }}
        >
          {/* neck */}
          <path
            d="M88 132 L 88 148 Q 100 154 112 148 L 112 132 Z"
            fill={`url(#${idSkin})`}
          />
          <path
            d="M88 148 Q 100 154 112 148"
            fill="none"
            stroke="rgba(0,0,0,.08)"
            strokeWidth="1"
          />

          {/* face */}
          <ellipse cx="100" cy="106" rx="38" ry="42" fill={`url(#${idSkin})`} />
          {/* hair */}
          <path
            d="M62 102 Q 56 64 100 58 Q 144 64 138 104 Q 138 86 122 80 Q 116 96 100 96 Q 84 96 78 88 Q 66 88 62 102 Z"
            fill={`url(#${idHair})`}
          />
          <path
            d="M78 70 Q 95 62 115 66"
            fill="none"
            stroke="rgba(255,255,255,.18)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* bindi (Priya only) */}
          {p.hasBindi && (
            <circle cx="100" cy="78" r="2.5" fill={p.accentColor} />
          )}

          {/* cheeks */}
          <ellipse cx="78" cy="120" rx="7" ry="4.5" fill={`url(#${idCheek})`} />
          <ellipse
            cx="122"
            cy="120"
            rx="7"
            ry="4.5"
            fill={`url(#${idCheek})`}
          />

          {/* eyebrows — vary by state (Marcus stays angular always) */}
          <path
            d={
              angularBrows
                ? "M76 92 Q 86 88 96 92"
                : thinking
                ? "M76 94 Q 86 90 96 94"
                : listening
                ? "M76 96 Q 86 93 96 96"
                : speaking
                ? "M76 92 Q 86 88 96 92"
                : "M76 95 Q 86 92 96 95"
            }
            fill="none"
            stroke={p.eyebrowColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ transition: "d .4s ease" }}
          />
          <path
            d={
              angularBrows
                ? "M104 92 Q 114 88 124 92"
                : thinking
                ? "M104 90 Q 114 86 124 92"
                : listening
                ? "M104 96 Q 114 93 124 96"
                : speaking
                ? "M104 92 Q 114 88 124 92"
                : "M104 95 Q 114 92 124 95"
            }
            fill="none"
            stroke={p.eyebrowColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ transition: "d .4s ease" }}
          />

          {/* eyes */}
          <g>
            <circle cx={86} cy={108} r="3.4" fill={p.eyebrowColor} />
            <circle cx={114} cy={108} r="3.4" fill={p.eyebrowColor} />
            <circle cx={86} cy={108} r="1.6" fill="#0d0703" />
            <circle cx={114} cy={108} r="1.6" fill="#0d0703" />
            <circle cx="87.5" cy="106.5" r="1.3" fill="#fff" />
            <circle cx="115.5" cy="106.5" r="1.3" fill="#fff" />
            {/* periodic blink */}
            <rect
              x="81.5"
              y="103.5"
              width="9"
              height="9"
              fill={`url(#${idSkin})`}
            >
              <animate
                attributeName="height"
                values="0;0;9;0;0"
                keyTimes="0;0.95;0.965;0.985;1"
                dur="5.5s"
                repeatCount="indefinite"
              />
            </rect>
            <rect
              x="109.5"
              y="103.5"
              width="9"
              height="9"
              fill={`url(#${idSkin})`}
            >
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

          {/* mouth */}
          {speaking ? (
            <g>
              <path
                d="M88 130 Q 100 142 112 130 Q 100 134 88 130 Z"
                fill="#7a2410"
              >
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
              <path
                d="M91 131 Q 100 135 109 131 L 108 132 Q 100 134 92 132 Z"
                fill="#fff"
              />
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
                d={p.mouthIdle}
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
          {p.hasEarrings && (
            <>
              <circle
                cx="62"
                cy="118"
                r="2.2"
                fill="#FFD66B"
                stroke="#C49A2A"
                strokeWidth="0.5"
              />
              <circle
                cx="138"
                cy="118"
                r="2.2"
                fill="#FFD66B"
                stroke="#C49A2A"
                strokeWidth="0.5"
              />
            </>
          )}
        </g>

        {/* listening waveform under chin */}
        {listening && (
          <g transform="translate(82,168)">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect
                key={i}
                x={i * 5}
                y={-4}
                width="3"
                height="8"
                rx="1.5"
                fill={p.accentColor}
              >
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
            <ellipse
              cx="9"
              cy="0"
              rx="14"
              ry="9"
              fill="#fff"
              opacity="0.88"
              stroke={p.pulseColor}
            />
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={i * 6 + 3}
                cy="0"
                r="1.8"
                fill={p.accentColor}
              >
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

export function StateLabel({
  state,
  personality = "mira",
}: {
  state: AgentState;
  personality?: Persona;
}) {
  const map: Record<AgentState, { txt: string; col: string }> = {
    idle: { txt: "READY", col: "var(--ink-3)" },
    asking: { txt: "SPEAKING", col: "var(--acc)" },
    speaking: { txt: "SPEAKING", col: "var(--acc)" },
    listening: { txt: "LISTENING", col: "var(--good)" },
    thinking: { txt: "THINKING", col: "var(--warn)" },
  };
  const s = map[state] ?? map.idle;
  const personaName = PERSONAS[personality].name;
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
      {personaName} · {s.txt}
    </div>
  );
}
