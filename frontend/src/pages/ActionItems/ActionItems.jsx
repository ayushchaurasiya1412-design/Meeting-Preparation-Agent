import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

// ── Constants ────────────────────────────────────────────────
const COLUMNS = [
  {
    id: "Pending",
    label: "Pending",
    icon: "🕐",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    chipCls: "chip-amber",
  },
  {
    id: "In Progress",
    label: "In Progress",
    icon: "🔄",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
    chipCls: "chip-sky",
  },
  {
    id: "Completed",
    label: "Completed",
    icon: "✅",
    color: "#10b981",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    chipCls: "chip-emerald",
  },
];

const MOCK = [
  { id:1, meeting_id:2, task:"Schedule security & compliance demo", assigned_to:"Ayush C.",  status:"Pending",     created_at:"2026-06-11T10:00:00" },
  { id:2, meeting_id:2, task:"Send HIPAA documentation pack",        assigned_to:"Priya P.",  status:"Completed",   created_at:"2026-06-10T09:00:00" },
  { id:3, meeting_id:1, task:"Prepare 24-month ROI projections",    assigned_to:"Marcus J.", status:"In Progress",  created_at:"2026-06-09T14:00:00" },
  { id:4, meeting_id:3, task:"Draft MSA for legal review",          assigned_to:"Emily K.",  status:"Pending",     created_at:"2026-06-08T11:00:00" },
  { id:5, meeting_id:1, task:"Follow-up call with CFO",             assigned_to:"Ayush C.",  status:"In Progress",  created_at:"2026-06-07T10:00:00" },
  { id:6, meeting_id:2, task:"Prepare competitive analysis report", assigned_to:"Marcus J.", status:"Completed",   created_at:"2026-06-06T09:00:00" },
];

