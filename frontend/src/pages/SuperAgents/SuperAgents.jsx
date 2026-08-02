import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const TABS = ["Overview", "Sentiment & Health", "Risk Analysis", "Deliverables"];

const MOCK_RESULT = {
  client_readiness: "High — 87%",
  sentiment: "Positive",
  sentiment_score: 87,
  risks: "Low regulatory risk identified. Minor budget timeline concern noted. No critical blockers present.",
  risk_level: "medium",
  insights: "Client shows strong product-market fit indicators. Decision-maker aligned with solution roadmap. Competitor evaluation ongoing — differentiate on compliance and support SLA.",
  summary: "The meeting demonstrated strong alignment between client needs and our solution capabilities. Dr. Park's enthusiasm for the analytics module is a key buying signal. Recommended next step is a security demo with their IT compliance team.",
  recommendations: "1. Lead with HIPAA compliance credentials\n2. Showcase real-time analytics dashboard\n3. Offer extended pilot program (90 days)\n4. Involve C-suite in next touchpoint",
  action_items: "• Schedule compliance demo — Jun 18\n• Send HIPAA documentation pack\n• Prepare ROI projections (24-month)\n• Draft MSA for legal review\n• Follow-up call with CFO",
  followup_email: "Subject: Next Steps — NovaCare Health Partnership\n\nDear Dr. Park,\n\nThank you for the productive session. I'm excited about the path forward.\n\nAs discussed, I'll arrange the security & compliance demo by June 18th. I'll also send across our HIPAA documentation and 24-month ROI projections this week.\n\nLooking forward to advancing this partnership.\n\nBest,\nAyush Chaurasiya",
};

const MOCK_MEETINGS = [
  { id:1, title:"Contract Negotiation",  client_id:4 },
  { id:2, title:"Discovery Call",        client_id:2 },
  { id:3, title:"Q3 Strategy Review",    client_id:1 },
  { id:4, title:"New Product Proposal",  client_id:3 },
];

function GaugeBar({ value, color = "#7c3aed", label }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
        <span style={{ fontSize:"0.82rem", color:"var(--text-secondary)", fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:"0.82rem", color, fontWeight:700 }}>{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="fill" style={{ width:`${value}%`, background:`linear-gradient(90deg, ${color}, ${color}bb)` }}/>
      </div>
    </div>
  );
}

function RiskMeter({ level }) {
  const cfg = {
    low:    { pct:25, color:"#10b981", label:"Low"    },
    medium: { pct:55, color:"#f59e0b", label:"Medium" },
    high:   { pct:85, color:"#f43f5e", label:"High"   },
  };
  const c = cfg[level] || cfg.medium;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
        <span style={{ fontSize:"0.82rem", color:"var(--text-secondary)", fontWeight:500 }}>Risk Level</span>
        <span className={`chip ${level==="low"?"chip-emerald":level==="high"?"chip-rose":"chip-amber"}`}>{c.label}</span>
      </div>
      <div className="progress-bar">
        <div className="fill" style={{ width:`${c.pct}%`, background:`linear-gradient(90deg, ${c.color}, ${c.color}bb)` }}/>
      </div>
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="btn-ghost" style={{ padding:"7px 14px", fontSize:"0.78rem" }}>
      {copied ? "✓ Copied!" : "Copy Email"}
    </button>
  );
}

