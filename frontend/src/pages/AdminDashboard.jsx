import React, { useState, useEffect } from "react";
import api from "../api";
import AdminDashboardCharts from "../components/AdminDashboardCharts.jsx";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444", "#6366f1"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
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

    console.log("Fetching admin analytics...");
    api
      .get("/admin/analytics")
      .then((res) => {
        console.log("Admin analytics response:", res.data);
        console.log("Response status:", res.status);
        console.log("Response data type:", typeof res.data);
        setAnalyticsData(res.data);
      })
      .catch((error) => {
        console.error("Admin analytics error:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
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
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" />
      </div>
    );
  }

  const pieData = [
    { name: "Accepted", value: stats.accepted || 0 },
    { name: "Pending", value: stats.pending || 0 },
    { name: "Rejected", value: stats.rejected || 0 },
  ].filter((d) => d.value > 0);

  const riskData = [
    { name: "Low", value: stats.riskCounts?.low || 0, fill: "#22c55e" },
    { name: "Medium", value: stats.riskCounts?.medium || 0, fill: "#eab308" },
    { name: "High", value: stats.riskCounts?.high || 0, fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Prepare analytics data
  const monthlyProjectsData = analyticsData?.projectsPerMonth
    ? Object.entries(analyticsData.projectsPerMonth).map(([month, count]) => ({
        month,
        count,
      }))
    : [];

  const departmentProjectsData = analyticsData?.departmentWise
    ? Object.entries(analyticsData.departmentWise).map(([dept, count]) => ({
        department: dept,
        count,
      }))
    : [];

  const statusDistributionData = analyticsData?.statusDistribution
    ? Object.entries(analyticsData.statusDistribution).map(
        ([status, count]) => ({ status, count }),
      )
    : [];

  const riskLevelsData = analyticsData?.riskLevels
    ? Object.entries(analyticsData.riskLevels).map(([risk, count]) => ({
        risk,
        count,
        fullMark: Math.max(...Object.values(analyticsData.riskLevels)) || 100,
      }))
    : [];

  const deptData = (stats.deptWise || []).map((d) => ({
    name: d._id || "N/A",
    count: d.count,
  }));
  const guideData = (stats.guideWise || []).map((d) => ({
    name: d.guide?.name || "Unknown",
    count: d.count,
  }));

  const trendData = [...(projects || [])]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .reduce((acc, p, i) => {
      const month = new Date(p.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const last = acc[acc.length - 1];
      if (last && last.month === month) last.count += 1;
      else
        acc.push({
          month,
          count: (acc.length ? acc[acc.length - 1].count : 0) + 1,
        });
      return acc;
    }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-white">
        Admin Dashboard - College Analytics
      </h1>

      {/* Charts Section */}
      <AdminDashboardCharts
        analyticsData={analyticsData}
        loading={analyticsLoading}
      />

      {/* Original Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Projects</p>
          <p className="text-2xl font-bold text-white mt-1">
            {analyticsData?.totalProjects || stats.total}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {analyticsData?.totalStudents || 0}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Guides</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {analyticsData?.totalGuides || 0}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {analyticsData?.statusDistribution?.Approved || stats.accepted}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Avg Progress</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{0}%</p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      {analyticsLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" />
        </div>
      ) : analyticsData ? (
        <div className="space-y-6">
          {/* First Row: Monthly Projects & Department Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Line Chart: Total projects created per month */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                📈 Projects Created Per Month
              </h2>
              {monthlyProjectsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyProjectsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                      }}
                      labelStyle={{ color: "#f3f4f6" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", r: 5 }}
                      name="Projects Created"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No project creation data available
                </p>
              )}
            </div>

            {/* Bar Chart: Department-wise projects count */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                🏢 Department-wise Projects
              </h2>
              {departmentProjectsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={departmentProjectsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="department"
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                      }}
                      labelStyle={{ color: "#f3f4f6" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#10b981"
                      name="Number of Projects"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No department data available
                </p>
              )}
            </div>
          </div>

          {/* Second Row: Status Distribution & Risk Levels */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Doughnut Chart: Status distribution */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                📊 Project Status Distribution
              </h2>
              {statusDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                      }}
                      labelStyle={{ color: "#f3f4f6" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No status data available
                </p>
              )}
            </div>

            {/* Radar Chart: Performance Risk Level */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                🎯 Performance Risk Levels (ML Prediction)
              </h2>
              {riskLevelsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={riskLevelsData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="risk" stroke="#9ca3af" />
                    <PolarRadiusAxis stroke="#9ca3af" />
                    <Radar
                      name="Risk Distribution"
                      dataKey="count"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                      }}
                      labelStyle={{ color: "#f3f4f6" }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No risk analysis data available
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
          Failed to load analytics data.
        </div>
      )}

      {/* Legacy Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Department-wise projects (Legacy)
          </h2>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No departments yet
            </p>
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Guide-wise projects
          </h2>
          {guideData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={guideData}
                layout="vertical"
                margin={{ left: 60 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No guide assignments yet
            </p>
          )}
        </div>
      </div>

      {/* ML Risk Alerts Table */}
      {stats.mlReports && stats.mlReports.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            🚨 ML Risk Alerts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Project</th>
                  <th className="text-left py-2">Delay risk</th>
                  <th className="text-left py-2">Performance risk</th>
                </tr>
              </thead>
              <tbody>
                {stats.mlReports.slice(0, 10).map((r) => (
                  <tr key={r._id} className="border-b border-slate-800">
                    <td className="py-2 text-white">
                      {r.projectId?.title || r.projectId}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${r.delayRisk === "high" ? "bg-red-500/20 text-red-400" : r.delayRisk === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}`}
                      >
                        {r.delayRisk || "N/A"}
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">
                      {r.performanceRisk || "N/A"}
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
