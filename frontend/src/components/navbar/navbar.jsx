import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());

  const [user] = useState(() => ({
    name: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "",
  }));

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");

    navigate("/");
  };

  const formatted =
    time.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) +
    " · " +
    time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="navbar">
      {/* Search */}

      <div
        style={{
          flex: 1,
          maxWidth: "360px",
          position: "relative",
        }}
      >
        <svg
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.4,
          }}
          width="16"
          height="16"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          placeholder="Search clients, meetings..."
          className="input-glass"
          style={{
            paddingLeft: "42px",
            height: "40px",
            fontSize: "0.85rem",
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Date */}

      <div
        style={{
          fontSize: "0.82rem",
          color: "#64748b",
          whiteSpace: "nowrap",
        }}
      >
        {formatted}
      </div>

      {/* Bell */}

      <button
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          width: "38px",
          height: "38px",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          color: "#94a3b8",
        }}
      >
        🔔
      </button>

      {/* Theme Toggle */}

      <button
        onClick={() =>
          setDarkMode(!darkMode)
        }
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          width: "38px",
          height: "38px",
          cursor: "pointer",
        }}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* User */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background:
              "linear-gradient(135deg,#7c3aed,#10b981)",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontWeight: "700",
          }}
        >
          {user.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div>
          <div
            style={{
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {user.name}
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            {user.email}
          </div>
        </div>
      </div>

      {/* Logout */}

      <button
        onClick={handleLogout}
        style={{
          marginLeft: "15px",
          background: "#ef4444",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Logout
      </button>
    </div>
  );
}