/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const MOCK = [
  { id:1, meeting_id:2, task:"Schedule security & compliance demo", assigned_to:"Ayush C.", status:"Pending",   created_at:"2026-06-11T10:00:00" },
  { id:2, meeting_id:2, task:"Send HIPAA documentation pack",        assigned_to:"Priya P.", status:"Completed", created_at:"2026-06-10T09:00:00" },
  { id:3, meeting_id:1, task:"Prepare 24-month ROI projections",    assigned_to:"Marcus J.",status:"Pending",   created_at:"2026-06-09T14:00:00" },
  { id:4, meeting_id:3, task:"Draft MSA for legal review",          assigned_to:"Emily K.", status:"Pending",   created_at:"2026-06-08T11:00:00" },
];

export default function ActionItems() {
  const [items, setItems]       = useState([]);
  const [meetingId, setMeetingId] = useState("");
  const [task, setTask]         = useState("");
  const [assignedTo, setAssigned] = useState("");
  const toast = useToast();

  const load = async () => {
    try { const r = await api.get("/api/action-items/"); setItems(r.data.length ? r.data : MOCK); }
    catch { setItems(MOCK); }
  };

  useEffect(() => { load(); }, []);

  const addItem = async () => {
    try {
      await api.post("/api/action-items/", { meeting_id: Number(meetingId), task, assigned_to: assignedTo });
      toast("Action item added!", "success");
      await load();
    } catch {
      setItems(prev => [...prev, { id: Date.now(), meeting_id: meetingId, task, assigned_to: assignedTo, status:"Pending", created_at: new Date().toISOString() }]);
      toast("Action item added!", "success");
    }
    setMeetingId(""); setTask(""); setAssigned("");
  };

  const toggleStatus = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: i.status === "Completed" ? "Pending" : "Completed" } : i));
  };

  const completed = items.filter(i => i.status === "Completed").length;

  return (
    <div>
      <div style={{ marginBottom:"28px" }}>
        <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800 }}>Action Items</h1>
        <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>
          <span style={{ color:"#10b981", fontWeight:600 }}>{completed}</span> of {items.length} completed
        </p>
      </div>

      {/* Progress */}
      <div className="glass" style={{ padding:"20px 24px", marginBottom:"24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
          <span style={{ fontSize:"0.82rem", color:"var(--text-secondary)", fontWeight:500 }}>Overall Progress</span>
          <span style={{ fontSize:"0.82rem", color:"#10b981", fontWeight:700 }}>{items.length ? Math.round(completed/items.length*100) : 0}%</span>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width:`${items.length ? (completed/items.length*100) : 0}%` }}/>
        </div>
      </div>

      {/* Form */}
      <div className="glass" style={{ padding:"24px", marginBottom:"24px" }}>
        <div style={{ fontWeight:700, fontSize:"0.92rem", marginBottom:"16px" }}>Create Action Item</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <input placeholder="Meeting ID" type="number" value={meetingId} onChange={e => setMeetingId(e.target.value)} className="input-glass"/>
          <input placeholder="Assigned To" value={assignedTo} onChange={e => setAssigned(e.target.value)} className="input-glass"/>
          <input placeholder="Task description…" value={task} onChange={e => setTask(e.target.value)} className="input-glass" style={{ gridColumn:"1/-1" }}/>
        </div>
        <button className="btn-primary" onClick={addItem} style={{ marginTop:"14px" }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add Item
        </button>
      </div>

      {/* List */}
      <div style={{ display:"grid", gap:"10px" }}>
        {items.map(item => (
          <div key={item.id} className="glass" style={{ padding:"18px 22px", display:"flex", gap:"14px", alignItems:"flex-start", opacity: item.status === "Completed" ? 0.7 : 1, transition:"opacity 0.2s" }}>
            <button onClick={() => toggleStatus(item.id)} style={{
              width:"22px", height:"22px", borderRadius:"50%", flexShrink:0, marginTop:"1px", cursor:"pointer",
              border: item.status === "Completed" ? "none" : "2px solid rgba(255,255,255,0.20)",
              background: item.status === "Completed" ? "#10b981" : "transparent",
              display:"grid", placeItems:"center", transition:"all 0.2s",
            }}>
              {item.status === "Completed" && (
                <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              )}
            </button>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:"0.9rem", color:"var(--text-primary)", textDecoration: item.status === "Completed" ? "line-through" : "none" }}>{item.task}</div>
              <div style={{ display:"flex", gap:"12px", marginTop:"6px", flexWrap:"wrap" }}>
                <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Meeting #{item.meeting_id}</span>
                <span style={{ fontSize:"0.75rem", color:"#a78bfa" }}>→ {item.assigned_to}</span>
                <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={`chip ${item.status === "Completed" ? "chip-emerald" : "chip-amber"}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}