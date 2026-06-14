import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
  {
    to: "/clients",
    label: "Clients",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    to: "/meetings",
    label: "Meetings",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    to: "/notes",
    label: "Notes",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    to: "/ai-analysis",
    label: "AI Analysis",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/>
      </svg>
    ),
  },
  {
    to: "/action-items",
    label: "Action Items",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
  {
    to: "/super-agent",
    label: "Super Agents",
    icon: (
      <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Loading...");
  const [userRole, setUserRole] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem("profilePhoto") || "");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const response = await api.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(response.data.name);
        setUserRole(response.data.role || "No Role Set");
        if (response.data.profile_photo) {
          setProfilePhoto(response.data.profile_photo);
          localStorage.setItem("profilePhoto", response.data.profile_photo);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
    
    const handleProfileUpdate = () => {
      setUserName(localStorage.getItem("userName") || "User");
      setProfilePhoto(localStorage.getItem("profilePhoto") || "");
    };
    
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const handleSignOut = (e) => {
    if (e) e.stopPropagation();
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className={`sidebar ${isOpen ? "" : "collapsed"}`}>
      {/* Logo */}
      <div style={{ padding: "24px 18px 16px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "grid", placeItems: "center",
            boxShadow: "0 4px 16px rgba(124,58,237,0.30)",
          }}>
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          {isOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", lineHeight: 1.1 }}>MeetPrep</div>
              <div style={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 600, letterSpacing: "0.06em" }}>AI AGENT</div>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          style={{
            marginTop: "16px", width: "100%", background: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: "10px",
            color: "#94a3b8", cursor: "pointer", padding: "7px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#7c3aed"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.30)"; e.currentTarget.style.background = "#f5f3ff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            }
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        {isOpen && (
          <div className="section-label" style={{ paddingLeft: "6px", marginBottom: "8px" }}>Navigation</div>
        )}
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

      {/* Profile / Sign Out */}
      <div 
        style={{ padding: "12px", borderTop: "1px solid #e2e8f0", cursor: "pointer" }}
        onClick={handleProfileClick}
      >
        {isOpen ? (
          <div style={{
            background: "#f8fafc", borderRadius: "14px",
            padding: "12px 14px", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: "10px",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.30)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
          >
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
              background: "linear-gradient(135deg, #7c3aed, #10b981)",
              display: "grid", placeItems: "center",
              fontWeight: 700, fontSize: "0.8rem", color: "#fff",
              overflow: "hidden"
            }}>
              {profilePhoto ? (
                <img src={`http://localhost:8000${profilePhoto}`} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                userName.substring(0, 2).toUpperCase()
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userRole || "User"}</div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px", borderRadius: "6px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="sidebar-profile-card">
            <div className="sidebar-profile-avatar" style={{ 
              width: "100%", aspectRatio: "1/1", borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #10b981)",
              display: "grid", placeItems: "center",
              fontWeight: 700, fontSize: "0.9rem", color: "#fff",
              cursor: "pointer", overflow: "hidden" 
            }}>
              {profilePhoto ? (
                <img src={`http://localhost:8000${profilePhoto}`} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                userName.substring(0, 2).toUpperCase()
              )}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{
                width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: "12px", color: "#94a3b8", cursor: "pointer", padding: "10px",
                display: "grid", placeItems: "center", marginTop: "8px"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
              onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}