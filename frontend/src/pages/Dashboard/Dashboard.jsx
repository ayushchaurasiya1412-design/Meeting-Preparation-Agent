import { useEffect, useState, useCallback } from "react";
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
function ActivityFeed({ items, onRefresh }) {
  const [pulse, setPulse] = useState(false);

  // live-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true);
      onRefresh();
      setTimeout(() => setPulse(false), 800);
    }, 30_000);
    return () => clearInterval(t);
  }, [onRefresh]);

  const timeAgo = (iso) => {
    if (!iso) return "just now";
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60)    return "just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const TYPE_CFG = {
    meeting    : { dot:"#7c3aed", bar:"#7c3aed" },
    client     : { dot:"#0ea5e9", bar:"#0ea5e9" },
    action_done: { dot:"#10b981", bar:"#10b981" },
    action_wip : { dot:"#f59e0b", bar:"#f59e0b" },
    note       : { dot:"#ec4899", bar:"#ec4899" },
  };

  return (
    <div className="glass" style={{ padding:22, display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#7c3aed22,#0ea5e922)", border:"1px solid var(--border)", display:"grid", placeItems:"center" }}>
            <svg width="15" height="15" fill="none" stroke="var(--violet)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)" }}>Recent Activity</div>
            <div style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Auto-updates every 30s</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* live dot */}
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#10b981",
              boxShadow: pulse ? "0 0 0 5px rgba(16,185,129,0.25)" : "0 0 0 3px rgba(16,185,129,0.15)",
              transition:"box-shadow 0.4s" }}/>
            <span style={{ fontSize:"0.68rem", color:"#10b981", fontWeight:600 }}>LIVE</span>
          </div>
          <button onClick={() => { setPulse(true); onRefresh(); setTimeout(()=>setPulse(false),800); }}
            style={{ width:28, height:28, borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-base)", cursor:"pointer", display:"grid", placeItems:"center", color:"var(--text-muted)", transition:"all 0.2s" }}
            title="Refresh now"
            onMouseEnter={e => { e.currentTarget.style.background="var(--bg-hover)"; e.currentTarget.style.color="var(--violet)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="var(--bg-base)";  e.currentTarget.style.color="var(--text-muted)"; }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"
              style={{ transition:"transform 0.4s", transform: pulse ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Timeline */}
      {items.length === 0 ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", gap:10, padding:"24px 0" }}>
          <div style={{ fontSize:"2rem", opacity:0.4 }}>📭</div>
          <div style={{ fontSize:"0.82rem" }}>No activity yet</div>
        </div>
      ) : (
        <div style={{ position:"relative" }}>
          {/* vertical rail */}
          <div style={{ position:"absolute", left:15, top:8, bottom:0, width:2, background:"var(--border)", borderRadius:99 }}/>

          {items.map((ev, i) => {
            const cfg = TYPE_CFG[ev.type] || { dot:"#94a3b8", bar:"#94a3b8" };
            return (
              <div key={i} style={{ display:"flex", gap:14, marginBottom:16, position:"relative", alignItems:"flex-start" }}>
                {/* dot on rail */}
                <div style={{
                  width:32, height:32, borderRadius:10, flexShrink:0,
                  background:`${cfg.dot}14`, border:`1.5px solid ${cfg.dot}30`,
                  display:"grid", placeItems:"center", fontSize:"0.88rem",
                  position:"relative", zIndex:1,
                  boxShadow: i === 0 ? `0 0 0 4px ${cfg.dot}12` : "none",
                }}>
                  {ev.icon}
                </div>

                <div style={{ flex:1, minWidth:0, paddingTop:4 }}>
                  {/* left colored bar */}
                  <div style={{ display:"flex", gap:0 }}>
                    <div style={{ width:3, borderRadius:99, background:`linear-gradient(180deg,${cfg.bar},${cfg.bar}44)`, marginRight:10, flexShrink:0, minHeight:32, alignSelf:"stretch" }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"0.82rem", color:"var(--text-primary)", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3 }}>
                        {ev.label}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                        <span style={{ fontSize:"0.68rem", color:`${cfg.dot}`, fontWeight:700, background:`${cfg.dot}12`, padding:"2px 7px", borderRadius:99, border:`1px solid ${cfg.dot}22` }}>
                          {ev.type?.replace("_"," ").toUpperCase() || "EVENT"}
                        </span>
                        <span style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>
                          {timeAgo(ev.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Upcoming Meetings Widget ─────────────────────────────────
function UpcomingMeetings({ items }) {
  const [now, setNow] = useState(Date.now());

  // tick every minute so countdowns refresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const getCountdown = (isoDate) => {
    if (!isoDate) return null;
    const diff = new Date(isoDate) - now;
    if (diff < 0)       return { label:"Started", color:"#f43f5e", bg:"#fff1f2", border:"#fecdd3" };
    const totalMins = Math.floor(diff / 60000);
    const days  = Math.floor(totalMins / 1440);
    const hours = Math.floor((totalMins % 1440) / 60);
    const mins  = totalMins % 60;
    if (days > 0)  return { label: `${days}d ${hours}h`, color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" };
    if (hours > 0) return { label: `${hours}h ${mins}m`,  color:"#0ea5e9", bg:"#f0f9ff", border:"#bae6fd" };
    if (mins  > 0) return { label: `${mins}m`,            color:"#f59e0b", bg:"#fffbeb", border:"#fde68a" };
    return { label:"Now", color:"#10b981", bg:"#ecfdf5", border:"#a7f3d0" };
  };

  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="glass" style={{ padding:22, display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"rgba(14,165,233,0.10)", border:"1px solid rgba(14,165,233,0.20)", display:"grid", placeItems:"center" }}>
            <svg width="16" height="16" fill="none" stroke="#0ea5e9" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)" }}>Upcoming Meetings</div>
            <div style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Next 7 days</div>
          </div>
        </div>
        <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#0ea5e9", background:"rgba(14,165,233,0.10)", padding:"3px 10px", borderRadius:99, border:"1px solid rgba(14,165,233,0.20)" }}>
          {items.length} scheduled
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", gap:10, padding:"28px 0" }}>
          <div style={{ fontSize:"2.4rem", opacity:0.35 }}>📅</div>
          <div style={{ fontSize:"0.84rem", fontWeight:500 }}>No meetings in the next 7 days</div>
          <div style={{ fontSize:"0.74rem", color:"var(--text-muted)" }}>Enjoy the free time!</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.map((m, i) => {
            const dt       = m.meeting_date ? new Date(m.meeting_date) : null;
            const cd       = getCountdown(m.meeting_date);
            const isFirst  = i === 0;

            return (
              <div key={m.id || i}
                style={{
                  borderRadius:14,
                  border:`1.5px solid ${isFirst ? "rgba(14,165,233,0.30)" : "var(--border)"}`,
                  background: isFirst ? "rgba(14,165,233,0.04)" : "var(--bg-base)",
                  overflow:"hidden", transition:"all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="none"; }}
              >
                {/* top color strip for first item */}
                {isFirst && <div style={{ height:3, background:"linear-gradient(90deg,#0ea5e9,#7c3aed)", borderRadius:"14px 14px 0 0" }}/>}

                <div style={{ display:"flex", gap:14, padding:"12px 14px", alignItems:"flex-start" }}>
                  {/* Date block */}
                  <div style={{
                    width:46, flexShrink:0, textAlign:"center", padding:"8px 4px",
                    borderRadius:10, background: isFirst ? "rgba(14,165,233,0.12)" : "var(--bg-surface)",
                    border:`1px solid ${isFirst ? "rgba(14,165,233,0.20)" : "var(--border)"}`,
                  }}>
                    <div style={{ fontSize:"0.6rem", fontWeight:800, color: isFirst ? "#0ea5e9" : "var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                      {dt ? DAY_NAMES[dt.getDay()] : "—"}
                    </div>
                    <div style={{ fontSize:"1.5rem", fontWeight:900, color: isFirst ? "#0ea5e9" : "var(--text-primary)", lineHeight:1.1 }}>
                      {dt ? dt.getDate() : "—"}
                    </div>
                    <div style={{ fontSize:"0.6rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase" }}>
                      {dt ? MONTH_SHORT[dt.getMonth()] : ""}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize:"0.74rem", color:"var(--text-muted)", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      {m.client_name}
                    </div>
                    {dt && (
                      <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {dt.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}
                        {m.duration ? ` · ${m.duration} min` : ""}
                      </div>
                    )}
                    {m.agenda && (
                      <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"95%" }}>
                        📋 {m.agenda}
                      </div>
                    )}
                    {/* action row */}
                    <div style={{ display:"flex", gap:6, marginTop:10 }}>
                      {cd && (
                        <span style={{ fontSize:"0.7rem", fontWeight:700, color:cd.color, background:cd.bg, padding:"3px 9px", borderRadius:99, border:`1px solid ${cd.border}` }}>
                          ⏱ {cd.label}
                        </span>
                      )}
                      <a href="/timer" style={{
                        fontSize:"0.7rem", fontWeight:700, color:"white",
                        background:"linear-gradient(135deg,#0ea5e9,#7c3aed)",
                        padding:"3px 10px", borderRadius:99, textDecoration:"none",
                        display:"inline-flex", alignItems:"center", gap:4,
                      }}>
                        <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                        Start Timer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
const PIE_COLORS = ["#7c3aed","#0ea5e9","#10b981","#f59e0b","#f43f5e","#14b8a6"];

export default function Dashboard() {
  const [stats,       setStats]       = useState({ clients:0, meetings:0, notes:0, actions:0, completed_actions:0, completion_rate:0 });
  const [monthly,     setMonthly]     = useState([]);
  const [actionCompl, setActionCompl] = useState([]);
  const [industries,  setIndustries]  = useState([]);
  const [upcoming,    setUpcoming]    = useState([]);
  const [activity,    setActivity]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await api.get("/api/dashboard/activity-feed");
      setActivity(res.data);
    } catch { /* keep existing */ }
  }, []);

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
        <ActivityFeed items={activity} onRefresh={fetchActivity}/>
      </div>
    </div>
  );
}
