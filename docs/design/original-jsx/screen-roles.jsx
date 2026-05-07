// Screen 2 — Resume parsed → Inferred roles reveal (3 variations)
function ScreenRoles({ next, variant="cards" }) {
  const { RESUME, INFERRED_ROLES } = window.LOOP_DATA;
  const [picked, setPicked] = React.useState("backend");

  return (
    <div className="pageEnter" style={{padding:"40px 48px",maxWidth:1280,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div className="chip chip-acc">✓ Parsed in 3.8s</div>
        <div className="chip">{RESUME.skills.length} skills extracted · {RESUME.experience.length} roles · {RESUME.projects.length} projects</div>
      </div>
      <h1 className="serif" style={{fontSize:52,letterSpacing:"-.025em",lineHeight:1,margin:"0 0 12px"}}>
        Here's what we read on you, Aarav.
      </h1>
      <p style={{fontSize:16,color:"var(--ink-2)",maxWidth:680,margin:"0 0 32px"}}>
        Three roles look reachable from where you are right now. Pick one to interview for — we'll tune questions to its core skills and to the gaps in your resume.
      </p>

      <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:24,alignItems:"start"}}>
        {/* Resume snapshot */}
        <div className="card" style={{padding:24,position:"sticky",top:24}}>
          <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500,marginBottom:14}}>Resume snapshot</div>
          <div style={{fontSize:18,fontWeight:500,letterSpacing:"-.01em"}}>{RESUME.name}</div>
          <div style={{fontSize:12,color:"var(--ink-3)",marginBottom:18}}>{RESUME.location} · {RESUME.signals.seniority}</div>
          <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:8}}>Top skills (extracted)</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
            {RESUME.skills.slice(0,6).map(s=>(
              <div key={s.k} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:80,fontSize:11,color:"var(--ink-2)"}}>{s.k}</div>
                <div style={{flex:1,height:3,background:"var(--bg-3)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${s.lvl*100}%`,background:"var(--acc)"}}/>
                </div>
                <div className="num" style={{fontSize:10,color:"var(--ink-4)",width:24,textAlign:"right"}}>{Math.round(s.lvl*100)}</div>
              </div>
            ))}
          </div>
          <Hr/>
          <div style={{marginTop:14}}>
            <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:8}}>Experience</div>
            {RESUME.experience.map((e,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:500}}>{e.role} · <span style={{color:"var(--ink-3)",fontWeight:400}}>{e.org}</span></div>
                <div style={{fontSize:10,color:"var(--ink-4)"}}>{e.period}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        {variant === "cards" && <RolesCards picked={picked} setPicked={setPicked} next={next}/>}
        {variant === "constellation" && <RolesConstellation picked={picked} setPicked={setPicked} next={next}/>}
        {variant === "list" && <RolesList picked={picked} setPicked={setPicked} next={next}/>}
      </div>
    </div>
  );
}

