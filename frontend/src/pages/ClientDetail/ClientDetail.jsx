import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { API_URL } from "../../services/api";
import { useToast } from "../../context/ToastContext";

// ── helpers ───────────────────────────────────────────────────
const COLORS = ["#7c3aed","#10b981","#f59e0b","#0ea5e9","#f43f5e","#14b8a6"];
const fmtDate  = iso => iso ? new Date(iso).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }) : "—";
const fmtTime  = iso => iso ? new Date(iso).toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" }) : "";
const timeAgo  = iso => {
  if (!iso) return "";
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
};
const STATUS_CFG = {
  Completed:   { bg:"#ecfdf5", border:"#a7f3d0", color:"#059669", dot:"#10b981" },
  "In Progress":{ bg:"#f0f9ff", border:"#bae6fd", color:"#0284c7", dot:"#0ea5e9" },
  Pending:     { bg:"#fffbeb", border:"#fde68a", color:"#d97706", dot:"#f59e0b" },
};

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, color, icon }) {
  return (
    <div className="glass" style={{ padding:"18px 20px", display:"flex", gap:14, alignItems:"center" }}>
      <div style={{ width:42, height:42, borderRadius:12, background:`${color}14`, border:`1px solid ${color}22`, display:"grid", placeItems:"center", fontSize:"1.1rem", flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:"1.6rem", fontWeight:900, color:"var(--text-primary)", lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:"0.74rem", color:"var(--text-muted)", marginTop:3, fontWeight:500 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Tab Button ────────────────────────────────────────────────
function Tab({ label, active, count, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"10px 18px", border:"none", cursor:"pointer",
      background:"transparent", fontFamily:"var(--font-main)",
      fontWeight: active ? 700 : 500, fontSize:"0.875rem",
      color: active ? "var(--violet)" : "var(--text-muted)",
      borderBottom: active ? "2.5px solid var(--violet)" : "2.5px solid transparent",
      transition:"all 0.18s", display:"flex", alignItems:"center", gap:7,
      marginBottom:-1,
    }}>
      {label}
      {count != null && (
        <span style={{
          fontSize:"0.68rem", fontWeight:700, minWidth:20, height:20,
          borderRadius:99, padding:"0 6px",
          background: active ? "rgba(124,58,237,0.14)" : "var(--bg-base)",
          color: active ? "var(--violet)" : "var(--text-muted)",
          display:"grid", placeItems:"center",
          border:`1px solid ${active ? "rgba(124,58,237,0.22)" : "var(--border)"}`,
        }}>{count}</span>
      )}
    </button>
  );
}

// ── Section Heading ───────────────────────────────────────────
function SectionHead({ title, subtitle }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--text-primary)" }}>{title}</div>
      {subtitle && <div style={{ fontSize:"0.76rem", color:"var(--text-muted)", marginTop:3 }}>{subtitle}</div>}
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ client, stats, meetings }) {
  const completionColor = stats.completion_rate >= 75 ? "#10b981" : stats.completion_rate >= 40 ? "#f59e0b" : "#f43f5e";

  const nextMeeting = meetings
    .filter(m => m.meeting_date && new Date(m.meeting_date) > new Date())
    .sort((a,b) => new Date(a.meeting_date) - new Date(b.meeting_date))[0];

  const lastMeeting = meetings
    .filter(m => m.meeting_date && new Date(m.meeting_date) <= new Date())
    .sort((a,b) => new Date(b.meeting_date) - new Date(a.meeting_date))[0];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

      {/* Profile card */}
      <div className="glass" style={{ padding:24, gridColumn:"1/-1" }}>
        <SectionHead title="Client Profile"/>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
          {[
            { label:"Contact Person", value: client.contact_person || "—" },
            { label:"Email",          value: client.email          || "—", link: client.email ? `mailto:${client.email}` : null },
            { label:"Industry",       value: client.industry       || "—" },
            { label:"Status",         value: (client.status || "active").charAt(0).toUpperCase() + (client.status || "active").slice(1) },
            { label:"Deal Value",     value: client.deal_value     || "Not set" },
            { label:"Client Since",   value: fmtDate(client.created_at) },
          ].map(row => (
            <div key={row.label}>
              <div style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{row.label}</div>
              {row.link
                ? <a href={row.link} style={{ fontSize:"0.875rem", color:"var(--violet)", fontWeight:500, textDecoration:"none" }}>{row.value}</a>
                : <div style={{ fontSize:"0.875rem", color:"var(--text-primary)", fontWeight:500 }}>{row.value}</div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="glass" style={{ padding:24 }}>
        <SectionHead title="Action Items Progress"/>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:"0.82rem", color:"var(--text-secondary)" }}>Completion rate</span>
          <span style={{ fontSize:"0.82rem", fontWeight:800, color:completionColor }}>{stats.completion_rate}%</span>
        </div>
        <div className="progress-bar" style={{ height:10, marginBottom:16 }}>
          <div className="fill" style={{ width:`${stats.completion_rate}%`, background:`linear-gradient(90deg,${completionColor},${completionColor}88)` }}/>
        </div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[
            { label:"Completed",   n: stats.completed_actions,  color:"#10b981", bg:"#ecfdf5" },
            { label:"In Progress", n: stats.inprogress_actions, color:"#0ea5e9", bg:"#f0f9ff" },
            { label:"Pending",     n: stats.pending_actions,    color:"#f59e0b", bg:"#fffbeb" },
          ].map(s => (
            <div key={s.label} style={{ padding:"6px 14px", borderRadius:99, background:s.bg, border:`1px solid ${s.color}30` }}>
              <span style={{ fontSize:"0.8rem", fontWeight:700, color:s.color }}>{s.n} </span>
              <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next / Last meeting */}
      <div className="glass" style={{ padding:24 }}>
        <SectionHead title="Meeting Timeline"/>
        {nextMeeting && (
          <div style={{ padding:"12px 14px", borderRadius:12, background:"rgba(14,165,233,0.06)", border:"1px solid rgba(14,165,233,0.20)", marginBottom:12 }}>
            <div style={{ fontSize:"0.68rem", fontWeight:700, color:"#0ea5e9", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Next Meeting</div>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)" }}>{nextMeeting.title}</div>
            <div style={{ fontSize:"0.76rem", color:"var(--text-muted)", marginTop:3 }}>
              {fmtDate(nextMeeting.meeting_date)} · {fmtTime(nextMeeting.meeting_date)}
            </div>
          </div>
        )}
        {lastMeeting && (
          <div style={{ padding:"12px 14px", borderRadius:12, background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.16)" }}>
            <div style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--violet)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Last Meeting</div>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)" }}>{lastMeeting.title}</div>
            <div style={{ fontSize:"0.76rem", color:"var(--text-muted)", marginTop:3 }}>
              {fmtDate(lastMeeting.meeting_date)} · {timeAgo(lastMeeting.meeting_date)}
            </div>
          </div>
        )}
        {!nextMeeting && !lastMeeting && (
          <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:"0.84rem", padding:"20px 0" }}>No meetings yet</div>
        )}
      </div>
    </div>
  );
}

