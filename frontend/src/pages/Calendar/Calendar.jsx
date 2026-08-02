import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

// ── helpers ──────────────────────────────────────────────────
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOf(y, m)  { return new Date(y, m, 1).getDay(); }

const STATUS_COLORS = {
  completed : { bg:"#ecfdf5", border:"#a7f3d0", text:"#059669", dot:"#10b981" },
  upcoming  : { bg:"#f5f3ff", border:"#ddd6fe", text:"#7c3aed", dot:"#7c3aed" },
  pending   : { bg:"#fffbeb", border:"#fde68a", text:"#d97706", dot:"#f59e0b" },
  cancelled : { bg:"#fff1f2", border:"#fecdd3", text:"#e11d48", dot:"#f43f5e" },
};

const MOCK_MEETINGS = [
  { id:1, title:"Contract Negotiation", client_name:"Atlas Consulting",  meeting_date:"2026-07-31T16:30:00", status:"pending" },
  { id:2, title:"Discovery Call",       client_name:"NovaCare Health",   meeting_date:"2026-07-28T14:30:00", status:"upcoming" },
  { id:3, title:"Q3 Strategy Review",   client_name:"Meridian Finance",  meeting_date:"2026-07-25T15:30:00", status:"upcoming" },
  { id:4, title:"Product Proposal",     client_name:"UrbanRetail Group", meeting_date:"2026-07-20T09:00:00", status:"completed" },
  { id:5, title:"Budget Planning",      client_name:"Atlas Consulting",  meeting_date:"2026-08-05T11:00:00", status:"upcoming" },
  { id:6, title:"Follow-up Call",       client_name:"NovaCare Health",   meeting_date:"2026-08-10T14:00:00", status:"pending" },
];

