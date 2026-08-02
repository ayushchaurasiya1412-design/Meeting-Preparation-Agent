import { useState } from "react";
import { useToast } from "../../context/ToastContext";

/*
  EmailSendModal — reusable modal to send/copy follow-up emails.

  Props:
    emailBody  : string  — pre-filled AI-generated email text
    clientName : string  — recipient name
    onClose    : fn      — close handler
*/
export default function EmailSendModal({ emailBody = "", clientName = "", onClose }) {
  const toast = useToast();

  const [to, setTo]         = useState("");
  const [subject, setSubject] = useState(`Follow-up: Meeting with ${clientName || "you"}`);
  const [body, setBody]     = useState(emailBody);
  const [sending, setSending] = useState(false);
  const [sent, setSent]     = useState(false);
  const [tab, setTab]       = useState("compose"); // compose | preview

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    toast("Email copied to clipboard!", "success");
  };

  const handleSend = async () => {
    if (!to.trim()) { toast("Please enter recipient email", "error"); return; }
    if (!subject.trim()) { toast("Subject is required", "error"); return; }
    setSending(true);
    // Simulate send (real: POST to /api/email/send with smtp config)
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    toast(`Email sent to ${to}!`, "success");
    setTimeout(onClose, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9,#7c3aed)", display:"grid", placeItems:"center" }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"1rem", color:"var(--text-primary)" }}>Send Follow-up Email</div>
              <div style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>AI-generated · ready to send</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:"1.3rem" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--bg-base)", borderRadius:10, padding:4, marginBottom:18 }}>
          {["compose","preview"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"7px", borderRadius:8, border:"none", cursor:"pointer",
              background: tab===t ? "var(--bg-surface)" : "transparent",
              color: tab===t ? "var(--violet)" : "var(--text-muted)",
              fontWeight: tab===t ? 700 : 500, fontSize:"0.82rem",
              boxShadow: tab===t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              fontFamily:"var(--font-main)", transition:"all 0.15s",
            }}>{t === "compose" ? "✏️ Compose" : "👁️ Preview"}</button>
          ))}
        </div>

        {tab === "compose" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>To</label>
              <input className="input-glass" type="email" placeholder="recipient@company.com"
                value={to} onChange={e => setTo(e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Subject</label>
              <input className="input-glass" placeholder="Email subject"
                value={subject} onChange={e => setSubject(e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize:"0.76rem", fontWeight:600, color:"var(--text-muted)", display:"block", marginBottom:5 }}>Message</label>
              <textarea className="input-glass" rows={10} style={{ resize:"vertical", fontFamily:"var(--font-main)", lineHeight:1.7, fontSize:"0.86rem" }}
                value={body} onChange={e => setBody(e.target.value)}/>
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div style={{ background:"var(--bg-base)", borderRadius:14, padding:"20px 22px", border:"1px solid var(--border)", minHeight:280 }}>
            <div style={{ marginBottom:14, paddingBottom:14, borderBottom:"1px solid var(--border)" }}>
              <div style={{ fontSize:"0.76rem", color:"var(--text-muted)" }}>To: <span style={{ color:"var(--text-primary)", fontWeight:600 }}>{to || "—"}</span></div>
              <div style={{ fontSize:"0.76rem", color:"var(--text-muted)", marginTop:4 }}>Subject: <span style={{ color:"var(--text-primary)", fontWeight:600 }}>{subject}</span></div>
            </div>
            <pre style={{ fontFamily:"var(--font-main)", fontSize:"0.86rem", color:"var(--text-secondary)", lineHeight:1.75, margin:0, whiteSpace:"pre-wrap" }}>{body}</pre>
          </div>
        )}

        {/* Footer */}
        <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={handleCopy} className="btn-ghost" style={{ fontSize:"0.82rem", gap:6 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Copy
          </button>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} className="btn-ghost" style={{ fontSize:"0.82rem" }}>Cancel</button>
            <button onClick={handleSend} className="btn-primary" style={{ fontSize:"0.82rem", minWidth:110 }} disabled={sending||sent}>
              {sent ? (
                <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Sent!</>
              ) : sending ? (
                <><span style={{ display:"inline-block", width:13, height:13, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Sending…</>
              ) : (
                <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg> Send Email</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
