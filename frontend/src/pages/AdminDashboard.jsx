import React, { useState, useEffect } from "react";
import api from "../api";
import AdminDashboardCharts from "../components/AdminDashboardCharts.jsx";
import {
  ShieldCheck,
  Users,
  Award,
  FolderGit2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/projects/admin-stats")
      .then((res) => setStats(res.data))
      .catch(() =>
        setStats({
          total: 0,
          accepted: 0,
          pending: 0,
          rejected: 0,
          deptWise: [],
          guideWise: [],
          riskCounts: {},
          mlReports: [],
        }),
      );

    api
      .get("/admin/analytics")
      .then((res) => {
        setAnalyticsData(res.data);
      })
      .catch((error) => {
        console.error("Admin analytics error:", error);
        setAnalyticsData({
          totalStudents: 0,
          totalGuides: 0,
          totalProjects: 0,
          projectsPerMonth: {},
          departmentWise: {},
          statusDistribution: {},
          riskLevels: { Low: 0, Medium: 0, High: 0 },
          totalMLReports: 0,
        });
      })
      .finally(() => setAnalyticsLoading(false));

    api
      .get("/projects")
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-emerald-400/40 border-t-emerald-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Glossy Header */}
      <div className="glossy-panel rounded-3xl p-7 border border-white/[0.15] shadow-glossy-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.18] text-emerald-300 text-xs font-semibold shadow-glossy-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Institutional Admin Command
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Institutional Intelligence & <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">Governance</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-xl drop-shadow-xs">
              Cross-department project metrics, ML milestone delay alerts, faculty mentorship quotas, and student completion trends.
            </p>
          </div>

          <div className="glossy-card rounded-2xl px-6 py-3 border border-white/[0.12] shadow-glossy-sm text-center">
            <span className="text-[10px] text-slate-300 block font-semibold uppercase tracking-wider">Total System Projects</span>
            <span className="text-2xl font-extrabold text-white drop-shadow-xs">{analyticsData?.totalProjects || stats.total}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-[10px] font-semibold uppercase tracking-wider">Projects</span>
            <FolderGit2 className="w-4 h-4 text-cyan-300" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            {analyticsData?.totalProjects || stats.total}
          </p>
        </div>

        <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-[10px] font-semibold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-blue-300" />
          </div>
          <p className="text-2xl font-extrabold text-blue-300">
            {analyticsData?.totalStudents || 0}
          </p>
        </div>

        <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-[10px] font-semibold uppercase tracking-wider">Guides</span>
            <Award className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-2xl font-extrabold text-purple-300">
            {analyticsData?.totalGuides || 0}
          </p>
        </div>

        <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-[10px] font-semibold uppercase tracking-wider">Approved</span>
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-300">
            {analyticsData?.statusDistribution?.Approved || stats.accepted || 0}
          </p>
        </div>

        <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-[10px] font-semibold uppercase tracking-wider">ML Reports</span>
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          </div>
          <p className="text-2xl font-extrabold text-amber-300">
            {analyticsData?.totalMLReports || stats.mlReports?.length || 0}
          </p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <AdminDashboardCharts
        analyticsData={analyticsData}
        loading={analyticsLoading}
      />

      {/* ML Delay Risk Alerts Table */}
      {stats.mlReports && stats.mlReports.length > 0 && (
        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] space-y-4 shadow-glossy-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider drop-shadow-xs">
                ML Milestone Risk & Delay Alerts
              </h2>
            </div>
            <span className="text-xs text-slate-300">Top Flagged Projects</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-300 border-b border-white/[0.1] uppercase font-semibold text-[10px]">
                  <th className="py-3 px-3">Project Title</th>
                  <th className="py-3 px-3">Delay Risk</th>
                  <th className="py-3 px-3">Performance Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {stats.mlReports.slice(0, 10).map((r) => (
                  <tr key={r._id} className="hover:bg-white/[0.04] transition">
                    <td className="py-3 px-3 text-white font-medium">
                      {r.projectId?.title || r.projectId}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border backdrop-blur-md ${
                          r.delayRisk === "high"
                            ? "bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-glossy-sm"
                            : r.delayRisk === "medium"
                              ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                        }`}
                      >
                        {r.delayRisk || "Low"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {r.performanceRisk || "On Track"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
