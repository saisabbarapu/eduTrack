import React, { useState, useEffect } from "react";
import api from "../api";
import CreateProjectModal from "../components/CreateProjectModal.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectDetail from "../components/ProjectDetail.jsx";
import SubmissionConsistencyHeatmap from "../components/SubmissionConsistencyHeatmap.jsx";
import StudentDashboardCharts from "../components/StudentDashboardCharts.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  FolderPlus,
  FolderGit2,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Search,
  BarChart3,
  Flame,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_MILESTONES = [
  {
    name: "Phase 1: Topic selection + SRS",
    description: "SRS document approval",
    status: "pending",
    dueDate: "",
  },
  {
    name: "Phase 2: UI/Backend development",
    description: "Core development",
    status: "pending",
    dueDate: "",
  },
  {
    name: "Phase 3: ML integration",
    description: "ML module integration",
    status: "pending",
    dueDate: "",
  },
  {
    name: "Phase 4: Final report + Demo",
    description: "Report and demo",
    status: "pending",
    dueDate: "",
  },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [duplicateCheck, setDuplicateCheck] = useState({ message: "" });
  const [guides, setGuides] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [activeTab, setActiveTab] = useState("projects"); // 'projects' | 'analytics' | 'heatmap'

  const fetchProjects = () => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchDashboardData = () => {
    setDashboardLoading(true);
    api
      .get(`/student/dashboard/${user._id}`)
      .then((res) => setDashboardData(res.data))
      .catch(console.error)
      .finally(() => setDashboardLoading(false));
  };

  const fetchAnalyticsData = () => {
    setAnalyticsLoading(true);
    api
      .get(`/student/dashboard/${user._id}/analytics`)
      .then((res) => setAnalyticsData(res.data))
      .catch(console.error)
      .finally(() => setAnalyticsLoading(false));
  };

  useEffect(() => {
    if (!showCreate) return;
    api
      .get("/users/guides")
      .then((res) => setGuides(res.data || []))
      .catch(() => setGuides([]));
  }, [showCreate]);

  const handleCreate = (formData, proposalFile) => {
    const fd = new FormData();
    const skipKeys = ["milestones", "teamMembers"];
    Object.keys(formData).forEach((k) => {
      if (skipKeys.includes(k)) return;
      const v = formData[k];
      fd.append(k, v != null && v !== "" ? v : "");
    });
    fd.append(
      "milestones",
      JSON.stringify(formData.milestones || DEFAULT_MILESTONES),
    );
    fd.append(
      "teamMembers",
      JSON.stringify(
        Array.isArray(formData.teamMembers)
          ? formData.teamMembers
          : (formData.teamMembers || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
      ),
    );
    if (proposalFile) fd.append("proposalPdf", proposalFile);
    api
      .post("/projects", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setShowCreate(false);
        fetchProjects();
      })
      .catch((e) =>
        alert(e.response?.data?.error || "Failed to create project"),
      );
  };

  const checkDuplicate = (title, abstract) => {
    return api
      .post("/ml/duplicate-check", { title, abstract: abstract || title })
      .then((res) => {
        setDuplicateCheck({
          message: res.data.message,
          matches: res.data.matches || [],
        });
        return res.data;
      })
      .catch(() => {
        setDuplicateCheck({ message: "Check unavailable" });
        return null;
      });
  };

  // Filter projects by search query and domain
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.techStack && p.techStack.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain =
      filterDomain === "all" || p.domain === filterDomain;
    return matchesSearch && matchesDomain;
  });

  // Chart data preparation
  const statusChartData = dashboardData?.statusDistribution
    ? Object.entries(dashboardData.statusDistribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const weeklyProgressData = dashboardData?.weeklyProgress
    ? Object.entries(dashboardData.weeklyProgress).map(([week, count]) => ({
        week,
        count,
      }))
    : [];

  const reviewScoresData =
    dashboardData?.reviewScores?.map((review) => ({
      name:
        review.milestoneName.substring(0, 15) +
        (review.milestoneName.length > 15 ? "..." : ""),
      score: review.score,
      guide: review.guideName,
    })) || [];

  const COLORS = ["#00f2fe", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Top Glossy Banner Header */}
      <div className="glossy-panel rounded-3xl p-7 border border-white/[0.15] shadow-glossy-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.18] text-cyan-300 text-xs font-semibold shadow-glossy-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              Student Innovation Workspace
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300">{user?.name}</span> 👋
            </h1>
            <p className="text-slate-300 text-xs max-w-xl drop-shadow-xs">
              Manage capstones, submit weekly sprint progress, analyze AI duplicate risks, and review faculty evaluations.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glossy-btn-primary text-white font-bold text-xs shadow-neon-glow transition-all shrink-0 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Glossy KPI Cards Row */}
      {dashboardData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-neon-glow">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-300 text-[11px] font-semibold uppercase tracking-wider">Total Projects</p>
              <p className="text-2xl font-extrabold text-white">{dashboardData.totalProjects || projects.length}</p>
            </div>
          </div>

          <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-neon-emerald">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-300 text-[11px] font-semibold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-extrabold text-emerald-300">{dashboardData.completedProjects || 0}</p>
            </div>
          </div>

          <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 backdrop-blur-md border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-neon-glow">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-300 text-[11px] font-semibold uppercase tracking-wider">Avg Progress</p>
              <p className="text-2xl font-extrabold text-blue-300">{dashboardData.averageProgress || 0}%</p>
            </div>
          </div>

          <div className="glossy-card rounded-3xl p-5 border border-white/[0.12] shadow-glossy-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 backdrop-blur-md border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-neon-purple">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-300 text-[11px] font-semibold uppercase tracking-wider">Reviews Logged</p>
              <p className="text-2xl font-extrabold text-purple-300">{dashboardData.reviewScores?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.1] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "projects"
                ? "bg-white/[0.15] text-cyan-300 border border-white/[0.25] shadow-glossy-sm"
                : "text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white/[0.15] text-cyan-300 border border-white/[0.25] shadow-glossy-sm"
                : "text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics Charts
          </button>

          <button
            onClick={() => setActiveTab("heatmap")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "heatmap"
                ? "bg-white/[0.15] text-cyan-300 border border-white/[0.25] shadow-glossy-sm"
                : "text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Consistency Heatmap
          </button>
        </div>

        {activeTab === "projects" && (
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl glossy-input text-xs"
              />
            </div>

            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-3.5 py-2 rounded-2xl glossy-input text-xs text-slate-200 cursor-pointer"
            >
              <option value="all" className="bg-[#0c1020]">All Domains</option>
              <option value="Web" className="bg-[#0c1020]">Web</option>
              <option value="AI/ML" className="bg-[#0c1020]">AI/ML</option>
              <option value="IoT" className="bg-[#0c1020]">IoT</option>
              <option value="Mobile" className="bg-[#0c1020]">Mobile</option>
              <option value="Cloud" className="bg-[#0c1020]">Cloud</option>
              <option value="Other" className="bg-[#0c1020]">Other</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: Projects List */}
      {activeTab === "projects" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="glossy-card rounded-3xl p-12 text-center border border-white/[0.12] space-y-3 shadow-glossy-sm">
              <FolderGit2 className="w-12 h-12 mx-auto text-slate-500" />
              <h3 className="font-display font-semibold text-lg text-white">No projects found</h3>
              <p className="text-xs max-w-sm mx-auto text-slate-300">
                {searchQuery
                  ? "No project matches your search terms."
                  : "You haven't submitted any projects yet. Click 'Create New Project' to get started."}
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-2 px-5 py-2.5 rounded-2xl glossy-btn-primary text-white text-xs font-bold inline-flex items-center gap-2 shadow-neon-glow cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  onView={() => setSelectedProject(p._id)}
                  role="student"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: Analytics Charts */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {dashboardLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin" />
            </div>
          ) : dashboardData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Doughnut Chart */}
              <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
                <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-300" />
                  Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0c1020", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", fontSize: "12px", color: "#f8fafc", backdropFilter: "blur(12px)" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#cbd5e1" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Progress - Line Chart */}
              <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
                <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-300" />
                  Weekly Progress Submissions
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0c1020", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", fontSize: "12px", color: "#f8fafc", backdropFilter: "blur(12px)" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#cbd5e1" }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#00f2fe"
                      strokeWidth={3}
                      dot={{ fill: "#00f2fe", r: 5 }}
                      name="Submissions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Review Scores Bar Chart */}
              <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm lg:col-span-2">
                <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-300" />
                  Guide Milestone Review Scores
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={reviewScoresData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" domain={[0, 10]} fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0c1020", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", fontSize: "12px", color: "#f8fafc", backdropFilter: "blur(12px)" }} />
                    <Bar dataKey="score" fill="#10b981" radius={[8, 8, 0, 0]} name="Score (/10)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          <StudentDashboardCharts
            analyticsData={analyticsData}
            loading={analyticsLoading}
          />
        </div>
      )}

      {/* TAB CONTENT 3: Heatmap */}
      {activeTab === "heatmap" && (
        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <SubmissionConsistencyHeatmap studentId={user._id} height={320} />
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          onCheckDuplicate={checkDuplicate}
          duplicateMessage={duplicateCheck.message}
          defaultMilestones={DEFAULT_MILESTONES}
          guides={guides}
          rollNumber={user.rollNumber}
        />
      )}

      {selectedProject && (
        <ProjectDetail
          projectId={selectedProject}
          role="student"
          onClose={() => setSelectedProject(null)}
          onRefresh={fetchProjects}
        />
      )}
    </div>
  );
}
