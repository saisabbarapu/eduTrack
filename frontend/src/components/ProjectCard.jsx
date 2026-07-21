import React from "react";
import DelayPredictionChart from "./DelayPredictionChart.jsx";

export default function ProjectCard({ project, onView, role }) {
  const statusColor = {
    pending: "bg-amber-500/20 text-amber-400",
    accepted: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white truncate">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {project.domain} • {project.techStack || "N/A"}
          </p>
          {project.studentId && (
            <p className="text-slate-500 text-sm mt-1">
              Student: {project.studentId.name}
            </p>
          )}
          {project.guideId && (
            <p className="text-slate-500 text-sm mt-1">
              Guide: {project.guideId.name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[project.guideStatus] || "bg-slate-600 text-slate-300"}`}
            >
              {project.guideStatus}
            </span>
            <span className="text-slate-500 text-sm">
              Progress: {project.progressPercent}%
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 ml-4">
          {/* Delay Prediction Chart */}
          <DelayPredictionChart projectId={project._id} size="small" />

          {/* View Button */}
          <button
            onClick={onView}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium whitespace-nowrap"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
