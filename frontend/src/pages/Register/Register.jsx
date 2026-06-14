import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await api.post("/api/users/register", {
        name,
        email,
        company,
        role,
        password,
      });

      alert("Registration Successful");
      navigate("/login");

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Registration Failed"
      );
    }
  };

  return (
    <div className="register-layout">
      {/* Creative Left Side */}
      <div className="register-brand-section">
        <div className="brand-content">
          <div className="logo-placeholder">
            <span className="logo-icon">✨</span>
            <span className="logo-text">MeetingPrep</span>
          </div>
          
          <h1 className="brand-title">
            Elevate your <br/> 
            <span className="text-gradient">meetings.</span>
          </h1>
          <p className="brand-subtitle">
            Join professionals who prepare faster, present better, and win more deals with AI-driven insights.
          </p>

          <div className="feature-cards">
            <div className="feature-card">
              <span className="feature-icon">🧠</span>
              <div>
                <h3>AI Insights</h3>
                <p>Instant background context on any client</p>
              </div>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <div>
                <h3>Save Time</h3>
                <p>Automate your preparation workflow</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="brand-orb orb-1"></div>
        <div className="brand-orb orb-2"></div>
      </div>

      {/* Form Right Side */}
      <div className="register-form-section">
        <div className="register-form-container">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Start your journey to better meetings.</p>
          </div>
          
          <form onSubmit={handleRegister} className="register-form">
            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  id="name"
                  placeholder=" "
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <label htmlFor="name">Full Name</label>
              </div>

              <div className="input-group">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="email">Email Address</label>
              </div>
            </div>
            
            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  id="company"
                  placeholder=" "
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
                <label htmlFor="company">Company</label>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  id="role"
                  placeholder=" "
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
                <label htmlFor="role">Job Title</label>
              </div>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Password</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="confirmPassword"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label htmlFor="confirmPassword">Confirm Password</label>
            </div>

            <button type="submit" className="register-button">
              <span>Create my account</span>
            </button>
          </form>
          
          <div className="register-footer">
            <p>
              Already have an account?{" "}
              <button 
                className="login-link" 
                onClick={() => navigate("/login")}
                type="button"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;