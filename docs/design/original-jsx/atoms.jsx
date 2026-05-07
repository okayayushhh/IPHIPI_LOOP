// Atomic UI components — gauges, sparkbars, score rings, etc.
const { useEffect, useRef, useState, useMemo } = React;

// ─── Score ring ─────────────────────────────────────────────
function ScoreRing({ value=0, size=92, stroke=6, color="var(--acc)", label, trend }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value/100) * c;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
          <div className="num" style={{fontSize:size*0.32,fontWeight:600,letterSpacing:"-.04em",lineHeight:1}}>{value}</div>
          {trend !=null && (
            <div className="num" style={{fontSize:10,color:trend>=0?"var(--good)":"var(--bad)",marginTop:2}}>
              {trend>=0?"↑":"↓"} {Math.abs(trend)}
            </div>
          )}
        </div>
      </div>
      {label && <div style={{fontSize:11,color:"var(--ink-3)",letterSpacing:".02em"}}>{label}</div>}
    </div>
  );
}

// ─── Horizontal score bar ────────────────────────────────────
function ScoreBar({ value=0, label, trend, color="var(--acc)", sub, height=4 }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
        <div style={{fontSize:12,color:"var(--ink-2)"}}>{label}</div>
        <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
          {trend!=null && <span className="num" style={{fontSize:10,color:trend>=0?"var(--good)":"var(--bad)"}}>{trend>=0?"+":""}{trend}</span>}
          <span className="num" style={{fontSize:14,fontWeight:600}}>{value}<span style={{color:"var(--ink-4)",fontWeight:400}}>/100</span></span>
        </div>
      </div>
      <div style={{height,background:"var(--bg-3)",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:color,borderRadius:999,transition:"width 1s cubic-bezier(.2,.8,.2,1)"}}/>
      </div>
      {sub && <div style={{fontSize:11,color:"var(--ink-4)",lineHeight:1.5}}>{sub}</div>}
    </div>
  );
}

// ─── Sparkbars ──────────────────────────────────────────────
function Sparkbars({ values=[], height=24, color="var(--acc)", anim=false }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:2,height}}>
      {values.map((v,i)=> (
        <div key={i} style={{
          flex:1,
          height:`${(v/max)*100}%`,
          background:color,
          borderRadius:1,
          opacity: anim ? .3+.7*(v/max) : 1,
          animation: anim ? `wave ${.6 + (i%5)*.1}s ease-in-out ${i*.05}s infinite alternate` : "none",
          transformOrigin:"bottom"
        }}/>
      ))}
    </div>
  );
}

// ─── Live waveform (animated) ───────────────────────────────
function LiveWave({ active=true, bars=40, height=36, color="var(--acc)" }) {
  const arr = useMemo(()=> Array.from({length:bars}, (_,i)=> 0.3 + Math.abs(Math.sin(i*0.7))*0.7), [bars]);
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height}}>
      {arr.map((v,i)=>(
        <div key={i} style={{
          width:3,height:`${v*100}%`,background:color,borderRadius:2,
          animation: active ? `wave ${0.5 + (i%7)*0.08}s ease-in-out ${i*0.04}s infinite alternate` : "none",
          opacity: active ? 1 : 0.25,
          transform: active ? "scaleY(1)" : "scaleY(.3)",
          transition:"transform .3s ease, opacity .3s ease",
          transformOrigin:"center"
        }}/>
      ))}
    </div>
  );
}

// ─── Section heading ────────────────────────────────────────
function Section({ kicker, title, action, children }) {
  return (
    <section style={{display:"flex",flexDirection:"column",gap:18}}>
      <header style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:16}}>
        <div>
          {kicker && <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:6,fontWeight:500}}>{kicker}</div>}
          <h2 className="serif" style={{margin:0,fontSize:28,letterSpacing:"-.02em",lineHeight:1.1}}>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

// ─── Live dot ───────────────────────────────────────────────
function LiveDot({ color="var(--bad)", label="LIVE" }) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:8}}>
      <div style={{position:"relative",width:8,height:8}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:color}}/>
        <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:`1px solid ${color}`,animation:"pulseRing 1.4s ease-out infinite"}}/>
      </div>
      <span className="uppercase mono" style={{fontSize:10,letterSpacing:".15em",color}}>{label}</span>
    </div>
  );
}

// ─── Number ticker (count-up) ──────────────────────────────
function CountUp({ to, dur=900, decimals=0, suffix="", className="" }) {
  const [v,setV]=useState(0);
  useEffect(()=>{
    let raf, start;
    const tick=(t)=>{
      if(!start) start=t;
      const p=Math.min(1,(t-start)/dur);
      const eased = 1-Math.pow(1-p,3);
      setV(to*eased);
      if(p<1) raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[to,dur]);
  return <span className={className}>{v.toFixed(decimals)}{suffix}</span>;
}

// ─── Tag/keyword pill cluster ──────────────────────────────
function Tags({ items=[], color }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
      {items.map((t,i)=> <span key={i} className="chip" style={color?{borderColor:color,color}:null}>{t}</span>)}
    </div>
  );
}

// ─── Empty/divider ───────────────────────────────────────────
function Hr() { return <div style={{height:1,background:"var(--line)"}}/>; }

Object.assign(window, { ScoreRing, ScoreBar, Sparkbars, LiveWave, Section, LiveDot, CountUp, Tags, Hr });
