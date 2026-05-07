// Screen 1 — Landing / Upload resume
function ScreenLanding({ next, dropped, setDropped }) {
  const [drag, setDrag] = React.useState(false);
  const [parsing, setParsing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [steps, setSteps] = React.useState([]);

  const STEPS = [
    "Extracting text from PDF…",
    "Tokenizing skills & domains…",
    "Mapping experience to seniority signals…",
    "Querying market role distributions…",
    "Inferring 3 most likely roles…",
  ];

  function handleDrop() {
    setDropped(true);
    setParsing(true);
    setProgress(0);
    setSteps([]);
    let i = 0;
    const tick = setInterval(()=>{
      setSteps(s => [...s, STEPS[i]]);
      setProgress(p => Math.min(100, p + 100/STEPS.length));
      i++;
      if (i >= STEPS.length) {
        clearInterval(tick);
        setTimeout(()=> { setParsing(false); next(); }, 600);
      }
    }, 700);
  }

  return (
    <div className="pageEnter" style={{maxWidth:980,margin:"0 auto",padding:"56px 48px 48px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
        <div className="chip chip-acc">v1.0 — Hackathon build</div>
        <div className="chip">5,420 candidates this week</div>
      </div>

      <h1 className="serif" style={{fontSize:60,lineHeight:1.05,letterSpacing:"-.025em",margin:"0 0 20px",maxWidth:820}}>
        The interview that <em style={{color:"var(--acc)",fontStyle:"normal"}}>knows</em> what to ask you.
      </h1>
      <p style={{fontSize:18,lineHeight:1.5,color:"var(--ink-2)",maxWidth:580,margin:"0 0 36px"}}>
        Drop your resume. Loop infers your most likely roles, runs a live mock interview tuned to the gaps, and grades your technical answers, communication, and confidence — frame by frame.
      </p>

      {!dropped ? (
        <div
          onDragOver={(e)=>{e.preventDefault();setDrag(true);}}
          onDragLeave={()=>setDrag(false)}
          onDrop={(e)=>{e.preventDefault();setDrag(false);handleDrop();}}
          onClick={handleDrop}
          style={{
            border:`1.5px dashed ${drag?"var(--acc)":"var(--line-2)"}`,
            background: drag?"rgba(196,255,78,.04)":"var(--bg-1)",
            borderRadius:18,
            padding:"56px 32px",
            display:"flex",flexDirection:"column",alignItems:"center",gap:14,
            cursor:"pointer",transition:"all .15s ease",
            position:"relative",overflow:"hidden",
          }}>
          <div style={{position:"absolute",inset:0,opacity:.4}} className="grid-bg"/>
          <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.4" strokeLinecap="round">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/>
            </svg>
            <div style={{fontSize:18,fontWeight:500}}>Drop your résumé here</div>
            <div style={{fontSize:13,color:"var(--ink-3)"}}>PDF · DOCX · TXT — up to 5 MB</div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button className="btn btn-pri">Choose file</button>
              <button className="btn" onClick={(e)=>{e.stopPropagation();handleDrop();}}>Use sample resume</button>
            </div>
            <div style={{marginTop:18,display:"flex",gap:18,fontSize:11,color:"var(--ink-4)"}}>
              <span>🔒 We never share your data</span>
              <span>·</span>
              <span>Parsed locally first</span>
              <span>·</span>
              <span>Avg parse: 4.2s</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card pageEnter" style={{padding:"32px 36px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:46,background:"var(--bg-3)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"var(--ink-3)",letterSpacing:".1em"}}>PDF</div>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>Aarav_Mehta_Resume.pdf</div>
                <div style={{fontSize:11,color:"var(--ink-4)"}}>248 KB · 1 page · just now</div>
              </div>
            </div>
            <div className="chip chip-acc">{Math.round(progress)}%</div>
          </div>
          <div style={{height:2,background:"var(--bg-3)",borderRadius:2,marginBottom:24,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progress}%`,background:"var(--acc)",transition:"width .5s ease"}}/>
          </div>
          <div className="mono" style={{fontSize:12,color:"var(--ink-3)",lineHeight:1.9}}>
            {steps.map((s,i)=>(
              <div key={i} className="rise" style={{display:"flex",gap:10}}>
                <span style={{color:"var(--acc)"}}>›</span><span>{s}</span>
              </div>
            ))}
            {parsing && steps.length<STEPS.length && (
              <div style={{display:"flex",gap:10,color:"var(--ink-4)"}}>
                <span style={{animation:"blink 1s infinite",color:"var(--acc)"}}>›</span><span style={{animation:"blink 1s infinite"}}>working…</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Three-step explainer */}
      <div style={{marginTop:64,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"var(--line)",border:"1px solid var(--line)",borderRadius:14,overflow:"hidden"}}>
        {[
          {n:"01", t:"Resume → Roles", d:"We parse your skills, projects and seniority signals, then infer the 3 roles you're most likely to land — with reasoning for each."},
          {n:"02", t:"Adaptive interview", d:"A live agent runs role-specific questions. If you struggle, it backs off; if you crush it, difficulty ramps. No static lists."},
          {n:"03", t:"Multimodal scoring", d:"Tone, pacing, eye contact, answer correctness — combined into one report with the exact lines that hurt or helped."},
        ].map((c,i)=>(
          <div key={i} style={{padding:"24px 24px",background:"var(--bg-1)",display:"flex",flexDirection:"column",gap:10}}>
            <span className="mono" style={{fontSize:11,color:"var(--acc)",letterSpacing:".1em"}}>{c.n}</span>
            <div style={{fontSize:16,fontWeight:500,letterSpacing:"-.01em"}}>{c.t}</div>
            <div style={{fontSize:13,color:"var(--ink-3)",lineHeight:1.55}}>{c.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ScreenLanding = ScreenLanding;
