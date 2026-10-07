import React from "react";
import DelayPredictionChart from "./DelayPredictionChart.jsx";
import {
  User,
  Award,
  ArrowRight,
  Code2,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function ProjectCard({ project, onView, role }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return {
          label: "Accepted",
          icon: CheckCircle2,
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-neon-emerald",
        };
      case "pending":
        return {
          label: "Pending Guide Review",
          icon: Clock,
          color: "bg-amber-500/15 text-amber-300 border-amber-400/40",
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: AlertCircle,
          color: "bg-rose-500/15 text-rose-300 border-rose-400/40",
        };
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle2,
          color: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-neon-glow",
        };
      default:
        return {
          label: status || "Draft",
          icon: Clock,
          color: "bg-slate-500/15 text-slate-300 border-slate-400/40",
        };
    }
  };

  const statusInfo = getStatusBadge(project.guideStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="glossy-card rounded-3xl p-6 glossy-card-hover relative overflow-hidden group">
      {/* Top Accent Glossy Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0 space-y-3.5">
          {/* Header Row: Title & Domain Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors truncate drop-shadow-xs">
              {project.title}
            </h3>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.08] backdrop-blur-md text-cyan-300 border border-white/[0.15] shadow-glossy-sm flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              {project.domain || "General"}
            </span>
          </div>

          <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
            {project.abstract || "No abstract provided."}
          </p>

          {/* Metadata Row: Tech stack & Roles */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-0.5">
            {project.techStack && (
              <div className="flex items-center gap-1.5 text-slate-200 font-medium bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/[0.08]">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{project.techStack}</span>
              </div>
            )}

            {project.studentId && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Student: <strong className="text-white">{project.studentId.name}</strong>
                </span>
              </div>
            )}

            {project.guideId && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  Guide: <strong className="text-white">{project.guideId.name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar & Status Pill Row */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 text-[11px] font-medium">Sprint Progress</span>
                <span className="font-bold text-cyan-300 text-xs">{project.progressPercent || 0}%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.08] shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-500 shadow-neon-glow"
                  style={{ width: `${Math.min(project.progressPercent || 0, 100)}%` }}
                />
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 shrink-0 backdrop-blur-md ${statusInfo.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Right Action Column & Delay Gauge */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
          <DelayPredictionChart projectId={project._id} size="small" />

          <button
            onClick={onView}
            className="px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-cyan-500 hover:text-black text-slate-200 text-xs font-bold border border-white/[0.15] hover:border-cyan-400 shadow-glossy-sm transition-all duration-200 flex items-center gap-1.5 group/btn whitespace-nowrap cursor-pointer backdrop-blur-md"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
