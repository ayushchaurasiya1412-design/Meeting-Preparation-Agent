import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate  = useNavigate();
  const [now, setNow]         = useState(new Date());
  const [userName, setUserName]   = useState(localStorage.getItem("userName") || "User");
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem("profilePhoto") || "");

  // live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // sync name / photo when profile is saved
  useEffect(() => {
    const sync = () => {
      setUserName(localStorage.getItem("userName") || "User");
      setProfilePhoto(localStorage.getItem("profilePhoto") || "");
    };
    window.addEventListener("profileUpdated", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("profileUpdated", sync); window.removeEventListener("storage", sync); };
  }, []);

  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="navbar">

      {/* ── Search ── */}
      <div style={{ position: "relative", width: 280, flexShrink: 0 }}>
        <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
          width="15" height="15" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search clients, meetings…"
          className="input-glass"
          style={{ paddingLeft: 36, height: 38, fontSize: "0.82rem" }}
        />
      </div>

      {/* spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Date · Time ── */}
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
        {dateStr} · {timeStr}
      </span>

      {/* ── Notifications ── */}
      <button className="navbar-icon-btn" title="Notifications">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
      </button>

      {/* ── Dark / Light toggle ── */}
      <button
        className="navbar-icon-btn"
        onClick={() => setDarkMode(!darkMode)}
        title={darkMode ? "Light mode" : "Dark mode"}
        style={{ fontSize: "0.95rem" }}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* ── User avatar + name ── */}
      <div
        onClick={() => navigate("/profile")}
        style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer",
          padding:"5px 10px 5px 6px", borderRadius:12,
          border:"1px solid var(--border)", background:"var(--bg-base)",
          transition:"all var(--ease)" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.30)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-base)"; }}
        title="View profile"
      >
        <div style={{
          width:30, height:30, borderRadius:8, overflow:"hidden",
          background:"linear-gradient(135deg,#7c3aed,#10b981)",
          display:"grid", placeItems:"center",
          color:"white", fontWeight:700, fontSize:"0.8rem", flexShrink:0,
        }}>
          {profilePhoto
            ? <img src={`http://localhost:8000${profilePhoto}`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            : initial
          }
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize:"0.82rem", fontWeight:600, color:"var(--text-primary)", whiteSpace:"nowrap", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis" }}>
            {userName}
          </div>
          <div style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Online</div>
        </div>
      </div>

      {/* ── Logout icon-only button ── */}
      <button
        className="navbar-icon-btn"
        onClick={() => { localStorage.clear(); navigate("/"); }}
        title="Sign out"
        style={{ color: "var(--rose)", borderColor: "rgba(244,63,94,0.20)", background: "rgba(244,63,94,0.06)" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.12)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.35)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,63,94,0.06)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.20)"; }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>

    </div>
  );
}
