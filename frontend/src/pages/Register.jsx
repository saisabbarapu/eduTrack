import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Strands from "../components/Strands.jsx";
import {
  GraduationCap,
  Award,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Hash,
  Building,
  Calendar,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNumber: "",
    department: "",
    batchYear: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setForm((f) => ({ ...f, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.user, data.token);
      if (data.user.role === "student") navigate("/student");
      else if (data.user.role === "guide") navigate("/guide");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "student",
      title: "Student",
      desc: "Projects & Reviews",
      icon: GraduationCap,
      color: "border-cyan-400/40 text-cyan-300 bg-cyan-500/15 shadow-neon-glow",
      activeBg: "border-cyan-400 bg-cyan-500/25 shadow-neon-glow scale-102",
    },
    {
      id: "guide",
      title: "Faculty",
      desc: "Evaluate & Mentor",
      icon: Award,
      color: "border-purple-400/40 text-purple-300 bg-purple-500/15 shadow-neon-purple",
      activeBg: "border-purple-400 bg-purple-500/25 shadow-neon-purple scale-102",
    },
    {
      id: "admin",
      title: "Admin",
      desc: "College Analytics",
      icon: ShieldCheck,
      color: "border-emerald-400/40 text-emerald-300 bg-emerald-500/15 shadow-neon-emerald",
      activeBg: "border-emerald-400 bg-emerald-500/25 shadow-neon-emerald scale-102",
    },
  ];

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

      <div className="w-full max-w-xl mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-white p-0.5 shadow-neon-glow mb-2">
            <div className="w-full h-full bg-[#080d1a]/85 backdrop-blur-md rounded-[14px] flex items-center justify-center">
              <Zap className="h-6 w-6 text-cyan-300" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            Create your <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">eduTrack</span> Account
          </h1>
          <p className="text-slate-300 text-xs">
            Select your institutional role and setup your workspace
          </p>
        </div>

        {/* Glossy Glass Form Card */}
        <div className="glossy-panel rounded-3xl p-8 shadow-glossy-lg border border-white/[0.15]">
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/15 backdrop-blur-md border border-rose-500/40 text-rose-200 text-xs font-medium flex items-center gap-2 shadow-glossy-sm">
              <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive Role Switcher Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = form.role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`cursor-pointer rounded-2xl p-3 text-center border transition-all duration-200 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? r.activeBg
                          : "border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 shadow-glossy-sm"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${r.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {r.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glossy-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alex@college.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glossy-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glossy-input text-xs"
                />
              </div>
            </div>

            {/* Role Specific Details */}
            {(form.role === "student" || form.role === "guide") && (
              <div className="pt-3 border-t border-white/[0.1] space-y-3">
                <span className="text-xs font-semibold text-cyan-300 block uppercase tracking-wider">
                  Academic Configuration
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {form.role === "student" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                        Roll Number
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                        <input
                          name="rollNumber"
                          value={form.rollNumber}
                          onChange={handleChange}
                          placeholder="e.g. MCA2026-001"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl glossy-input text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                      <input
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl glossy-input text-xs"
                      />
                    </div>
                  </div>

                  {form.role === "student" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wider">
                        Batch Year
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                        <input
                          name="batchYear"
                          value={form.batchYear}
                          onChange={handleChange}
                          placeholder="e.g. 2026"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl glossy-input text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl glossy-btn-primary text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
