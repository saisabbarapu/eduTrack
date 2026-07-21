import React, { useState, useEffect } from "react";
import api from "../api";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectDetail from "../components/ProjectDetail.jsx";
import GuideDashboardCharts from "../components/GuideDashboardCharts.jsx";
import { useAuth } from "../context/AuthContext.jsx";
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

export default function GuideDashboard() {
  const { user } = useAuth();
  const [tagged, setTagged] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    setAnalyticsLoading(true);

    Promise.all([
      api.get("/projects/tagged").then((r) => setTagged(r.data)),
      api.get("/projects").then((r) => setAccepted(r.data)),
      api
        .get(`/guide/dashboard/${user._id}/analytics`)
        .then((r) => setAnalyticsData(r.data)),
    ]).finally(() => {
      setLoading(false);
      setAnalyticsLoading(false);
    });
  };

  useEffect(() => {
    if (user?._id) {
      fetch();
    }
  }, [user]);

  const handleApproveMilestone = async (projectId, milestoneId, status) => {
    try {
      await api.put(`/projects/${projectId}/milestones/${milestoneId}`, {
        status,
      });
      fetch(); // Refresh data
    } catch (error) {
      console.error("Failed to update milestone:", error);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-8">
        Guide Dashboard
      </h1>

      {/* Charts Section */}
      <GuideDashboardCharts guideId={user._id} loading={loading} />

      {/* Projects Section */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" />
        </div>
      ) : (
        <>
          {/* Pending approval */}
          {tagged.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-amber-400 mb-4">
                Pending approval ({tagged.length})
              </h2>
              <div className="grid gap-4">
                {tagged.map((p) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    onView={() => setSelectedProject(p._id)}
                    role="guide"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Accepted projects */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">
              My accepted projects
            </h2>
            {accepted.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
                No accepted projects yet. Accept requests from the list above.
              </div>
            ) : (
              <div className="grid gap-4">
                {accepted.map((p) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    onView={() => setSelectedProject(p._id)}
                    role="guide"
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {selectedProject && (
        <ProjectDetail
          projectId={selectedProject}
          role="guide"
          onClose={() => setSelectedProject(null)}
          onRefresh={fetch}
        />
      )}
    </div>
  );
}
