import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Strands from "../components/Strands.jsx";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Cpu,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user, data.token);
      if (data.user.role === "student") navigate("/student");
      else if (data.user.role === "guide") navigate("/guide");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === "admin") {
      setEmail("admin@edutrack.com");
      setPassword("admin123");
    } else if (role === "student") {
      setEmail("leelasaisabbarapu22@gmail.com");
      setPassword("student123");
    } else if (role === "guide") {
      setEmail("guide1@edutrack.com");
      setPassword("guide123");
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] flex items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-cyan-400 selection:text-black">
      {/* Animated WebGL Strands Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <Strands
          colors={["#f97316", "#8b5cf6", "#06b6d4"]}
          count={3}
          speed={0.35}
          amplitude={0.9}
          waviness={1.1}
          thickness={0.65}
          glow={2.2}
          taper={2.8}
          spread={1}
          intensity={0.42}
          saturation={1.8}
          opacity={0.65}
          scale={1.4}
          glass={false}
          refraction={1}
          dispersion={1}
          glassSize={1}
          hueShift={0}
        />
        {/* Ambient Dark Diffusion Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/40 via-[#070913]/65 to-[#070913]/90" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Side: Brand Feature Showcase */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.18] text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-glossy-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            AI-Driven College Management
          </div>

          <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
            Streamline College Projects with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300">
              Glossy Intelligence
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed drop-shadow-xs">
            eduTrack seamlessly connects Students, Faculty Guides, and Administrators with AI duplicate detection, milestone review trackers, and ML risk forecasting.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { text: "Automated ML Duplicate Topic Detection", icon: Cpu },
              { text: "Real-time Guide Review & Milestone Stepper", icon: CheckCircle2 },
              { text: "College-wide Analytics & ML Delay Alerts", icon: BarChart3 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-8 h-8 rounded-xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.15] flex items-center justify-center text-cyan-300 shadow-glossy-sm">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Glossy Glass Auth Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="glossy-panel rounded-3xl p-8 shadow-glossy-lg relative overflow-hidden">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-white p-0.5 shadow-neon-glow mb-3">
                <div className="w-full h-full bg-[#080d1a]/85 backdrop-blur-md rounded-[14px] flex items-center justify-center">
                  <Zap className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">eduTrack</span>
              </h2>
              <p className="text-slate-300 text-xs mt-1">
                Enter your institutional credentials to access portal
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-500/15 backdrop-blur-md border border-rose-500/40 text-rose-200 text-xs font-medium flex items-center gap-2 shadow-glossy-sm">
                <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glossy-input text-xs"
                    placeholder="student@college.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl glossy-input text-xs"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl glossy-btn-primary text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill Bar */}
            <div className="mt-6 pt-5 border-t border-white/[0.1] space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Quick Autofill Demo Account:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials("student")}
                  className="px-2 py-2 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/[0.12] hover:border-cyan-400/50 text-[11px] font-semibold text-cyan-200 transition cursor-pointer shadow-glossy-sm backdrop-blur-md"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials("guide")}
                  className="px-2 py-2 rounded-xl bg-white/[0.05] hover:bg-purple-500/20 border border-white/[0.12] hover:border-purple-400/50 text-[11px] font-semibold text-purple-200 transition cursor-pointer shadow-glossy-sm backdrop-blur-md"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials("admin")}
                  className="px-2 py-2 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/[0.12] hover:border-emerald-400/50 text-[11px] font-semibold text-emerald-200 transition cursor-pointer shadow-glossy-sm backdrop-blur-md"
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-300">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
