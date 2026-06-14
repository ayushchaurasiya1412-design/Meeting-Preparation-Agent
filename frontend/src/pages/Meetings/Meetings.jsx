import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const MOCK_MEETINGS = [
  { id:1, title:"Contract Negotiation", client_name:"Atlas Consulting",   meeting_date:"2026-06-20T16:30:00", duration:120, location:"Client Office",   status:"pending",   agenda:"Review Q3 contract terms" },
  { id:2, title:"Discovery Call",       client_name:"NovaCare Health",    meeting_date:"2026-06-18T14:30:00", duration:45,  location:"Google Meet",     status:"upcoming",  agenda:"Initial product walkthrough" },
  { id:3, title:"Q3 Strategy Review",   client_name:"Meridian Finance",   meeting_date:"2026-06-15T15:30:00", duration:90,  location:"Zoom",            status:"upcoming",  agenda:"Quarterly planning" },
  { id:4, title:"New Product Proposal", client_name:"UrbanRetail Group",  meeting_date:"2026-06-12T19:30:00", duration:60,  location:"Head Office",     status:"completed", agenda:"Present new solution" },
];

const MOCK_CLIENTS = [
  { id:1, company_name:"Meridian Finance" },
  { id:2, company_name:"NovaCare Health"  },
  { id:3, company_name:"UrbanRetail Group"},
  { id:4, company_name:"Atlas Consulting" },
];

const statusCfg = {
  completed: { cls:"chip-emerald", label:"Completed" },
  upcoming:  { cls:"chip-violet",  label:"Upcoming"  },
  pending:   { cls:"chip-amber",   label:"Pending"   },
  cancelled: { cls:"chip-rose",    label:"Cancelled" },
};
const meetingIcons = ["📊","🔍","💼","📋","🚀","🤝"];

