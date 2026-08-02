import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    to: "/clients",
    label: "Clients",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    to: "/meetings",
    label: "Meetings",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    to: "/notes",
    label: "Notes",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    to: "/ai-analysis",
    label: "AI Analysis",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/>
      </svg>
    ),
  },
  {
    to: "/action-items",
    label: "Action Items",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
  {
    to: "/super-agent",
    label: "Super Agents",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const [userName, setUserName]   = useState(localStorage.getItem("userName") || "User");
  const [userRole, setUserRole]   = useState("");
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem("profilePhoto") || "");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(res.data.name || "User");
        setUserRole(res.data.role || "");
        if (res.data.profile_photo) {
          setProfilePhoto(res.data.profile_photo);
          localStorage.setItem("profilePhoto", res.data.profile_photo);
        }
      } catch (_) {}
    };
    fetchUser();

    const onUpdate = () => {
      setUserName(localStorage.getItem("userName") || "User");
      setProfilePhoto(localStorage.getItem("profilePhoto") || "");
    };
    window.addEventListener("profileUpdated", onUpdate);
    return () => window.removeEventListener("profileUpdated", onUpdate);
  }, []);

  const handleSignOut = (e) => {
    e?.stopPropagation();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className={`sidebar ${isOpen ? "" : "collapsed"}`}>

      {/* ── Logo ── */}
      <div className="sidebar-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            display: "grid", placeItems: "center",
            boxShadow: "0 4px 16px rgba(124,58,237,0.30)",
          }}>
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          {isOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", lineHeight: 1.1 }}>MeetPrep</div>
              <div style={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 600, letterSpacing: "0.06em" }}>AI AGENT</div>
            </div>
          )}
        </div>

        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            }
          </svg>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        {isOpen && <div className="section-label" style={{ paddingLeft: 6, marginBottom: 8 }}>Navigation</div>}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
            title={!isOpen ? item.label : undefined}
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Profile footer ── */}
      <div className="sidebar-footer" onClick={() => navigate("/profile")} style={{ overflow: "hidden" }}>
        {isOpen ? (
          <div className="sidebar-profile-row">
            <div className="sidebar-avatar">
              {profilePhoto
                ? <img src={`http://localhost:8000${profilePhoto}`} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : userName.substring(0, 2).toUpperCase()
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight:600, fontSize:"0.82rem", color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {userName}
              </div>
              <div style={{ fontSize:"0.68rem", color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {userRole || "User"}
              </div>
            </div>
            <button
              className="sidebar-signout-btn"
              onClick={handleSignOut}
              title="Sign out"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        ) : (
          /* collapsed — just avatar centered */
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div className="sidebar-avatar">
              {profilePhoto
                ? <img src={`http://localhost:8000${profilePhoto}`} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : userName.substring(0, 2).toUpperCase()
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
