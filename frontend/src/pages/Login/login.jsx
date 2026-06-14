import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {
    navigate("/dashboard");
  }
}, [navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    setIsLoading(true);

    const response = await api.post(
      "/api/users/login",
      {
        email,
        password,
      }
    );

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    localStorage.setItem(
      "userName",
      response.data.name
    );

    localStorage.setItem(
  "userName",
  response.data.name
);

    localStorage.setItem(
      "userId",
      response.data.user_id
    );

    navigate("/dashboard");

  } catch (error) {

    alert(
      error.response?.data?.detail ||
      "Login Failed"
    );

  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Outfit']">
      {/* Left Column - Branding / Imagery */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-violet-600 to-indigo-900 overflow-hidden items-center justify-center p-12">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute w-96 h-96 bg-violet-400/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-sky-400/30 rounded-full blur-[80px] animate-pulse bottom-20 left-20" style={{ animationDelay: "1s" }}></div>
        
        {/* Glassmorphism Branding Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center transform transition-transform hover:scale-105 duration-500">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 flex items-center justify-center text-4xl mb-8 shadow-inner border border-white/30 backdrop-blur-sm">
            🚀
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Automate Your <br /> Meeting Intelligence
          </h2>
          <p className="text-indigo-100 text-lg font-medium leading-relaxed mb-8">
            Join thousands of professionals saving hours each week with AI-driven summaries, action items, and automated follow-ups.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-indigo-500 flex items-center justify-center text-white font-bold text-xs backdrop-blur-md">
                  U{i}
                </div>
              ))}
            </div>
            <div className="text-white font-semibold text-sm">
              +2,000 users joined
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-50 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg text-3xl mb-8 text-white">
            🚀
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium mb-10 text-lg">Please enter your details to sign in.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-4 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">Forgot Password?</a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-4 outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" id="remember" className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500/20" />
              <label htmlFor="remember" className="text-sm font-semibold text-slate-600 cursor-pointer">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-2xl mt-4 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:scale-105 transition-transform duration-500"></div>
              <div className="relative px-5 py-4 flex items-center justify-center">
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="text-white font-bold text-lg tracking-wide">Sign In</span>
                )}
              </div>
            </button>
            
            <button
              type="button"
              className="w-full bg-white border border-slate-200 text-slate-700 font-bold text-lg py-4 rounded-2xl hover:bg-slate-50 transition-colors duration-300 shadow-sm flex items-center justify-center gap-3"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </form>

          <button
  type="button"
  onClick={() => navigate("/register")}
  className="text-violet-600 font-bold hover:text-violet-700 transition-colors ml-1"
>
  Create an account
</button>
        </div>
      </div>
    </div>
  );
}

export default Login;