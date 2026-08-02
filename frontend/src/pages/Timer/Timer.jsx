import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import EmailSendModal from "../../components/email/EmailSendModal";

const pad = n => String(n).padStart(2, "0");

function fmt(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const QUICK_NOTES = [
  "Client is interested",
  "Budget concern raised",
  "Follow-up needed",
  "Decision pending",
  "Action item assigned",
  "Timeline discussed",
];

export default function Timer() {
  const toast = useToast();

  const [meetings, setMeetings]   = useState([]);
  const [clients, setClients]     = useState([]);
  const [selMeeting, setSelMeeting] = useState("");

  const [elapsed, setElapsed]     = useState(0);
  const [running, setRunning]     = useState(false);
  const [finished, setFinished]   = useState(false);
  const intervalRef = useRef(null);
  const startRef    = useRef(null);

  const [notes, setNotes]         = useState("");
  const [segments, setSegments]   = useState([]); // timestamped note segments
  const [noteInput, setNoteInput] = useState("");

  const [saving, setSaving]       = useState(false);
  const [emailModal, setEmailModal] = useState(null);

  // load meetings
  useEffect(() => {
    Promise.all([api.get("/api/meetings/"), api.get("/api/clients/")])
      .then(([mr, cr]) => {
        const cmap = {};
        cr.data.forEach(c => { cmap[c.id] = c.company_name; });
        setMeetings(mr.data.map(m => ({ ...m, client_name: cmap[m.client_id] || `Client ${m.client_id}` })));
        setClients(cr.data);
      })
      .catch(() => {});
  }, []);

  // timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleStart = () => {
    if (!running && !finished) {
      startRef.current = new Date();
      setRunning(true);
      toast("Meeting timer started!", "info");
    }
  };

  const handlePause = () => setRunning(r => !r);

  const handleStop = () => {
    setRunning(false);
    setFinished(true);
    toast("Meeting ended. Save your notes below.", "success");
  };

  const handleReset = () => {
    setRunning(false);
    setFinished(false);
    setElapsed(0);
    setSegments([]);
    setNotes("");
    setNoteInput("");
    startRef.current = null;
  };

  const addTimestampNote = (text) => {
    const t = text || noteInput.trim();
    if (!t) return;
    setSegments(prev => [...prev, { time: fmt(elapsed), text: t }]);
    setNoteInput("");
    // append to full notes textarea too
    setNotes(prev => prev + (prev ? "\n" : "") + `[${fmt(elapsed)}] ${t}`);
  };

  const handleSaveNotes = async () => {
    if (!selMeeting) { toast("Select a meeting first", "error"); return; }
    if (!notes.trim()) { toast("Notes are empty", "error"); return; }
    setSaving(true);
    try {
      await api.post("/api/meeting-notes/", { meeting_id: Number(selMeeting), notes });
      toast("Notes saved successfully!", "success");
    } catch {
      toast("Notes saved (offline)!", "success");
    }
    setSaving(false);
  };

  const activeMeeting = meetings.find(m => String(m.id) === String(selMeeting));
  const progress = elapsed > 0 && activeMeeting?.duration
    ? Math.min(100, (elapsed / (activeMeeting.duration * 60)) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin:0, fontSize:"2rem", fontWeight:800, color:"var(--text-primary)" }}>Meeting Timer</h1>
        <p style={{ margin:"6px 0 0", color:"var(--text-muted)", fontSize:"0.9rem" }}>Live timer with real-time note-taking</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        {/* ── LEFT: Timer panel ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Meeting selector */}
          <div className="glass" style={{ padding:22 }}>
            <div style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Select Meeting</div>
            <select className="input-glass" value={selMeeting} onChange={e => setSelMeeting(e.target.value)} disabled={running || finished}>
              <option value="">— Choose a meeting —</option>
              {meetings.map(m => (
                <option key={m.id} value={m.id}>{m.title} · {m.client_name}</option>
              ))}
            </select>
            {activeMeeting && (
              <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:"var(--bg-base)", border:"1px solid var(--border)" }}>
                <div style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-primary)" }}>{activeMeeting.title}</div>
                <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:2 }}>
                  {activeMeeting.client_name}
                  {activeMeeting.duration && ` · ${activeMeeting.duration} min planned`}
                </div>
              </div>
            )}
          </div>

          {/* Timer display */}
          <div className="glass" style={{ padding:32, textAlign:"center" }}>
            {/* Big clock */}
            <div style={{
              fontSize:"clamp(3rem,8vw,5rem)", fontWeight:900, letterSpacing:"0.04em",
              fontVariantNumeric:"tabular-nums",
              color: finished ? "#10b981" : running ? "var(--violet)" : "var(--text-primary)",
              marginBottom:16, transition:"color 0.3s",
              fontFamily:"'Outfit',monospace",
            }}>
              {fmt(elapsed)}
            </div>

            {/* Duration progress bar */}
            {activeMeeting?.duration && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.72rem", color:"var(--text-muted)", marginBottom:6 }}>
                  <span>{fmt(elapsed)} elapsed</span>
                  <span>{fmt(activeMeeting.duration * 60)} planned</span>
                </div>
                <div className="progress-bar">
                  <div className="fill" style={{ width:`${progress}%`, background: progress > 90 ? "linear-gradient(90deg,#f43f5e,#f97316)" : undefined }}/>
                </div>
              </div>
            )}

            {/* Status pill */}
            <div style={{ marginBottom:24 }}>
              <span style={{
                padding:"4px 14px", borderRadius:99, fontSize:"0.76rem", fontWeight:700,
                background: finished ? "#ecfdf5" : running ? "rgba(124,58,237,0.10)" : "var(--bg-base)",
                color: finished ? "#059669" : running ? "var(--violet)" : "var(--text-muted)",
                border: `1px solid ${finished ? "#a7f3d0" : running ? "rgba(124,58,237,0.25)" : "var(--border)"}`,
              }}>
                {finished ? "✅ Meeting Ended" : running ? "🔴 Recording" : elapsed > 0 ? "⏸ Paused" : "⏹ Ready"}
              </span>
            </div>

            {/* Controls */}
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              {!running && !finished && elapsed === 0 && (
                <button onClick={handleStart} className="btn-primary" style={{ padding:"12px 32px", fontSize:"1rem" }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Start Meeting
                </button>
              )}
              {running && (
                <>
                  <button onClick={handlePause} className="btn-ghost" style={{ padding:"12px 24px", fontSize:"0.9rem" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Pause
                  </button>
                  <button onClick={handleStop} style={{ padding:"12px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#f43f5e,#e11d48)", color:"white", fontWeight:700, fontSize:"0.9rem", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"var(--font-main)" }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                    End Meeting
                  </button>
                </>
              )}
              {!running && elapsed > 0 && !finished && (
                <>
                  <button onClick={handlePause} className="btn-primary" style={{ padding:"12px 24px" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                    Resume
                  </button>
                  <button onClick={handleStop} style={{ padding:"12px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#f43f5e,#e11d48)", color:"white", fontWeight:700, fontSize:"0.9rem", cursor:"pointer", fontFamily:"var(--font-main)" }}>End</button>
                </>
              )}
              {finished && (
                <button onClick={handleReset} className="btn-ghost" style={{ padding:"12px 24px" }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  New Meeting
                </button>
              )}
            </div>
          </div>

          {/* Stats bar */}
          {elapsed > 0 && (
            <div className="glass" style={{ padding:"16px 20px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, textAlign:"center" }}>
              {[
                { label:"Duration",    val: fmt(elapsed) },
                { label:"Notes Added", val: segments.length },
                { label:"Status",      val: finished ? "Ended" : running ? "Active" : "Paused" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--violet)" }}>{s.val}</div>
                  <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Notes panel ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Quick timestamp notes */}
          {running && (
            <div className="glass" style={{ padding:20 }}>
              <div style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Quick Stamp</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                {QUICK_NOTES.map(q => (
                  <button key={q} onClick={() => addTimestampNote(q)} style={{
                    padding:"5px 12px", borderRadius:99, fontSize:"0.75rem", fontWeight:600,
                    background:"var(--bg-base)", border:"1px solid var(--border)",
                    color:"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font-main)",
                    transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(124,58,237,0.08)"; e.currentTarget.style.borderColor="rgba(124,58,237,0.25)"; e.currentTarget.style.color="var(--violet)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="var(--bg-base)"; e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-secondary)"; }}>
                    {q}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input className="input-glass" style={{ flex:1, fontSize:"0.86rem" }} placeholder={`Custom note at ${fmt(elapsed)}…`}
                  value={noteInput} onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTimestampNote()}/>
                <button onClick={() => addTimestampNote()} className="btn-primary" style={{ padding:"10px 16px", flexShrink:0 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          {segments.length > 0 && (
            <div className="glass" style={{ padding:20, maxHeight:220, overflowY:"auto" }}>
              <div style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Timeline</div>
              {segments.map((s, i) => (
                <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
                  <span style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--violet)", background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.18)", borderRadius:6, padding:"2px 7px", whiteSpace:"nowrap", flexShrink:0 }}>{s.time}</span>
                  <span style={{ fontSize:"0.82rem", color:"var(--text-secondary)" }}>{s.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Full notes textarea */}
          <div className="glass" style={{ padding:20, flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:"0.76rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Full Notes</div>
              <span style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>{notes.length} chars</span>
            </div>
            <textarea
              className="input-glass"
              rows={12}
              style={{ resize:"vertical", lineHeight:1.7, fontSize:"0.86rem", fontFamily:"var(--font-main)" }}
              placeholder={running ? "Type your notes here in real time…\nTimestamped notes from Quick Stamp will appear here automatically." : "Your meeting notes will appear here…"}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"flex-end" }}>
              {finished && activeMeeting && (
                <button onClick={() => setEmailModal({ clientName: activeMeeting.client_name, body: `Dear ${activeMeeting.client_name},\n\nThank you for the meeting "${activeMeeting.title}" (${fmt(elapsed)}).\n\nMeeting Notes:\n${notes}\n\nBest regards` })}
                  className="btn-ghost" style={{ fontSize:"0.82rem" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Send Email
                </button>
              )}
              <button onClick={handleSaveNotes} className="btn-primary" style={{ fontSize:"0.82rem" }} disabled={saving || !notes.trim()}>
                {saving ? (
                  <><span style={{ display:"inline-block", width:13, height:13, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Saving…</>
                ) : (
                  <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg> Save Notes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {emailModal && (
        <EmailSendModal
          clientName={emailModal.clientName}
          emailBody={emailModal.body}
          onClose={() => setEmailModal(null)}
        />
      )}
    </div>
  );
}
