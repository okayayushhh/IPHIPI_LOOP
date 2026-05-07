// Sample data — believable resume / roles / jobs / interview content
const RESUME = {
  name: "Aarav Mehta",
  email: "aarav.mehta@hey.com",
  phone: "+91 98•••••••2",
  location: "Bengaluru, IN",
  summary:
    "Final-year CS undergrad with 2 internships building backend services and data pipelines. Strong in Python/Go, comfortable with cloud (AWS), curious about distributed systems.",
  skills: [
    { k: "Python", lvl: 0.9 }, { k: "Go", lvl: 0.7 }, { k: "PostgreSQL", lvl: 0.8 },
    { k: "AWS (Lambda, RDS, S3)", lvl: 0.65 }, { k: "Docker", lvl: 0.7 },
    { k: "Kafka", lvl: 0.5 }, { k: "React", lvl: 0.55 }, { k: "System Design", lvl: 0.45 },
    { k: "Pandas / NumPy", lvl: 0.75 }, { k: "Airflow", lvl: 0.5 },
  ],
  experience: [
    {
      role: "Backend Intern",
      org: "Razorpay",
      period: "May–Aug 2025",
      bullets: [
        "Built idempotent webhook retry service handling 1.2M events/day in Go.",
        "Cut p99 latency from 480ms → 110ms by introducing a Redis-backed dedupe layer.",
        "Wrote a runbook adopted by 4 engineers on the team.",
      ],
    },
    {
      role: "Data Intern",
      org: "Atlan",
      period: "Dec 2024–Feb 2025",
      bullets: [
        "Authored 14 Airflow DAGs to ingest customer metadata from 6 SaaS sources.",
        "Reduced backfill time on a 40GB dataset by 6× via partitioned writes.",
      ],
    },
  ],
  projects: [
    {
      name: "kvstore.go",
      blurb: "Tiny Raft-based key-value store. 3-node consensus, ~1.4k LOC.",
      tags: ["Go", "Raft", "gRPC"],
    },
    {
      name: "queryplan-viz",
      blurb: "Visualizes Postgres EXPLAIN trees. Featured on r/PostgreSQL.",
      tags: ["TypeScript", "D3", "Postgres"],
    },
  ],
  education: [
    { school: "BITS Pilani", degree: "B.E. Computer Science", period: "2022–2026", gpa: "8.7 / 10" },
  ],
  signals: {
    seniority: "Entry / New-grad",
    domains: ["Backend", "Data", "Cloud"],
    yoe: 0.8,
  },
};

const INFERRED_ROLES = [
  {
    id: "backend",
    title: "Backend Engineer (New-grad)",
    fit: 0.92,
    why: [
      "Razorpay internship: production Go services at scale",
      "Strong Postgres & Redis fundamentals from kvstore.go",
      "Comfort with idempotency + p99 latency thinking",
    ],
    gaps: ["System design at scale", "Distributed transactions", "Observability tooling"],
    market: "1,240 active openings · ₹14–28 LPA typical",
    color: "var(--acc)",
  },
  {
    id: "data",
    title: "Data / Analytics Engineer",
    fit: 0.81,
    why: [
      "14 Airflow DAGs shipped at Atlan",
      "Pandas/NumPy + partitioned writes on 40GB dataset",
      "SQL fluency from Postgres internals work",
    ],
    gaps: ["dbt / lineage tooling", "Stream processing (Flink)", "Warehouse cost tuning"],
    market: "780 active openings · ₹12–24 LPA typical",
    color: "#7CC8FF",
  },
  {
    id: "platform",
    title: "Platform / DevOps Engineer",
    fit: 0.71,
    why: [
      "AWS Lambda + RDS + S3 hands-on",
      "Docker + container experience",
      "Owned a runbook adopted by team",
    ],
    gaps: ["Kubernetes operationally", "Terraform / IaC depth", "Incident response"],
    market: "510 active openings · ₹16–32 LPA typical",
    color: "#FFB84E",
  },
];

const INTERVIEW_TRANSCRIPT = [
  { who: "agent", t: "00:04", text: "Hi Aarav — thanks for joining. We'll spend about 30 minutes today. I'd love to start with your Razorpay internship. Walk me through the webhook retry service you built." },
  { who: "user",  t: "00:18", text: "Sure. So the existing webhook system would just retry on failure with exponential backoff, but it didn't dedupe. Customers were complaining about double charges on idempotent endpoints." },
  { who: "user",  t: "00:34", text: "I introduced a Redis layer keyed on (event_id, endpoint_url) with a 24-hour TTL. Before each retry we'd check the key, and only fire if it wasn't already in flight." },
  { who: "agent", t: "00:52", text: "Good. What was your TTL reasoning? Why 24 hours specifically — and what happens if Redis goes down mid-retry?" },
  { who: "user",  t: "01:08", text: "Hmm, 24 hours was — honestly, mostly because the SLA on customer-side processing was 24 hours. If Redis goes down we'd… fall back to direct sends, which loses the dedupe guarantee." },
  { who: "agent", t: "01:24", text: "Right. So your retry service is only as available as Redis. Have you thought about how you'd make this multi-region?", flag: "probe" },
  { who: "user",  t: "01:42", text: "I haven't, no. We were single-region in ap-south-1. I think you'd need… a CRDT? Or maybe a leader-elected Redis cluster per region with cross-region replication?" },
  { who: "agent", t: "02:00", text: "Let's hold that thread. Switching gears — tell me about a time you disagreed with a teammate's design decision.", flag: "soft" },
];

