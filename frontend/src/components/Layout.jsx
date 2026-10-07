import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Strands from "./Strands.jsx";
import {
  GraduationCap,
  LogOut,
  User,
  LayoutDashboard,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "student":
        return {
          label: "Student",
          icon: GraduationCap,
          color: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-neon-glow",
        };
      case "guide":
        return {
          label: "Faculty Guide",
          icon: Award,
          color: "bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-neon-purple",
        };
      case "admin":
        return {
          label: "Administrator",
          icon: ShieldCheck,
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-neon-emerald",
        };
      default:
        return {
          label: role,
          icon: User,
          color: "bg-slate-500/15 text-slate-300 border-slate-400/40",
        };
    }
  };

  const roleInfo = user ? getRoleBadge(user.role) : null;
  const RoleIcon = roleInfo?.icon || User;

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col relative selection:bg-cyan-400 selection:text-black">
      {/* Dynamic Animated WebGL Strands Background */}
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
        {/* Ambient Dark Diffusion Vignette for Seamless Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/40 via-[#070913]/65 to-[#070913]/90" />
      </div>

      {/* Top Glossy Frosted Glass Navbar */}
      <nav className="sticky top-0 z-40 bg-[#0a0f1e]/80 backdrop-blur-2xl border-b border-white/[0.12] shadow-glossy-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Logo & Main Nav */}
            <div className="flex items-center gap-8">
              <div
                onClick={() => {
                  if (user?.role === "student") navigate("/student");
                  else if (user?.role === "guide") navigate("/guide");
                  else if (user?.role === "admin") navigate("/admin");
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 p-0.5 shadow-neon-glow transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-[#0a0f1d]/90 rounded-[14px] flex items-center justify-center backdrop-blur-md">
                    <GraduationCap className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0f1d] animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-indigo-300 drop-shadow-sm">
                    eduTrack
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400/90 -mt-1 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-300" /> Academic Portal
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              {user && (
                <div className="hidden sm:flex items-center gap-1.5 pl-4 border-l border-white/[0.12]">
                  <button
                    onClick={() => navigate(`/${user.role}`)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      location.pathname.startsWith(`/${user.role}`)
                        ? "bg-white/[0.12] text-cyan-300 border border-white/[0.2] shadow-glossy-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Right User Bar */}
            {user && (
              <div className="flex items-center gap-3.5">
                {/* User Info Capsule */}
                <div className="flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-xl border border-white/[0.14] rounded-full px-3.5 py-1.5 shadow-glossy-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${roleInfo.color} flex items-center gap-1 backdrop-blur-md`}
                    >
                      <RoleIcon className="w-2.5 h-2.5" />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign out of eduTrack"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-white/[0.1] hover:border-rose-500/40 text-xs font-semibold transition-all cursor-pointer shadow-glossy-sm backdrop-blur-md"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-6 text-center text-xs text-slate-400 bg-black/20 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-200">eduTrack</span>
            <span>— AI-Driven Project Governance & Review Portal</span>
          </div>
          <div className="text-slate-400">
            © {new Date().getFullYear()} College Review Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
