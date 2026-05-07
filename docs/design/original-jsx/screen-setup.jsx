// Screen 3 — Pre-interview setup (camera/mic check)
function ScreenSetup({ next }) {
  const [camOn, setCamOn] = React.useState(true);
  const [micOn, setMicOn] = React.useState(true);
  const [vol, setVol] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  React.useEffect(()=>{
    const t = setInterval(()=> setVol(0.2 + Math.random()*0.7), 120);
    return ()=> clearInterval(t);
  },[]);

  React.useEffect(()=>{
    const t = setTimeout(()=> setReady(true), 1400);
    return ()=> clearTimeout(t);
  },[]);

  return (
    <div className="pageEnter" style={{padding:"40px 48px",maxWidth:1180,margin:"0 auto"}}>
      <div className="chip" style={{marginBottom:14}}>Backend Engineer · ~28 min · 6 questions adaptive</div>
      <h1 className="serif" style={{fontSize:52,letterSpacing:"-.025em",lineHeight:1,margin:"0 0 12px"}}>
        Let's get your studio set up.
      </h1>
      <p style={{fontSize:16,color:"var(--ink-2)",maxWidth:600,margin:"0 0 36px"}}>
        We'll grade your camera framing, lighting, and mic clarity once before we start so the multimodal scoring isn't fighting noise.
      </p>

      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:24}}>
        {/* Camera preview */}
        <div className="card" style={{padding:0,overflow:"hidden",aspectRatio:"16/10",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",background:"#000"}}>
          {camOn ? (
            <>
              {/* fake camera image */}
              <div style={{
                position:"absolute",inset:0,
                background:"radial-gradient(ellipse at 60% 40%, #2a2520 0%, #14110d 50%, #050403 100%)"
              }}/>
              {/* silhouette */}
              <svg viewBox="0 0 200 160" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
                <defs>
                  <radialGradient id="head" cx="50%" cy="40%">
                    <stop offset="0%" stopColor="#3d3225"/>
                    <stop offset="100%" stopColor="#1a140d"/>
                  </radialGradient>
                </defs>
                <ellipse cx="100" cy="76" rx="22" ry="26" fill="url(#head)"/>
                <path d="M50 160 Q 100 100 150 160 Z" fill="#1a140d"/>
              </svg>
              {/* face detection overlay */}
              <svg viewBox="0 0 200 160" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
                <rect x="76" y="50" width="48" height="56" fill="none" stroke="var(--acc)" strokeWidth="0.5" strokeDasharray="2 1.5">
                  <animate attributeName="stroke-dashoffset" from="0" to="-7" dur="2s" repeatCount="indefinite"/>
                </rect>
                <text x="78" y="48" fill="var(--acc)" fontSize="3.5" fontFamily="JetBrains Mono">face · 0.97</text>
                <circle cx="89" cy="71" r="0.8" fill="var(--acc)"/>
                <circle cx="111" cy="71" r="0.8" fill="var(--acc)"/>
                <circle cx="100" cy="92" r="0.8" fill="var(--acc)"/>
                <circle cx="92" cy="98" r="0.8" fill="var(--acc)"/>
                <circle cx="108" cy="98" r="0.8" fill="var(--acc)"/>
              </svg>
              {/* hud */}
              <div style={{position:"absolute",top:14,left:14,right:14,display:"flex",justifyContent:"space-between"}}>
                <LiveDot label="PREVIEW"/>
                <span className="mono" style={{fontSize:10,color:"var(--ink-3)"}}>1080p · 30fps</span>
              </div>
              <div style={{position:"absolute",bottom:14,left:14,right:14,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div className="mono" style={{fontSize:10,color:"var(--ink-3)",lineHeight:1.6}}>
                  <div>Lighting: <span style={{color:"var(--good)"}}>good</span></div>
                  <div>Framing: <span style={{color:"var(--good)"}}>centered</span></div>
                  <div>Background: <span style={{color:"var(--warn)"}}>busy</span></div>
                </div>
              </div>
            </>
          ) : (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,color:"var(--ink-4)"}}>
              <div style={{fontSize:34}}>⊘</div>
              <div style={{fontSize:13}}>Camera off</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="card" style={{padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Camera</div>
                <div style={{fontSize:11,color:"var(--ink-4)"}}>FaceTime HD · built-in</div>
              </div>
              <Toggle on={camOn} onChange={setCamOn}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span className={camOn?"chip chip-good":"chip"}>{camOn?"connected":"off"}</span>
              <span className="chip">1080p</span>
            </div>
          </div>

          <div className="card" style={{padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Microphone</div>
                <div style={{fontSize:11,color:"var(--ink-4)"}}>MacBook Air mic</div>
              </div>
              <Toggle on={micOn} onChange={setMicOn}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Sparkbars values={micOn?Array.from({length:24},()=>0.2+Math.random()*0.8):Array(24).fill(0.05)} height={28} anim={micOn}/>
            </div>
            <div className="mono" style={{fontSize:10,color:"var(--ink-4)",marginTop:8}}>say a few words to test — we're calibrating</div>
          </div>

          <div className="card" style={{padding:18,display:"flex",flexDirection:"column",gap:10}}>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500}}>Pre-flight checks</div>
            {[
              {label:"Camera permission", ok:true},
              {label:"Mic permission", ok:true},
              {label:"Network ≥ 5 Mbps", ok:true, val:"24.3 Mbps"},
              {label:"Quiet environment", ok:false, val:"some background noise"},
            ].map((c,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12}}>{c.label}</span>
                <span className={c.ok?"chip chip-good":"chip chip-warn"} style={{fontSize:10}}>{c.val ? c.val : c.ok?"ok":"check"}</span>
              </div>
            ))}
          </div>

          <button onClick={next} disabled={!ready}
            className="btn btn-pri" style={{justifyContent:"center",padding:"14px 24px",fontSize:14,opacity:ready?1:0.6}}>
            {ready ? "Begin interview →" : "Calibrating…"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={()=>onChange(!on)} style={{
      all:"unset",cursor:"pointer",
      width:36,height:20,borderRadius:999,
      background: on?"var(--acc)":"var(--bg-3)",
      position:"relative",transition:"background .15s"
    }}>
      <div style={{
        position:"absolute",top:2,left:on?18:2,
        width:16,height:16,borderRadius:"50%",
        background:on?"var(--ink)":"var(--ink-3)",
        transition:"left .15s"
      }}/>
    </button>
  );
}

window.ScreenSetup = ScreenSetup;