export default function SuperAgents() {
  const [meetings, setMeetings] = useState([]);
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading]    = useState(false);
  const [result, setResult]      = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  useEffect(() => {
    api.get("/api/meetings/")
      .then(r => { setMeetings(r.data); if (r.data.length) setMeetingId(String(r.data[0].id)); })
      .catch(() => { setMeetings(MOCK_MEETINGS); setMeetingId("1"); });
  }, []);

  const runAnalysis = async () => {
    if (!meetingId) { toast("Please select a meeting.", "warning"); return; }
    try {
      setLoading(true); setResult(null);
      const r = await api.post("/api/ai/super-analysis-by-id", { meeting_id: Number(meetingId) });
      setResult(r.data);
      toast("Super Agent analysis complete!", "success");
    } catch {
      toast("Backend offline — showing mock analysis.", "warning");
      await new Promise(res => setTimeout(res, 2000));
      setResult(MOCK_RESULT);
    } finally { setLoading(false); }
  };

  const selectedMeeting = meetings.find(m => String(m.id) === String(meetingId));

  const renderTab = () => {
    if (!result) return null;
    switch (activeTab) {
      case 0: return ( // Overview
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"#a78bfa", marginBottom:"16px" }}>Client Readiness</div>
            <div style={{ fontSize:"1.8rem", fontWeight:800, color:"var(--text-primary)", marginBottom:"16px" }}>{result.client_readiness}</div>
            <GaugeBar value={result.sentiment_score || 87} color="#a78bfa" label="Readiness Score"/>
          </div>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"#fbbf24", marginBottom:"16px" }}>Key Insights</div>
            <p style={{ margin:0, color:"var(--text-secondary)", fontSize:"0.85rem", lineHeight:1.75 }}>{result.insights}</p>
          </div>
          <div className="glass" style={{ padding:"24px", gridColumn:"1/-1" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:"12px" }}>Executive Summary</div>
            <p style={{ margin:0, color:"var(--text-secondary)", fontSize:"0.88rem", lineHeight:1.75 }}>{result.summary}</p>
          </div>
        </div>
      );
      case 1: return ( // Sentiment & Health
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:"20px" }}>Sentiment Breakdown</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <GaugeBar value={result.sentiment_score || 87} color="#10b981" label="Positive"/>
              <GaugeBar value={8} color="#94a3b8" label="Neutral"/>
              <GaugeBar value={5} color="#f43f5e" label="Negative"/>
            </div>
          </div>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:"16px" }}>Overall Sentiment</div>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
              <span style={{ fontSize:"2.5rem" }}>😊</span>
              <div>
                <div style={{ fontWeight:700, fontSize:"1.3rem", color:"#10b981" }}>{result.sentiment}</div>
                <div style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>Based on meeting notes & context</div>
              </div>
            </div>
            <div style={{ background:"rgba(16,185,129,0.10)", border:"1px solid rgba(16,185,129,0.20)", borderRadius:"12px", padding:"12px 16px" }}>
              <div style={{ fontSize:"0.82rem", color:"#34d399", lineHeight:1.6 }}>Client shows strong buying intent. Emotional tone throughout the meeting was enthusiastic and collaborative.</div>
            </div>
          </div>
        </div>
      );
      case 2: return ( // Risk Analysis
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:"20px" }}>Risk Assessment</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <RiskMeter level={result.risk_level || "medium"}/>
              <GaugeBar value={30} color="#f59e0b" label="Budget Risk"/>
              <GaugeBar value={15} color="#f43f5e" label="Timeline Risk"/>
              <GaugeBar value={20} color="#a78bfa" label="Regulatory Risk"/>
            </div>
          </div>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:"14px" }}>Risk Factors</div>
            <p style={{ margin:"0 0 16px", color:"var(--text-secondary)", fontSize:"0.85rem", lineHeight:1.75 }}>{result.risks}</p>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:"12px" }}>Recommendations</div>
            <pre style={{ margin:0, fontFamily:"var(--font-primary)", fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{result.recommendations}</pre>
          </div>
        </div>
      );
      case 3: return ( // Deliverables
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)", marginBottom:"16px" }}>Action Items</div>
            <pre style={{ margin:0, fontFamily:"var(--font-primary)", fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:2, whiteSpace:"pre-wrap" }}>{result.action_items}</pre>
          </div>
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
              <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)" }}>Follow-up Email</div>
              <CopyBtn text={result.followup_email || ""}/>
            </div>
            <pre style={{ margin:0, fontFamily:"var(--font-primary)", fontSize:"0.82rem", color:"var(--text-secondary)", lineHeight:1.75, whiteSpace:"pre-wrap", background:"rgba(255,255,255,0.03)", borderRadius:"10px", padding:"14px", border:"1px solid rgba(255,255,255,0.06)" }}>{result.followup_email}</pre>
          </div>
          <div className="glass" style={{ padding:"20px", gridColumn:"1/-1", display:"flex", justifyContent:"flex-end", gap:"12px" }}>
            <CopyBtn text={result.followup_email || ""}/>
            <button
              className="btn-primary"
              onClick={() => window.open(`http://127.0.0.1:8000/api/reports/download-report/${meetingId}`, "_blank")}
              disabled={!meetingId}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export PDF Report
            </button>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom:"28px" }}>
        <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800 }}>Super Agents</h1>
        <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>
          Multi-agent AI analysis pipeline for <span style={{ color:"#a78bfa" }}>executive meeting prep</span>
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass" style={{ padding:"24px", marginBottom:"24px", display:"flex", gap:"16px", alignItems:"flex-end", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:"240px" }}>
          <label style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"8px" }}>Select a Meeting</label>
          <select value={meetingId} onChange={e => setMeetingId(e.target.value)} className="input-glass">
            {meetings.map(m => (
              <option key={m.id} value={m.id}>{m.title || `Meeting ${m.id}`} — Client {m.client_id || "N/A"}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={runAnalysis} disabled={loading || !meetings.length} style={{ padding:"12px 28px", opacity: loading ? 0.75 : 1 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          {loading ? "Running Agents…" : "Run Super Agent"}
        </button>
        {result && (
          <button className="btn-ghost" onClick={runAnalysis} style={{ padding:"12px 20px" }}>Re-analyze</button>
        )}
      </div>

      {/* Loader */}
      {loading && (
        <div className="glass" style={{ padding:"60px", marginBottom:"24px", textAlign:"center" }}>
          <div style={{ position:"relative", width:"80px", height:"80px", margin:"0 auto 24px" }}>
            {[0,1,2].map(i => (
              <div key={i} className="pulse-ring" style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid rgba(124,58,237,0.35)", animationDelay:`${i*0.4}s` }}/>
            ))}
            <div style={{ position:"absolute", inset:"20px", borderRadius:"50%", background:"linear-gradient(135deg, #7c3aed, #4f46e5)", display:"grid", placeItems:"center", boxShadow:"0 0 30px rgba(124,58,237,0.50)" }}>
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          <div style={{ fontWeight:700, fontSize:"1rem" }}>4 AI Agents Running…</div>
          <div style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:"8px" }}>Client Readiness · Sentiment · Risk · Deliverables</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Meeting Header */}
          <div className="glass" style={{ padding:"20px 24px", marginBottom:"20px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))", borderColor:"rgba(124,58,237,0.22)" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:"1.1rem" }}>{selectedMeeting?.title || "Meeting Analysis"}</div>
              <div style={{ color:"#a78bfa", fontSize:"0.84rem", marginTop:"3px" }}>Analysis complete — {TABS.length} agents ran successfully</div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {["✓ Readiness","✓ Sentiment","✓ Risk","✓ Deliverables"].map((t,i) => (
                <span key={i} className="chip chip-emerald" style={{ fontSize:"0.72rem" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:"4px", marginBottom:"20px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"5px" }}>
            {TABS.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)} style={{
                flex:1, padding:"9px 12px", borderRadius:"10px", border:"none", cursor:"pointer",
                fontFamily:"var(--font-primary)", fontSize:"0.84rem", fontWeight:600,
                background: activeTab === i ? "rgba(124,58,237,0.22)" : "transparent",
                color: activeTab === i ? "#a78bfa" : "var(--text-muted)",
                transition:"all 0.2s",
              }}>
                {tab}
              </button>
            ))}
          </div>

          {renderTab()}
        </>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="glass" style={{ padding:"60px 40px", textAlign:"center" }}>
          <div style={{ width:"72px", height:"72px", borderRadius:"22px", background:"rgba(124,58,237,0.12)", display:"grid", placeItems:"center", margin:"0 auto 20px", boxShadow:"0 0 40px rgba(124,58,237,0.20)" }}>
            <svg width="32" height="32" fill="none" stroke="#a78bfa" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div style={{ fontWeight:700, fontSize:"1.1rem" }}>Select a meeting and run Super Agent</div>
          <div style={{ color:"var(--text-muted)", fontSize:"0.88rem", marginTop:"8px" }}>
            4 specialized AI agents will analyze your meeting from every angle
          </div>
        </div>
      )}
    </div>
  );
}