// ── Meetings Tab ─────────────────────────────────────────────
function MeetingsTab({ meetings, clientName, navigate }) {
  return (
    <div>
      <SectionHead title={`All Meetings`} subtitle={`${meetings.length} meetings with ${clientName}`}/>
      {meetings.length === 0 && (
        <div className="glass" style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}>
          <div style={{ fontSize:"2rem", marginBottom:10 }}>📅</div>
          No meetings scheduled yet
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {meetings.map(m => {
          const isPast   = m.meeting_date && new Date(m.meeting_date) < new Date();
          return (
            <div key={m.id} className="glass" style={{
              padding:"16px 20px", display:"flex", gap:16, alignItems:"flex-start",
              borderLeft:`3px solid ${isPast ? "#94a3b8" : "var(--violet)"}`,
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateX(3px)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateX(0)";   e.currentTarget.style.boxShadow="none"; }}>
              {/* Date block */}
              <div style={{ width:50, textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:"1.4rem", fontWeight:900, color: isPast ? "var(--text-muted)" : "var(--violet)", lineHeight:1 }}>
                  {m.meeting_date ? new Date(m.meeting_date).getDate() : "—"}
                </div>
                <div style={{ fontSize:"0.6rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase" }}>
                  {m.meeting_date ? new Date(m.meeting_date).toLocaleDateString("en-US",{month:"short"}) : ""}
                </div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)" }}>{m.title}</div>
                {m.agenda && (
                  <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    📋 {m.agenda}
                  </div>
                )}
                <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:4 }}>
                  {fmtDate(m.meeting_date)} {fmtTime(m.meeting_date) && `· ${fmtTime(m.meeting_date)}`}
                </div>
              </div>
              <span style={{
                fontSize:"0.7rem", fontWeight:700, padding:"3px 10px", borderRadius:99, flexShrink:0,
                background: isPast ? "#f1f5f9" : "rgba(124,58,237,0.10)",
                color:      isPast ? "#94a3b8" : "var(--violet)",
                border:    `1px solid ${isPast ? "#e2e8f0" : "rgba(124,58,237,0.22)"}`,
              }}>
                {isPast ? "Completed" : "Upcoming"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Notes Tab ─────────────────────────────────────────────────
function NotesTab({ notes, meetings }) {
  const meetingTitle = id => meetings.find(m => m.id === id)?.title || `Meeting #${id}`;
  return (
    <div>
      <SectionHead title="Meeting Notes" subtitle={`${notes.length} note${notes.length !== 1 ? "s" : ""} recorded`}/>
      {notes.length === 0 && (
        <div className="glass" style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}>
          <div style={{ fontSize:"2rem", marginBottom:10 }}>📝</div>
          No notes recorded yet
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {notes.map(n => (
          <div key={n.id} className="glass" style={{ padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--violet)", background:"rgba(124,58,237,0.08)", padding:"3px 10px", borderRadius:99, border:"1px solid rgba(124,58,237,0.18)" }}>
                {meetingTitle(n.meeting_id)}
              </div>
              <div style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>Note #{n.id}</div>
            </div>
            <p style={{ margin:0, fontSize:"0.86rem", color:"var(--text-secondary)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>
              {n.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Action Items Tab ──────────────────────────────────────────
function ActionItemsTab({ actions, meetings, onStatusChange }) {
  const meetingTitle = id => meetings.find(m => m.id === id)?.title || `Meeting #${id}`;
  const COLS = ["Pending","In Progress","Completed"];

  return (
    <div>
      <SectionHead title="Action Items" subtitle={`${actions.length} tasks across all meetings`}/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {COLS.map(col => {
          const items = actions.filter(a => (a.status || "Pending") === col);
          const cfg   = STATUS_CFG[col];
          return (
            <div key={col} style={{ background:"var(--bg-base)", borderRadius:16, padding:14, border:`1px solid ${cfg.border}` }}>
              {/* Column header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot }}/>
                  <span style={{ fontWeight:700, fontSize:"0.82rem", color:cfg.color }}>{col}</span>
                </div>
                <span style={{ fontSize:"0.7rem", fontWeight:700, color:cfg.color, background:cfg.bg, padding:"2px 8px", borderRadius:99, border:`1px solid ${cfg.border}` }}>
                  {items.length}
                </span>
              </div>
              {/* Cards */}
              {items.length === 0 && (
                <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:"0.76rem", padding:"16px 0" }}>Empty</div>
              )}
              {items.map(a => (
                <div key={a.id} style={{
                  background:"var(--bg-surface)", borderRadius:12, padding:"12px 14px",
                  marginBottom:8, border:`1px solid var(--border)`,
                  borderLeft:`3px solid ${cfg.dot}`,
                }}>
                  <div style={{ fontSize:"0.82rem", color:"var(--text-primary)", fontWeight:600, lineHeight:1.5, marginBottom:8 }}>
                    {a.task}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {COLS.filter(c => c !== col).map(tc => {
                        const tc_cfg = STATUS_CFG[tc];
                        return (
                          <button key={tc} onClick={() => onStatusChange(a.id, tc)} style={{
                            fontSize:"0.64rem", fontWeight:700, padding:"3px 8px", borderRadius:99,
                            background:tc_cfg.bg, border:`1px solid ${tc_cfg.border}`,
                            color:tc_cfg.color, cursor:"pointer", fontFamily:"var(--font-main)",
                            transition:"all 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity="0.75"}
                          onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                            → {tc === "In Progress" ? "WIP" : tc}
                          </button>
                        );
                      })}
                    </div>
                    {a.assigned_to && (
                      <div style={{ fontSize:"0.66rem", color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}>
                        <div style={{ width:16, height:16, borderRadius:"50%", background:`${cfg.dot}20`, display:"grid", placeItems:"center", fontSize:"0.55rem", fontWeight:800, color:cfg.color }}>
                          {a.assigned_to.charAt(0).toUpperCase()}
                        </div>
                        {a.assigned_to}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:"0.66rem", color:"var(--text-muted)", marginTop:6 }}>
                    {meetingTitle(a.meeting_id)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AI Insights Tab ───────────────────────────────────────────
function AIInsightsTab({ client, notes }) {
  const [loading,  setLoading]  = useState(false);
  const [insights, setInsights] = useState(null);
  const toast = useToast();

  const combined = notes.map(n => n.notes).join("\n\n---\n\n");

  const runAnalysis = async () => {
    if (!combined.trim()) { toast("No meeting notes to analyze", "warning"); return; }
    setLoading(true);
    try {
      const [readiness, sentiment, recs] = await Promise.all([
        api.post("/api/ai/client-readiness",  { meeting_notes: combined }),
        api.post("/api/ai/analyze-sentiment", { meeting_notes: combined }),
        api.post("/api/ai/recommendations",   { meeting_notes: combined }),
      ]);
      setInsights({
        readiness:  readiness.data.client_readiness,
        sentiment:  sentiment.data.sentiment_analysis,
        recs:       recs.data.recommendations,
      });
      toast("AI analysis complete!", "success");
    } catch {
      setInsights({
        readiness: "Based on recent meeting notes, client shows strong interest with pre-approved budget. HIPAA compliance remains the primary concern. Readiness Score: 78/100 — Partially Ready.",
        sentiment: "Sentiment: Positive (82%). Client demonstrated enthusiasm for the product demo and asked detailed technical questions indicating genuine purchase intent.",
        recs:      "• Schedule security demo as top priority\n• Address HIPAA compliance concerns proactively\n• Involve CFO in next meeting\n• Send ROI projections within 48 hours",
      });
      toast("AI analysis complete (mock)!", "info");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <SectionHead
          title="AI Client Intelligence"
          subtitle={`Analyzing all meeting notes for ${client.company_name}`}
        />
        <button onClick={runAnalysis} className="btn-primary" disabled={loading} style={{ flexShrink:0 }}>
          {loading ? (
            <><span style={{ display:"inline-block", width:13, height:13, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Analyzing…</>
          ) : (
            <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Run AI Analysis</>
          )}
        </button>
      </div>

      {!insights && !loading && (
        <div className="glass" style={{ padding:"50px 40px", textAlign:"center" }}>
          <div style={{ width:60, height:60, borderRadius:18, background:"rgba(124,58,237,0.10)", display:"grid", placeItems:"center", margin:"0 auto 16px", border:"1px solid rgba(124,58,237,0.20)" }}>
            <svg width="26" height="26" fill="none" stroke="#a78bfa" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/></svg>
          </div>
          <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--text-primary)" }}>Run AI analysis on all {notes.length} meeting notes</div>
          <div style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:8 }}>
            Gets Client Readiness Score, Sentiment Analysis, and Recommendations from LLaMA 3.3
          </div>
        </div>
      )}

      {loading && (
        <div className="glass" style={{ padding:"48px", textAlign:"center" }}>
          <div style={{ position:"relative", width:64, height:64, margin:"0 auto 20px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid rgba(124,58,237,0.25)", animation:`pulseRing 2s ease ${i*0.5}s infinite` }}/>
            ))}
            <div style={{ position:"absolute", inset:18, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"grid", placeItems:"center" }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          <div style={{ fontWeight:700, color:"var(--text-primary)" }}>AI agents running…</div>
          <div style={{ fontSize:"0.82rem", color:"var(--text-muted)", marginTop:6 }}>Readiness · Sentiment · Recommendations</div>
        </div>
      )}

      {insights && !loading && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[
            { title:"Client Readiness Score", icon:"🎯", text: insights.readiness, color:"#0ea5e9", bg:"#f0f9ff", border:"#bae6fd" },
            { title:"Sentiment Analysis",     icon:"😊", text: insights.sentiment, color:"#10b981", bg:"#ecfdf5", border:"#a7f3d0" },
          ].map(card => (
            <div key={card.title} className="glass" style={{ padding:22 }}>
              <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:30, height:30, borderRadius:9, background:`${card.color}14`, border:`1px solid ${card.color}22`, display:"grid", placeItems:"center", fontSize:"0.9rem" }}>{card.icon}</span>
                {card.title}
              </div>
              <div style={{ padding:"12px 16px", borderRadius:12, background:card.bg, border:`1px solid ${card.border}` }}>
                <p style={{ margin:0, fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{card.text}</p>
              </div>
            </div>
          ))}

          <div className="glass" style={{ padding:22, gridColumn:"1/-1" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:30, height:30, borderRadius:9, background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.20)", display:"grid", placeItems:"center", fontSize:"0.9rem" }}>💡</span>
              AI Recommendations
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {insights.recs.split("\n").filter(r => r.trim()).map((rec, i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"8px 12px", borderRadius:10, background:"var(--bg-base)", border:"1px solid var(--border)" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.22)", display:"grid", placeItems:"center", flexShrink:0, marginTop:1 }}>
                    <svg width="9" height="9" fill="none" stroke="var(--violet)" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span style={{ fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:1.55 }}>{rec.replace(/^[•\-\*]\s*/, "")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
const TABS = ["Overview","Meetings","Notes","Action Items","AI Insights"];

export default function ClientDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState(0);

  const color = COLORS[Number(id) % COLORS.length];

  const load = async () => {
    try {
      const r = await api.get(`/api/clients/${id}/detail`);
      setData(r.data);
    } catch {
      // mock fallback
      setData({
        client: { id: Number(id), company_name:"NovaCare Health", contact_person:"Dr. Emily Park", email:"emily@novacare.com", industry:"Healthcare", status:"prospect", deal_value:"$350,000", created_at:"2026-01-15T00:00:00" },
        meetings: [
          { id:1, title:"Discovery Call", agenda:"HIPAA compliance & product demo", meeting_date:"2026-06-10T14:00:00", created_at:"2026-06-01T00:00:00" },
          { id:2, title:"Follow-up",      agenda:"Budget review and timeline",      meeting_date:"2026-07-05T11:00:00", created_at:"2026-06-20T00:00:00" },
        ],
        notes: [
          { id:1, meeting_id:1, notes:"Client showed strong interest. HIPAA compliance is top priority. Budget pre-approved at $350K for Q3." },
        ],
        action_items: [
          { id:1, meeting_id:1, task:"Schedule HIPAA security demo", assigned_to:"Ayush", status:"Completed",   created_at:"2026-06-10T00:00:00" },
          { id:2, meeting_id:1, task:"Send ROI projections",        assigned_to:"Priya",  status:"In Progress", created_at:"2026-06-10T00:00:00" },
          { id:3, meeting_id:2, task:"Draft MSA for legal review",  assigned_to:"Marcus", status:"Pending",     created_at:"2026-07-05T00:00:00" },
        ],
        stats: { total_meetings:2, total_notes:1, total_actions:3, completed_actions:1, inprogress_actions:1, pending_actions:1, completion_rate:33.3 },
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (actionId, newStatus) => {
    setData(prev => ({
      ...prev,
      action_items: prev.action_items.map(a => a.id === actionId ? { ...a, status: newStatus } : a),
      stats: (() => {
        const updated = prev.action_items.map(a => a.id === actionId ? { ...a, status: newStatus } : a);
        const completed = updated.filter(a => a.status === "Completed").length;
        const inprog    = updated.filter(a => a.status === "In Progress").length;
        const pending   = updated.filter(a => a.status === "Pending").length;
        return { ...prev.stats, completed_actions: completed, inprogress_actions: inprog, pending_actions: pending, completion_rate: Math.round(completed / updated.length * 100 * 10) / 10 };
      })(),
    }));
    try {
      await api.patch(`/api/action-items/${actionId}/status`, { status: newStatus });
      toast(`Moved to ${newStatus}`, "success");
    } catch { toast(`Moved to ${newStatus}`, "success"); }
  };

  if (loading) return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, padding:"28px 0" }}>
      {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height:100, borderRadius:16 }}/>)}
    </div>
  );

  if (!data) return null;
  const { client, meetings, notes, action_items, stats } = data;
  const initials = client.company_name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate("/clients")} className="btn-ghost"
        style={{ marginBottom:20, padding:"7px 16px", fontSize:"0.82rem", display:"flex", alignItems:"center", gap:6 }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7"/></svg>
        Back to Clients
      </button>

      {/* Hero header */}
      <div className="glass" style={{ padding:"24px 28px", marginBottom:20, display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
        <div style={{ width:64, height:64, borderRadius:18, background:`${color}18`, border:`2px solid ${color}30`, display:"grid", placeItems:"center", fontWeight:800, fontSize:"1.3rem", color, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:"0 0 4px", fontSize:"1.8rem", fontWeight:900, color:"var(--text-primary)" }}>
            {client.company_name}
          </h1>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:"0.84rem", color:"var(--text-muted)" }}>{client.contact_person}</span>
            {client.industry && (
              <span style={{ fontSize:"0.76rem", fontWeight:600, color, background:`${color}12`, padding:"3px 10px", borderRadius:99, border:`1px solid ${color}22` }}>
                {client.industry}
              </span>
            )}
            <span style={{
              fontSize:"0.72rem", fontWeight:700,
              color:      client.status === "active" ? "#059669" : client.status === "prospect" ? "#d97706" : "#94a3b8",
              background: client.status === "active" ? "#ecfdf5" : client.status === "prospect" ? "#fffbeb" : "#f1f5f9",
              padding:"3px 10px", borderRadius:99,
              border:`1px solid ${client.status === "active" ? "#a7f3d0" : client.status === "prospect" ? "#fde68a" : "#e2e8f0"}`,
            }}>
              {(client.status || "active").charAt(0).toUpperCase() + (client.status || "active").slice(1)}
            </span>
            {client.deal_value && (
              <span style={{ fontSize:"0.88rem", fontWeight:800, color:"#10b981" }}>{client.deal_value}</span>
            )}
          </div>
        </div>
        {/* Quick actions */}
        <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
          {client.email && (
            <a href={`mailto:${client.email}`} className="btn-ghost" style={{ padding:"8px 16px", fontSize:"0.82rem", textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Email
            </a>
          )}
          <button onClick={() => { setTab(4); }} className="btn-primary" style={{ padding:"8px 16px", fontSize:"0.82rem" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            AI Insights
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
        <StatCard label="Total Meetings"   value={stats.total_meetings}    color="#7c3aed" icon="📅"/>
        <StatCard label="Meeting Notes"    value={stats.total_notes}       color="#0ea5e9" icon="📝"/>
        <StatCard label="Action Items"     value={stats.total_actions}     color="#f59e0b" icon="✅"/>
        <StatCard label="Completed Tasks"  value={stats.completed_actions} color="#10b981" icon="🎯"/>
        <StatCard label="Completion Rate"  value={`${stats.completion_rate}%`} color="#14b8a6" icon="📊"/>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:"1px solid var(--border)", display:"flex", marginBottom:20, overflowX:"auto" }}>
        {TABS.map((t,i) => (
          <Tab
            key={t} label={t} active={tab===i} onClick={() => setTab(i)}
            count={
              i===1 ? meetings.length :
              i===2 ? notes.length :
              i===3 ? action_items.length : null
            }
          />
        ))}
      </div>

      {/* Tab content */}
      {tab === 0 && <OverviewTab     client={client} stats={stats} meetings={meetings}/>}
      {tab === 1 && <MeetingsTab     meetings={meetings} clientName={client.company_name} navigate={navigate}/>}
      {tab === 2 && <NotesTab        notes={notes} meetings={meetings}/>}
      {tab === 3 && <ActionItemsTab  actions={action_items} meetings={meetings} onStatusChange={handleStatusChange}/>}
      {tab === 4 && <AIInsightsTab   client={client} notes={notes}/>}
    </div>
  );
}

// ── Meetings Tab ─────────────────────────────────────────────
function MeetingsTab({ meetings, clientName, navigate }) {
  return (
    <div>
      <SectionHead title="All Meetings" subtitle={`${meetings.length} meetings with ${clientName}`}/>
      {meetings.length === 0 && (
        <div className="glass" style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}>
          <div style={{ fontSize:"2rem", marginBottom:10 }}>📅</div>No meetings scheduled yet
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {meetings.map(m => {
          const isPast = m.meeting_date && new Date(m.meeting_date) < new Date();
          return (
            <div key={m.id} className="glass" style={{
              padding:"16px 20px", display:"flex", gap:16, alignItems:"flex-start",
              borderLeft:`3px solid ${isPast ? "#94a3b8" : "var(--violet)"}`,
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateX(3px)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateX(0)";   e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ width:50, textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:"1.4rem", fontWeight:900, color: isPast ? "var(--text-muted)" : "var(--violet)", lineHeight:1 }}>
                  {m.meeting_date ? new Date(m.meeting_date).getDate() : "—"}
                </div>
                <div style={{ fontSize:"0.6rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase" }}>
                  {m.meeting_date ? new Date(m.meeting_date).toLocaleDateString("en-US",{month:"short"}) : ""}
                </div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)" }}>{m.title}</div>
                {m.agenda && <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>📋 {m.agenda}</div>}
                <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:4 }}>{fmtDate(m.meeting_date)} · {fmtTime(m.meeting_date)}</div>
              </div>
              <span style={{ fontSize:"0.7rem", fontWeight:700, padding:"3px 10px", borderRadius:99, flexShrink:0, background: isPast ? "#f1f5f9" : "rgba(124,58,237,0.10)", color: isPast ? "#94a3b8" : "var(--violet)", border:`1px solid ${isPast ? "#e2e8f0" : "rgba(124,58,237,0.22)"}` }}>
                {isPast ? "Completed" : "Upcoming"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Notes Tab ─────────────────────────────────────────────────
function NotesTab({ notes, meetings }) {
  const meetingTitle = id => meetings.find(m => m.id === id)?.title || `Meeting #${id}`;
  return (
    <div>
      <SectionHead title="Meeting Notes" subtitle={`${notes.length} note${notes.length !== 1 ? "s" : ""} recorded`}/>
      {notes.length === 0 && <div className="glass" style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}><div style={{ fontSize:"2rem", marginBottom:10 }}>📝</div>No notes recorded yet</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {notes.map(n => (
          <div key={n.id} className="glass" style={{ padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--violet)", background:"rgba(124,58,237,0.08)", padding:"3px 10px", borderRadius:99, border:"1px solid rgba(124,58,237,0.18)" }}>
                {meetingTitle(n.meeting_id)}
              </div>
              <div style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>Note #{n.id}</div>
            </div>
            <p style={{ margin:0, fontSize:"0.86rem", color:"var(--text-secondary)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{n.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Action Items Tab ──────────────────────────────────────────
function ActionItemsTab({ actions, meetings, onStatusChange }) {
  const meetingTitle = id => meetings.find(m => m.id === id)?.title || `Meeting #${id}`;
  const COLS = ["Pending","In Progress","Completed"];
  return (
    <div>
      <SectionHead title="Action Items" subtitle={`${actions.length} tasks across all meetings`}/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {COLS.map(col => {
          const items = actions.filter(a => (a.status || "Pending") === col);
          const cfg   = STATUS_CFG[col];
          return (
            <div key={col} style={{ background:"var(--bg-base)", borderRadius:16, padding:14, border:`1px solid ${cfg.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot }}/>
                  <span style={{ fontWeight:700, fontSize:"0.82rem", color:cfg.color }}>{col}</span>
                </div>
                <span style={{ fontSize:"0.7rem", fontWeight:700, color:cfg.color, background:cfg.bg, padding:"2px 8px", borderRadius:99, border:`1px solid ${cfg.border}` }}>{items.length}</span>
              </div>
              {items.length === 0 && <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:"0.76rem", padding:"16px 0" }}>Empty</div>}
              {items.map(a => (
                <div key={a.id} style={{ background:"var(--bg-surface)", borderRadius:12, padding:"12px 14px", marginBottom:8, border:`1px solid var(--border)`, borderLeft:`3px solid ${cfg.dot}` }}>
                  <div style={{ fontSize:"0.82rem", color:"var(--text-primary)", fontWeight:600, lineHeight:1.5, marginBottom:8 }}>{a.task}</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:6 }}>
                    {COLS.filter(c => c !== col).map(tc => {
                      const tcc = STATUS_CFG[tc];
                      return (
                        <button key={tc} onClick={() => onStatusChange(a.id, tc)} style={{ fontSize:"0.64rem", fontWeight:700, padding:"3px 8px", borderRadius:99, background:tcc.bg, border:`1px solid ${tcc.border}`, color:tcc.color, cursor:"pointer", fontFamily:"var(--font-main)", transition:"opacity 0.15s" }}
                          onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                          → {tc === "In Progress" ? "WIP" : tc}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>{meetingTitle(a.meeting_id)}{a.assigned_to ? ` · ${a.assigned_to}` : ""}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AI Insights Tab ───────────────────────────────────────────
function AIInsightsTab({ client, notes }) {
  const [loading,  setLoading]  = useState(false);
  const [insights, setInsights] = useState(null);
  const toast = useToast();
  const combined = notes.map(n => n.notes).join("\n\n---\n\n");

  const runAnalysis = async () => {
    if (!combined.trim()) { toast("No meeting notes to analyze", "warning"); return; }
    setLoading(true);
    try {
      const [readiness, sentiment, recs] = await Promise.all([
        api.post("/api/ai/client-readiness",  { meeting_notes: combined }),
        api.post("/api/ai/analyze-sentiment", { meeting_notes: combined }),
        api.post("/api/ai/recommendations",   { meeting_notes: combined }),
      ]);
      setInsights({ readiness: readiness.data.client_readiness, sentiment: sentiment.data.sentiment_analysis, recs: recs.data.recommendations });
      toast("AI analysis complete!", "success");
    } catch {
      setInsights({
        readiness: "Readiness Score: 78/100 — Partially Ready. Client shows strong interest with pre-approved budget. Primary concern: HIPAA compliance.",
        sentiment: "Sentiment: Positive (82%). Client demonstrated enthusiasm and asked detailed technical questions indicating genuine purchase intent.",
        recs:      "• Schedule security demo as top priority\n• Address HIPAA compliance concerns proactively\n• Involve CFO in next meeting\n• Send ROI projections within 48 hours",
      });
      toast("AI analysis complete (mock)!", "info");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <SectionHead title="AI Client Intelligence" subtitle={`Analyzing all meeting notes for ${client.company_name}`}/>
        <button onClick={runAnalysis} className="btn-primary" disabled={loading} style={{ flexShrink:0 }}>
          {loading
            ? <><span style={{ display:"inline-block", width:13, height:13, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Analyzing…</>
            : <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Run AI Analysis</>
          }
        </button>
      </div>

      {!insights && !loading && (
        <div className="glass" style={{ padding:"50px 40px", textAlign:"center" }}>
          <div style={{ width:60, height:60, borderRadius:18, background:"rgba(124,58,237,0.10)", display:"grid", placeItems:"center", margin:"0 auto 16px", border:"1px solid rgba(124,58,237,0.20)" }}>
            <svg width="26" height="26" fill="none" stroke="#a78bfa" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/></svg>
          </div>
          <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--text-primary)" }}>Click "Run AI Analysis" to get insights</div>
          <div style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:8 }}>
            Analyzes {notes.length} meeting note{notes.length !== 1 ? "s" : ""} — Readiness Score · Sentiment · Recommendations
          </div>
        </div>
      )}

      {loading && (
        <div className="glass" style={{ padding:"48px", textAlign:"center" }}>
          <div style={{ position:"relative", width:64, height:64, margin:"0 auto 20px" }}>
            {[0,1,2].map(i => <div key={i} style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid rgba(124,58,237,0.25)", animation:`pulseRing 2s ease ${i*0.5}s infinite` }}/>)}
            <div style={{ position:"absolute", inset:18, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"grid", placeItems:"center" }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          <div style={{ fontWeight:700, color:"var(--text-primary)" }}>AI agents running…</div>
          <div style={{ fontSize:"0.82rem", color:"var(--text-muted)", marginTop:6 }}>Readiness · Sentiment · Recommendations</div>
        </div>
      )}

      {insights && !loading && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[
            { title:"Client Readiness", icon:"🎯", text: insights.readiness, bg:"#f0f9ff", border:"#bae6fd", color:"#0284c7" },
            { title:"Sentiment",        icon:"😊", text: insights.sentiment, bg:"#ecfdf5", border:"#a7f3d0", color:"#059669" },
          ].map(c => (
            <div key={c.title} className="glass" style={{ padding:22 }}>
              <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:30, height:30, borderRadius:9, background:c.bg, border:`1px solid ${c.border}`, display:"grid", placeItems:"center", fontSize:"0.9rem" }}>{c.icon}</span>
                {c.title}
              </div>
              <div style={{ padding:"12px 16px", borderRadius:12, background:c.bg, border:`1px solid ${c.border}` }}>
                <p style={{ margin:0, fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{c.text}</p>
              </div>
            </div>
          ))}
          <div className="glass" style={{ padding:22, gridColumn:"1/-1" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:30, height:30, borderRadius:9, background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.20)", display:"grid", placeItems:"center", fontSize:"0.9rem" }}>💡</span>
              AI Recommendations
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {insights.recs.split("\n").filter(r => r.trim()).map((rec, i) => (
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"8px 12px", borderRadius:10, background:"var(--bg-base)", border:"1px solid var(--border)" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.22)", display:"grid", placeItems:"center", flexShrink:0, marginTop:1 }}>
                    <svg width="9" height="9" fill="none" stroke="var(--violet)" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span style={{ fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:1.55 }}>{rec.replace(/^[•\-\*]\s*/,"")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
const TABS = ["Overview","Meetings","Notes","Action Items","AI Insights"];

export default function ClientDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState(0);
  const color = COLORS[Number(id) % COLORS.length];

  const load = async () => {
    try { const r = await api.get(`/api/clients/${id}/detail`); setData(r.data); }
    catch {
      setData({
        client: { id: Number(id), company_name:"NovaCare Health", contact_person:"Dr. Emily Park", email:"emily@novacare.com", industry:"Healthcare", status:"prospect", deal_value:"$350,000", created_at:"2026-01-15T00:00:00" },
        meetings: [
          { id:1, title:"Discovery Call", agenda:"HIPAA compliance & product demo", meeting_date:"2026-06-10T14:00:00" },
          { id:2, title:"Follow-up",      agenda:"Budget review and timeline",      meeting_date:"2026-08-15T11:00:00" },
        ],
        notes: [{ id:1, meeting_id:1, notes:"Client showed strong interest. HIPAA compliance is top priority. Budget pre-approved at $350K for Q3." }],
        action_items: [
          { id:1, meeting_id:1, task:"Schedule HIPAA security demo", assigned_to:"Ayush", status:"Completed",    created_at:"2026-06-10T00:00:00" },
          { id:2, meeting_id:1, task:"Send ROI projections",        assigned_to:"Priya",  status:"In Progress",  created_at:"2026-06-10T00:00:00" },
          { id:3, meeting_id:2, task:"Draft MSA for legal review",  assigned_to:"Marcus", status:"Pending",      created_at:"2026-08-15T00:00:00" },
        ],
        stats: { total_meetings:2, total_notes:1, total_actions:3, completed_actions:1, inprogress_actions:1, pending_actions:1, completion_rate:33.3 },
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (actionId, newStatus) => {
    setData(prev => {
      const updated = prev.action_items.map(a => a.id === actionId ? { ...a, status: newStatus } : a);
      const completed = updated.filter(a => a.status === "Completed").length;
      return { ...prev, action_items: updated, stats: { ...prev.stats, completed_actions: completed, completion_rate: Math.round(completed / updated.length * 1000) / 10 } };
    });
    try { await api.patch(`/api/action-items/${actionId}/status`, { status: newStatus }); } catch {}
    toast(`Moved to ${newStatus}`, "success");
  };

  if (loading) return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, padding:"28px 0" }}>
      {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height:100, borderRadius:16 }}/>)}
    </div>
  );
  if (!data) return null;

  const { client, meetings, notes, action_items, stats } = data;
  const initials = client.company_name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return (
    <div>
      <button onClick={() => navigate("/clients")} className="btn-ghost" style={{ marginBottom:20, padding:"7px 16px", fontSize:"0.82rem", display:"flex", alignItems:"center", gap:6 }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7"/></svg>
        Back to Clients
      </button>

      {/* Hero */}
      <div className="glass" style={{ padding:"24px 28px", marginBottom:20, display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
        <div style={{ width:64, height:64, borderRadius:18, background:`${color}18`, border:`2px solid ${color}30`, display:"grid", placeItems:"center", fontWeight:800, fontSize:"1.3rem", color, flexShrink:0 }}>{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:"0 0 4px", fontSize:"1.8rem", fontWeight:900, color:"var(--text-primary)" }}>{client.company_name}</h1>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:"0.84rem", color:"var(--text-muted)" }}>{client.contact_person}</span>
            {client.industry && <span style={{ fontSize:"0.76rem", fontWeight:600, color, background:`${color}12`, padding:"3px 10px", borderRadius:99, border:`1px solid ${color}22` }}>{client.industry}</span>}
            <span style={{ fontSize:"0.72rem", fontWeight:700, color: client.status==="active"?"#059669":client.status==="prospect"?"#d97706":"#94a3b8", background: client.status==="active"?"#ecfdf5":client.status==="prospect"?"#fffbeb":"#f1f5f9", padding:"3px 10px", borderRadius:99, border:`1px solid ${client.status==="active"?"#a7f3d0":client.status==="prospect"?"#fde68a":"#e2e8f0"}` }}>
              {(client.status||"active").charAt(0).toUpperCase()+(client.status||"active").slice(1)}
            </span>
            {client.deal_value && <span style={{ fontSize:"0.88rem", fontWeight:800, color:"#10b981" }}>{client.deal_value}</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
          {client.email && (
            <a href={`mailto:${client.email}`} className="btn-ghost" style={{ padding:"8px 16px", fontSize:"0.82rem", textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Email
            </a>
          )}
          <button onClick={() => setTab(4)} className="btn-primary" style={{ padding:"8px 16px", fontSize:"0.82rem" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            AI Insights
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
        <StatCard label="Total Meetings"  value={stats.total_meetings}    color="#7c3aed" icon="📅"/>
        <StatCard label="Meeting Notes"   value={stats.total_notes}       color="#0ea5e9" icon="📝"/>
        <StatCard label="Action Items"    value={stats.total_actions}     color="#f59e0b" icon="✅"/>
        <StatCard label="Completed Tasks" value={stats.completed_actions} color="#10b981" icon="🎯"/>
        <StatCard label="Completion Rate" value={`${stats.completion_rate}%`} color="#14b8a6" icon="📊"/>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:"1px solid var(--border)", display:"flex", marginBottom:20, overflowX:"auto" }}>
        {TABS.map((t,i) => <Tab key={t} label={t} active={tab===i} onClick={() => setTab(i)} count={i===1?meetings.length:i===2?notes.length:i===3?action_items.length:null}/>)}
      </div>

      {tab===0 && <OverviewTab    client={client} stats={stats} meetings={meetings}/>}
      {tab===1 && <MeetingsTab    meetings={meetings} clientName={client.company_name} navigate={navigate}/>}
      {tab===2 && <NotesTab       notes={notes} meetings={meetings}/>}
      {tab===3 && <ActionItemsTab actions={action_items} meetings={meetings} onStatusChange={handleStatusChange}/>}
      {tab===4 && <AIInsightsTab  client={client} notes={notes}/>}
    </div>
  );
}
