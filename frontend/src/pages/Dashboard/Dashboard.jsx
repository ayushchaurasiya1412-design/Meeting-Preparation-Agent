import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid, AreaChart, Area,
} from "recharts";

// ── Tooltip ──────────────────────────────────────────────────
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 14px", boxShadow:"0 4px 14px rgba(0,0,0,0.08)" }}>
      {label && <div style={{ color:"var(--text-muted)", fontSize:"0.74rem", marginBottom:4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color||"var(--violet)", fontWeight:700, fontSize:"0.92rem" }}>
          {p.name ? `${p.name}: ` : ""}{p.value}
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ title, value, subtitle, color, gradient, icon, trend }) {
  return (
    <div className="glass glass-hover" style={{ padding:22 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div style={{ width:46, height:46, borderRadius:14, background:gradient, display:"grid", placeItems:"center", border:`1px solid ${color}20` }}>
          {icon}
        </div>
        {trend != null && (
          <span style={{ fontSize:"0.72rem", fontWeight:700, color: trend >= 0 ? "#10b981" : "#f43f5e", background: trend >= 0 ? "#ecfdf5" : "#fff1f2", padding:"3px 8px", borderRadius:99, border:`1px solid ${trend>=0?"#a7f3d0":"#fecdd3"}` }}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize:"2rem", fontWeight:900, color:"var(--text-primary)", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:4 }}>{subtitle}</div>
      <div style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-secondary)", marginTop:2 }}>{title}</div>
    </div>
  );
}

// ── Activity Feed ────────────────────────────────────────────
function ActivityFeed({ items }) {
  const timeAgo = (iso) => {
    if (!iso) return "just now";
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60)   return "just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };
  return (
    <div className="glass" style={{ padding:22 }}>
      <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)", marginBottom:18 }}>📰 Recent Activity</div>
      {items.length === 0 && <div style={{ color:"var(--text-muted)", fontSize:"0.84rem", textAlign:"center", padding:"20px 0" }}>No activity yet</div>}
      {items.map((ev, i) => (
        <div key={i} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`${ev.color}12`, border:`1px solid ${ev.color}22`, display:"grid", placeItems:"center", fontSize:"0.9rem", flexShrink:0 }}>
            {ev.icon}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:"0.82rem", color:"var(--text-primary)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.label}</div>
            <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:2 }}>{timeAgo(ev.time)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Upcoming Meetings Widget ─────────────────────────────────
function UpcomingMeetings({ items }) {
  return (
    <div className="glass" style={{ padding:22 }}>
      <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)", marginBottom:18 }}>📅 Upcoming (7 days)</div>
      {items.length === 0 && <div style={{ color:"var(--text-muted)", fontSize:"0.84rem", textAlign:"center", padding:"20px 0" }}>No upcoming meetings</div>}
      {items.map((m, i) => {
        const dt   = m.meeting_date ? new Date(m.meeting_date) : null;
        const days = dt ? Math.ceil((dt - Date.now()) / 86400000) : null;
        return (
          <div key={i} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start", padding:"10px 12px", borderRadius:12, background:"var(--bg-base)", border:"1px solid var(--border)" }}>
            <div style={{ textAlign:"center", width:36, flexShrink:0 }}>
              <div style={{ fontSize:"1.4rem", fontWeight:900, color:"var(--violet)", lineHeight:1 }}>{dt ? dt.getDate() : "—"}</div>
              <div style={{ fontSize:"0.6rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase" }}>{dt ? dt.toLocaleDateString("en-US",{month:"short"}) : ""}</div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"0.85rem", fontWeight:700, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</div>
              <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:2 }}>{m.client_name}</div>
            </div>
            {days != null && (
              <span style={{ fontSize:"0.68rem", fontWeight:700, color: days===0?"#f43f5e":days===1?"#f59e0b":"#7c3aed", background: days===0?"#fff1f2":days===1?"#fffbeb":"#f5f3ff", padding:"3px 8px", borderRadius:99, flexShrink:0, border:`1px solid ${days===0?"#fecdd3":days===1?"#fde68a":"#ddd6fe"}` }}>
                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days}d`}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
const PIE_COLORS = ["#7c3aed","#0ea5e9","#10b981","#f59e0b","#f43f5e","#14b8a6"];

export default function Dashboard() {
  const [stats,          setStats]          = useState({ clients:0, meetings:0, notes:0, actions:0, completed_actions:0, completion_rate:0 });
  const [monthly,        setMonthly]        = useState([]);
  const [actionCompl,    setActionCompl]    = useState([]);
  const [industries,     setIndustries]     = useState([]);
  const [upcoming,       setUpcoming]       = useState([]);
  const [activity,       setActivity]       = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, m, ac, ind, up, act] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/monthly-meetings"),
          api.get("/api/dashboard/action-completion"),
          api.get("/api/dashboard/industry-distribution"),
          api.get("/api/dashboard/upcoming-meetings"),
          api.get("/api/dashboard/activity-feed"),
        ]);
        setStats(s.data);
        setMonthly(m.data);
        setActionCompl(ac.data);
        setIndustries(ind.data);
        setUpcoming(up.data);
        setActivity(act.data);
      } catch {
        // fallback mock data
        setMonthly([
          {month:"Feb",meetings:2},{month:"Mar",meetings:4},{month:"Apr",meetings:3},
          {month:"May",meetings:6},{month:"Jun",meetings:5},{month:"Jul",meetings:8},
        ]);
        setActionCompl([
          {month:"Feb",total:5,completed:2,rate:40},{month:"Mar",total:8,completed:4,rate:50},
          {month:"Apr",total:6,completed:3,rate:50},{month:"May",total:10,completed:7,rate:70},
          {month:"Jun",total:9,completed:6,rate:67},{month:"Jul",total:12,completed:10,rate:83},
        ]);
        setIndustries([{name:"Finance",value:2},{name:"Healthcare",value:2},{name:"Retail",value:1},{name:"Consulting",value:1}]);
        setUpcoming([]);
        setActivity([]);
        setStats({ clients:4, meetings:5, notes:3, actions:12, completed_actions:5, completion_rate:42 });
      }
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { title:"Total Clients",  value:stats.clients,   subtitle:`${Math.ceil(stats.clients*0.6)} active`,   color:"#7c3aed", gradient:"#f5f3ff", trend:12,
      icon:<svg width="20" height="20" fill="none" stroke="#7c3aed" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    { title:"Total Meetings", value:stats.meetings,  subtitle:`${Math.ceil(stats.meetings*0.4)} upcoming`, color:"#0ea5e9", gradient:"#f0f9ff", trend:8,
      icon:<svg width="20" height="20" fill="none" stroke="#0ea5e9" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
    { title:"Meeting Notes",  value:stats.notes,     subtitle:"All time",                                  color:"#10b981", gradient:"#ecfdf5", trend:5,
      icon:<svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
    { title:"Action Items",   value:stats.actions,   subtitle:`${stats.completed_actions} completed`,      color:"#f59e0b", gradient:"#fffbeb", trend:null,
      icon:<svg width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> },
    { title:"Completion Rate",value:`${stats.completion_rate}%`, subtitle:"Action items done", color:"#14b8a6", gradient:"#f0fdfa", trend:null,
      icon:<svg width="20" height="20" fill="none" stroke="#14b8a6" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg> },
    { title:"AI Productivity", value:`${Math.min(100,Math.floor((stats.meetings+stats.notes+stats.actions)*4))}%`, subtitle:"AI efficiency score", color:"#ec4899", gradient:"#fdf2f8", trend:15,
      icon:<svg width="20" height="20" fill="none" stroke="#ec4899" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/></svg> },
  ];

  if (loading) return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
      {Array.from({length:6}).map((_,i) => <div key={i} className="skeleton" style={{ height:120, borderRadius:18 }}/>)}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800, color:"var(--text-primary)" }}>Dashboard</h1>
        <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>
          Overview of <span style={{ color:"var(--violet)" }}>your meeting preparation workspace</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
        {statCards.map(s => <StatCard key={s.title} {...s}/>)}
      </div>

      {/* AI Summary Banner */}
      <div className="glass" style={{ padding:"18px 22px", marginBottom:24, background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", border:"1px solid #ddd6fe", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"#ede9fe", display:"grid", placeItems:"center", border:"1px solid #ddd6fe", flexShrink:0 }}>
          <svg width="18" height="18" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:"0.9rem", color:"#0f172a" }}>🤖 AI Executive Summary</div>
          <div style={{ fontSize:"0.82rem", color:"#475569", marginTop:2 }}>
            Managing <strong style={{ color:"#7c3aed" }}>{stats.clients}</strong> clients ·{" "}
            <strong style={{ color:"#0ea5e9" }}>{stats.meetings}</strong> meetings ·{" "}
            <strong style={{ color:"#10b981" }}>{stats.notes}</strong> notes ·{" "}
            <strong style={{ color:"#f59e0b" }}>{stats.actions}</strong> action items ·{" "}
            <strong style={{ color:"#14b8a6" }}>{stats.completion_rate}%</strong> completion rate
          </div>
        </div>
      </div>

      {/* Charts Row 1 — Monthly meetings + Action completion trend */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

        {/* Monthly meetings bar */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)", marginBottom:18 }}>📈 Monthly Meetings</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} barSize={24}>
              <defs>
                <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:"var(--text-muted)", fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"var(--text-muted)", fontSize:12 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="meetings" fill="url(#barG)" radius={[8,8,0,0]} name="Meetings"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action completion line */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)", marginBottom:18 }}>✅ Action Completion Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={actionCompl}>
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill:"var(--text-muted)", fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"var(--text-muted)", fontSize:12 }} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip content={<CTip/>}/>
              <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} fill="url(#areaG)" dot={{ fill:"#10b981", r:4 }} name="Rate %"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 — Industry pie + Meetings vs completed bar */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

        {/* Industry distribution */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)", marginBottom:18 }}>🏢 Client Industries</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={industries} cx="50%" cy="50%" outerRadius={75} innerRadius={38} dataKey="value" nameKey="name" paddingAngle={4}>
                {industries.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip content={<CTip/>}/>
              <Legend formatter={v => <span style={{ color:"var(--text-secondary)", fontSize:"0.78rem" }}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Total vs Completed actions */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)", marginBottom:18 }}>📊 Tasks: Total vs Completed</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={actionCompl} barSize={14} barGap={3}>
              <XAxis dataKey="month" tick={{ fill:"var(--text-muted)", fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"var(--text-muted)", fontSize:12 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="total"     fill="#e2e8f0" radius={[4,4,0,0]} name="Total"/>
              <Bar dataKey="completed" fill="#7c3aed"  radius={[4,4,0,0]} name="Done"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row — Upcoming + Activity feed */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <UpcomingMeetings items={upcoming}/>
        <ActivityFeed items={activity}/>
      </div>
    </div>
  );
}
