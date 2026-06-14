import { useEffect, useState } from "react";
import api from "../../services/api";

const statusCfg = {
  completed: { cls: "chip-emerald", label: "Completed" },
  upcoming:  { cls: "chip-violet",  label: "Upcoming"  },
  pending:   { cls: "chip-amber",   label: "Pending"   },
  cancelled: { cls: "chip-rose",    label: "Cancelled" },
};

function getStatus(meeting) {
  if (meeting.status) return meeting.status.toLowerCase();
  const d = new Date(meeting.meeting_date);
  return d < new Date() ? "completed" : "upcoming";
}

export default function RecentMeetings() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    api.get("/api/meetings/")
      .then(r => setMeetings(r.data.slice(0, 4)))
      .catch(() => setMeetings([
        { id: 1, title: "Contract Negotiation", client_name: "Atlas Consulting",   meeting_date: "2026-06-20T16:30:00", status: "pending"   },
        { id: 2, title: "Discovery Call",       client_name: "NovaCare Health",    meeting_date: "2026-06-18T14:30:00", status: "upcoming"  },
        { id: 3, title: "Q3 Strategy Review",   client_name: "Meridian Finance",   meeting_date: "2026-06-15T15:30:00", status: "upcoming"  },
        { id: 4, title: "New Product Proposal", client_name: "UrbanRetail Group",  meeting_date: "2026-06-12T19:30:00", status: "completed" },
      ]));
  }, []);

  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>Recent Meetings</div>
        <a href="/meetings" style={{ fontSize: "0.78rem", color: "#7c3aed", textDecoration: "none", fontWeight: 500 }}>View all →</a>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {meetings.map((m) => {
          const st = getStatus(m);
          const cfg = statusCfg[st] || statusCfg.upcoming;
          const dateStr = m.meeting_date ? new Date(m.meeting_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
          return (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "12px",
              background: "#f8fafc", border: "1px solid #f1f5f9",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.borderColor = "#ede9fe"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "#f5f3ff", display: "grid", placeItems: "center", flexShrink: 0,
                border: "1px solid #ede9fe",
              }}>
                <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>{m.client_name || `Client ${m.client_id || "—"}`} · {dateStr}</div>
              </div>
              <span className={`chip ${cfg.cls}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}