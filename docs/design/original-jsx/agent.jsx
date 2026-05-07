// Agent persona — three visual variants
const { useEffect: useEffectA, useState: useStateA, useMemo: useMemoA } = React;

// 1. Orb — abstract pulsing energy
function AgentOrb({ state="idle", size=200 }) {
  // states: idle, asking, listening, thinking
  const speaking = state === "asking";
  const listening = state === "listening";
  const thinking = state === "thinking";

  return (
    <div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {/* outer glow */}
      <div style={{
        position:"absolute",inset:0,borderRadius:"50%",
        background:"radial-gradient(circle at 50% 50%, rgba(255,107,53,.45) 0%, rgba(255,107,53,.15) 35%, transparent 70%)",
        filter:"blur(8px)",
        animation:`blob 4s ease-in-out infinite`,
      }}/>
      {/* mid ring */}
      <div style={{
        position:"absolute",width:size*0.78,height:size*0.78,borderRadius:"50%",
        border:"1px solid rgba(255,107,53,.35)",
        animation: speaking ? `pulseRing 1.6s ease-out infinite` : "none",
      }}/>
      <div style={{
        position:"absolute",width:size*0.78,height:size*0.78,borderRadius:"50%",
        border:"1px solid rgba(255,107,53,.22)",
        animation: speaking ? `pulseRing 1.6s ease-out .4s infinite` : "none",
      }}/>
      {/* core */}
      <div style={{
        position:"relative",
        width:size*0.55,height:size*0.55,borderRadius:"50%",
        background:`radial-gradient(circle at 35% 30%, #FFD9C2 0%, #FF8A5C 30%, #D14A18 80%, #7A2607 100%)`,
        boxShadow: "inset 0 -6px 20px rgba(0,0,0,.3), 0 0 60px rgba(255,107,53,.4)",
        animation: thinking ? `spin 8s linear infinite` : `blob 3.5s ease-in-out infinite`,
      }}>
        {/* inner highlight */}
        <div style={{position:"absolute",top:"15%",left:"22%",width:"30%",height:"22%",borderRadius:"50%",background:"rgba(255,255,255,.55)",filter:"blur(6px)"}}/>
      </div>
      {/* listening waveform overlay */}
      {listening && (
        <div style={{position:"absolute",bottom:size*0.28,left:0,right:0,display:"flex",justifyContent:"center"}}>
          <div style={{display:"flex",gap:3,alignItems:"center",height:24}}>
            {Array.from({length:9}).map((_,i)=>(
              <div key={i} style={{
                width:3,height:"70%",background:"var(--ink)",borderRadius:2,
                animation:`wave ${0.4+(i%3)*0.1}s ease-in-out ${i*0.05}s infinite alternate`,transformOrigin:"center"
              }}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Persona — illustrated character "Mira" — warm, friendly interviewer
function AgentMira({ state="idle", size=200 }) {
  const speaking = state==="asking";
  const listening = state==="listening";
  const thinking = state==="thinking";
  // Gentle head tilt when listening (signals attentiveness)
  const tilt = listening ? -3 : thinking ? 2 : 0;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id="bgG" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#FFF1E0"/>
            <stop offset="55%" stopColor="#FFD9BD"/>
            <stop offset="100%" stopColor="#FFBE94"/>
          </radialGradient>
          <linearGradient id="hairG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5a3520"/>
            <stop offset="100%" stopColor="#2e1a0e"/>
          </linearGradient>
          <linearGradient id="skinG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fae0c4"/>
            <stop offset="100%" stopColor="#e3b88f"/>
          </linearGradient>
          <linearGradient id="shirtG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9DBEFF"/>
            <stop offset="100%" stopColor="#7B9EE8"/>
          </linearGradient>
          <radialGradient id="cheekG" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,140,120,.55)"/>
            <stop offset="100%" stopColor="rgba(255,140,120,0)"/>
          </radialGradient>
        </defs>

        {/* warm gradient bg */}
        <circle cx="100" cy="100" r="100" fill="url(#bgG)"/>
        {/* gentle pulse halo when speaking — feels like a kind voice */}
        {speaking && (
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,107,53,.45)" strokeWidth="1.5">
            <animate attributeName="r" values="86;96;86" dur="2.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".5;.1;.5" dur="2.4s" repeatCount="indefinite"/>
          </circle>
        )}
        {!speaking && <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,107,53,.25)"/>}

        {/* tiny floating sparkles for warmth */}
        <g opacity="0.7">
          <circle cx="40" cy="50" r="1.5" fill="#FFD66B">
            <animate attributeName="opacity" values=".3;1;.3" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="160" cy="55" r="1.2" fill="#FFB6E0">
            <animate attributeName="opacity" values="1;.3;1" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="170" cy="140" r="1" fill="#9DD9FF">
            <animate attributeName="opacity" values=".4;1;.4" dur="3.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="32" cy="135" r="1.3" fill="#C9A6FF">
            <animate attributeName="opacity" values="1;.4;1" dur="2.8s" repeatCount="indefinite"/>
          </circle>
        </g>

        {/* breathing body group */}
        <g style={{transformOrigin:"100px 200px",animation:"blob 4s ease-in-out infinite"}}>
          {/* shoulders / sweater — softer sky blue, less corporate */}
          <path d="M28 200 Q 60 150 100 138 Q 140 150 172 200 Z" fill="url(#shirtG)"/>
          {/* sweater collar v */}
          <path d="M88 142 Q 100 152 112 142 L 108 138 Q 100 145 92 138 Z" fill="url(#skinG)" opacity="0.85"/>
          {/* tiny accent pin on sweater */}
          <circle cx="125" cy="170" r="2.2" fill="var(--acc)"/>
        </g>

        {/* head group — tilts subtly with state */}
        <g style={{transformOrigin:"100px 110px", transform:`rotate(${tilt}deg)`, transition:"transform .6s cubic-bezier(.4,1.6,.5,1)"}}>
          {/* neck */}
          <path d="M88 132 L 88 148 Q 100 154 112 148 L 112 132 Z" fill="url(#skinG)"/>
          <path d="M88 148 Q 100 154 112 148" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1"/>
          {/* head — a touch rounder than before, friendlier */}
          <ellipse cx="100" cy="106" rx="38" ry="42" fill="url(#skinG)"/>
          {/* hair — short, soft, framing not severe */}
          <path d="M62 102 Q 56 64 100 58 Q 144 64 138 104 Q 138 86 122 80 Q 116 96 100 96 Q 84 96 78 88 Q 66 88 62 102 Z" fill="url(#hairG)"/>
          {/* tiny hair shine */}
          <path d="M78 70 Q 95 62 115 66" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" strokeLinecap="round"/>

          {/* warm cheek blush */}
          <ellipse cx="78" cy="120" rx="7" ry="4.5" fill="url(#cheekG)"/>
          <ellipse cx="122" cy="120" rx="7" ry="4.5" fill="url(#cheekG)"/>

          {/* eyebrows — gentle arches; lift slightly when speaking (engaged), 
               soft empathetic tilt when listening, curious one-up when thinking */}
          {(() => {
            const eb = thinking
              ? { l: "M76 94 Q 86 90 96 94", r: "M104 90 Q 114 86 124 92" }
              : listening
              ? { l: "M76 96 Q 86 93 96 96", r: "M104 96 Q 114 93 124 96" }
              : speaking
              ? { l: "M76 92 Q 86 88 96 92", r: "M104 92 Q 114 88 124 92" }
              : { l: "M76 95 Q 86 92 96 95", r: "M104 95 Q 114 92 124 95" };
            return (
              <>
                <path d={eb.l} fill="none" stroke="#3a2418" strokeWidth="1.8" strokeLinecap="round" style={{transition:"d .4s ease"}}/>
                <path d={eb.r} fill="none" stroke="#3a2418" strokeWidth="1.8" strokeLinecap="round" style={{transition:"d .4s ease"}}/>
              </>
            );
          })()}

          {/* eyes — bigger, rounder, more sparkle. softer color than pure black. */}
          <g>
            {/* eye whites */}
            <ellipse cx="86" cy="108" rx="4.5" ry="4.5" fill="#fff"/>
            <ellipse cx="114" cy="108" rx="4.5" ry="4.5" fill="#fff"/>
            {/* iris — warm brown */}
            <circle cx={86} cy={108} r="3.4" fill="#3a2418"/>
            <circle cx={114} cy={108} r="3.4" fill="#3a2418"/>
            {/* pupil */}
            <circle cx={86} cy={108} r="1.6" fill="#0d0703"/>
            <circle cx={114} cy={108} r="1.6" fill="#0d0703"/>
            {/* highlight — the "alive" sparkle */}
            <circle cx="87.5" cy="106.5" r="1.3" fill="#fff"/>
            <circle cx="115.5" cy="106.5" r="1.3" fill="#fff"/>
            <circle cx="84.5" cy="109.5" r="0.6" fill="#fff" opacity="0.7"/>
            <circle cx="112.5" cy="109.5" r="0.6" fill="#fff" opacity="0.7"/>
            {/* lower eyelashes — friendly Duo-Lingo style flick */}
            <path d="M82 110 Q 86 113 90 110" fill="none" stroke="#3a2418" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>
            <path d="M110 110 Q 114 113 118 110" fill="none" stroke="#3a2418" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>
            {/* blink — happens periodically; eyelid sweeps down briefly */}
            <rect x="81.5" y="103.5" width="9" height="9" fill="url(#skinG)">
              <animate attributeName="height" values="0;0;9;0;0" keyTimes="0;0.95;0.965;0.985;1" dur="5.5s" repeatCount="indefinite"/>
            </rect>
            <rect x="109.5" y="103.5" width="9" height="9" fill="url(#skinG)">
              <animate attributeName="height" values="0;0;9;0;0" keyTimes="0;0.95;0.965;0.985;1" dur="5.5s" repeatCount="indefinite"/>
            </rect>
          </g>

          {/* nose — minimal */}
          <path d="M100 115 Q 97 122 100 125 Q 103 125 100 121" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="1" strokeLinecap="round"/>

          {/* mouth — ALWAYS smiling. width/curve varies with state. */}
          {(() => {
            // base = warm smile. speaking = open animated smile. listening = closed gentle smile. thinking = soft side-pulled smile.
            if (speaking) {
              return (
                <g>
                  <path d="M88 130 Q 100 142 112 130 Q 100 134 88 130 Z" fill="#7a2410">
                    <animate attributeName="d"
                      values="M88 130 Q 100 142 112 130 Q 100 134 88 130 Z;
                              M89 130 Q 100 138 111 130 Q 100 132 89 130 Z;
                              M88 130 Q 100 144 112 130 Q 100 135 88 130 Z;
                              M88 130 Q 100 142 112 130 Q 100 134 88 130 Z"
                      dur="0.7s" repeatCount="indefinite"/>
                  </path>
                  {/* teeth */}
                  <path d="M91 131 Q 100 135 109 131 L 108 132 Q 100 134 92 132 Z" fill="#fff"/>
                </g>
              );
            }
            if (thinking) {
              return <path d="M89 132 Q 100 137 110 130" fill="none" stroke="#7a2410" strokeWidth="2" strokeLinecap="round"/>;
            }
            // idle / listening — warm closed smile
            return (
              <>
                <path d="M88 130 Q 100 140 112 130" fill="none" stroke="#7a2410" strokeWidth="2.2" strokeLinecap="round"/>
                {/* dimples */}
                <circle cx="86" cy="129" r="0.8" fill="rgba(0,0,0,.12)"/>
                <circle cx="114" cy="129" r="0.8" fill="rgba(0,0,0,.12)"/>
              </>
            );
          })()}

          {/* gold stud earrings */}
          <circle cx="62" cy="118" r="2.2" fill="#FFD66B" stroke="#C49A2A" strokeWidth="0.5"/>
          <circle cx="138" cy="118" r="2.2" fill="#FFD66B" stroke="#C49A2A" strokeWidth="0.5"/>
        </g>

        {/* listening waveform under chin — softer, rounded */}
        {listening && (
          <g transform="translate(82,168)">
            {[0,1,2,3,4,5,6,7].map(i => (
              <rect key={i} x={i*5} y={-4} width="3" height="8" rx="1.5" fill="var(--acc)">
                <animate attributeName="height" values="3;14;5;11;3" dur={`${0.6+i*0.05}s`} begin={`${i*0.04}s`} repeatCount="indefinite"/>
                <animate attributeName="y" values="-1;-7;-2;-5;-1" dur={`${0.6+i*0.05}s`} begin={`${i*0.04}s`} repeatCount="indefinite"/>
              </rect>
            ))}
          </g>
        )}

        {/* thinking — soft thought bubble dots that feel encouraging not judgey */}
        {thinking && (
          <g transform="translate(146,56)">
            <ellipse cx="9" cy="0" rx="14" ry="9" fill="#fff" opacity="0.88" stroke="rgba(255,107,53,.3)"/>
            {[0,1,2].map(i=>(
              <circle key={i} cx={i*6+3} cy="0" r="1.8" fill="var(--acc)">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin={`${i*0.2}s`} repeatCount="indefinite"/>
              </circle>
            ))}
          </g>
        )}

        {/* tiny "i'm here for you" wave hand when idle — gentle */}
        {state === "idle" && (
          <g transform="translate(150,150)">
            <text x="0" y="0" fontSize="18" style={{transformOrigin:"0 0",animation:"blob 2.5s ease-in-out infinite"}}>👋</text>
          </g>
        )}
      </svg>
    </div>
  );
}

// 3. Wave — minimal voice waveform circle
function AgentWave({ state="idle", size=200 }) {
  const active = state==="asking" || state==="listening";
  const thinking = state==="thinking";
  return (
    <div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{
        position:"absolute",inset:0,borderRadius:"50%",
        border:"1px solid var(--line-2)",
      }}/>
      <div style={{
        position:"absolute",inset:size*0.08,borderRadius:"50%",
        background:"radial-gradient(circle at 50% 50%, rgba(196,255,78,.08) 0%, transparent 70%)",
        animation:active?"blob 2s ease-in-out infinite":"none",
      }}/>
      {/* center waveform */}
      <div style={{display:"flex",alignItems:"center",gap:size*0.025,height:size*0.4}}>
        {Array.from({length:13}).map((_,i)=>{
          const center = 6;
          const dist = Math.abs(i-center);
          const baseH = (1 - dist/8) * 100;
          return (
            <div key={i} style={{
              width:size*0.025,
              height:`${baseH}%`,
              background:"var(--acc)",
              borderRadius:2,
              animation:active?`wave ${0.35+dist*0.08}s ease-in-out ${dist*0.04}s infinite alternate`:"none",
              opacity: active?1: 0.3,
              transformOrigin:"center"
            }}/>
          );
        })}
      </div>
      {thinking && (
        <div style={{position:"absolute",bottom:14,fontFamily:"var(--mono)",fontSize:10,letterSpacing:".15em",color:"var(--ink-3)",textTransform:"uppercase"}}>
          thinking
          <span style={{animation:"blink 1.4s infinite"}}>...</span>
        </div>
      )}
    </div>
  );
}

function AgentPersona({ variant="orb", state="idle", size=200 }) {
  if (variant==="mira") return <AgentMira state={state} size={size}/>;
  if (variant==="wave") return <AgentWave state={state} size={size}/>;
  return <AgentOrb state={state} size={size}/>;
}

function StateLabel({ state }) {
  const map = {
    idle:    { txt: "READY",     col: "var(--ink-3)" },
    asking:  { txt: "SPEAKING",  col: "var(--acc)" },
    listening: { txt: "LISTENING", col: "var(--good)" },
    thinking: { txt: "THINKING", col: "var(--warn)" },
  };
  const s = map[state] || map.idle;
  return (
    <div className="uppercase mono" style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:10,letterSpacing:".18em",color:s.col}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:s.col,animation:state!=="idle"?"blink 1.2s infinite":"none"}}/>
      {s.txt}
    </div>
  );
}

Object.assign(window, { AgentPersona, AgentOrb, AgentMira, AgentWave, StateLabel });
