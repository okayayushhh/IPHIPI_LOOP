// Screen 4 — Live interview
function ScreenInterview({ next, agent, state, setState }) {
  const { INTERVIEW_TRANSCRIPT, NEXT_QUESTIONS } = window.LOOP_DATA;
  const [shown, setShown] = React.useState(INTERVIEW_TRANSCRIPT.length);
  const [time, setTime] = React.useState(124); // seconds elapsed
  const [conf, setConf] = React.useState(72);
  const [eng, setEng] = React.useState(81);
  const [stress, setStress] = React.useState(34);
  const transcriptRef = React.useRef();

  React.useEffect(()=>{
    const t = setInterval(()=> setTime(s=>s+1), 1000);
    return ()=> clearInterval(t);
  },[]);

  React.useEffect(()=>{
    const t = setInterval(()=>{
      setConf(c => Math.max(40,Math.min(95, c + (Math.random()*8-4))));
      setEng(c => Math.max(40,Math.min(95, c + (Math.random()*6-3))));
      setStress(c => Math.max(15,Math.min(70, c + (Math.random()*8-4))));
    }, 1500);
    return ()=> clearInterval(t);
  },[]);

  const fmt = (s)=> `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="pageEnter" style={{padding:"22px 28px",display:"flex",flexDirection:"column",gap:18,height:"100vh"}}>
      {/* top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <LiveDot/>
          <div style={{display:"flex",flexDirection:"column"}}>
            <span style={{fontSize:13,fontWeight:500}}>Backend Engineer · Mock Interview</span>
            <span className="mono" style={{fontSize:10,color:"var(--ink-4)"}}>session s-015 · adaptive</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <div className="mono" style={{fontSize:13,letterSpacing:".05em"}}>{fmt(time)} <span style={{color:"var(--ink-4)"}}>/ 28:00</span></div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-sm">Pause</button>
            <button className="btn btn-sm" onClick={next}>End & review →</button>
          </div>
        </div>
      </div>

      {/* main grid */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 0.8fr 1fr",gap:16,flex:1,minHeight:0}}>
        {/* candidate camera */}
        <div className="card" style={{padding:0,overflow:"hidden",position:"relative",display:"flex"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 60% 40%, #2a2520 0%, #14110d 50%, #050403 100%)"}}/>
          <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
            <defs>
              <radialGradient id="head2" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#3d3225"/>
                <stop offset="100%" stopColor="#1a140d"/>
              </radialGradient>
            </defs>
            <ellipse cx="100" cy="76" rx="22" ry="26" fill="url(#head2)"/>
            <path d="M50 160 Q 100 100 150 160 Z" fill="#1a140d"/>
            <rect x="76" y="50" width="48" height="56" fill="none" stroke="var(--acc)" strokeWidth="0.4" strokeDasharray="2 1.5">
              <animate attributeName="stroke-dashoffset" from="0" to="-7" dur="2s" repeatCount="indefinite"/>
            </rect>
            <text x="78" y="48" fill="var(--acc)" fontSize="3" fontFamily="JetBrains Mono">candidate · tracking</text>
            {[[89,71],[111,71],[100,92],[92,98],[108,98],[100,82]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="0.7" fill="var(--acc)"/>
            ))}
          </svg>
          {/* hud overlays */}
          <div style={{position:"absolute",top:14,left:14,display:"flex",flexDirection:"column",gap:6}}>
            <span className="chip" style={{fontSize:10}}>You</span>
          </div>
          <div style={{position:"absolute",top:14,right:14,display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <div className="mono" style={{fontSize:10,padding:"4px 8px",background:"rgba(0,0,0,.6)",borderRadius:4,color:"var(--ink-2)"}}>eye contact: <span style={{color:"var(--good)"}}>0.86</span></div>
            <div className="mono" style={{fontSize:10,padding:"4px 8px",background:"rgba(0,0,0,.6)",borderRadius:4,color:"var(--ink-2)"}}>posture: <span style={{color:"var(--good)"}}>open</span></div>
            <div className="mono" style={{fontSize:10,padding:"4px 8px",background:"rgba(0,0,0,.6)",borderRadius:4,color:"var(--ink-2)"}}>blink rate: <span style={{color:"var(--warn)"}}>elevated</span></div>
          </div>
          {/* live caption */}
          <div style={{position:"absolute",bottom:14,left:14,right:14,display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(0,0,0,.7)",borderRadius:10,backdropFilter:"blur(8px)"}}>
            <LiveWave active={state==="listening"} bars={20} height={20}/>
            <span style={{fontSize:11,color:"var(--ink-2)",flex:1}}>
              {state==="listening" ? "…I think you'd need a CRDT? Or maybe a leader-elected Redis cluster…" : "—"}
            </span>
          </div>
        </div>

        {/* agent */}
        <div className="card" style={{padding:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",gap:14,position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="logo-dot" style={{width:8,height:8}}/>
            <span className="uppercase mono" style={{fontSize:10,color:"var(--ink-3)",letterSpacing:".15em"}}>Mira · interviewer</span>
          </div>

          <AgentPersona variant={agent} state={state} size={180}/>

          <StateLabel state={state}/>

          <div className="card" style={{padding:14,width:"100%",background:"var(--bg-2)",border:"1px solid var(--line-2)"}}>
            <div className="uppercase" style={{fontSize:9,color:"var(--ink-4)",marginBottom:6}}>current question</div>
            <div style={{fontSize:13,lineHeight:1.5,color:"var(--ink)"}}>
              "So your retry service is only as available as Redis. Have you thought about how you'd make this multi-region?"
            </div>
          </div>

          <div style={{display:"flex",gap:6,width:"100%"}}>
            <button className="btn btn-sm" style={{flex:1,justifyContent:"center"}}>Repeat</button>
            <button className="btn btn-sm" style={{flex:1,justifyContent:"center"}}>Skip</button>
            <button className="btn btn-sm" style={{flex:1,justifyContent:"center"}}>Hint</button>
          </div>
        </div>

        {/* right column — transcript + HUD */}
        <div style={{display:"flex",flexDirection:"column",gap:14,minHeight:0}}>
          {/* HUD */}
          <div className="card" style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500}}>Live signals</div>
            <Hud label="Confidence" v={conf} color="var(--acc)"/>
            <Hud label="Engagement" v={eng} color="#7CC8FF"/>
            <Hud label="Stress" v={stress} color="var(--warn)" inverted/>
            <Hr/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
              <span style={{color:"var(--ink-3)"}}>Adaptation</span>
              <span className="chip chip-warn" style={{fontSize:10}}>↓ easier next</span>
            </div>
            <div style={{fontSize:10,color:"var(--ink-4)",lineHeight:1.5}}>
              You hesitated on multi-region. Mira will probe fundamentals before re-attempting system design.
            </div>
          </div>

          {/* Transcript */}
          <div className="card scroll" ref={transcriptRef} style={{padding:16,display:"flex",flexDirection:"column",gap:12,flex:1,overflowY:"auto",minHeight:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:-16,background:"var(--bg-1)",margin:"-16px -16px 0",padding:"14px 16px",borderBottom:"1px solid var(--line)",zIndex:1}}>
              <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500}}>Transcript</div>
              <span className="mono" style={{fontSize:9,color:"var(--ink-4)"}}>auto-scroll</span>
            </div>
            {INTERVIEW_TRANSCRIPT.slice(0,shown).map((m,i)=>(
              <div key={i} style={{display:"flex",gap:10}}>
                <span className="mono" style={{fontSize:10,color:"var(--ink-4)",width:36,flexShrink:0,paddingTop:2}}>{m.t}</span>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <span className="uppercase mono" style={{fontSize:9,color:m.who==="agent"?"var(--acc)":"var(--ink-3)",letterSpacing:".15em"}}>
                    {m.who==="agent"?"Mira":"You"}{m.flag==="probe"?" · probe":m.flag==="soft"?" · pivot":""}
                  </span>
                  <span style={{fontSize:12,color:m.who==="agent"?"var(--ink)":"var(--ink-2)",lineHeight:1.5}}>{m.text}</span>
                </div>
              </div>
            ))}
            {state==="listening" && (
              <div style={{display:"flex",gap:10,opacity:.7}}>
                <span className="mono" style={{fontSize:10,color:"var(--ink-4)",width:36,flexShrink:0,paddingTop:2}}>02:18</span>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <span className="uppercase mono" style={{fontSize:9,color:"var(--ink-3)",letterSpacing:".15em"}}>You · live</span>
                  <span style={{fontSize:12,color:"var(--ink-3)",lineHeight:1.5}}>
                    Well, when teams disagree on design I usually <span style={{borderRight:"1px solid var(--acc)",animation:"blink 1s infinite"}}>&nbsp;</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Question queue */}
          <div className="card" style={{padding:14}}>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:8}}>Up next (adaptive queue)</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {NEXT_QUESTIONS.slice(0,3).map((q,i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:11,color:i===0?"var(--ink-2)":"var(--ink-4)"}}>
                  <span className="mono" style={{color:"var(--ink-4)"}}>{i+1}.</span>
                  <span style={{lineHeight:1.4}}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hud({ label, v, color, inverted }) {
  const display = Math.round(v);
  const tone = inverted ? (v>50?"var(--bad)":v>30?"var(--warn)":"var(--good)") : (v>70?"var(--good)":v>50?"var(--warn)":"var(--bad)");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
        <span style={{fontSize:11,color:"var(--ink-2)"}}>{label}</span>
        <span className="num" style={{fontSize:13,fontWeight:500,color:tone}}>{display}</span>
      </div>
      <div style={{height:3,background:"var(--bg-3)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${v}%`,background:color,transition:"width .8s ease"}}/>
      </div>
    </div>
  );
}

window.ScreenInterview = ScreenInterview;