// V1: cards layout
function RolesCards({ picked, setPicked, next }) {
  const { INFERRED_ROLES } = window.LOOP_DATA;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500}}>3 inferred roles · ranked by fit</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {INFERRED_ROLES.map((r, i)=>(
          <button key={r.id} onClick={()=>setPicked(r.id)} style={{
            all:"unset",cursor:"pointer",
            display:"flex",flexDirection:"column",
            background: picked===r.id ? "var(--bg-2)" : "var(--bg-1)",
            border: `1px solid ${picked===r.id ? r.color : "var(--line)"}`,
            borderRadius:14,padding:20,gap:14,
            position:"relative",overflow:"hidden",
            animation:`rise .5s ease-out ${i*0.08}s both`,
            transition:"all .15s",
          }}>
            {picked===r.id && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:r.color}}/>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div className="num" style={{fontSize:36,fontWeight:600,letterSpacing:"-.04em",lineHeight:1,color:r.color}}>
                <CountUp to={Math.round(r.fit*100)}/>
              </div>
              <span className="mono uppercase" style={{fontSize:9,color:"var(--ink-4)"}}>fit</span>
            </div>
            <div style={{fontSize:15,fontWeight:500,letterSpacing:"-.01em",lineHeight:1.2}}>{r.title}</div>
            <Hr/>
            <div>
              <div className="uppercase" style={{fontSize:9,color:"var(--ink-4)",marginBottom:6}}>Why we matched</div>
              <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>
                {r.why.map((w,j)=>(
                  <li key={j} style={{fontSize:11,color:"var(--ink-2)",display:"flex",gap:6,lineHeight:1.4}}>
                    <span style={{color:r.color,marginTop:2}}>+</span><span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="uppercase" style={{fontSize:9,color:"var(--ink-4)",marginBottom:6}}>Probe areas</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {r.gaps.map((g,j)=> <span key={j} style={{fontSize:10,padding:"3px 7px",borderRadius:4,background:"var(--bg-3)",color:"var(--ink-3)"}}>{g}</span>)}
              </div>
            </div>
            <div style={{fontSize:10,color:"var(--ink-4)",marginTop:"auto"}}>{r.market}</div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
        <button className="btn btn-ghost">Edit resume signals</button>
        <button className="btn btn-pri" onClick={next}>Interview for {INFERRED_ROLES.find(r=>r.id===picked).title.split(" ")[0]} →</button>
      </div>
    </div>
  );
}

// V2: constellation — visual map
function RolesConstellation({ picked, setPicked, next }) {
  const { INFERRED_ROLES } = window.LOOP_DATA;
  const positions = { backend:{x:50,y:35}, data:{x:25,y:65}, platform:{x:75,y:65} };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500}}>Role fit constellation</div>
      <div className="card" style={{padding:32,position:"relative",height:520,overflow:"hidden"}}>
        <div className="grid-bg" style={{position:"absolute",inset:0,opacity:.3}}/>
        {/* center "you" */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8,zIndex:0}}>
          {/* center marker pulse */}
        </div>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:"absolute",inset:0}}>
          {INFERRED_ROLES.map(r=>(
            <line key={r.id} x1="50" y1="50" x2={positions[r.id].x} y2={positions[r.id].y}
              stroke={r.color} strokeOpacity={picked===r.id?0.6:0.18} strokeWidth="0.15" strokeDasharray="0.8 0.4" vectorEffect="non-scaling-stroke"/>
          ))}
        </svg>
        {/* center node */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:"var(--ink)",boxShadow:"0 0 0 6px var(--bg-2), 0 0 0 7px var(--line-2)"}}/>
          <div className="uppercase mono" style={{fontSize:9,color:"var(--ink-3)",letterSpacing:".15em"}}>You</div>
        </div>
        {INFERRED_ROLES.map((r,i)=>(
          <button key={r.id} onClick={()=>setPicked(r.id)} style={{
            all:"unset",cursor:"pointer",
            position:"absolute",
            left:`${positions[r.id].x}%`,top:`${positions[r.id].y}%`,
            transform:"translate(-50%,-50%)",
            width: 200,
            padding:"12px 14px",
            borderRadius:12,
            background:picked===r.id?"var(--bg-2)":"var(--bg-1)",
            border:`1px solid ${picked===r.id?r.color:"var(--line-2)"}`,
            display:"flex",flexDirection:"column",gap:6,
            animation:`rise .5s ease-out ${i*0.1}s both`,
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <div style={{fontSize:13,fontWeight:500}}>{r.title.split("(")[0].trim()}</div>
              <div className="num" style={{fontSize:18,fontWeight:600,color:r.color,letterSpacing:"-.03em"}}>{Math.round(r.fit*100)}</div>
            </div>
            <div style={{fontSize:10,color:"var(--ink-4)"}}>{r.market.split("·")[0]}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>
              {r.why.slice(0,2).map((w,j)=>(
                <span key={j} style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:"var(--bg-3)",color:"var(--ink-3)"}}>{w.split(":")[0].slice(0,18)}{w.length>18?"…":""}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
        <button className="btn btn-pri" onClick={next}>Interview for {INFERRED_ROLES.find(r=>r.id===picked).title.split(" ")[0]} →</button>
      </div>
    </div>
  );
}

// V3: stacked detail list
function RolesList({ picked, setPicked, next }) {
  const { INFERRED_ROLES } = window.LOOP_DATA;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",fontWeight:500}}>Detailed role breakdown</div>
      {INFERRED_ROLES.map((r,i)=>{
        const open = picked===r.id;
        return (
          <button key={r.id} onClick={()=>setPicked(r.id)} style={{
            all:"unset",cursor:"pointer",
            background:"var(--bg-1)",border:`1px solid ${open?r.color:"var(--line)"}`,borderRadius:14,
            padding:open?"22px 24px":"18px 24px",
            display:"flex",flexDirection:"column",gap:open?16:0,
            transition:"all .2s",
            animation:`rise .4s ease-out ${i*0.06}s both`,
          }}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18}}>
              <div style={{display:"flex",alignItems:"center",gap:18}}>
                <div className="num" style={{fontSize:32,fontWeight:600,color:r.color,letterSpacing:"-.04em"}}>{Math.round(r.fit*100)}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:500}}>{r.title}</div>
                  <div style={{fontSize:11,color:"var(--ink-4)",marginTop:2}}>{r.market}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:120,height:3,background:"var(--bg-3)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${r.fit*100}%`,background:r.color}}/>
                </div>
                <div style={{fontSize:18,color:"var(--ink-3)"}}>{open?"−":"+"}</div>
              </div>
            </div>
            {open && (
              <div className="rise" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,paddingTop:12,borderTop:"1px solid var(--line)"}}>
                <div>
                  <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:8}}>Strong evidence</div>
                  <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
                    {r.why.map((w,j)=>(
                      <li key={j} style={{fontSize:12,color:"var(--ink-2)",display:"flex",gap:8,lineHeight:1.5}}>
                        <span style={{color:r.color}}>+</span><span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="uppercase" style={{fontSize:10,color:"var(--ink-4)",marginBottom:8}}>What we'll probe</div>
                  <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
                    {r.gaps.map((g,j)=>(
                      <li key={j} style={{fontSize:12,color:"var(--ink-2)",display:"flex",gap:8,lineHeight:1.5}}>
                        <span style={{color:"var(--warn)"}}>?</span><span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </button>
        );
      })}
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
        <button className="btn btn-pri" onClick={next}>Interview for {INFERRED_ROLES.find(r=>r.id===picked).title.split(" ")[0]} →</button>
      </div>
    </div>
  );
}

window.ScreenRoles = ScreenRoles;