function MeetingModal({ initial, clients, onClose, onSave }) {
  const [form, setForm] = useState(initial || { title:"", client_id:"", meeting_date:"", duration:"", location:"", agenda:"", status:"upcoming" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <h2 style={{ margin:0, fontWeight:700, fontSize:"1.2rem" }}>{initial?.id ? "Edit Meeting" : "Schedule Meeting"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"1.3rem" }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Meeting Title</label>
            <input placeholder="Meeting Title" value={form.title} onChange={e => set("title", e.target.value)} className="input-glass"/>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Client</label>
            <select value={form.client_id} onChange={e => set("client_id", e.target.value)} className="input-glass">
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className="input-glass">
              {["upcoming","pending","completed","cancelled"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Date & Time</label>
            <input type="datetime-local" value={form.meeting_date} onChange={e => set("meeting_date", e.target.value)} className="input-glass"/>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Duration (min)</label>
            <input type="number" placeholder="60" value={form.duration} onChange={e => set("duration", e.target.value)} className="input-glass"/>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Location / Platform</label>
            <input placeholder="Google Meet, Office, Zoom…" value={form.location} onChange={e => set("location", e.target.value)} className="input-glass"/>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Agenda</label>
            <textarea placeholder="Meeting agenda…" value={form.agenda} onChange={e => set("agenda", e.target.value)} rows={3} className="input-glass" style={{ resize:"vertical" }}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"24px", justifyContent:"flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{initial?.id ? "Save Changes" : "Schedule"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [clients, setClients]   = useState([]);
  const [search, setSearch]     = useState("");
  const [view, setView]         = useState("grid"); // grid | list
  const [modal, setModal]       = useState(null);
  const toast = useToast();

  const loadAll = async () => {
    try {
      const [mr, cr] = await Promise.all([api.get("/api/meetings/"), api.get("/api/clients/")]);
      const cMap = {};
      cr.data.forEach(c => { cMap[c.id] = c.company_name; });
      setMeetings(mr.data.map(m => ({ ...m, client_name: cMap[m.client_id] || `Client ${m.client_id}` })));
      setClients(cr.data);
    } catch {
      setMeetings(MOCK_MEETINGS);
      setClients(MOCK_CLIENTS);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSave = async (form) => {
    try {
      if (form.id) { await api.put(`/api/meetings/${form.id}/`, form); toast("Meeting updated!", "success"); }
      else { await api.post("/api/meetings/", { ...form, client_id: Number(form.client_id) }); toast("Meeting scheduled!", "success"); }
      await loadAll();
    } catch {
      const clientName = clients.find(c => String(c.id) === String(form.client_id))?.company_name || "No client";
      if (form.id) setMeetings(prev => prev.map(m => m.id === form.id ? { ...m, ...form, client_name: clientName } : m));
      else setMeetings(prev => [...prev, { ...form, id: Date.now(), client_name: clientName }]);
      toast(form.id ? "Meeting updated!" : "Meeting scheduled!", "success");
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meeting?")) return;
    try { await api.delete(`/api/meetings/${id}/`); } catch {}
    setMeetings(prev => prev.filter(m => m.id !== id));
    toast("Meeting deleted.", "info");
  };

  const filtered = meetings.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (m) => (m.status || (new Date(m.meeting_date) < new Date() ? "completed" : "upcoming")).toLowerCase();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"28px" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800 }}>Meetings</h1>
          <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>{filtered.length} total meetings</p>
        </div>
        <button className="btn-primary" onClick={() => setModal("add")}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Schedule Meeting
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"24px", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, maxWidth:"400px" }}>
          <svg style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", opacity:0.4 }} width="16" height="16" fill="none" stroke="var(--text-secondary)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input placeholder="Search meetings..." value={search} onChange={e => setSearch(e.target.value)} className="input-glass" style={{ paddingLeft:"42px" }}/>
        </div>
        <div style={{ display:"flex", gap:"4px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"4px" }}>
          {["grid","list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? "rgba(124,58,237,0.25)" : "transparent",
              border: view === v ? "1px solid rgba(124,58,237,0.30)" : "1px solid transparent",
              color: view === v ? "#a78bfa" : "var(--text-muted)",
              borderRadius:"9px", width:"34px", height:"34px", cursor:"pointer",
              display:"grid", placeItems:"center", transition:"all 0.2s",
            }}>
              {v === "grid"
                ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: view === "grid" ? "grid" : "flex", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(320px,1fr))" : undefined, flexDirection: view === "list" ? "column" : undefined, gap:"16px" }}>
        {filtered.map((m, i) => {
          const st = getStatus(m);
          const cfg = statusCfg[st] || statusCfg.upcoming;
          const dateStr = m.meeting_date ? new Date(m.meeting_date).toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric" }) + " · " + new Date(m.meeting_date).toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" }) : "—";
          return (
            <div key={m.id} className="glass glass-hover" style={{ padding:"22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
                <div style={{ display:"flex", gap:"12px", alignItems:"center", minWidth:0 }}>
                  <span style={{ fontSize:"1.4rem", flexShrink:0 }}>{meetingIcons[i % meetingIcons.length]}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</div>
                    <div style={{ fontSize:"0.78rem", color:"#a78bfa", fontWeight:500, marginTop:"2px" }}>{m.client_name}</div>
                  </div>
                </div>
                <span className={`chip ${cfg.cls}`} style={{ flexShrink:0, marginLeft:"8px" }}>{cfg.label}</span>
              </div>
              <div style={{ display:"grid", gap:"7px" }}>
                <div style={{ display:"flex", gap:"8px", alignItems:"center", fontSize:"0.82rem", color:"var(--text-secondary)" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {dateStr}
                </div>
                {m.duration && (
                  <div style={{ display:"flex", gap:"8px", alignItems:"center", fontSize:"0.82rem", color:"var(--text-secondary)" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    {m.duration} min
                  </div>
                )}
                {m.location && (
                  <div style={{ display:"flex", gap:"8px", alignItems:"center", fontSize:"0.82rem", color:"var(--text-secondary)" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {m.location}
                  </div>
                )}
              </div>
              <div style={{ display:"flex", gap:"8px", marginTop:"16px" }}>
                <button className="btn-ghost" style={{ flex:1, justifyContent:"center", padding:"8px 12px", fontSize:"0.82rem" }} onClick={() => setModal(m)}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit
                </button>
                <button onClick={() => handleDelete(m.id)} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", background:"rgba(244,63,94,0.10)", border:"1px solid rgba(244,63,94,0.20)", color:"#f43f5e", borderRadius:"12px", padding:"8px 12px", cursor:"pointer", fontSize:"0.82rem", fontWeight:500, fontFamily:"var(--font-primary)", transition:"all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(244,63,94,0.10)"}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <MeetingModal
          initial={modal === "add" ? null : modal}
          clients={clients}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}