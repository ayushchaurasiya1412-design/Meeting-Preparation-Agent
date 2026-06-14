import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const COLORS = ["#7c3aed","#10b981","#f59e0b","#0ea5e9","#f43f5e","#14b8a6"];
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const MOCK_CLIENTS = [
  { id:1, company_name:"Meridian Finance",  contact_person:"James Whitmore", email:"james@meridian.com",  industry:"Finance",    status:"active",   deal_value:"$820,000" },
  { id:2, company_name:"NovaCare Health",   contact_person:"Dr. Emily Park",  email:"emily@novacare.com",  industry:"Healthcare", status:"prospect", deal_value:"$350,000" },
  { id:3, company_name:"UrbanRetail Group", contact_person:"Marcus Johnson",  email:"marcus@urbanretail.com",industry:"Retail",   status:"active",   deal_value:"$200,000" },
  { id:4, company_name:"Atlas Consulting",  contact_person:"Priya Patel",     email:"priya@atlasconsulting.com",industry:"Consulting",status:"prospect",deal_value:"$600,000" },
];

function ClientModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { company_name:"", contact_person:"", email:"", industry:"", status:"active" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <h2 style={{ margin:0, fontWeight:700, fontSize:"1.2rem", color:"#0f172a" }}>{initial?.id ? "Edit Client" : "Add New Client"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:"1.3rem" }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          {[["company_name","Company Name","text"],["contact_person","Contact Person","text"],["email","Email","email"],["industry","Industry","text"]].map(([k,ph,t]) => (
            <div key={k}>
              <label style={{ fontSize:"0.78rem", fontWeight:600, color:"#94a3b8", display:"block", marginBottom:"5px" }}>{ph}</label>
              <input type={t} placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)} className="input-glass"/>
            </div>
          ))}
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"#94a3b8", display:"block", marginBottom:"5px" }}>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className="input-glass">
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"#94a3b8", display:"block", marginBottom:"5px" }}>Deal Value</label>
            <input type="text" placeholder="$0" value={form.deal_value || ""} onChange={e => set("deal_value", e.target.value)} className="input-glass"/>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"24px", justifyContent:"flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(form)}>
            {initial?.id ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const toast = useToast();

  const load = async () => {
    try { const r = await api.get("/api/clients/"); setClients(r.data); }
    catch { setClients(MOCK_CLIENTS); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (form.id) { await api.put(`/api/clients/${form.id}/`, form); toast("Client updated successfully!", "success"); }
      else { await api.post("/api/clients/", form); toast("Client added successfully!", "success"); }
      await load();
    } catch {
      setClients(prev => form.id ? prev.map(c => c.id === form.id ? { ...c, ...form } : c) : [...prev, { ...form, id: Date.now() }]);
      toast(form.id ? "Client updated!" : "Client added!", "success");
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    try { await api.delete(`/api/clients/${id}/`); } catch {}
    setClients(prev => prev.filter(c => c.id !== id));
    toast("Client deleted.", "info");
  };

  const filtered = clients.filter(c =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const statusCfg = { active:"chip-emerald", prospect:"chip-amber", inactive:"chip-rose" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"28px" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800, color:"#0f172a" }}>Clients</h1>
          <p style={{ margin:"6px 0 0", color:"#94a3b8", fontSize:"0.9rem" }}>{filtered.length} total clients</p>
        </div>
        <button className="btn-primary" onClick={() => setModal("add")}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add Client
        </button>
      </div>

      <div style={{ position:"relative", maxWidth:"420px", marginBottom:"24px" }}>
        <svg style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", opacity:0.4 }} width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="input-glass" style={{ paddingLeft:"42px" }}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:"16px" }}>
        {filtered.map((c, i) => (
          <div key={c.id} className="glass glass-hover" style={{ padding:"22px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
              <div className="avatar" style={{ background:`${COLORS[i%COLORS.length]}14`, color:COLORS[i%COLORS.length], border:`1px solid ${COLORS[i%COLORS.length]}30`, fontSize:"0.82rem", width:"46px", height:"46px", borderRadius:"14px" }}>
                {getInitials(c.company_name)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ fontWeight:700, fontSize:"1rem", color:"#0f172a" }}>{c.company_name}</div>
                  <span className={`chip ${statusCfg[c.status] || "chip-emerald"}`}>{c.status || "active"}</span>
                </div>
                <div style={{ color:"#94a3b8", fontSize:"0.82rem", marginTop:"2px" }}>{c.contact_person}</div>
              </div>
            </div>

            <div style={{ marginTop:"16px", display:"grid", gap:"7px" }}>
              {c.email && (
                <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"0.82rem", color:"#475569" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span style={{ color:"#2563eb" }}>{c.email}</span>
                </div>
              )}
              {c.industry && (
                <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"0.82rem", color:"#475569" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  {c.industry}
                </div>
              )}
              {c.deal_value && (
                <div style={{ fontWeight:700, color:"#059669", fontSize:"0.95rem", marginTop:"2px" }}>{c.deal_value}</div>
              )}
            </div>

            <div style={{ display:"flex", gap:"8px", marginTop:"16px" }}>
              <button className="btn-ghost" style={{ flex:1, justifyContent:"center", padding:"8px 12px", fontSize:"0.82rem" }} onClick={() => setModal(c)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
              <button onClick={() => handleDelete(c.id)} style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px",
                background:"#fff1f2", border:"1px solid #fecdd3",
                color:"#e11d48", borderRadius:"12px", padding:"8px 12px",
                cursor:"pointer", fontSize:"0.82rem", fontWeight:500, fontFamily:"var(--font-primary)",
                transition:"all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffe4e6"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff1f2"}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && <ClientModal initial={modal === "add" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}