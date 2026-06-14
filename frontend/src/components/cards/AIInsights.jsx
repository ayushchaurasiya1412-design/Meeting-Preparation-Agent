const insights = [
  { text: "Budget Approved — Q3 allocation confirmed", type: "success" },
  { text: "Client Sentiment Positive", type: "success" },
  { text: "Risk Level: Low — No blockers identified", type: "info" },
  { text: "Development Sprint Ready to Begin", type: "success" },
  { text: "Timeline On Track — Delivery by end of Q3", type: "info" },
  { text: "Follow-up email draft pending review", type: "warning" },
];

const typeConfig = {
  success: { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: "✓" },
  info:    { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "i" },
  warning: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "!" },
};

export default function AIInsights() {
  return (
    <div className="glass" style={{ padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "10px",
          background: "#f5f3ff", display: "grid", placeItems: "center",
          border: "1px solid #ddd6fe",
        }}>
          <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>AI Insights</div>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Live intelligence summary</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {insights.map((item, i) => {
          const cfg = typeConfig[item.type];
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 14px", borderRadius: "10px",
              background: cfg.bg, border: `1px solid ${cfg.border}`,
            }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: cfg.color, color: "#fff",
                display: "grid", placeItems: "center",
                fontSize: "0.65rem", fontWeight: 800, flexShrink: 0,
              }}>{cfg.icon}</div>
              <span style={{ fontSize: "0.82rem", color: cfg.color, fontWeight: 500 }}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}