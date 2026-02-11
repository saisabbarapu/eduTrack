import React, { useState, useEffect } from 'react';
import api from '../api';
import CreateProjectModal from '../components/CreateProjectModal.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectDetail from '../components/ProjectDetail.jsx';
import SubmissionConsistencyHeatmap from '../components/SubmissionConsistencyHeatmap.jsx';
import StudentDashboardCharts from '../components/StudentDashboardCharts.jsx';
import { useAuth } from '../context/AuthContext.jsx';
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
  ResponsiveContainer
} from 'recharts';

const DEFAULT_MILESTONES = [
  { name: 'Phase 1: Topic selection + SRS', description: 'SRS document approval', status: 'pending', dueDate: '' },
  { name: 'Phase 2: UI/Backend development', description: 'Core development', status: 'pending', dueDate: '' },
  { name: 'Phase 3: ML integration', description: 'ML module integration', status: 'pending', dueDate: '' },
  { name: 'Phase 4: Final report + Demo', description: 'Report and demo', status: 'pending', dueDate: '' }
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [assignedGuide, setAssignedGuide] = useState(null);
  const [duplicateCheck, setDuplicateCheck] = useState({ message: '' });
  const [guides, setGuides] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchProjects = () => {
    api.get('/projects').then((res) => setProjects(res.data)).catch(console.error).finally(() => setLoading(false));
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
    api.get(`/student/dashboard/${user._id}`)
      .then((res) => setDashboardData(res.data))
      .catch(console.error)
      .finally(() => setDashboardLoading(false));
  };

  const fetchAnalyticsData = () => {
    setAnalyticsLoading(true);
    api.get(`/student/dashboard/${user._id}/analytics`)
      .then((res) => setAnalyticsData(res.data))
      .catch(console.error)
      .finally(() => setAnalyticsLoading(false));
  };

  useEffect(() => {
    if (!showCreate) return;
    api.get('/users/guides')
      .then((res) => setGuides(res.data || []))
      .catch(() => setGuides([]));
  }, [showCreate]);

  const handleCreate = (formData, proposalFile) => {
    const fd = new FormData();
    const skipKeys = ['milestones', 'teamMembers'];
    Object.keys(formData).forEach((k) => {
      if (skipKeys.includes(k)) return;
      const v = formData[k];
      fd.append(k, v != null && v !== '' ? v : '');
    });
    fd.append('milestones', JSON.stringify(formData.milestones || DEFAULT_MILESTONES));
    fd.append('teamMembers', JSON.stringify(Array.isArray(formData.teamMembers) ? formData.teamMembers : (formData.teamMembers || '').split(',').map((s) => s.trim()).filter(Boolean)));
    if (proposalFile) fd.append('proposalPdf', proposalFile);
    api.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => { setShowCreate(false); fetchProjects(); })
      .catch((e) => alert(e.response?.data?.error || 'Failed to create project'));
  };

  const checkDuplicate = (title, abstract) => {
    api.post('/ml/duplicate-check', { title, abstract: abstract || title })
      .then((res) => setDuplicateCheck({ message: res.data.message, matches: res.data.matches || [] }))
      .catch(() => setDuplicateCheck({ message: 'Check unavailable' }));
  };

  // Chart data preparation
  const statusChartData = dashboardData?.statusDistribution ? 
    Object.entries(dashboardData.statusDistribution).map(([name, value]) => ({ name, value })) : [];

  const weeklyProgressData = dashboardData?.weeklyProgress ? 
    Object.entries(dashboardData.weeklyProgress).map(([week, count]) => ({ week, count })) : [];

  const reviewScoresData = dashboardData?.reviewScores?.map((review, index) => ({
    name: review.milestoneName.substring(0, 15) + (review.milestoneName.length > 15 ? '...' : ''),
    score: review.score,
    guide: review.guideName
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Student Dashboard</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium">
          + New Project
        </button>
      </div>

      {/* Dashboard Stats Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-1">Total Projects</div>
            <div className="text-2xl font-bold text-white">{dashboardData.totalProjects}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-400">{dashboardData.completedProjects}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-1">Avg Progress</div>
            <div className="text-2xl font-bold text-blue-400">{dashboardData.averageProgress}%</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-1">Reviews</div>
            <div className="text-2xl font-bold text-purple-400">{dashboardData.reviewScores?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {dashboardLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500" />
        </div>
      ) : dashboardData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Project Status Distribution - Doughnut Chart */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Progress Updates - Line Chart */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress Updates</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Milestones Submitted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Review Scores - Bar Chart */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Review Scores (out of 10)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewScoresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar 
                  dataKey="score" 
                  fill="#10b981"
                  name="Review Score"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-12 text-center text-slate-400 mb-8">
          Failed to load dashboard data.
        </div>
      )}
      <StudentDashboardCharts analyticsData={analyticsData} loading={analyticsLoading} />
      <SubmissionConsistencyHeatmap studentId={user._id} height={350} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-4">My Projects</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
          No projects yet. Create your first project to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              onView={() => setSelectedProject(p._id)}
              role="student"
            />
          ))}
        </div>
      )}

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