// ── Meeting Detail Drawer ────────────────────────────────────
function MeetingDrawer({ meeting, onClose }) {
  if (!meeting) return null;
  const sc = STATUS_COLORS[meeting.status] || STATUS_COLORS.upcoming;
  const dt = new Date(meeting.meeting_date);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}
         onClick={onClose}>
      <div style={{ flex:1, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(4px)" }}/>
      <div style={{
        width:380, height:"100vh", background:"var(--bg-surface)",
        borderLeft:"1px solid var(--border)", padding:28, overflowY:"auto",
        animation:"slideInRight 0.25s cubic-bezier(.4,0,.2,1)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ fontWeight:800, fontSize:"1.1rem", color:"var(--text-primary)" }}>Meeting Detail</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"1.3rem" }}>✕</button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:"#f5f3ff", display:"grid", placeItems:"center", fontSize:"1.5rem" }}>📅</div>
          <div>
            <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--text-primary)" }}>{meeting.title}</div>
            <div style={{ fontSize:"0.8rem", color:"#a78bfa", fontWeight:600 }}>{meeting.client_name}</div>
          </div>
        </div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:sc.bg, border:`1px solid ${sc.border}`, marginBottom:20 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:sc.dot }}/>
          <span style={{ fontSize:"0.78rem", fontWeight:700, color:sc.text, textTransform:"capitalize" }}>{meeting.status}</span>
        </div>
        {[
          { icon:"📅", label:"Date", val: dt.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}) },
          { icon:"⏰", label:"Time", val: dt.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) },
          { icon:"⏱️", label:"Duration", val: meeting.duration ? `${meeting.duration} min` : "Not set" },
          { icon:"📍", label:"Location", val: meeting.location || "Not set" },
        ].map(r => (
          <div key={r.label} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
            <span style={{ fontSize:"1rem", marginTop:1 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{r.label}</div>
              <div style={{ fontSize:"0.88rem", color:"var(--text-primary)", marginTop:2 }}>{r.val}</div>
            </div>
          </div>
        ))}
        {meeting.agenda && (
          <div style={{ marginTop:16, background:"var(--bg-base)", borderRadius:12, padding:"14px 16px", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Agenda</div>
            <div style={{ fontSize:"0.86rem", color:"var(--text-secondary)", lineHeight:1.65 }}>{meeting.agenda}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Calendar Component ──────────────────────────────────
export default function CalendarPage() {
  const today   = new Date();
  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [view, setView]       = useState("month"); // month | week | list
  const [meetings, setMeetings] = useState([]);
  const [selected, setSelected] = useState(null); // date string "YYYY-MM-DD"
  const [drawer, setDrawer]   = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get("/api/meetings/")
      .then(r => {
        const cmap = {};
        api.get("/api/clients/").then(cr => {
          cr.data.forEach(c => { cmap[c.id] = c.company_name; });
          setMeetings(r.data.map(m => ({ ...m, client_name: cmap[m.client_id] || `Client ${m.client_id}` })));
        }).catch(() => setMeetings(r.data));
      })
      .catch(() => setMeetings(MOCK_MEETINGS));
  }, []);

  // meetings indexed by "YYYY-MM-DD"
  const byDay = {};
  meetings.forEach(m => {
    if (!m.meeting_date) return;
    const key = m.meeting_date.slice(0, 10);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(m);
  });

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  const totalDays  = daysInMonth(year, month);
  const startDay   = firstDayOf(year, month);
  const cells      = Array.from({ length: startDay + totalDays }, (_, i) => i < startDay ? null : i - startDay + 1);
  // pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const fmt = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // --- month view meetings for selected day sidebar
  const selMeetings = selected ? (byDay[selected] || []) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800, color:"var(--text-primary)" }}>Calendar</h1>
          <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>
            {meetings.length} meetings scheduled
          </p>
        </div>
        {/* View Switcher */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-base)", border:"1px solid var(--border)", borderRadius:12, padding:4 }}>
          {["month","week","list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding:"7px 18px", borderRadius:9, border:"none", cursor:"pointer",
              background: view===v ? "var(--bg-surface)" : "transparent",
              color: view===v ? "var(--violet)" : "var(--text-muted)",
              fontWeight: view===v ? 700 : 500, fontSize:"0.82rem",
              boxShadow: view===v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition:"all 0.18s", fontFamily:"var(--font-main)",
            }}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 300px" : "1fr", gap:20 }}>
        <div>
          {/* Nav bar */}
          <div className="glass" style={{ padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <button onClick={prevMonth} className="btn-ghost" style={{ padding:"6px 14px", fontSize:"0.85rem" }}>← Prev</button>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.20)", color:"var(--violet)", borderRadius:9, padding:"5px 14px", cursor:"pointer", fontWeight:600, fontSize:"0.8rem", fontFamily:"var(--font-main)" }}>Today</button>
              <span style={{ fontWeight:800, fontSize:"1.2rem", color:"var(--text-primary)" }}>{MONTHS[month]} {year}</span>
            </div>
            <button onClick={nextMonth} className="btn-ghost" style={{ padding:"6px 14px", fontSize:"0.85rem" }}>Next →</button>
          </div>

          {view === "month" && (
            <div className="glass" style={{ overflow:"hidden" }}>
              {/* Day headers */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1px solid var(--border)" }}>
                {DAYS.map(d => (
                  <div key={d} style={{ padding:"10px 0", textAlign:"center", fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{d}</div>
                ))}
              </div>
              {/* Cells */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
                {cells.map((day, idx) => {
                  const key   = day ? fmt(day) : null;
                  const dayMs = key ? byDay[key] || [] : [];
                  const isToday  = key === todayKey;
                  const isSel    = key === selected;
                  return (
                    <div key={idx} onClick={() => day && setSelected(isSel ? null : key)}
                      style={{
                        minHeight:100, padding:"8px 6px",
                        borderRight: (idx+1)%7===0 ? "none" : "1px solid var(--border)",
                        borderBottom:"1px solid var(--border)",
                        background: isSel ? "rgba(124,58,237,0.06)" : isToday ? "rgba(124,58,237,0.03)" : "transparent",
                        cursor: day ? "pointer" : "default",
                        transition:"background 0.15s",
                        position:"relative",
                      }}
                      onMouseEnter={e => { if(day && !isSel) e.currentTarget.style.background="var(--bg-base)"; }}
                      onMouseLeave={e => { if(day && !isSel) e.currentTarget.style.background="transparent"; }}
                    >
                      {day && (
                        <>
                          <div style={{
                            width:28, height:28, borderRadius:"50%",
                            background: isToday ? "var(--violet)" : isSel ? "rgba(124,58,237,0.15)" : "transparent",
                            display:"grid", placeItems:"center",
                            fontSize:"0.82rem", fontWeight: isToday||isSel ? 700 : 400,
                            color: isToday ? "#fff" : isSel ? "var(--violet)" : "var(--text-primary)",
                            marginBottom:4,
                          }}>{day}</div>
                          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                            {dayMs.slice(0,3).map((m,i) => {
                              const sc = STATUS_COLORS[m.status] || STATUS_COLORS.upcoming;
                              return (
                                <div key={i} onClick={e => { e.stopPropagation(); setDrawer(m); }}
                                  style={{ background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:5, padding:"2px 5px", fontSize:"0.66rem", fontWeight:600, color:sc.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:"pointer" }}>
                                  {m.title}
                                </div>
                              );
                            })}
                            {dayMs.length > 3 && (
                              <div style={{ fontSize:"0.64rem", color:"var(--text-muted)", fontWeight:600 }}>+{dayMs.length-3} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "week" && <WeekView year={year} month={month} byDay={byDay} todayKey={todayKey} onMeeting={setDrawer}/>}
          {view === "list" && <ListView meetings={meetings} onMeeting={setDrawer}/>}
        </div>

        {/* Selected Day Sidebar */}
        {selected && (
          <div className="glass" style={{ padding:20, alignSelf:"start" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)" }}>
                {new Date(selected+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
              </div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"1.1rem" }}>✕</button>
            </div>
            {selMeetings.length === 0 && (
              <div style={{ textAlign:"center", padding:"28px 0", color:"var(--text-muted)", fontSize:"0.84rem" }}>No meetings this day</div>
            )}
            {selMeetings.map(m => {
              const sc = STATUS_COLORS[m.status] || STATUS_COLORS.upcoming;
              return (
                <div key={m.id} onClick={() => setDrawer(m)} style={{
                  padding:"12px 14px", borderRadius:12, border:`1px solid ${sc.border}`,
                  background:sc.bg, marginBottom:10, cursor:"pointer", transition:"all 0.18s",
                }} onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                   onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{ fontWeight:700, fontSize:"0.88rem", color:sc.text }}>{m.title}</div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:3 }}>{m.client_name}</div>
                  <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:3 }}>
                    {new Date(m.meeting_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {drawer && <MeetingDrawer meeting={drawer} onClose={() => setDrawer(null)}/>}
    </div>
  );
}

// ── Week View ────────────────────────────────────────────────
function WeekView({ year, month, byDay, todayKey, onMeeting }) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(year, month, 1);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am-7pm
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  });
  const fmtKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  return (
    <div className="glass" style={{ overflow:"hidden" }}>
      {/* Week nav */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid var(--border)" }}>
        <button className="btn-ghost" style={{ padding:"5px 12px", fontSize:"0.8rem" }} onClick={() => { const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); }}>← Prev Week</button>
        <span style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)" }}>
          {days[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})} – {days[6].toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
        </span>
        <button className="btn-ghost" style={{ padding:"5px 12px", fontSize:"0.8rem" }} onClick={() => { const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); }}>Next Week →</button>
      </div>
      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"52px repeat(7,1fr)" }}>
        {/* corner */}
        <div style={{ borderRight:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"8px 0" }}/>
        {days.map((d, i) => {
          const isToday = fmtKey(d) === todayKey;
          return (
            <div key={i} style={{ textAlign:"center", padding:"8px 4px", borderRight: i<6 ? "1px solid var(--border)" : "none", borderBottom:"1px solid var(--border)", background: isToday ? "rgba(124,58,237,0.04)" : "transparent" }}>
              <div style={{ fontSize:"0.68rem", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase" }}>{DAYS[d.getDay()]}</div>
              <div style={{ width:28, height:28, borderRadius:"50%", background: isToday ? "var(--violet)" : "transparent", color: isToday ? "#fff" : "var(--text-primary)", fontWeight: isToday ? 700 : 400, fontSize:"0.88rem", display:"grid", placeItems:"center", margin:"4px auto 0" }}>{d.getDate()}</div>
            </div>
          );
        })}
        {HOURS.map(h => (
          <>
            <div key={`h${h}`} style={{ borderRight:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"0 6px", fontSize:"0.66rem", color:"var(--text-muted)", height:60, display:"flex", alignItems:"flex-start", paddingTop:4 }}>
              {h % 12 || 12}{h < 12 ? "am" : "pm"}
            </div>
            {days.map((d, di) => {
              const key  = fmtKey(d);
              const dms  = (byDay[key] || []).filter(m => {
                const mh = new Date(m.meeting_date).getHours();
                return mh === h;
              });
              return (
                <div key={`${h}-${di}`} style={{ borderRight: di<6 ? "1px solid var(--border)" : "none", borderBottom:"1px solid var(--border)", height:60, padding:"2px 3px", position:"relative", background: fmtKey(d)===todayKey ? "rgba(124,58,237,0.02)" : "transparent" }}>
                  {dms.map((m,mi) => {
                    const sc = STATUS_COLORS[m.status] || STATUS_COLORS.upcoming;
                    return (
                      <div key={mi} onClick={() => onMeeting(m)} style={{ background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:5, padding:"2px 5px", fontSize:"0.62rem", fontWeight:600, color:sc.text, cursor:"pointer", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:1 }}>
                        {m.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ── List View ────────────────────────────────────────────────
function ListView({ meetings, onMeeting }) {
  const sorted = [...meetings].sort((a,b) => new Date(a.meeting_date) - new Date(b.meeting_date));
  const groups = {};
  sorted.forEach(m => {
    const k = m.meeting_date?.slice(0,7) || "Unknown";
    if (!groups[k]) groups[k] = [];
    groups[k].push(m);
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      {Object.entries(groups).map(([monthKey, ms]) => (
        <div key={monthKey}>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, padding:"0 4px" }}>
            {monthKey !== "Unknown" ? new Date(monthKey+"-01").toLocaleDateString("en-US",{month:"long",year:"numeric"}) : "No Date"}
          </div>
          <div className="glass" style={{ overflow:"hidden" }}>
            {ms.map((m, i) => {
              const sc  = STATUS_COLORS[m.status] || STATUS_COLORS.upcoming;
              const dt  = m.meeting_date ? new Date(m.meeting_date) : null;
              return (
                <div key={m.id} onClick={() => onMeeting(m)} style={{
                  display:"flex", alignItems:"center", gap:16, padding:"14px 18px",
                  borderBottom: i < ms.length-1 ? "1px solid var(--border)" : "none",
                  cursor:"pointer", transition:"background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background="var(--bg-base)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <div style={{ width:44, textAlign:"center", flexShrink:0 }}>
                    <div style={{ fontSize:"0.68rem", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase" }}>{dt ? DAYS[dt.getDay()] : ""}</div>
                    <div style={{ fontSize:"1.3rem", fontWeight:800, color:"var(--text-primary)", lineHeight:1 }}>{dt ? dt.getDate() : "—"}</div>
                  </div>
                  <div style={{ width:3, height:44, borderRadius:99, background:sc.dot, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--text-primary)" }}>{m.title}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:2 }}>{m.client_name} {dt ? "· "+dt.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : ""}</div>
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, background:sc.bg, border:`1px solid ${sc.border}` }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:sc.dot }}/>
                    <span style={{ fontSize:"0.72rem", fontWeight:700, color:sc.text, textTransform:"capitalize" }}>{m.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <div className="glass" style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}>No meetings found</div>
      )}
    </div>
  );
}
