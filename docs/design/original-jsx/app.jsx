// Main app — routing + tweaks panel
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "interviewState": "asking",
  "agentPersona": "mira",
  "rolesVariant": "cards",
  "feedbackVariant": "report",
  "mode": "student"
}/*EDITMODE-END*/;

function App() {
  const [route, setRoute] = useStateApp("landing");
  const [dropped, setDropped] = useStateApp(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const order = ["landing","roles","setup","interview","feedback","jobs","history"];
  const idx = order.indexOf(route);
  const next = () => setRoute(order[Math.min(order.length-1, idx+1)]);

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute}/>
      <main style={{minWidth:0,background:"var(--bg)",position:"relative"}}>
        {route==="landing" && <ScreenLanding next={next} dropped={dropped} setDropped={setDropped}/>}
        {route==="roles" && <ScreenRoles next={next} variant={t.rolesVariant}/>}
        {route==="setup" && <ScreenSetup next={next}/>}
        {route==="interview" && <ScreenInterview next={next} agent={t.agentPersona} state={t.interviewState} setState={(v)=>setTweak('interviewState',v)}/>}
        {route==="feedback" && <ScreenFeedback next={next} variant={t.feedbackVariant}/>}
        {route==="jobs" && <ScreenJobs next={next}/>}
        {route==="history" && <ScreenHistory next={next}/>}
      </main>

      <TweaksPanel>
        <TweakSection label="Interview"/>
        <TweakRadio label="Agent state" value={t.interviewState}
          options={["idle","asking","listening","thinking"]}
          onChange={(v)=>setTweak('interviewState',v)}/>
        <TweakSelect label="Agent persona" value={t.agentPersona}
          options={[{value:"mira",label:"Mira (illustrated)"},{value:"orb",label:"Energy orb"},{value:"wave",label:"Voice waveform"}]}
          onChange={(v)=>setTweak('agentPersona',v)}/>
        <TweakSection label="Layout variants"/>
        <TweakSelect label="Roles reveal" value={t.rolesVariant}
          options={[{value:"cards",label:"Card grid"},{value:"constellation",label:"Constellation map"},{value:"list",label:"Detail list"}]}
          onChange={(v)=>setTweak('rolesVariant',v)}/>
        <TweakSelect label="Feedback report" value={t.feedbackVariant}
          options={[{value:"report",label:"Full report"},{value:"scorecard",label:"Scorecard"},{value:"timeline",label:"Moment timeline"}]}
          onChange={(v)=>setTweak('feedbackVariant',v)}/>
        <TweakSection label="Audience"/>
        <TweakRadio label="Tone" value={t.mode}
          options={["student","pro"]}
          onChange={(v)=>setTweak('mode',v)}/>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
