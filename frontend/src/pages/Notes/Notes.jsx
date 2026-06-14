import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const PRIORITY_CFG = {
  high:   { cls:"chip-rose",    label:"High"   },
  medium: { cls:"chip-amber",   label:"Medium" },
  low:    { cls:"chip-emerald", label:"Low"    },
};

const MOCK_NOTES = [
  { id:1, meeting_id:1, notes:"Sarah mentioned their current CRM is outdated and they need better analytics. They're evaluating 3 vendors including us. Decision expected by end of Q2.", client_name:"Acme Tech", title:"Pain Points", tags:["strategy","Q3","CRM"],  priority:"high",   created_at:"2026-06-11T00:00:00" },
  { id:2, meeting_id:2, notes:"Budget for next fiscal year has been approved at $820K. Need to submit proposal by June 20th. James confirmed internal stakeholder support.", client_name:"Meridian Finance", title:"Budget Approval", tags:["budget","proposal"],       priority:"high",   created_at:"2026-06-10T00:00:00" },
  { id:3, meeting_id:3, notes:"Dr. Park is enthusiastic about the patient management module. Key concern is HIPAA compliance and data sovereignty. Arrange security demo next week.", client_name:"NovaCare Health", title:"Healthcare Compliance", tags:["HIPAA","demo","compliance"], priority:"medium", created_at:"2026-06-09T00:00:00" },
  { id:4, meeting_id:4, notes:"Marcus wants to see ROI projections over 24 months. Retail analytics dashboard resonated strongly. Plan follow-up with CFO included.", client_name:"UrbanRetail Group", title:"ROI Discussion", tags:["ROI","retail","follow-up"], priority:"low",    created_at:"2026-06-08T00:00:00" },
];

function NoteModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { meeting_id:"", notes:"", title:"", priority:"medium", tags:"" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <h2 style={{ margin:0, fontWeight:700, fontSize:"1.2rem" }}>{initial?.id ? "Edit Note" : "New Note"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"1.3rem" }}>✕</button>
        </div>
        <div style={{ display:"grid", gap:"14px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            <div>
              <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Title</label>
              <input placeholder="Note title" value={form.title||""} onChange={e => set("title", e.target.value)} className="input-glass"/>
            </div>
            <div>
              <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} className="input-glass">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Meeting ID</label>
            <input type="number" placeholder="Meeting ID" value={form.meeting_id} onChange={e => set("meeting_id", e.target.value)} className="input-glass"/>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Note Content</label>
            <textarea placeholder="Write meeting notes…" value={form.notes} onChange={e => set("notes", e.target.value)} rows={5} className="input-glass" style={{ resize:"vertical" }}/>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"5px" }}>Tags (comma separated)</label>
            <input placeholder="strategy, Q3, CRM" value={form.tags || (Array.isArray(form.tags) ? form.tags.join(",") : "")} onChange={e => set("tags", e.target.value)} className="input-glass"/>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"24px", justifyContent:"flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{initial?.id ? "Save Changes" : "Add Note"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes]   = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);
  const toast = useToast();

  const load = async () => {
    try { const r = await api.get("/api/meeting-notes/"); setNotes(r.data.length ? r.data : MOCK_NOTES); }
    catch { setNotes(MOCK_NOTES); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (form.id) { await api.put(`/api/meeting-notes/${form.id}/`, form); toast("Note updated!", "success"); }
      else { await api.post("/api/meeting-notes/", { ...form, meeting_id: Number(form.meeting_id) }); toast("Note added!", "success"); }
      await load();
    } catch {
      const tags = typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags || [];
      if (form.id) setNotes(prev => prev.map(n => n.id === form.id ? { ...n, ...form, tags } : n));
      else setNotes(prev => [...prev, { ...form, id: Date.now(), tags, created_at: new Date().toISOString() }]);
      toast(form.id ? "Note updated!" : "Note added!", "success");
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try { await api.delete(`/api/meeting-notes/${id}/`); } catch {}
    setNotes(prev => prev.filter(n => n.id !== id));
    toast("Note deleted.", "info");
  };

  const filtered = notes.filter(n =>
    n.notes?.toLowerCase().includes(search.toLowerCase()) ||
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by client
  const grouped = filtered.reduce((acc, n) => {
    const key = n.client_name || `Meeting ${n.meeting_id}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"28px" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800 }}>Notes</h1>
          <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>{filtered.length} total notes</p>
        </div>
        <button className="btn-primary" onClick={() => setModal("add")}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Note
        </button>
      </div>

      <div style={{ position:"relative", maxWidth:"420px", marginBottom:"28px" }}>
        <svg style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", opacity:0.4 }} width="16" height="16" fill="none" stroke="var(--text-secondary)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="input-glass" style={{ paddingLeft:"42px" }}/>
      </div>

      <div style={{ display:"grid", gap:"28px" }}>
        {Object.entries(grouped).map(([client, clientNotes]) => (
          <div key={client}>
            <div className="section-label" style={{ marginBottom:"12px" }}>{client}</div>
            <div style={{ display:"grid", gap:"12px" }}>
              {clientNotes.map(n => {
                const pc = PRIORITY_CFG[n.priority] || PRIORITY_CFG.medium;
                const tags = Array.isArray(n.tags) ? n.tags : (n.tags||"").split(",").map(t=>t.trim()).filter(Boolean);
                return (
                  <div key={n.id} className="glass glass-hover" style={{ padding:"20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                      <div style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--text-primary)" }}>{n.title || `Note #${n.id}`}</div>
                      <span className={`chip ${pc.cls}`}>{pc.label}</span>
                    </div>
                    <p style={{ margin:"0 0 12px", fontSize:"0.85rem", color:"var(--text-secondary)", lineHeight:1.7 }}>{n.notes}</p>
                    {tags.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"12px" }}>
                        {tags.map((t,i) => (
                          <span key={i} style={{ padding:"3px 10px", borderRadius:"99px", fontSize:"0.72rem", fontWeight:600, background:"rgba(124,58,237,0.12)", color:"#a78bfa", border:"1px solid rgba(124,58,237,0.22)" }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:"0.74rem", color:"var(--text-muted)" }}>
                        {new Date(n.created_at).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}
                      </span>
                      <div style={{ display:"flex", gap:"6px" }}>
                        <button onClick={() => setModal(n)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"6px", borderRadius:"8px", transition:"color 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(n.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:"6px", borderRadius:"8px", transition:"color 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#f43f5e"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {modal && <NoteModal initial={modal === "add" ? null : modal} onClose={() => setModal(null)} onSave={handleSave}/>}
    </div>
  );
}