// Screen 6 — Job recommendations
function ScreenJobs({ next }) {
  const { JOBS } = window.LOOP_DATA;
  const [filter, setFilter] = React.useState("all");
  const [picked, setPicked] = React.useState(JOBS[0]);
  const tags = [
    { id:"all", label:"All matches", n: JOBS.length },
    { id:"backend", label:"Backend", n: JOBS.filter(j=>j.tag==="backend").length },
    { id:"data", label:"Data", n: JOBS.filter(j=>j.tag==="data").length },
    { id:"platform", label:"Platform", n: JOBS.filter(j=>j.tag==="platform").length },
  ];
  const filtered = filter==="all" ? JOBS : JOBS.filter(j=>j.tag===filter);

  return (
    <div className="pageEnter" style={{padding:"40px 48px",maxWidth:1280,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div className="chip chip-acc">Live · crawled 14 boards in 6.2s</div>
        <div className="chip">{JOBS.length} matches found</div>
      </div>
      <h1 className="serif" style={{fontSize:48,letterSpacing:"-.025em",lineHeight:1,margin:"0 0 8px"}}>Roles you should apply to today.</h1>
      <p style={{fontSize:16,color:"var(--ink-2)",margin:"0 0 28px",maxWidth:680}}>
        Aggregated from public listings, ranked by skill match × resume signal × interview performance. Click a role to see why it fits.
      </p>

      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {tags.map(t=>(
          <button key={t.id} onClick={()=>setFilter(t.id)} className={filter===t.id?"chip chip-acc":"chip"} style={{cursor:"pointer",padding:"6px 12px",fontSize:12}}>
            {t.label} <span style={{color:"var(--ink-4)",marginLeft:4}}>{t.n}</span>
          </button>
        ))}
        <div style={{flex:1}}/>
        <div className="chip" style={{padding:"6px 12px"}}>Sort: match score</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:18,alignItems:"start"}}>
        {/* List */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtered.map((j,i)=>(
            <button key={i} onClick={()=>setPicked(j)} style={{
              all:"unset",cursor:"pointer",
              background: picked.co===j.co ? "var(--bg-2)" : "var(--bg-1)",
              border:`1px solid ${picked.co===j.co ? "var(--line-2)" : "var(--line)"}`,
              borderRadius:12, padding:"16px 18px",
              display:"grid",gridTemplateColumns:"40px minmax(0,1fr) 110px 130px",gap:18,alignItems:"center",
              animation:`rise .3s ease-out ${i*0.04}s both`,
              transition:"all .15s",
            }}>
              <div style={{width:36,height:36,borderRadius:8,background:"var(--bg-3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600,color:"var(--ink-2)"}}>
                {j.co[0]}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                  <span style={{fontSize:14,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{j.title}</span>
                  {j.new && <span className="chip chip-acc" style={{fontSize:9,padding:"2px 6px",flexShrink:0}}>NEW</span>}
                </div>
                <div style={{fontSize:11,color:"var(--ink-3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {j.co} · {j.loc}
                </div>
              </div>
              <div style={{fontSize:12,color:"var(--ink-2)"}}>{j.comp}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}>
                <div style={{width:60,height:3,background:"var(--bg-3)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${j.match}%`,background:j.match>=85?"var(--good)":j.match>=75?"var(--acc)":"var(--warn)"}}/>
                </div>
                <span className="num" style={{fontSize:14,fontWeight:600,color:j.match>=85?"var(--good)":j.match>=75?"var(--acc)":"var(--warn)"}}>{j.match}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="card" style={{padding:22,position:"sticky",top:24,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:10,background:"var(--bg-3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:600}}>{picked.co[0]}</div>
            <div>
              <div style={{fontSize:16,fontWeight:500}}>{picked.title}</div>
              <div style={{fontSize:12,color:"var(--ink-3)"}}>{picked.co} · {picked.loc}</div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:18,padding:"14px 0",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)"}}>
            <ScoreRing value={picked.match} size={64} stroke={5} color={picked.match>=85?"var(--good)":"var(--acc)"}/>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <div style={{fontSize:11,color:"var(--ink-4)"}}>Match score</div>
              <div style={{fontSize:14,fontWeight:500}}>{picked.match >= 90 ? "Excellent fit" : picked.match >= 80 ? "Strong fit" : "Worth applying"}</div>
              <div style={{fontSize:11,color:"var(--ink-3)"}}>{picked.comp}</div>
            </div>
          </div>

          <div>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:10}}>Why this fits</div>
            <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
              {picked.why.map((w,i)=>(
                <li key={i} style={{display:"flex",gap:8,fontSize:12,color:"var(--ink-2)",lineHeight:1.5}}>
                  <span style={{color:"var(--acc)",marginTop:2}}>+</span><span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:10}}>Interview prep based on resume</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {["System design at scale","Distributed transactions","SQL deep-dives"].map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--bg-2)",borderRadius:6,fontSize:11}}>
                  <span>{p}</span>
                  <span style={{color:"var(--acc)"}}>practice →</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-pri" style={{justifyContent:"center"}}>Apply with one-click</button>
          <button className="btn" style={{justifyContent:"center"}}>Save · Run mock for this role</button>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:32}}>
        <button className="btn">Refresh listings</button>
        <button className="btn btn-pri" onClick={next}>View history →</button>
      </div>
    </div>
  );
}

window.ScreenJobs = ScreenJobs;
