import { useState, useEffect } from "react";
import api, { API_URL } from "../../services/api";
import { useToast } from "../../context/ToastContext";

// ── Loader ────────────────────────────────────────────────────
function AILoader() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:"24px" }}>
      <div style={{ position:"relative", width:"80px", height:"80px" }}>
        {[0,1,2].map(i => (
          <div key={i} className="pulse-ring" style={{
            position:"absolute", inset:0, borderRadius:"50%",
            border:"2px solid rgba(124,58,237,0.30)",
            animation:`pulseRing 2s ease ${i*0.5}s infinite`,
          }}/>
        ))}
        <div style={{ position:"absolute", inset:18, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"grid", placeItems:"center", boxShadow:"0 0 24px rgba(124,58,237,0.45)" }}>
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--text-primary)" }}>AI Pipeline Running…</div>
        <div style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:6 }}>
          Generating summary · Action items · Email draft
        </div>
      </div>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-ghost" style={{ padding:"6px 14px", fontSize:"0.78rem" }}>
      {copied
        ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Copied!</>
        : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy</>
      }
    </button>
  );
}

const MOCK_RESULT = {
  success: true,
  client_name: "NovaCare Health",
  meeting_title: "Discovery Call",
  summary: "The discovery call revealed strong interest in the patient management module. Dr. Park emphasized HIPAA compliance as the top priority. Budget for Q3 has been pre-approved pending technical review.",
  action_items: [
    "Schedule security & compliance demo by Jun 18",
    "Prepare HIPAA compliance documentation",
    "Send ROI projection report to Dr. Park",
    "Loop in legal team for data sovereignty review",
  ],
  email: `Subject: Follow-up — Discovery Call with NovaCare Health\n\nDear Dr. Park,\n\nThank you for your time today. We're excited about the opportunity to support NovaCare Health's patient management goals.\n\nAs discussed, I'll coordinate a security-focused demo by June 18th and share our HIPAA compliance documentation beforehand.\n\nLooking forward to the next steps.\n\nBest regards`,
};

