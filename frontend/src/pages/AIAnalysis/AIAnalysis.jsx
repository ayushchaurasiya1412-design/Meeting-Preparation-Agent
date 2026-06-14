import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

function AILoader() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:"24px" }}>
      <div style={{ position:"relative", width:"80px", height:"80px" }}>
        {[0,1,2].map(i => (
          <div key={i} className="pulse-ring" style={{
            position:"absolute", inset:0,
            borderRadius:"50%",
            border:"2px solid rgba(124,58,237,0.40)",
            animationDelay:`${i*0.4}s`,
            animationDuration:"2s",
          }}/>
        ))}
        <div style={{
          position:"absolute", inset:"20px",
          borderRadius:"50%",
          background:"linear-gradient(135deg, #7c3aed, #4f46e5)",
          display:"grid", placeItems:"center",
          boxShadow:"0 0 30px rgba(124,58,237,0.50)",
        }}>
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/>
          </svg>
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--text-primary)" }}>AI is analyzing your meeting…</div>
        <div style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:"6px" }}>Processing notes, context, and generating insights</div>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-ghost" style={{ padding:"6px 14px", fontSize:"0.78rem" }}>
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}

export default function AIAnalysis() {
  const downloadPDF = () => {

  if (!meetingId) {
    toast("Please enter Meeting ID", "warning");
    return;
  }

  window.open(
    `http://127.0.0.1:8000/api/reports/download-report/${meetingId}`,
    "_blank"
  );
};
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const toast = useToast();

  const analyze = async () => {
    if (!meetingId) { toast("Please enter a Meeting ID", "warning"); return; }
    try {
      setLoading(true); setResult(null);
      const r = await api.post("/api/ai/analyze-meeting", { meeting_id: Number(meetingId) });
      setResult(r.data);
      toast("Analysis complete!", "success");
    } catch {
      toast("Backend offline — showing mock analysis.", "warning");
      setResult({
        success: true,
        client_name: "NovaCare Health",
        meeting_title: "Discovery Call",
        summary: "The discovery call revealed strong interest in the patient management module. Dr. Park emphasized HIPAA compliance as the top priority. The team showed enthusiasm for the analytics dashboard and requested a security-focused demo within the next two weeks. Budget for Q3 has been pre-approved pending technical review.",
        action_items: ["Schedule security & compliance demo by Jun 18","Prepare HIPAA compliance documentation","Send ROI projection report to Dr. Park","Loop in legal team for data sovereignty review"],
        email: `Subject: Follow-up — Discovery Call with NovaCare Health\n\nDear Dr. Park,\n\nThank you for your time today. We're excited about the opportunity to support NovaCare Health's patient management goals.\n\nAs discussed, I'll coordinate a security-focused demo by June 18th and share our HIPAA compliance documentation beforehand.\n\nLooking forward to the next steps.\n\nBest regards,\nAyush Chaurasiya`,
      });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom:"28px" }}>
        <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800 }}>AI Meeting Analysis</h1>
        <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>
          Powered by <span style={{ color:"#a78bfa" }}>multi-agent AI pipeline</span>
        </p>
      </div>

      {/* Input Card */}
      <div className="glass" style={{ padding:"28px", marginBottom:"24px" }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:"14px", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:"220px" }}>
            <label style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:"8px" }}>Meeting ID</label>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", opacity:0.4 }} width="16" height="16" fill="none" stroke="var(--text-secondary)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <input
                type="number" placeholder="Enter Meeting ID (e.g. 1)"
                value={meetingId} onChange={e => setMeetingId(e.target.value)}
                className="input-glass" style={{ paddingLeft:"42px" }}
                onKeyDown={e => e.key === "Enter" && analyze()}
              />
            </div>
          </div>
          <button className="btn-primary" onClick={analyze} disabled={loading} style={{ padding:"12px 28px", opacity: loading ? 0.75 : 1 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            {loading ? "Analyzing…" : "Analyze Meeting"}
          </button>
        </div>
      </div>

      {/* Loader */}
      {loading && <div className="glass" style={{ marginBottom:"24px" }}><AILoader/></div>}

      {/* Results */}
      {result?.success && !loading && (
        <div style={{ display:"grid", gap:"16px" }}>
          {/* Meeting Details */}
          <div className="glass" style={{ padding:"24px", display:"flex", gap:"16px", alignItems:"center", background:"linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))", borderColor:"rgba(124,58,237,0.20)" }}>
            <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"rgba(124,58,237,0.20)", display:"grid", placeItems:"center", flexShrink:0, boxShadow:"0 0 20px rgba(124,58,237,0.30)" }}>
              <svg width="22" height="22" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:"1.1rem", color:"var(--text-primary)" }}>{result.meeting_title}</div>
              <div style={{ fontSize:"0.84rem", color:"#a78bfa", marginTop:"3px" }}>Client: {result.client_name}</div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
            {/* Summary */}
            <div className="glass" style={{ padding:"24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
                <div style={{ fontWeight:700, fontSize:"0.92rem", display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"1rem" }}>📝</span> AI Summary
                </div>
              </div>
              <p style={{ margin:0, color:"var(--text-secondary)", fontSize:"0.88rem", lineHeight:1.75 }}>{result.summary}</p>
            </div>

            {/* Action Items */}
            <div className="glass" style={{ padding:"24px" }}>
              <div style={{ fontWeight:700, fontSize:"0.92rem", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"1rem" }}>✅</span> Action Items
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {(result.action_items || []).map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                    <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.30)", display:"grid", placeItems:"center", flexShrink:0, marginTop:"1px" }}>
                      <svg width="10" height="10" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span style={{ fontSize:"0.85rem", color:"var(--text-secondary)", lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  }}
>
 <button
  onClick={downloadPDF}
  className="btn-primary"
  disabled={!meetingId}
  style={{
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  📄 Download AI Report
</button>
</div>

          {/* Follow-up Email */}
          <div className="glass" style={{ padding:"24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
              <div style={{ fontWeight:700, fontSize:"0.92rem", display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"1rem" }}>📧</span> Follow-up Email Draft
              </div>
              <CopyButton text={result.email || ""} />
            </div>
            <pre style={{
              margin:0, whiteSpace:"pre-wrap", fontFamily:"var(--font-primary)",
              fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:1.75,
              background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"16px",
              border:"1px solid rgba(255,255,255,0.06)",
            }}>{result.email}</pre>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="glass" style={{ padding:"60px 40px", textAlign:"center" }}>
          <div style={{ width:"64px", height:"64px", borderRadius:"20px", background:"rgba(124,58,237,0.12)", display:"grid", placeItems:"center", margin:"0 auto 20px", boxShadow:"0 0 30px rgba(124,58,237,0.20)" }}>
            <svg width="28" height="28" fill="none" stroke="#a78bfa" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/></svg>
          </div>
          <div style={{ fontWeight:700, fontSize:"1.1rem", color:"var(--text-primary)" }}>Ready to analyze</div>
          <div style={{ color:"var(--text-muted)", fontSize:"0.88rem", marginTop:"8px" }}>Enter a Meeting ID above and click Analyze to get AI-powered insights</div>
        </div>
      )}
    </div>
  );
}