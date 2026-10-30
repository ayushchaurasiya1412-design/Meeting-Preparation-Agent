import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

// ── Suggested quick prompts ───────────────────────────────────
const QUICK_PROMPTS = [
  "What were the key decisions in my last meeting?",
  "List all pending action items",
  "Which client has the highest readiness?",
  "How many meetings do I have this week?",
  "Summarize my recent notes",
  "What follow-ups are due?",
];

// ── Single message bubble ─────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  const isLoading = msg.loading;

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
      alignItems: "flex-end",
      gap: 8,
    }}>
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0,
          background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
          display: "grid", placeItems: "center", fontSize: "0.75rem",
        }}>
          <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
      )}

      <div style={{
        maxWidth: "78%",
        padding: isLoading ? "10px 14px" : "10px 14px",
        borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isUser
          ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
          : "var(--bg-base)",
        border: isUser ? "none" : "1px solid var(--border)",
        color: isUser ? "white" : "var(--text-primary)",
        fontSize: "0.85rem",
        lineHeight: 1.65,
        wordBreak: "break-word",
        boxShadow: isUser ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
      }}>
        {isLoading ? (
          /* Typing indicator */
          <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "var(--text-muted)",
                animation: `typingDot 1.2s ease ${i * 0.2}s infinite`,
              }}/>
            ))}
          </div>
        ) : (
          <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0,
          background: "linear-gradient(135deg,#10b981,#14b8a6)",
          display: "grid", placeItems: "center",
          fontWeight: 700, fontSize: "0.72rem", color: "white",
        }}>
          {(localStorage.getItem("userName") || "U").charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Main Chat Bubble ──────────────────────────────────────────
export default function AIChatBubble() {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your MeetPrep AI assistant 👋\n\nAsk me anything about your meetings, clients, action items, or notes. I can also give you general meeting advice!",
    },
  ]);
  const [loading, setLoading]   = useState(false);
  const [context, setContext]   = useState(""); // optional notes context
  const [showCtx, setShowCtx]   = useState(false);
  const [unread,  setUnread]    = useState(0);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // scroll to bottom on new message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setUnread(0);
    }
  }, [open]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");

    // add user message
    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);

    // add loading placeholder
    setMessages(prev => [...prev, { role: "assistant", content: "", loading: true }]);
    setLoading(true);

    // build history (exclude loading placeholder)
    const history = [...messages, userMsg]
      .filter(m => !m.loading)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post("/api/ai/chat", {
        message: msg,
        history: history.slice(-8), // last 8 turns
        context: context,
      });

      const reply = res.data.reply || "Sorry, I couldn't generate a response.";
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: "assistant", content: reply },
      ]);

      // if chat is closed, show unread badge
      if (!open) setUnread(u => u + 1);

    } catch {
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: "assistant", content: "I'm having trouble connecting to the AI right now. Please check that the backend is running and try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! How can I help you?",
    }]);
  };

  return (
    <>
      {/* ── Typing dot animation ── */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes bubblePulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(124,58,237,0.40); }
          50%       { box-shadow: 0 6px 32px rgba(124,58,237,0.65); }
        }
      `}</style>

      {/* ── Chat Window ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 999,
          width: 360, borderRadius: 22,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
          display: "flex", flexDirection: "column",
          animation: "chatSlideUp 0.25s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
          maxHeight: "70vh",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.20)", display: "grid", placeItems: "center" }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "white" }}>MeetPrep AI</div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.70)", display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 0 2px rgba(74,222,128,0.30)" }}/>
                Always ready
              </div>
            </div>
            {/* Header actions */}
            <button onClick={() => setShowCtx(s => !s)} title="Add meeting context"
              style={{ width: 30, height: 30, borderRadius: 8, background: showCtx ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "white" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </button>
            <button onClick={clearChat} title="Clear chat"
              style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "white" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
            <button onClick={() => setOpen(false)}
              style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "white", fontSize: "1rem" }}>
              ✕
            </button>
          </div>

          {/* Context box (collapsible) */}
          {showCtx && (
            <div style={{ padding: "10px 14px", background: "var(--bg-base)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                📋 Meeting Context (optional)
              </div>
              <textarea
                rows={3}
                placeholder="Paste meeting notes here so AI can answer questions about them…"
                value={context}
                onChange={e => setContext(e.target.value)}
                className="input-glass"
                style={{ fontSize: "0.78rem", resize: "vertical", lineHeight: 1.5 }}
              />
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 14px 8px",
            display: "flex", flexDirection: "column",
            minHeight: 0,
          }}>
            {messages.map((msg, i) => <Message key={i} msg={msg}/>)}
            <div ref={bottomRef}/>
          </div>

          {/* Quick prompts — show only when no user messages yet */}
          {messages.filter(m => m.role === "user").length === 0 && (
            <div style={{ padding: "0 14px 10px", flexShrink: 0 }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Try asking…
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p)} style={{
                    fontSize: "0.72rem", fontWeight: 500, padding: "4px 10px",
                    borderRadius: 99, cursor: "pointer", fontFamily: "var(--font-main)",
                    background: "var(--bg-base)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)", transition: "all 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"; e.currentTarget.style.color = "var(--violet)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-base)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 12px 12px", flexShrink: 0,
            borderTop: "1px solid var(--border)",
            display: "flex", gap: 8, alignItems: "flex-end",
          }}>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask anything about your meetings…"
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="input-glass"
              style={{
                flex: 1, resize: "none", overflow: "hidden",
                fontSize: "0.85rem", lineHeight: 1.5,
                minHeight: 38, maxHeight: 100,
                padding: "9px 14px",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 11, border: "none", flexShrink: 0,
                background: loading || !input.trim()
                  ? "var(--bg-base)"
                  : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "grid", placeItems: "center",
                transition: "all 0.2s",
                boxShadow: loading || !input.trim() ? "none" : "0 4px 12px rgba(124,58,237,0.30)",
              }}>
              {loading
                ? <div style={{ width: 14, height: 14, border: "2px solid var(--text-muted)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
                : <svg width="16" height="16" fill="none" stroke={loading || !input.trim() ? "var(--text-muted)" : "white"} strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
              }
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "0 0 10px", fontSize: "0.64rem", color: "var(--text-muted)" }}>
            Powered by LLaMA 3.3 · 70B
          </div>
        </div>
      )}

      {/* ── Floating Button ── */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: "50%", border: "none",
          background: open
            ? "linear-gradient(135deg,#f43f5e,#e11d48)"
            : "linear-gradient(135deg,#7c3aed,#4f46e5)",
          cursor: "pointer",
          display: "grid", placeItems: "center",
          boxShadow: "0 6px 24px rgba(124,58,237,0.40)",
          animation: open ? "none" : "bubblePulse 2.5s ease infinite",
          transition: "background 0.25s, transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08) translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1) translateY(0)"}
        title={open ? "Close Chat" : "Ask AI Assistant"}
      >
        {open ? (
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        )}

        {/* Unread badge */}
        {unread > 0 && !open && (
          <div style={{
            position: "absolute", top: -2, right: -2,
            width: 18, height: 18, borderRadius: "50%",
            background: "#f43f5e", border: "2px solid white",
            display: "grid", placeItems: "center",
            fontSize: "0.62rem", fontWeight: 800, color: "white",
          }}>{unread}</div>
        )}
      </button>
    </>
  );
}
