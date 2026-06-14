export default function StatCard({ title, value, subtitle, icon, color = "#7c3aed", gradient }) {
  const bg = gradient || `rgba(124,58,237,0.12)`;
  return (
    <div
      className="glass glass-hover"
      style={{ padding: "24px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.80rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {title}
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, marginTop: "6px" }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: "0.78rem", color, marginTop: "5px", fontWeight: 500 }}>{subtitle}</div>
          )}
        </div>
        <div
          className="stat-icon"
          style={{ background: bg, boxShadow: `0 4px 16px ${color}28` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}