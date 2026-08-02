import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

/* ── animated counter hook ── */
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

/* ── intersection observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── typing animation hook ── */
function useTyping(words, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return display;
}

/* ════════════════════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════════════════════ */
function LandingNav({ onLogin, onRegister }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["Features", "How It Works", "Pricing", "FAQ"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(226,232,240,0.8)" : "none",
      transition: "all 0.3s ease",
      padding: "0 5vw",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "grid", placeItems: "center", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.2rem", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MeetPrep AI</span>
        </div>
        {/* Desktop Links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="hide-mobile">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ color: "#475569", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#7c3aed"} onMouseLeave={e => e.target.style.color = "#475569"}>
              {l}
            </a>
          ))}
        </div>
        {/* CTA */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onLogin} style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "Outfit,sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
            Sign In
          </button>
          <button onClick={onRegister} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.30)", transition: "all 0.2s", fontFamily: "Outfit,sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════════
   HERO SECTION
════════════════════════════════════════════════════════════ */
function HeroSection({ onRegister, onLogin }) {
  const typed = useTyping(["Meeting Summaries", "Action Items", "Risk Analysis", "Follow-up Emails", "Client Insights"], 75, 2200);
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 70, position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #faf5ff 0%, #eff6ff 50%, #f0fdf4 100%)" }}>
      {/* BG Blobs */}
      <div style={{ position: "absolute", top: "5%", left: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", bottom: "0%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", top: "40%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }}/>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 5vw", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">
        {/* Left */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.20)", marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", display: "inline-block", boxShadow: "0 0 0 3px rgba(124,58,237,0.25)" }}/>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.04em" }}>Powered by LLaMA 3.3 · 70B AI Model</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.1, color: "#0f172a", margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            AI-Powered<br/>
            <span style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {typed}
              <span style={{ borderRight: "3px solid #7c3aed", marginLeft: 2, animation: "blink 1s step-end infinite" }}/>
            </span>
            <br/>
            <span style={{ color: "#0f172a" }}>In Seconds</span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.75, margin: "0 0 36px", maxWidth: 520 }}>
            Stop wasting hours on manual meeting prep. MeetPrep AI automatically generates summaries, extracts action items, identifies risks, and drafts follow-up emails — so you can focus on what matters.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
            <button onClick={onRegister} style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 8px 24px rgba(124,58,237,0.35)", transition: "all 0.25s", fontFamily: "Outfit,sans-serif", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,58,237,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.35)"; }}>
              Start Free — No Credit Card
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </button>
            <button onClick={onLogin} style={{ padding: "14px 28px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.25s", fontFamily: "Outfit,sans-serif", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.transform = "translateY(0)"; }}>
              View Dashboard Demo
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </div>

          {/* Social Proof Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {["#7c3aed","#0ea5e9","#10b981","#f59e0b","#f43f5e"].map((c, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${c}, ${c}99)`, border: "2px solid white", marginLeft: i ? -8 : 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: "0.7rem", color: "white" }}>
                  {["A","B","C","D","E"][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: 2, color: "#f59e0b", fontSize: "0.85rem" }}>★★★★★</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>Trusted by <strong style={{ color: "#0f172a" }}>2,400+</strong> professionals</div>
            </div>
            <div style={{ width: 1, height: 32, background: "#e2e8f0" }}/>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
              <strong style={{ color: "#10b981" }}>↑ 5hrs/week</strong> saved on average
            </div>
          </div>
        </div>

        {/* Right — AI Output Card */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -20, borderRadius: 32, background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(14,165,233,0.08))", filter: "blur(30px)" }}/>
          <HeroDemoCard />
        </div>
      </div>
    </section>
  );
}

