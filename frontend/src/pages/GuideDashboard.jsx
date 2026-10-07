import React, { useState, useEffect } from "react";
import api from "../api";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectDetail from "../components/ProjectDetail.jsx";
import GuideDashboardCharts from "../components/GuideDashboardCharts.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Award,
  Clock,
  Users,
  FileCheck2,
} from "lucide-react";

export default function GuideDashboard() {
  const { user } = useAuth();
  const [tagged, setTagged] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetch = () => {
    setLoading(true);

    Promise.all([
      api.get("/projects/tagged").then((r) => setTagged(r.data)),
      api.get("/projects").then((r) => setAccepted(r.data)),
      api
        .get(`/guide/dashboard/${user._id}/analytics`)
        .catch(() => {}),
    ]).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (user?._id) {
      fetch();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Faculty Glossy Banner */}
      <div className="glossy-panel rounded-3xl p-7 border border-white/[0.15] shadow-glossy-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.18] text-purple-300 text-xs font-semibold shadow-glossy-sm">
              <Award className="w-3.5 h-3.5 text-purple-300" />
              Faculty Evaluation Console
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Faculty Workspace — <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-300">{user?.name}</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-xl drop-shadow-xs">
              Review project proposals, approve milestones, score capstone submissions, and track mentee progress in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glossy-card rounded-2xl px-5 py-3 border border-white/[0.12] shadow-glossy-sm text-center">
              <span className="text-[10px] text-slate-300 block font-semibold uppercase tracking-wider">Pending Requests</span>
              <span className="text-xl font-extrabold text-amber-300">{tagged.length}</span>
            </div>
            <div className="glossy-card rounded-2xl px-5 py-3 border border-white/[0.12] shadow-glossy-sm text-center">
              <span className="text-[10px] text-slate-300 block font-semibold uppercase tracking-wider">Active Projects</span>
              <span className="text-xl font-extrabold text-emerald-300">{accepted.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <GuideDashboardCharts guideId={user._id} loading={loading} />

      {/* Projects Review Workspace */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-400/40 border-t-purple-300 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Requests */}
          {tagged.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-amber-300">
                <Clock className="w-4 h-4 animate-pulse" />
                <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider drop-shadow-xs">
                  Pending Tag Requests ({tagged.length})
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-glossy-sm backdrop-blur-md">
                  Action Required
                </span>
              </div>

              <div className="grid gap-4 grid-cols-1">
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

          {/* Active Projects */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider drop-shadow-xs">
                  My Active Projects ({accepted.length})
                </h2>
              </div>
            </div>

            {accepted.length === 0 ? (
              <div className="glossy-card rounded-3xl p-12 text-center border border-white/[0.12] space-y-3 shadow-glossy-sm">
                <Users className="w-12 h-12 mx-auto text-slate-500" />
                <h3 className="font-display font-semibold text-base text-white">No active projects yet</h3>
                <p className="text-xs max-w-sm mx-auto text-slate-300">
                  When students tag you as their faculty guide, their requests will appear in your queue.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1">
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
        </div>
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
