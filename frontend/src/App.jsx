import { useState } from "react";
import Register from "./pages/Register/Register";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/sidebar/sidebar";
import Navbar from "./components/navbar/Navbar";
import { ToastProvider } from "./context/ToastContext";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import Clients from "./pages/Clients/Clients";
import Meetings from "./pages/Meetings/Meetings";
import Notes from "./pages/Notes/Notes";
import AIAnalysis from "./pages/AIAnalysis/AIAnalysis";
import ActionItems from "./pages/ActionItems/ActionItems";
import SuperAgents from "./pages/SuperAgents/SuperAgents";
import Profile from "./pages/Profile/Profile";

function Layout() {
  const [darkMode, setDarkMode] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
      />

      <div
        style={{
          marginLeft: isOpen ? "300px" : "90px",
          transition: "all 0.3s ease",
          minHeight: "100vh",
        }}
      >
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div
          className="page-content"
          style={{
            padding: "20px",
          }}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/clients"
              element={<Clients />}
            />

            <Route
              path="/meetings"
              element={<Meetings />}
            />

            <Route
              path="/notes"
              element={<Notes />}
            />

            <Route
              path="/ai-analysis"
              element={<AIAnalysis />}
            />

            <Route
              path="/action-items"
              element={<ActionItems />}
            />

            <Route
              path="/super-agent"
              element={<SuperAgents />}
            />
            <Route
             path="/register"
             element={<Register />}
            />
            <Route
             path="/profile"
             element={<Profile />}
            />

          </Routes>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  // Public Pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // Protected Routes
  if (!isLoggedIn) {
    return <Login />;
  }

  return <Layout />;
}
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;