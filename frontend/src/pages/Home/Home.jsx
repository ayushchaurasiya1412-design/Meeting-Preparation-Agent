import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-['Outfit']">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-400/30 blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 md:px-16 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 text-xl text-white">
            🚀
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-indigo-600">
            MPA AI
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 rounded-full font-semibold text-sm text-slate-800 bg-white/60 hover:bg-white border border-slate-200/60 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md hover:border-violet-200"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 pt-20 pb-32 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Left Text */}
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
            </span>
            Meet the Future of Meetings
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            Automate your <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600">
              Meeting Intelligence
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
            The AI-powered platform that automatically generates summaries, extracts action items, identifies risks, and drafts follow-up emails while you focus on the conversation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_12px_25px_rgba(124,58,237,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Get Started for Free
              <span className="text-xl">✨</span>
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              View Live Demo
              <span className="text-xl">👀</span>
            </button>
          </div>
        </div>

        {/* Right Dashboard Preview */}
        <div className="flex-1 w-full max-w-xl relative group perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-3xl blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          
          <div className="relative rounded-3xl shadow-2xl shadow-slate-200/50 transition-transform duration-500 transform group-hover:-translate-y-2 overflow-hidden border-4 border-white">
            <img src="/ai-mockup.png" alt="AI Agent Concept" className="w-full h-auto object-cover" />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-white/50 backdrop-blur-lg border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Everything you need for perfect meetings
            </h2>
            <p className="text-slate-600 text-lg">
              Our AI super-agents work in the background so you can focus on building relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🤖", title: "AI Summary", desc: "Instantly get concise summaries of hour-long calls." },
              { icon: "⚠", title: "Risk Analysis", desc: "Identify potential blockers and client hesitation automatically." },
              { icon: "📧", title: "Follow-Up Email", desc: "One-click drafting of personalized follow-up emails." },
              { icon: "📄", title: "PDF Reports", desc: "Export beautiful meeting intelligence reports." },
              { icon: "📊", title: "Analytics", desc: "Track meeting success rates and engagement metrics." },
              { icon: "🚀", title: "Super Agent", desc: "Delegate tasks directly to your AI assistant during calls." }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-violet-50 group-hover:border-violet-100 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              How MPA AI Works
            </h2>
            <p className="text-slate-600 text-lg">
              Three simple steps to transform your meeting productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-sm border border-violet-200">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Calendar</h3>
              <p className="text-slate-600">Integrate with Google Calendar or Outlook in one click.</p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-sm border border-sky-200">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Agent Joins</h3>
              <p className="text-slate-600">Our invisible bot joins your calls to listen and take notes.</p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-sm border border-emerald-200">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Get Insights</h3>
              <p className="text-slate-600">Receive summaries, tasks, and follow-ups instantly after the meeting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-24 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Loved by teams everywhere
            </h2>
            <p className="text-slate-600 text-lg">
              Don't just take our word for it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Jenkins", role: "Product Manager", text: "MPA AI saves me at least 5 hours a week. The action item extraction is incredibly accurate." },
              { name: "David Chen", role: "Sales Director", text: "I can finally focus on the prospect instead of furiously typing notes. The CRM integration is seamless." },
              { name: "Emily Rodriguez", role: "Founder", text: "It's like having a chief of staff in every meeting. The automated follow-up drafts are a game changer." }
            ].map((t, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-amber-400 mb-4 text-lg">★★★★★</div>
                <p className="text-slate-700 italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-200 to-sky-200 flex items-center justify-center font-bold text-violet-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <span className="text-slate-500 text-xs">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-24 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Simple, transparent pricing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter</h3>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">$0<span className="text-lg text-slate-500 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 text-slate-600">
                <li>✓ 5 meetings per month</li>
                <li>✓ Basic summaries</li>
                <li>✓ 7-day history</li>
              </ul>
              <button className="w-full py-3 rounded-xl font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 transition-colors">Get Started</button>
            </div>
            {/* Pro */}
            <div className="bg-gradient-to-b from-violet-600 to-indigo-700 border border-violet-500 p-8 rounded-3xl shadow-xl transform md:-translate-y-4 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">Most Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-extrabold text-white mb-6">$19<span className="text-lg text-violet-200 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 text-violet-100">
                <li>✓ Unlimited meetings</li>
                <li>✓ Advanced AI insights</li>
                <li>✓ Unlimited history</li>
                <li>✓ Custom vocabulary</li>
              </ul>
              <button className="w-full py-3 rounded-xl font-bold text-violet-900 bg-white hover:bg-slate-50 transition-colors shadow-lg">Start Free Trial</button>
            </div>
            {/* Enterprise */}
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">Custom</div>
              <ul className="space-y-3 mb-8 text-slate-600">
                <li>✓ Everything in Pro</li>
                <li>✓ SSO & Advanced Security</li>
                <li>✓ Dedicated account manager</li>
                <li>✓ API access</li>
              </ul>
              <button className="w-full py-3 rounded-xl font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm text-white">🚀</div>
            <span className="text-xl font-bold text-white">MPA AI</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm">© 2026 MPA AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;