// ── Add Item Modal ───────────────────────────────────────────
function AddItemModal({ onClose, onSave }) {
  const [form, setForm] = useState({ meeting_id:"", task:"", assigned_to:"", status:"Pending" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div style={{ fontWeight:800, fontSize:"1.05rem", color:"var(--text-primary)" }}>Create Action Item</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"1.3rem" }}>✕</button>
        </div>
        <div style={{ display:"grid", gap:12 }}>
          <div>
            <label style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Task Description *</label>
            <textarea className="input-glass" rows={3} placeholder="Describe the action item…"
              style={{ resize:"vertical", lineHeight:1.6 }}
              value={form.task} onChange={e => set("task", e.target.value)}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Assigned To</label>
              <input className="input-glass" placeholder="Person name" value={form.assigned_to} onChange={e => set("assigned_to", e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Meeting ID</label>
              <input className="input-glass" type="number" placeholder="Meeting #" value={form.meeting_id} onChange={e => set("meeting_id", e.target.value)}/>
            </div>
          </div>
          <div>
            <label style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Initial Status</label>
            <select className="input-glass" value={form.status} onChange={e => set("status", e.target.value)}>
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:22, justifyContent:"flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => form.task.trim() && onSave(form)}>Create Item</button>
        </div>
      </div>
    </div>
  );
}

// ── Kanban Card ──────────────────────────────────────────────
function KanbanCard({ item, col, onMove, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const otherCols = COLUMNS.filter(c => c.id !== col.id);

  return (
    <div
      style={{
        background:"var(--bg-surface)", borderRadius:14,
        border:`1px solid var(--border)`,
        padding:"14px 16px", marginBottom:10,
        boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
        transition:"all 0.2s", cursor:"default",
        borderLeft:`3px solid ${col.color}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.09)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      {/* Task text */}
      <div style={{ fontSize:"0.86rem", fontWeight:600, color:"var(--text-primary)", lineHeight:1.5, marginBottom:10,
        display: expanded ? "block" : "-webkit-box",
        WebkitLineClamp: expanded ? "unset" : 2,
        WebkitBoxOrient:"vertical", overflow:"hidden",
        cursor:"pointer",
      }} onClick={() => setExpanded(e => !e)}>
        {item.task}
      </div>

      {/* Meta row */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
        {item.assigned_to && (
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:`${col.color}20`, border:`1px solid ${col.color}40`, display:"grid", placeItems:"center", fontSize:"0.58rem", fontWeight:800, color:col.color }}>
              {item.assigned_to.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontWeight:500 }}>{item.assigned_to}</span>
          </div>
        )}
        {item.meeting_id && (
          <span style={{ fontSize:"0.68rem", color:"var(--text-muted)", background:"var(--bg-base)", padding:"2px 7px", borderRadius:99, border:"1px solid var(--border)" }}>
            #{item.meeting_id}
          </span>
        )}
        <span style={{ marginLeft:"auto", fontSize:"0.66rem", color:"var(--text-muted)" }}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : ""}
        </span>
      </div>

      {/* Move buttons */}
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        {otherCols.map(tc => (
          <button key={tc.id} onClick={() => onMove(item.id, tc.id)} style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4,
            padding:"5px 8px", borderRadius:8, fontSize:"0.68rem", fontWeight:700,
            background:`${tc.color}10`, border:`1px solid ${tc.color}28`,
            color:tc.color, cursor:"pointer", fontFamily:"var(--font-main)", transition:"all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background=`${tc.color}20`; e.currentTarget.style.transform="scale(1.02)"; }}
          onMouseLeave={e => { e.currentTarget.style.background=`${tc.color}10`; e.currentTarget.style.transform="scale(1)"; }}>
            {tc.icon} {tc.label === "In Progress" ? "WIP" : tc.label}
          </button>
        ))}
        <button onClick={() => onDelete(item.id)} style={{
          width:28, height:28, borderRadius:8, border:"1px solid rgba(244,63,94,0.20)",
          background:"rgba(244,63,94,0.06)", color:"#f43f5e", cursor:"pointer",
          display:"grid", placeItems:"center", flexShrink:0, transition:"all 0.18s",
        }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(244,63,94,0.15)"}
        onMouseLeave={e => e.currentTarget.style.background="rgba(244,63,94,0.06)"}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Kanban Column ────────────────────────────────────────────
function KanbanColumn({ col, items, onMove, onDelete, isDragOver, onDragOver, onDragLeave, onDrop }) {
  return (
    <div
      style={{
        flex:1, minWidth:0,
        background: isDragOver ? `${col.color}06` : "var(--bg-base)",
        borderRadius:18, padding:16,
        border:`1.5px solid ${isDragOver ? col.color+"40" : "var(--border)"}`,
        transition:"all 0.2s", minHeight:500,
      }}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(); }}
    >
      {/* Column header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`${col.color}15`, border:`1px solid ${col.color}25`, display:"grid", placeItems:"center", fontSize:"1rem" }}>
            {col.icon}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)" }}>{col.label}</div>
          </div>
        </div>
        {/* count badge */}
        <div style={{
          minWidth:26, height:26, borderRadius:99, padding:"0 8px",
          background:`${col.color}15`, border:`1px solid ${col.color}25`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"0.76rem", fontWeight:800, color:col.color,
        }}>
          {items.length}
        </div>
      </div>

      {/* Drop zone hint */}
      {isDragOver && (
        <div style={{
          border:`2px dashed ${col.color}60`, borderRadius:12, padding:"12px",
          textAlign:"center", fontSize:"0.76rem", color:col.color,
          fontWeight:600, marginBottom:10, background:`${col.color}08`,
        }}>
          Drop here → {col.label}
        </div>
      )}

      {/* Cards */}
      {items.length === 0 && !isDragOver && (
        <div style={{ textAlign:"center", padding:"32px 12px", color:"var(--text-muted)" }}>
          <div style={{ fontSize:"1.8rem", opacity:0.3, marginBottom:8 }}>
            {col.id === "Pending" ? "📋" : col.id === "In Progress" ? "⚙️" : "🎉"}
          </div>
          <div style={{ fontSize:"0.76rem", fontWeight:500 }}>
            {col.id === "Pending" ? "No pending tasks" : col.id === "In Progress" ? "Nothing in progress" : "No completed tasks"}
          </div>
        </div>
      )}
      {items.map(item => (
        <div key={item.id}
          draggable
          onDragStart={e => { e.dataTransfer.setData("itemId", String(item.id)); e.dataTransfer.setData("fromCol", col.id); }}
        >
          <KanbanCard item={item} col={col} onMove={onMove} onDelete={onDelete}/>
        </div>
      ))}
    </div>
  );
}

// ── Main Kanban Page ─────────────────────────────────────────
export default function ActionItems() {
  const toast = useToast();
  const [items,    setItems]    = useState([]);
  const [modal,    setModal]    = useState(false);
  const [search,   setSearch]   = useState("");
  const [dragOver, setDragOver] = useState(null); // column id being hovered
  const dragItem = useRef(null);

  const load = async () => {
    try {
      const r = await api.get("/api/action-items/");
      setItems(r.data.length ? r.data : MOCK);
    } catch { setItems(MOCK); }
  };

  useEffect(() => { load(); }, []);

  // ── status move (button click or drag) ──
  const moveItem = async (id, newStatus) => {
    // optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    try {
      await api.patch(`/api/action-items/${id}/status`, { status: newStatus });
      toast(`Moved to ${newStatus}`, "success");
    } catch { toast(`Moved to ${newStatus}`, "success"); /* offline ok */ }
  };

  // ── delete ──
  const deleteItem = async (id) => {
    if (!window.confirm("Delete this action item?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    try { await api.delete(`/api/action-items/${id}`); } catch {}
    toast("Item deleted.", "info");
  };

  // ── add new ──
  const handleAdd = async (form) => {
    try {
      await api.post("/api/action-items/", { meeting_id: Number(form.meeting_id) || 1, task: form.task, assigned_to: form.assigned_to });
      toast("Action item created!", "success");
      await load();
    } catch {
      setItems(prev => [...prev, { id: Date.now(), meeting_id: form.meeting_id || 1, task: form.task, assigned_to: form.assigned_to, status: form.status, created_at: new Date().toISOString() }]);
      toast("Action item created!", "success");
    }
    setModal(false);
  };

  // ── drag ──
  const handleDrop = (toColId) => {
    const id = Number(dragItem.current);
    if (id) moveItem(id, toColId);
    dragItem.current = null;
    setDragOver(null);
  };

  // ── derived ──
  const filtered = search
    ? items.filter(i => i.task?.toLowerCase().includes(search.toLowerCase()) || i.assigned_to?.toLowerCase().includes(search.toLowerCase()))
    : items;

  const byCol = (colId) => filtered.filter(i => (i.status || "Pending") === colId);
  const total     = items.length;
  const completed = items.filter(i => i.status === "Completed").length;
  const inProg    = items.filter(i => i.status === "In Progress").length;
  const pct       = total ? Math.round(completed / total * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800, color:"var(--text-primary)" }}>Action Items</h1>
          <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>
            <span style={{ color:"#10b981", fontWeight:700 }}>{completed}</span> completed ·{" "}
            <span style={{ color:"#0ea5e9", fontWeight:700 }}>{inProg}</span> in progress ·{" "}
            <span style={{ color:"#f59e0b", fontWeight:700 }}>{total - completed - inProg}</span> pending
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Item
        </button>
      </div>

      {/* Progress bar + stats row */}
      <div className="glass" style={{ padding:"18px 22px", marginBottom:22, display:"grid", gridTemplateColumns:"1fr auto", gap:20, alignItems:"center" }}>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:"0.82rem", color:"var(--text-secondary)", fontWeight:500 }}>Overall Progress</span>
            <span style={{ fontSize:"0.82rem", color:"#10b981", fontWeight:800 }}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{ height:8 }}>
            <div className="fill" style={{ width:`${pct}%` }}/>
          </div>
          <div style={{ display:"flex", gap:16, marginTop:10 }}>
            {COLUMNS.map(col => {
              const n = byCol(col.id).length;
              return (
                <div key={col.id} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:col.color }}/>
                  <span style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>{col.label}: <strong style={{ color:col.color }}>{n}</strong></span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Search */}
        <div style={{ position:"relative", width:240 }}>
          <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", opacity:0.45 }} width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input className="input-glass" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:34, height:38, fontSize:"0.82rem" }}/>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            col={col}
            items={byCol(col.id)}
            onMove={moveItem}
            onDelete={deleteItem}
            isDragOver={dragOver === col.id}
            onDragOver={() => setDragOver(col.id)}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col.id)}
          />
        ))}
      </div>

      {modal && <AddItemModal onClose={() => setModal(false)} onSave={handleAdd}/>}
    </div>
  );
}