// ── Main Page ─────────────────────────────────────────────────
export default function AIAnalysis() {
  const toast = useToast();

  const [meetings,   setMeetings]   = useState([]);
  const [clients,    setClients]    = useState({});        // { id: company_name }
  const [meetingId,  setMeetingId]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);

  // load meetings + clients on mount
  useEffect(() => {
    Promise.all([
      api.get("/api/meetings/"),
      api.get("/api/clients/"),
    ]).then(([mr, cr]) => {
      const cmap = {};
      cr.data.forEach(c => { cmap[c.id] = c.company_name; });
      setClients(cmap);
      setMeetings(mr.data);
      if (mr.data.length) setMeetingId(String(mr.data[0].id));
    }).catch(() => {
      // mock fallback
      setMeetings([{ id:1, title:"Discovery Call", client_id:1 }]);
      setClients({ 1:"NovaCare Health" });
      setMeetingId("1");
    });
  }, []);

  const analyze = async () => {
    if (!meetingId) { toast("Please select a meeting", "warning"); return; }
    try {
      setLoading(true);
      setResult(null);
      const r = await api.post("/api/ai/analyze-meeting", { meeting_id: Number(meetingId) });
      setResult(r.data);
      const newCount = r.data.new_action_items_count ?? r.data.action_items?.length ?? 0;
      if (newCount > 0) {
        toast(`Analysis complete! ${newCount} new action item${newCount > 1 ? "s" : ""} saved.`, "success");
      } else {
        toast("Analysis complete! No new action items (already saved).", "info");
      }
    } catch {
      toast("Backend offline — showing mock analysis.", "warning");
      await new Promise(res => setTimeout(res, 1800));
      setResult(MOCK_RESULT);
    } finally {
      setLoading(false);
    }
  };

  // fixed: downloadPDF is declared AFTER hooks (no hoisting bug)
  const downloadPDF = () => {
    if (!meetingId) { toast("Please select a meeting first", "warning"); return; }
    window.open(`${API_URL}/api/reports/download-report/${meetingId}`, "_blank");
  };

  const selectedMeeting = meetings.find(m => String(m.id) === String(meetingId));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"28px" }}>
        <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800, color:"var(--text-primary)" }}>AI Meeting Analysis</h1>
        <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>
          Powered by <span style={{ color:"#a78bfa", fontWeight:600 }}>LLaMA 3.3 · 70B</span> multi-agent pipeline
        </p>
      </div>

      {/* ── Input Card ── */}
      <div className="glass" style={{ padding:"24px", marginBottom:"24px" }}>
        <div style={{ display:"flex", gap:16, alignItems:"flex-end", flexWrap:"wrap" }}>

          {/* Meeting dropdown */}
          <div style={{ flex:1, minWidth:260 }}>
            <label style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              Select Meeting
            </label>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", opacity:0.5 }}
                width="15" height="15" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <select
                value={meetingId}
                onChange={e => { setMeetingId(e.target.value); setResult(null); }}
                className="input-glass"
                style={{ paddingLeft:42, cursor:"pointer" }}
                disabled={loading}
              >
                {meetings.length === 0 && <option value="">Loading meetings…</option>}
                {meetings.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} — {clients[m.client_id] || `Client ${m.client_id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Analyze button */}
          <button
            className="btn-primary"
            onClick={analyze}
            disabled={loading || !meetingId}
            style={{ padding:"12px 28px", opacity: loading ? 0.75 : 1, flexShrink:0 }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            {loading ? "Analyzing…" : "Analyze Meeting"}
          </button>

          {/* PDF download — only when result exists */}
          {result?.success && (
            <button
              onClick={downloadPDF}
              className="btn-ghost"
              style={{ padding:"12px 20px", flexShrink:0 }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Download PDF
            </button>
          )}
        </div>

        {/* Selected meeting info strip */}
        {selectedMeeting && !loading && (
          <div style={{ marginTop:16, padding:"10px 14px", borderRadius:10, background:"var(--bg-base)", border:"1px solid var(--border)", display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--violet)" }}/>
              <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)", fontWeight:500 }}>{selectedMeeting.title}</span>
            </div>
            <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>
              Client: <span style={{ color:"var(--text-primary)", fontWeight:600 }}>{clients[selectedMeeting.client_id] || `Client ${selectedMeeting.client_id}`}</span>
            </div>
            {selectedMeeting.meeting_date && (
              <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>
                Date: <span style={{ color:"var(--text-primary)", fontWeight:600 }}>
                  {new Date(selectedMeeting.meeting_date).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                </span>
              </div>
            )}
            <div style={{ marginLeft:"auto", fontSize:"0.72rem", color:"var(--text-muted)", background:"var(--bg-surface)", padding:"3px 10px", borderRadius:99, border:"1px solid var(--border)" }}>
              ID: #{meetingId}
            </div>
          </div>
        )}
      </div>

      {/* ── Loader ── */}
      {loading && (
        <div className="glass" style={{ marginBottom:"24px" }}>
          <AILoader/>
        </div>
      )}

      {/* ── Results ── */}
      {result?.success && !loading && (
        <div style={{ display:"grid", gap:16 }}>

          {/* Meeting Header Banner */}
          <div className="glass" style={{
            padding:"22px 24px", display:"flex", gap:16, alignItems:"center",
            background:"linear-gradient(135deg,rgba(124,58,237,0.10),rgba(79,70,229,0.06))",
            borderColor:"rgba(124,58,237,0.22)",
          }}>
            <div style={{ width:50, height:50, borderRadius:14, background:"rgba(124,58,237,0.18)", display:"grid", placeItems:"center", flexShrink:0 }}>
              <svg width="22" height="22" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:"1.1rem", color:"var(--text-primary)" }}>{result.meeting_title}</div>
              <div style={{ fontSize:"0.84rem", color:"#a78bfa", marginTop:3, fontWeight:600 }}>{result.client_name}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:99, background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)" }}>
              <svg width="13" height="13" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span style={{ fontSize:"0.76rem", fontWeight:700, color:"#10b981" }}>Analysis Complete</span>
            </div>
          </div>

          {/* Summary + Action Items */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            <div className="glass" style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--text-primary)", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:28, height:28, borderRadius:8, background:"rgba(124,58,237,0.12)", display:"grid", placeItems:"center", fontSize:"0.9rem" }}>📝</span>
                AI Summary
              </div>
              <p style={{ margin:0, color:"var(--text-secondary)", fontSize:"0.88rem", lineHeight:1.8 }}>{result.summary}</p>
            </div>

            <div className="glass" style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--text-primary)", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:28, height:28, borderRadius:8, background:"rgba(16,185,129,0.12)", display:"grid", placeItems:"center", fontSize:"0.9rem" }}>✅</span>
                Action Items
                <span style={{ marginLeft:"auto", fontSize:"0.7rem", fontWeight:700, color:"#10b981", background:"rgba(16,185,129,0.10)", padding:"2px 8px", borderRadius:99, border:"1px solid rgba(16,185,129,0.20)" }}>
                  {(result.action_items || []).length} items
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {(result.action_items || []).map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(16,185,129,0.14)", border:"1px solid rgba(16,185,129,0.28)", display:"grid", placeItems:"center", flexShrink:0, marginTop:1 }}>
                      <svg width="10" height="10" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span style={{ fontSize:"0.84rem", color:"var(--text-secondary)", lineHeight:1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Follow-up Email */}
          <div className="glass" style={{ padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--text-primary)", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:28, height:28, borderRadius:8, background:"rgba(14,165,233,0.12)", display:"grid", placeItems:"center", fontSize:"0.9rem" }}>📧</span>
                Follow-up Email Draft
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <CopyButton text={result.email || ""}/>
                <button onClick={downloadPDF} className="btn-primary" style={{ padding:"6px 16px", fontSize:"0.8rem" }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Download PDF
                </button>
              </div>
            </div>
            <pre style={{
              margin:0, whiteSpace:"pre-wrap",
              fontFamily:"var(--font-main)", fontSize:"0.86rem",
              color:"var(--text-secondary)", lineHeight:1.8,
              background:"var(--bg-base)", borderRadius:12, padding:18,
              border:"1px solid var(--border)",
            }}>{result.email}</pre>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!result && !loading && (
        <div className="glass" style={{ padding:"60px 40px", textAlign:"center" }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"rgba(124,58,237,0.10)", display:"grid", placeItems:"center", margin:"0 auto 20px", border:"1px solid rgba(124,58,237,0.20)" }}>
            <svg width="28" height="28" fill="none" stroke="#a78bfa" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/>
            </svg>
          </div>
          <div style={{ fontWeight:700, fontSize:"1.1rem", color:"var(--text-primary)" }}>Select a meeting and click Analyze</div>
          <div style={{ color:"var(--text-muted)", fontSize:"0.86rem", marginTop:8, maxWidth:400, margin:"8px auto 0" }}>
            The AI pipeline will generate a summary, extract action items, and draft a professional follow-up email.
          </div>
        </div>
      )}
    </div>
  );
}