/* ── Hero Demo Card ── */
function HeroDemoCard() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { label: "Summary", icon: "📝", color: "#7c3aed",
      content: "The client expressed strong interest in our enterprise analytics module. Budget of $820K is pre-approved. Key concern: HIPAA compliance. Next steps involve a security demo by June 18th and legal review of the MSA." },
    { label: "Action Items", icon: "✅", color: "#10b981",
      items: ["Schedule HIPAA compliance demo — Jun 18", "Send ROI projections (24-month) to Dr. Park", "Loop in legal team for MSA review", "Follow-up call with CFO next Friday"] },
    { label: "Risk Analysis", icon: "⚠️", color: "#f59e0b",
      risks: [{ label: "Regulatory Risk", level: 35, color: "#a78bfa" }, { label: "Budget Timeline", level: 55, color: "#f59e0b" }, { label: "Competitor Eval", level: 70, color: "#f43f5e" }] },
    { label: "Follow-up Email", icon: "📧", color: "#0ea5e9",
      email: "Subject: Next Steps — NovaCare Partnership\n\nDear Dr. Park,\n\nThank you for the productive session today. I'll arrange the compliance demo by Jun 18 and send over our HIPAA documentation.\n\nBest,\nYour AI Assistant" },
  ];
  const t = tabs[tab];
  return (
    <div style={{ position: "relative", borderRadius: 24, background: "white", border: "1px solid #e2e8f0", boxShadow: "0 24px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      {/* Window bar */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f43f5e" }}/>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }}/>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }}/>
        <span style={{ marginLeft: 8, fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>MeetPrep AI — Live Analysis</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.25)", animation: "pulse 2s infinite" }}/>
          <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>AI Active</span>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 4px" }}>
        {tabs.map((tb, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "10px 6px", border: "none", background: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: tab === i ? tb.color : "#94a3b8", borderBottom: tab === i ? `2px solid ${tb.color}` : "2px solid transparent", transition: "all 0.2s", fontFamily: "Outfit,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span>{tb.icon}</span><span className="hide-xs">{tb.label}</span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ padding: 20, minHeight: 200 }}>
        {tab === 0 && <p style={{ fontSize: "0.86rem", color: "#475569", lineHeight: 1.75, margin: 0 }}>{t.content}</p>}
        {tab === 1 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {t.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1.5px solid rgba(16,185,129,0.30)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <svg width="10" height="10" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <span style={{ fontSize: "0.83rem", color: "#475569" }}>{item}</span>
            </div>
          ))}
        </div>}
        {tab === 2 && <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {t.risks.map((r, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 500 }}>{r.label}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: r.color }}>{r.level}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${r.level}%`, background: `linear-gradient(90deg, ${r.color}, ${r.color}99)`, borderRadius: 99, transition: "width 1s ease" }}/>
              </div>
            </div>
          ))}
        </div>}
        {tab === 3 && <pre style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", fontFamily: "Outfit,sans-serif", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #f1f5f9" }}>{t.email}</pre>}
      </div>
      {/* Footer */}
      <div style={{ padding: "10px 20px 14px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Generated by LLaMA 3.3 · 70B</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["#10b981","#7c3aed","#0ea5e9"].map((c,i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }}/>)}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STATS SECTION
════════════════════════════════════════════════════════════ */
function StatsSection() {
  const [ref, inView] = useInView(0.2);
  const stats = [
    { target: 2400, suffix: "+", label: "Active Professionals", icon: "👥", color: "#7c3aed" },
    { target: 98,   suffix: "%", label: "Accuracy Rate",         icon: "🎯", color: "#10b981" },
    { target: 5,    suffix: "hrs", label: "Saved Per Week",       icon: "⏱️", color: "#0ea5e9" },
    { target: 50,   suffix: "K+", label: "Meetings Processed",    icon: "📋", color: "#f59e0b" },
  ];
  const c0 = useCounter(stats[0].target, 2000, inView);
  const c1 = useCounter(stats[1].target, 2000, inView);
  const c2 = useCounter(stats[2].target, 2000, inView);
  const c3 = useCounter(stats[3].target, 2000, inView);
  const vals = [c0, c1, c2, c3];
  return (
    <section ref={ref} style={{ padding: "72px 5vw", background: "white", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: "center", padding: "28px 20px", borderRadius: 20, border: "1px solid #f1f5f9", background: "#fafbff", transition: "all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${s.color}20`; e.currentTarget.style.borderColor = `${s.color}30`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#f1f5f9"; }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontSize: "2.8rem", fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 6 }}>
              {vals[i]}{s.suffix}
            </div>
            <div style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FEATURES SECTION
════════════════════════════════════════════════════════════ */
const FEATURES = [
  { icon: "🧠", title: "AI Meeting Summary", desc: "Turn 60-minute calls into crisp 3-paragraph summaries instantly. Never lose context again.", color: "#7c3aed", badge: "Most Used" },
  { icon: "✅", title: "Action Item Extraction", desc: "Automatically identify and assign tasks to the right people from your meeting notes.", color: "#10b981", badge: "" },
  { icon: "⚠️", title: "Risk Analysis", desc: "Spot budget concerns, competitor mentions, and blockers before they derail your deal.", color: "#f59e0b", badge: "" },
  { icon: "📧", title: "Follow-up Email Draft", desc: "One-click professional follow-up emails personalized to each client.", color: "#0ea5e9", badge: "Popular" },
  { icon: "📊", title: "Sentiment Analysis", desc: "Understand client mood and engagement level throughout the meeting.", color: "#f43f5e", badge: "" },
  { icon: "📈", title: "Client Readiness Score", desc: "Get a 0–100 readiness score to know exactly how close your client is to closing.", color: "#14b8a6", badge: "New" },
  { icon: "🚀", title: "Super Agent Mode", desc: "Run 10+ AI agents simultaneously for a complete 360° meeting intelligence report.", color: "#6d28d9", badge: "Premium" },
  { icon: "📄", title: "PDF Report Export", desc: "Export beautiful, professional AI reports to share with your team or stakeholders.", color: "#475569", badge: "" },
  { icon: "🔒", title: "Secure & Private", desc: "End-to-end encryption. Your data stays yours. SOC2 compliant infrastructure.", color: "#059669", badge: "" },
];

function FeaturesSection() {
  const [active, setActive] = useState(null);
  return (
    <section id="features" style={{ padding: "100px 5vw", background: "linear-gradient(180deg, #fafbff 0%, white 100%)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)", marginBottom: 18 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase" }}>Features</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Everything your meetings need
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: 580, margin: "0 auto" }}>
            One platform. 9 powerful AI capabilities. Built for professionals who win deals.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              style={{ padding: "28px 24px", borderRadius: 22, border: `1.5px solid ${active === i ? f.color + "40" : "#f1f5f9"}`, background: active === i ? `${f.color}08` : "white", transition: "all 0.3s", cursor: "default", position: "relative", transform: active === i ? "translateY(-4px)" : "translateY(0)", boxShadow: active === i ? `0 16px 40px ${f.color}18` : "none" }}>
              {f.badge && (
                <div style={{ position: "absolute", top: 18, right: 18, padding: "3px 10px", borderRadius: 99, background: `${f.color}15`, color: f.color, fontSize: "0.68rem", fontWeight: 700, border: `1px solid ${f.color}25` }}>{f.badge}</div>
              )}
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}12`, border: `1px solid ${f.color}20`, display: "grid", placeItems: "center", fontSize: "1.5rem", marginBottom: 18, transition: "transform 0.3s", transform: active === i ? "scale(1.1)" : "scale(1)" }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "1.02rem", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontSize: "0.86rem", color: "#64748b", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    { num: "01", icon: "📝", title: "Add Meeting Notes", desc: "Paste your raw meeting notes or transcription into MeetPrep AI. No formatting required.", color: "#7c3aed" },
    { num: "02", icon: "🤖", title: "AI Agents Activate", desc: "10+ specialized AI agents analyze your notes simultaneously — each an expert in a different domain.", color: "#0ea5e9" },
    { num: "03", icon: "⚡", title: "Get Instant Intelligence", desc: "Receive a complete briefing: summary, risks, action items, email draft, and sentiment score in seconds.", color: "#10b981" },
    { num: "04", icon: "📄", title: "Export & Share", desc: "Download a professional PDF report or copy individual outputs. Share with your team instantly.", color: "#f59e0b" },
  ];
  return (
    <section id="how-it-works" style={{ padding: "100px 5vw", background: "white" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)", marginBottom: 18 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0ea5e9", letterSpacing: "0.08em", textTransform: "uppercase" }}>How It Works</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            From raw notes to intelligence<br/>in 4 steps
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
            No setup required. No learning curve. Just results.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, position: "relative" }} className="steps-grid">
          {/* Connector line */}
          <div style={{ position: "absolute", top: 48, left: "12.5%", right: "12.5%", height: 2, background: "linear-gradient(90deg, #7c3aed, #0ea5e9, #10b981, #f59e0b)", opacity: 0.25, zIndex: 0, borderRadius: 99 }} className="hide-mobile"/>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "32px 20px", borderRadius: 22, border: "1.5px solid #f1f5f9", background: "#fafbff", position: "relative", zIndex: 1, transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}35`; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${s.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${s.color}20, ${s.color}08)`, border: `2px solid ${s.color}30`, display: "grid", placeItems: "center", margin: "0 auto 18px", fontSize: "1.5rem" }}>{s.icon}</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: s.color, letterSpacing: "0.12em", marginBottom: 8 }}>STEP {s.num}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontSize: "0.84rem", color: "#64748b", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   AI DEMO SECTION
════════════════════════════════════════════════════════════ */
function AIDemoSection() {
  const SAMPLE_NOTES = `Client: NovaCare Health | Contact: Dr. Emily Park
Meeting: Product Discovery Call | Duration: 45 min

Dr. Park expressed strong interest in the patient management module.
Main concern is HIPAA compliance and data sovereignty.
Budget is pre-approved at $350K for Q3.
Currently evaluating 3 vendors including us.
Wants a security-focused demo by June 18.
CFO needs to sign off — arrange intro call.
Competitor weakness: slow support SLA.`;

  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const mockAnalyze = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        summary: "NovaCare Health discovery call reveals strong purchase intent. Dr. Park is aligned with the solution but requires HIPAA compliance assurance. Budget ($350K) is approved. Key next step: arrange a security demo before June 18 and schedule a CFO intro call.",
        items: ["Schedule HIPAA security demo — Jun 18", "Send HIPAA compliance documentation pack", "Arrange CFO introduction call", "Prepare competitive comparison vs. slow-SLA rival"],
        sentiment: "Positive · 84%",
        risk: "Low — Minor timeline pressure",
      });
      setLoading(false);
    }, 2200);
  };

  return (
    <section style={{ padding: "100px 5vw", background: "linear-gradient(180deg, #f5f3ff 0%, #eff6ff 100%)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.20)", marginBottom: 18 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase" }}>Try It Live</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            See the AI in action
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
            Paste any meeting notes and watch the AI agents work in real time.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }} className="demo-grid">
          {/* Input */}
          <div style={{ background: "white", borderRadius: 22, border: "1.5px solid #e2e8f0", padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem" }}>📋</span> Meeting Notes Input
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={14}
              style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", fontFamily: "Outfit,sans-serif", fontSize: "0.85rem", color: "#475569", lineHeight: 1.7, resize: "vertical", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "rgba(124,58,237,0.50)"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            <button onClick={mockAnalyze} disabled={loading || !notes.trim()}
              style={{ marginTop: 14, width: "100%", padding: "13px", borderRadius: 14, border: "none", background: loading ? "#a78bfa" : "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Outfit,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 6px 20px rgba(124,58,237,0.30)" }}>
              {loading ? (
                <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/> Analyzing with AI…</>
              ) : (
                <><svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Analyze with AI</>
              )}
            </button>
          </div>
          {/* Output */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!result && !loading && (
              <div style={{ background: "white", borderRadius: 22, border: "1.5px dashed #ddd6fe", padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 14 }}>🤖</div>
                <div style={{ fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>AI Analysis Ready</div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Click Analyze to see the results appear here</div>
              </div>
            )}
            {loading && (
              <div style={{ background: "white", borderRadius: 22, border: "1.5px solid #e2e8f0", padding: 40, textAlign: "center" }}>
                <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 20px" }}>
                  {[0,1,2].map(i => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.30)", animation: `pulseRing 2s ease ${i*0.4}s infinite` }}/>)}
                  <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "grid", placeItems: "center" }}>
                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>AI Agents Processing…</div>
                <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Running sentiment · risk · summary · actions</div>
              </div>
            )}
            {result && (
              <>
                <DemoResultCard icon="📝" title="AI Summary" color="#7c3aed"><p style={{ fontSize: "0.86rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>{result.summary}</p></DemoResultCard>
                <DemoResultCard icon="✅" title="Action Items" color="#10b981">
                  {result.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.25)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                        <svg width="9" height="9" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <span style={{ fontSize: "0.83rem", color: "#475569" }}>{item}</span>
                    </div>
                  ))}
                </DemoResultCard>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <DemoResultCard icon="😊" title="Sentiment" color="#0ea5e9"><div style={{ fontWeight: 700, color: "#10b981", fontSize: "1rem" }}>{result.sentiment}</div></DemoResultCard>
                  <DemoResultCard icon="⚠️" title="Risk Level" color="#f59e0b"><div style={{ fontWeight: 700, color: "#10b981", fontSize: "0.88rem" }}>{result.risk}</div></DemoResultCard>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoResultCard({ icon, title, color, children }) {
  return (
    <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #f1f5f9", padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ fontSize: "1rem" }}>{icon}</span>{title}
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: color }}/>
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { name: "Sarah Jenkins", role: "Product Manager", company: "Atlassian", avatar: "SJ", color: "#7c3aed", stars: 5, text: "MeetPrep AI saves me at least 5 hours every single week. The action item extraction is scarily accurate — it catches things even I miss." },
  { name: "David Chen", role: "Enterprise Sales Director", company: "Salesforce", avatar: "DC", color: "#0ea5e9", stars: 5, text: "I close deals faster now. The client readiness score alone has changed how I prioritize follow-ups. This is what CRM should have been." },
  { name: "Emily Rodriguez", role: "Founder & CEO", company: "NovaTech", avatar: "ER", color: "#10b981", stars: 5, text: "It's like having a chief of staff in every single meeting. The automated follow-up email draft alone is worth 10x the price." },
  { name: "Marcus Thompson", role: "Head of Partnerships", company: "Notion", avatar: "MT", color: "#f59e0b", stars: 5, text: "The risk analysis feature flagged a budget concern I completely missed. Saved a $200K deal. Can't imagine working without it." },
  { name: "Priya Patel", role: "Consulting Partner", company: "McKinsey", avatar: "PP", color: "#f43f5e", stars: 5, text: "We rolled this out to our entire consulting practice. The AI-generated reports are indistinguishable from human-written ones — but 100x faster." },
  { name: "Alex Kim", role: "VP of Customer Success", company: "HubSpot", avatar: "AK", color: "#14b8a6", stars: 5, text: "Sentiment analysis helps me coach my team on client engagement. The data-driven insights are something no other tool provides." },
];

function TestimonialsSection() {
  return (
    <section style={{ padding: "100px 5vw", background: "white", overflow: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)", marginBottom: 18 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#d97706", letterSpacing: "0.08em", textTransform: "uppercase" }}>Testimonials</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Loved by 2,400+ professionals
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
            From startup founders to Fortune 500 executives — here's what they say.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ padding: "28px 24px", borderRadius: 22, border: "1.5px solid #f1f5f9", background: "#fafbff", transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = `${t.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#f1f5f9"; }}>
              <div style={{ display: "flex", gap: 2, color: "#f59e0b", marginBottom: 14 }}>{"★".repeat(t.stars)}</div>
              <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.75, margin: "0 0 20px", fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`, display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.82rem", color: "white", flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{t.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   PRICING
════════════════════════════════════════════════════════════ */
const PLANS = [
  {
    name: "Starter", price: "0", period: "/mo", color: "#64748b", popular: false,
    desc: "Perfect for individuals exploring AI meeting tools.",
    features: ["5 meetings/month", "AI Summary & Action Items", "Basic follow-up email", "7-day history", "Email support"],
    missing: ["Risk & Sentiment Analysis", "Super Agent Mode", "PDF Export", "API Access"],
    cta: "Get Started Free",
  },
  {
    name: "Pro", price: "19", period: "/mo", color: "#7c3aed", popular: true,
    desc: "For professionals who run meetings that close deals.",
    features: ["Unlimited meetings", "All 9 AI capabilities", "Risk & Sentiment Analysis", "Super Agent Mode", "PDF Report Export", "Unlimited history", "Priority support", "CRM-ready exports"],
    missing: [],
    cta: "Start 14-Day Free Trial",
  },
  {
    name: "Enterprise", price: "Custom", period: "", color: "#0f172a", popular: false,
    desc: "For teams and companies that run on meetings.",
    features: ["Everything in Pro", "Team workspace", "SSO & SAML", "SOC2 compliance", "Custom AI training", "Dedicated account manager", "SLA guarantee", "API & Webhooks"],
    missing: [],
    cta: "Contact Sales",
  },
];

function PricingSection() {
  const [annual, setAnnual] = useState(false);
  return (
    <section id="pricing" style={{ padding: "100px 5vw", background: "linear-gradient(180deg, #fafbff 0%, white 100%)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", marginBottom: 18 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pricing</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: 520, margin: "0 auto 28px" }}>No hidden fees. Cancel anytime. Start free today.</p>
          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#f1f5f9", borderRadius: 99, padding: "5px 8px" }}>
            <button onClick={() => setAnnual(false)} style={{ padding: "8px 20px", borderRadius: 99, border: "none", background: !annual ? "white" : "transparent", color: !annual ? "#0f172a" : "#64748b", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", boxShadow: !annual ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s", fontFamily: "Outfit,sans-serif" }}>Monthly</button>
            <button onClick={() => setAnnual(true)} style={{ padding: "8px 20px", borderRadius: 99, border: "none", background: annual ? "white" : "transparent", color: annual ? "#0f172a" : "#64748b", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", boxShadow: annual ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s", fontFamily: "Outfit,sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              Annual
              <span style={{ padding: "2px 7px", borderRadius: 99, background: "#dcfce7", color: "#16a34a", fontSize: "0.7rem", fontWeight: 700 }}>-20%</span>
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "start" }} className="pricing-grid">
          {PLANS.map((plan, i) => {
            const price = plan.price === "Custom" ? "Custom" : annual && plan.price !== "0" ? String(Math.floor(Number(plan.price) * 0.8)) : plan.price;
            return (
              <div key={i} style={{ borderRadius: 24, border: `1.5px solid ${plan.popular ? "#7c3aed40" : "#e2e8f0"}`, background: plan.popular ? "linear-gradient(160deg, #7c3aed, #4f46e5)" : "white", padding: 28, position: "relative", transform: plan.popular ? "scale(1.03)" : "scale(1)", boxShadow: plan.popular ? "0 20px 60px rgba(124,58,237,0.25)" : "none", transition: "all 0.3s" }}>
                {plan.popular && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", padding: "5px 18px", borderRadius: 99, background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "white", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 12px rgba(245,158,11,0.35)", whiteSpace: "nowrap" }}>✨ Most Popular</div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: plan.popular ? "white" : "#0f172a", marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ fontSize: "0.84rem", color: plan.popular ? "rgba(255,255,255,0.70)" : "#64748b", marginBottom: 20 }}>{plan.desc}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    {price !== "Custom" && <span style={{ fontSize: "1.2rem", fontWeight: 700, color: plan.popular ? "rgba(255,255,255,0.8)" : "#64748b" }}>$</span>}
                    <span style={{ fontSize: "3rem", fontWeight: 900, color: plan.popular ? "white" : "#0f172a", lineHeight: 1 }}>{price}</span>
                    {plan.period && <span style={{ fontSize: "0.9rem", color: plan.popular ? "rgba(255,255,255,0.6)" : "#94a3b8", fontWeight: 500 }}>{plan.period}</span>}
                  </div>
                </div>
                <button style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: plan.popular ? "white" : "linear-gradient(135deg,#7c3aed,#4f46e5)", color: plan.popular ? "#7c3aed" : "white", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", marginBottom: 24, fontFamily: "Outfit,sans-serif", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>{plan.cta}</button>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <svg width="16" height="16" fill="none" stroke={plan.popular ? "rgba(255,255,255,0.9)" : "#10b981"} strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span style={{ fontSize: "0.84rem", color: plan.popular ? "rgba(255,255,255,0.85)" : "#475569" }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: 0.4 }}>
                      <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      <span style={{ fontSize: "0.84rem", color: "#94a3b8", textDecoration: "line-through" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FAQ
════════════════════════════════════════════════════════════ */
const FAQS = [
  { q: "How accurate is the AI analysis?", a: "Our AI runs on Meta's LLaMA 3.3 70B model, one of the most powerful open-source LLMs available. In internal testing, our action item extraction is 94% accurate and meeting summaries score 4.8/5 from professional users." },
  { q: "Is my meeting data private and secure?", a: "Absolutely. All data is encrypted in transit and at rest. We never train on your data. Enterprise plans come with SOC2 compliance and dedicated infrastructure." },
  { q: "Does it work with any meeting platform?", a: "Yes. MeetPrep AI works with any notes or transcription text — Zoom, Google Meet, Microsoft Teams, in-person meetings, voice memos, or anything else. Just paste the text." },
  { q: "What's the Super Agent Mode?", a: "Super Agent simultaneously runs 10+ specialized AI agents on your meeting notes: summary, action items, risk analysis, sentiment, client readiness score, complexity analysis, meeting health, recommendations, task assignment, and follow-up email — all in one click." },
  { q: "Can I try it before paying?", a: "Yes! The Starter plan is completely free forever with 5 meetings/month. Pro also has a 14-day free trial with no credit card required." },
  { q: "How fast does it analyze a meeting?", a: "Typically 3–8 seconds for a standard analysis. Super Agent mode (10+ AI analyses) takes 15–30 seconds depending on note length." },
];

function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{ padding: "100px 5vw", background: "white" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)", marginBottom: 18 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0ea5e9", letterSpacing: "0.08em", textTransform: "uppercase" }}>FAQ</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: "1rem", color: "#64748b", margin: 0 }}>Everything you need to know about MeetPrep AI.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setOpen(open === i ? null : i)}
              style={{ borderRadius: 16, border: `1.5px solid ${open === i ? "rgba(124,58,237,0.25)" : "#f1f5f9"}`, background: open === i ? "#faf5ff" : "white", overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}>
              <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <span style={{ fontWeight: 600, fontSize: "0.95rem", color: open === i ? "#7c3aed" : "#0f172a" }}>{f.q}</span>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: open === i ? "#7c3aed" : "#f1f5f9", display: "grid", placeItems: "center", flexShrink: 0, transition: "all 0.25s" }}>
                  <svg width="14" height="14" fill="none" stroke={open === i ? "white" : "#64748b"} strokeWidth="2.5" viewBox="0 0 24 24" style={{ transition: "transform 0.25s", transform: open === i ? "rotate(180deg)" : "rotate(0)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              {open === i && (
                <div style={{ padding: "0 22px 18px" }}>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569", lineHeight: 1.75 }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   CTA BANNER
════════════════════════════════════════════════════════════ */
function CTASection({ onRegister }) {
  return (
    <section style={{ padding: "80px 5vw", background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-30%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", bottom: "-30%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }}/>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🚀</div>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "white", margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          Ready to transform your meetings?
        </h2>
        <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.80)", lineHeight: 1.7, margin: "0 0 36px" }}>
          Join 2,400+ professionals who save 5+ hours every week.<br/>Free forever plan available. No credit card required.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onRegister}
            style={{ padding: "15px 36px", borderRadius: 14, border: "none", background: "white", color: "#7c3aed", fontWeight: 800, fontSize: "1rem", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.20)", transition: "all 0.25s", fontFamily: "Outfit,sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            Start Free — No Credit Card
          </button>
          <button style={{ padding: "15px 32px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.10)", color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer", backdropFilter: "blur(8px)", transition: "all 0.25s", fontFamily: "Outfit,sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.20)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            View Live Demo
          </button>
        </div>
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {["✓ Free forever plan", "✓ No credit card", "✓ Setup in 60 seconds", "✓ Cancel anytime"].map((t, i) => (
            <span key={i} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════════════════════ */
function Footer({ onLogin, onRegister }) {
  const cols = [
    { title: "Product", links: ["Features", "How It Works", "Pricing", "Changelog", "Roadmap"] },
    { title: "Use Cases", links: ["Sales Teams", "Consulting", "Product Managers", "Founders", "Legal Teams"] },
    { title: "Company", links: ["About Us", "Blog", "Careers", "Press Kit", "Contact"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"] },
  ];
  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "72px 5vw 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 60 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "grid", placeItems: "center", boxShadow: "0 4px 14px rgba(124,58,237,0.40)" }}>
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "white" }}>MeetPrep AI</span>
            </div>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.75, color: "#64748b", maxWidth: 260, margin: "0 0 22px" }}>
              The AI-powered platform that transforms your raw meeting notes into complete intelligence reports in seconds.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Twitter/X", path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
                { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                { label: "GitHub", path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" },
              ].map((s, i) => (
                <a key={i} href="#" title={s.label}
                  style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", transition: "all 0.2s", color: "#64748b" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.25)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.40)"; e.currentTarget.style.color = "#a78bfa"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "#64748b"; }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={s.path}/></svg>
                </a>
              ))}
            </div>
          </div>
          {/* Link Columns */}
          {cols.map((col, i) => (
            <div key={i}>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#f1f5f9", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>{col.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link, j) => (
                  <a key={j} href="#" style={{ fontSize: "0.88rem", color: "#64748b", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#a78bfa"}
                    onMouseLeave={e => e.target.style.color = "#64748b"}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <span style={{ fontSize: "0.84rem", color: "#475569" }}>© 2026 MeetPrep AI. All rights reserved. Built with ❤️ and LLaMA 3.3</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onLogin} style={{ padding: "8px 18px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.10)", background: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer", fontFamily: "Outfit,sans-serif", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.40)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}>
              Sign In
            </button>
            <button onClick={onRegister} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════
   ROOT HOME PAGE
════════════════════════════════════════════════════════════ */
function Home() {
  const navigate = useNavigate();
  const onLogin    = () => navigate("/login");
  const onRegister = () => navigate("/register");

  // Scroll progress bar
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const h = () => {
      const el = document.documentElement;
      setScroll((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ fontFamily: "Outfit, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
      {/* Scroll progress */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 3, width: `${scroll}%`, background: "linear-gradient(90deg, #7c3aed, #0ea5e9)", zIndex: 200, transition: "width 0.1s" }}/>

      <LandingNav onLogin={onLogin} onRegister={onRegister} />
      <HeroSection onRegister={onRegister} onLogin={onLogin} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AIDemoSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection onRegister={onRegister} />
      <Footer onLogin={onLogin} onRegister={onRegister} />

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ position: "fixed", bottom: 28, right: 28, width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", color: "white", cursor: "pointer", display: scroll > 20 ? "grid" : "none", placeItems: "center", boxShadow: "0 6px 20px rgba(124,58,237,0.35)", zIndex: 99, transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
      </button>
    </div>
  );
}

export default Home;