const NEXT_QUESTIONS = [
  "Walk me through how you'd design a rate limiter for the webhook service.",
  "What's the difference between Raft and Paxos in one sentence?",
  "Tell me about a time a project didn't go as planned.",
  "How would you debug a 3 AM page about p99 latency spiking on the API gateway?",
];

const JOBS = [
  { co: "Razorpay", title: "Backend Engineer I", loc: "Bengaluru · Hybrid", comp: "₹22–28 LPA", match: 94, tag: "backend", new: true, why: ["Tech match: Go, Postgres, Redis", "You interned here — strong referral signal", "Team works on payments infra"] },
  { co: "Atlan",     title: "Software Engineer, Data Platform", loc: "Remote (IN)", comp: "₹24–32 LPA", match: 91, tag: "data", new: true, why: ["Internship history", "Airflow + metadata expertise"] },
  { co: "Cred",      title: "Backend Engineer (New-grad)", loc: "Bengaluru", comp: "₹26–34 LPA", match: 88, tag: "backend", why: ["Go + Postgres core stack", "High-throughput payments domain"] },
  { co: "Postman",   title: "Platform Engineer", loc: "Bengaluru · Hybrid", comp: "₹20–30 LPA", match: 82, tag: "platform", why: ["AWS + Docker fit", "Internal-tooling DNA"] },
  { co: "Hasura",    title: "Backend Engineer", loc: "Remote", comp: "₹22–30 LPA", match: 80, tag: "backend", why: ["Postgres deep work", "GraphQL is a stretch"] },
  { co: "Rippling",  title: "Software Engineer (Data)", loc: "Bengaluru", comp: "₹28–38 LPA", match: 78, tag: "data", why: ["DAG + warehouse fit", "Scale gap to address"] },
  { co: "Zerodha",   title: "Junior Backend Engineer", loc: "Bengaluru", comp: "₹16–22 LPA", match: 76, tag: "backend", why: ["Strong fundamentals match", "Smaller team, more ownership"] },
  { co: "Freshworks", title: "Associate Data Engineer", loc: "Chennai", comp: "₹14–20 LPA", match: 71, tag: "data", why: ["Pandas/Airflow fit", "SaaS metadata experience"] },
];

const HISTORY = [
  { id: "s-014", date: "Apr 28, 2026", role: "Backend (Sr. Mock)", duration: "32m", tech: 78, comm: 84, conf: 71, delta: +6 },
  { id: "s-013", date: "Apr 22, 2026", role: "System Design",      duration: "41m", tech: 64, comm: 80, conf: 62, delta: -3 },
  { id: "s-012", date: "Apr 18, 2026", role: "Backend (New-grad)",  duration: "28m", tech: 81, comm: 79, conf: 74, delta: +9 },
  { id: "s-011", date: "Apr 11, 2026", role: "Data Engineer",       duration: "35m", tech: 72, comm: 77, conf: 68, delta: +2 },
  { id: "s-010", date: "Apr 04, 2026", role: "Backend (New-grad)",  duration: "30m", tech: 67, comm: 75, conf: 60, delta: 0 },
  { id: "s-009", date: "Mar 28, 2026", role: "Behavioral",          duration: "22m", tech: null, comm: 82, conf: 70, delta: +5 },
];

const FEEDBACK = {
  overall: 78,
  scores: {
    technical: { v: 76, label: "Technical correctness", trend: +6 },
    communication: { v: 84, label: "Communication clarity", trend: +2 },
    confidence: { v: 71, label: "Vocal confidence", trend: -4 },
    structure: { v: 68, label: "Answer structure", trend: +1 },
    engagement: { v: 81, label: "Engagement / eye contact", trend: +3 },
  },
  strengths: [
    { t: "Concrete impact framing", d: "You consistently quoted numbers — '480ms → 110ms', '40GB dataset' — which lands well with senior engineers." },
    { t: "Honest about gaps", d: "When asked about multi-region failure modes, you said 'I haven't thought about that' before guessing. Senior signal." },
  ],
  improvements: [
    { t: "TTL / config justification", d: "You picked 24h because it 'matched the SLA' — but didn't explore the operational cost of longer TTLs. Pre-rehearse a 'why this number' answer for any constant in your code.", severity: "med" },
    { t: "System design vocabulary", d: "Reached for 'CRDT' under pressure when 'leader election + replication' was the cleaner answer. Practice 5 system-design primitives until they're reflex.", severity: "high" },
    { t: "Vocal pace under pressure", d: "Pace dropped from 142 wpm → 98 wpm at the multi-region question. Slower is fine; pauses before 'I haven't' would read as confident, not unsure.", severity: "low" },
  ],
  next: [
    "Spend 90min on 'designing a rate limiter' — you've used Redis, the leap is small.",
    "Read DDIA Ch. 5 (Replication) once. The vocabulary will stick.",
    "Re-record the Razorpay story with a STAR structure. Keep it under 90 seconds.",
  ],
};

const EXEMPLAR_QUESTIONS = {
  warmup: ["Tell me about yourself in 60 seconds.", "What drew you to backend over frontend?"],
  technical: [
    "Walk me through the webhook retry service.",
    "How would you design a rate limiter for it?",
    "What's a connection pool, and when does sizing it matter?",
  ],
  systemDesign: [
    "Design a URL shortener that handles 10k req/s.",
    "How would you make your retry service multi-region?",
  ],
  behavioral: [
    "Tell me about a time you disagreed with a teammate's design.",
    "When did a project not go as planned?",
  ],
};

window.LOOP_DATA = { RESUME, INFERRED_ROLES, INTERVIEW_TRANSCRIPT, NEXT_QUESTIONS, JOBS, HISTORY, FEEDBACK, EXEMPLAR_QUESTIONS };
