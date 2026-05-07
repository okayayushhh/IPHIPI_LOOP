// Screen 7 — History / past sessions
function ScreenHistory({ next }) {
  const { HISTORY } = window.LOOP_DATA;
  return (
    <div className="pageEnter" style={{padding:"40px 48px",maxWidth:1180,margin:"0 auto"}}>
      <h1 className="serif" style={{fontSize:48,letterSpacing:"-.025em",lineHeight:1,margin:"0 0 8px"}}>Your training history.</h1>
      <p style={{fontSize:16,color:"var(--ink-2)",margin:"0 0 28px",maxWidth:580}}>
        Six sessions over four weeks. Technical scoring is on a clear upward trend; confidence still needs work.
      </p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        {[
          { l:"Sessions", v:"6", sub:"in 4 weeks"},
          { l:"Avg score", v:"73", sub:"↑ 9 vs first"},
          { l:"Streak", v:"3", sub:"weeks active"},
          { l:"Best run", v:"81", sub:"backend, apr 18"},
        ].map((s,i)=>(
          <div key={i} className="card" style={{padding:20}}>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:8}}>{s.l}</div>
            <div className="num" style={{fontSize:36,fontWeight:600,letterSpacing:"-.03em",lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--ink-3)",marginTop:6}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:24,marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18}}>
          <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500}}>Score trend · technical / communication / confidence</div>
          <div style={{display:"flex",gap:14,fontSize:11,color:"var(--ink-3)"}}>
            <span><span style={{display:"inline-block",width:10,height:2,background:"var(--acc)",verticalAlign:"middle",marginRight:4}}/>Technical</span>
            <span><span style={{display:"inline-block",width:10,height:2,background:"#7CC8FF",verticalAlign:"middle",marginRight:4}}/>Communication</span>
            <span><span style={{display:"inline-block",width:10,height:2,background:"var(--warn)",verticalAlign:"middle",marginRight:4}}/>Confidence</span>
          </div>
        </div>
        <TrendChart/>
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr 80px repeat(3,80px) 60px",padding:"14px 22px",borderBottom:"1px solid var(--line)",fontSize:10,color:"var(--ink-4)",letterSpacing:".1em",textTransform:"uppercase"}}>
          <span>id</span><span>date</span><span>role</span><span>time</span><span>tech</span><span>comm</span><span>conf</span><span>Δ</span>
        </div>
        {HISTORY.map((h,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr 80px repeat(3,80px) 60px",padding:"14px 22px",borderBottom:i<HISTORY.length-1?"1px solid var(--line)":"none",fontSize:12,alignItems:"center",cursor:"pointer"}}>
            <span className="mono" style={{fontSize:11,color:"var(--ink-4)"}}>{h.id}</span>
            <span style={{color:"var(--ink-2)"}}>{h.date}</span>
            <span style={{fontWeight:500}}>{h.role}</span>
            <span className="mono" style={{color:"var(--ink-3)"}}>{h.duration}</span>
            <span className="num" style={{color: h.tech ? (h.tech>75?"var(--good)":"var(--ink)") : "var(--ink-4)"}}>{h.tech ?? "—"}</span>
            <span className="num">{h.comm}</span>
            <span className="num" style={{color: h.conf < 65 ? "var(--warn)" : "var(--ink)"}}>{h.conf}</span>
            <span className="num" style={{color: h.delta>0 ? "var(--good)" : h.delta<0 ? "var(--bad)" : "var(--ink-4)",fontSize:11}}>
              {h.delta>0?"+":""}{h.delta}
            </span>
          </div>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginTop:32}}>
        <button className="btn btn-pri" onClick={next}>Start new session →</button>
      </div>
    </div>
  );
}

function TrendChart() {
  const { HISTORY } = window.LOOP_DATA;
  const data = [...HISTORY].reverse();
  const w=920,h=180;
  const series = (key,col,dash) => {
    const pts = data.map((d,i)=> [i*(w/(data.length-1)), h - ((d[key]??0)/100)*h*0.85 - 10]);
    const path = pts.map(([x,y],i)=> `${i===0?"M":"L"}${x},${y}`).join(" ");
    return <g><path d={path} fill="none" stroke={col} strokeWidth="2" strokeDasharray={dash||""}/>{pts.map(([x,y],i)=> <circle key={i} cx={x} cy={y} r="2.5" fill={col}/>)}</g>;
  };
  return (
    <svg viewBox={`0 0 ${w} ${h+20}`} style={{width:"100%",height:h+20}}>
      {[0,25,50,75,100].map(g=>(
        <line key={g} x1="0" x2={w} y1={h - (g/100)*h*0.85 - 10} y2={h - (g/100)*h*0.85 - 10} stroke="var(--line)" strokeDasharray="2 4"/>
      ))}
      {series("tech","var(--acc)")}
      {series("comm","#7CC8FF","4 3")}
      {series("conf","var(--warn)","2 3")}
      {data.map((d,i)=>(
        <text key={i} x={i*(w/(data.length-1))} y={h+15} fill="var(--ink-4)" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">{d.date.split(",")[0]}</text>
      ))}
    </svg>
  );
}

window.ScreenHistory = ScreenHistory;
