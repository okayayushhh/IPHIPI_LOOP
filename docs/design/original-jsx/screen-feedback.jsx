// Screen 5 — Feedback report (3 variations)
function ScreenFeedback({ next, variant="report" }) {
  if (variant === "report") return <FeedbackReport next={next}/>;
  if (variant === "scorecard") return <FeedbackScorecard next={next}/>;
  return <FeedbackTimeline next={next}/>;
}

// V1: full structured report
function FeedbackReport({ next }) {
  const { FEEDBACK } = window.LOOP_DATA;
  const F = FEEDBACK;
  return (
    <div className="pageEnter" style={{padding:"40px 48px",maxWidth:1200,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,marginBottom:32}}>
        <div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div className="chip">Apr 28 · 32m</div>
            <div className="chip">Backend (Sr. Mock)</div>
            <div className="chip chip-good">+6 vs last session</div>
          </div>
          <h1 className="serif" style={{fontSize:52,letterSpacing:"-.025em",lineHeight:1,margin:"0 0 8px",maxWidth:780}}>
            You're closer than you sound.
          </h1>
          <p style={{fontSize:16,color:"var(--ink-2)",maxWidth:680,margin:0}}>
            Strong fundamentals, honest about gaps. The biggest unlock isn't more knowledge — it's slowing your pace under pressure and pre-rehearsing 5 system-design primitives.
          </p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <ScoreRing value={F.overall} size={120} stroke={8}/>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <span className="uppercase" style={{fontSize:10,color:"var(--ink-4)"}}>Overall</span>
            <span className="num" style={{fontSize:13,color:"var(--good)"}}>↑ 6 from last</span>
            <span style={{fontSize:11,color:"var(--ink-3)"}}>Top 22% this week</span>
          </div>
        </div>
      </div>

      {/* Score grid */}
      <div className="card" style={{padding:24,marginBottom:24}}>
        <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:18}}>Multimodal scorecard</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:28,rowGap:18}}>
          {Object.entries(F.scores).map(([k,s])=>(
            <div key={k} style={{minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:6}}>
                <span style={{fontSize:11,color:"var(--ink-2)",lineHeight:1.3,minWidth:0,overflow:"hidden"}}>{s.label}</span>
                <span style={{display:"flex",gap:6,alignItems:"baseline",flexShrink:0}}>
                  {s.trend!=null && <span className="num" style={{fontSize:10,color:s.trend>=0?"var(--good)":"var(--bad)"}}>{s.trend>=0?"+":""}{s.trend}</span>}
                  <span className="num" style={{fontSize:14,fontWeight:600}}>{s.v}</span>
                </span>
              </div>
              <div style={{height:4,background:"var(--bg-3)",borderRadius:999,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${s.v}%`,background:s.v>75?"var(--good)":s.v>60?"var(--acc)":"var(--warn)",borderRadius:999,transition:"width 1s cubic-bezier(.2,.8,.2,1)"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths + improvements */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
        <div className="card" style={{padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"var(--good)"}}/>
            <span className="uppercase" style={{fontSize:11,color:"var(--ink-2)",fontWeight:500}}>What worked</span>
          </div>
          {F.strengths.map((s,i)=>(
            <div key={i} style={{padding:"14px 0",borderBottom:i<F.strengths.length-1?"1px solid var(--line)":"none"}}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{s.t}</div>
              <div style={{fontSize:12,color:"var(--ink-3)",lineHeight:1.55}}>{s.d}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"var(--warn)"}}/>
            <span className="uppercase" style={{fontSize:11,color:"var(--ink-2)",fontWeight:500}}>What to work on</span>
          </div>
          {F.improvements.map((s,i)=>(
            <div key={i} style={{padding:"14px 0",borderBottom:i<F.improvements.length-1?"1px solid var(--line)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <div style={{fontSize:14,fontWeight:500}}>{s.t}</div>
                <span className={s.severity==="high"?"chip chip-bad":s.severity==="med"?"chip chip-warn":"chip"} style={{fontSize:9}}>{s.severity}</span>
              </div>
              <div style={{fontSize:12,color:"var(--ink-3)",lineHeight:1.55}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pace & confidence chart */}
      <div className="card" style={{padding:24,marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
          <div>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:4}}>Confidence over time</div>
            <div style={{fontSize:14,color:"var(--ink-2)"}}>The dip happens at the multi-region question (02:00).</div>
          </div>
          <div style={{display:"flex",gap:10,fontSize:11,color:"var(--ink-3)"}}>
            <span><span style={{display:"inline-block",width:10,height:2,background:"var(--acc)",verticalAlign:"middle",marginRight:4}}/>Confidence</span>
            <span><span style={{display:"inline-block",width:10,height:2,background:"var(--warn)",verticalAlign:"middle",marginRight:4}}/>Stress</span>
          </div>
        </div>
        <ConfidenceChart/>
      </div>

      {/* Next steps */}
      <div className="card" style={{padding:24}}>
        <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:14}}>Coaching plan · next 2 weeks</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {window.LOOP_DATA.FEEDBACK.next.map((n,i)=>(
            <div key={i} style={{padding:16,background:"var(--bg-2)",borderRadius:10,display:"flex",flexDirection:"column",gap:8}}>
              <div className="num" style={{fontSize:11,color:"var(--acc)",letterSpacing:".1em"}}>STEP 0{i+1}</div>
              <div style={{fontSize:13,lineHeight:1.5}}>{n}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:32}}>
        <button className="btn">Download PDF</button>
        <div style={{display:"flex",gap:10}}>
          <button className="btn">Re-run interview</button>
          <button className="btn btn-pri" onClick={next}>See matched jobs →</button>
        </div>
      </div>
    </div>
  );
}

function ConfidenceChart() {
  const w=920,h=180;
  const conf = [72,75,78,76,80,82,79,72,65,58,50,55,62,68,72,74,78,80,76];
  const stress = [30,28,26,30,28,32,38,48,55,62,68,60,52,46,40,38,34,32,30];
  const path = (arr,c) => {
    const dx = w/(arr.length-1);
    return arr.map((v,i)=> `${i===0?"M":"L"}${i*dx},${h - (v/100)*h*0.85 - 10}`).join(" ");
  };
  const eventX = w * 10/(conf.length-1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}}>
      {[0,25,50,75,100].map(g=>(
        <line key={g} x1="0" x2={w} y1={h - (g/100)*h*0.85 - 10} y2={h - (g/100)*h*0.85 - 10} stroke="var(--line)" strokeDasharray="2 4"/>
      ))}
      <line x1={eventX} x2={eventX} y1="5" y2={h-5} stroke="var(--bad)" strokeOpacity=".5" strokeDasharray="3 3"/>
      <text x={eventX+6} y="18" fill="var(--bad)" fontSize="10" fontFamily="JetBrains Mono">multi-region question</text>
      <path d={path(conf)} fill="none" stroke="var(--acc)" strokeWidth="2"/>
      <path d={path(stress)} fill="none" stroke="var(--warn)" strokeWidth="2" strokeDasharray="4 3"/>
      {/* dots */}
      {conf.map((v,i)=> <circle key={i} cx={i*(w/(conf.length-1))} cy={h - (v/100)*h*0.85 - 10} r="2" fill="var(--acc)"/>)}
    </svg>
  );
}

// V2: scorecard — single page, dense
function FeedbackScorecard({ next }) {
  const { FEEDBACK } = window.LOOP_DATA;
  return (
    <div className="pageEnter" style={{padding:"40px 48px",maxWidth:1100,margin:"0 auto"}}>
      <div className="chip" style={{marginBottom:14}}>Session s-014 · Apr 28 · 32m</div>
      <h1 className="serif" style={{fontSize:48,letterSpacing:"-.025em",lineHeight:1,margin:"0 0 32px"}}>
        Scorecard.
      </h1>

      <div className="card" style={{padding:32,marginBottom:24}}>
        <div style={{display:"grid",gridTemplateColumns:"180px 1fr",gap:36,alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <ScoreRing value={FEEDBACK.overall} size={150} stroke={8}/>
            <span style={{fontSize:11,color:"var(--ink-3)"}}>OVERALL · top 22%</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:18}}>
            {Object.entries(FEEDBACK.scores).map(([k,s])=>(
              <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <ScoreRing value={s.v} size={68} stroke={4} color={s.v>75?"var(--good)":s.v>60?"var(--acc)":"var(--warn)"} trend={s.trend}/>
                <div style={{fontSize:10,color:"var(--ink-3)",textAlign:"center",lineHeight:1.3}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {FEEDBACK.strengths.map((s,i)=>(
          <div key={i} className="card" style={{padding:20,borderColor:"rgba(124,255,107,.25)"}}>
            <div className="uppercase" style={{fontSize:10,color:"var(--good)",marginBottom:8,fontWeight:500}}>+ STRENGTH</div>
            <div style={{fontSize:15,fontWeight:500,marginBottom:6}}>{s.t}</div>
            <div style={{fontSize:12,color:"var(--ink-3)",lineHeight:1.6}}>{s.d}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32}}>
        {FEEDBACK.improvements.map((s,i)=>(
          <div key={i} className="card" style={{padding:20,borderColor:"rgba(255,184,78,.25)"}}>
            <div className="uppercase" style={{fontSize:10,color:"var(--warn)",marginBottom:8,fontWeight:500}}>↗ IMPROVE</div>
            <div style={{fontSize:14,fontWeight:500,marginBottom:6}}>{s.t}</div>
            <div style={{fontSize:12,color:"var(--ink-3)",lineHeight:1.55}}>{s.d}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
        <button className="btn btn-pri" onClick={next}>See matched jobs →</button>
      </div>
    </div>
  );
}

// V3: timeline — moment-by-moment
function FeedbackTimeline({ next }) {
  const { FEEDBACK, INTERVIEW_TRANSCRIPT } = window.LOOP_DATA;
  const events = [
    { t:"00:18", type:"good", title:"Strong opener", desc:"Concrete numbers ('1.2M events/day') — landed well.", score:88 },
    { t:"00:34", type:"good", title:"Clean architecture explanation", desc:"Walked through Redis dedupe layer cleanly.", score:84 },
    { t:"01:08", type:"warn", title:"TTL reasoning was thin", desc:"'24 hours because of SLA' — but no operational tradeoff thinking.", score:62 },
    { t:"01:24", type:"warn", title:"Hesitation on multi-region", desc:"Confidence dropped, pace from 142→98 wpm.", score:55 },
    { t:"01:42", type:"good", title:"Honest about gap", desc:"Said 'I haven't, no' before guessing — senior signal.", score:78 },
    { t:"02:00", type:"bad", title:"Reached for jargon under pressure", desc:"'CRDT' was incorrect; 'leader election' was the cleaner answer.", score:42 },
    { t:"02:24", type:"good", title:"Pivot recovery", desc:"Behavioral switch landed; you settled back into your range.", score:80 },
  ];
  return (
    <div className="pageEnter" style={{padding:"40px 48px",maxWidth:980,margin:"0 auto"}}>
      <h1 className="serif" style={{fontSize:48,letterSpacing:"-.025em",lineHeight:1,margin:"0 0 8px"}}>Moment by moment.</h1>
      <p style={{fontSize:16,color:"var(--ink-2)",margin:"0 0 32px",maxWidth:580}}>The 7 moments that shaped your overall score of <strong style={{color:"var(--ink)"}}>{FEEDBACK.overall}</strong>.</p>

      <div style={{position:"relative",paddingLeft:40}}>
        {/* timeline rail */}
        <div style={{position:"absolute",left:14,top:8,bottom:8,width:1,background:"var(--line-2)"}}/>
        {events.map((e,i)=>{
          const col = e.type==="good"?"var(--good)":e.type==="warn"?"var(--warn)":"var(--bad)";
          return (
            <div key={i} style={{position:"relative",padding:"14px 0",animation:`rise .4s ease-out ${i*0.06}s both`}}>
              <div style={{position:"absolute",left:-32,top:18,width:14,height:14,borderRadius:"50%",background:col,boxShadow:`0 0 0 4px var(--bg)`}}/>
              <div className="card" style={{padding:16,display:"grid",gridTemplateColumns:"60px 1fr 60px",gap:18,alignItems:"center",borderColor: e.type==="good"?"rgba(124,255,107,.15)":e.type==="warn"?"rgba(255,184,78,.15)":"rgba(255,107,91,.15)"}}>
                <span className="mono" style={{fontSize:13,color:"var(--ink-3)"}}>{e.t}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{e.title}</div>
                  <div style={{fontSize:12,color:"var(--ink-3)",lineHeight:1.55}}>{e.desc}</div>
                </div>
                <div className="num" style={{fontSize:22,fontWeight:600,color:col,letterSpacing:"-.03em",textAlign:"right"}}>{e.score}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:32}}>
        <button className="btn btn-pri" onClick={next}>See matched jobs →</button>
      </div>
    </div>
  );
}

window.ScreenFeedback = ScreenFeedback;
