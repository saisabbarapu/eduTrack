import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img
                  src="/projecticon.png"
                  alt="EduTrack"
                  className="h-8 w-8 rounded"
                />
                <span className="font-display font-bold text-white text-lg">
                  EduTrack
                </span>
              </div>
              {user && (
                <div className="flex gap-2">
                  {user.role === "student" && (
                    <button
                      onClick={() => navigate("/student")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${location.pathname === "/student" ? "bg-primary-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Dashboard
                    </button>
                  )}
                  {user.role === "guide" && (
                    <button
                      onClick={() => navigate("/guide")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${location.pathname === "/guide" ? "bg-primary-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Dashboard
                    </button>
                  )}
                  {user.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${location.pathname === "/admin" ? "bg-primary-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Dashboard
                    </button>
                  )}
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
