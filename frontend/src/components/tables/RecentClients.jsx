import { useEffect, useState } from "react";
import api from "../../services/api";

const COLORS = ["#7c3aed","#10b981","#f59e0b","#0ea5e9","#f43f5e","#14b8a6"];
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function RecentClients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    api.get("/api/clients/")
      .then(r => setClients(r.data.slice(0, 5)))
      .catch(() => setClients([
        { id: 1, company_name: "Meridian Finance",  contact_person: "James Whitmore", industry: "Finance",    status: "active" },
        { id: 2, company_name: "NovaCare Health",   contact_person: "Dr. Emily Park",  industry: "Healthcare", status: "prospect" },
        { id: 3, company_name: "UrbanRetail Group", contact_person: "Marcus Johnson",  industry: "Retail",     status: "active" },
      ]));
  }, []);

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>Recent Clients</div>
        <a href="/clients" style={{ fontSize: "0.78rem", color: "#7c3aed", textDecoration: "none", fontWeight: 500 }}>View all →</a>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {clients.map((c, i) => (
          <div key={c.id} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px 12px", borderRadius: "12px",
            background: "#f8fafc", border: "1px solid #f1f5f9",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.borderColor = "#ede9fe"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
          >
            <div className="avatar" style={{ background: `${COLORS[i % COLORS.length]}14`, color: COLORS[i % COLORS.length], border: `1px solid ${COLORS[i % COLORS.length]}30`, width: "36px", height: "36px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {getInitials(c.company_name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.company_name}</div>
              <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>{c.contact_person}</div>
            </div>
            <span className={`chip ${c.status === "active" ? "chip-emerald" : "chip-amber"}`}>
              {c.status || "active"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}