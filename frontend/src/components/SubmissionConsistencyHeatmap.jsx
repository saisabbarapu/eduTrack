import React, { useState, useEffect } from "react";
import api from "../api";

const SubmissionConsistencyHeatmap = ({ studentId, height = 350 }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchSubmissionData();
    }
  }, [studentId]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      const projectsResponse = await api.get("/projects");
      const studentProjects = projectsResponse.data.filter(
        (p) => p.studentId?._id === studentId || p.studentId === studentId,
      );
      const heatmap = generateHeatmapData(studentProjects);
      setHeatmapData(heatmap);
    } catch (error) {
      console.error("Failed to fetch submission data:", error);
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (projects) => {
    const now = new Date();
    const weeksBack = 12;
    const heatmap = [];

    for (let weekOffset = weeksBack - 1; weekOffset >= 0; weekOffset--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - weekOffset * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekNumber = getWeekNumber(weekStart);
      const year = weekStart.getFullYear();

      const hasSubmissions = projects.some((project) => {
        const progressUpdates = project.progressUpdates || [];
        return progressUpdates.some((update) => {
          const updateDate = new Date(update.createdAt);
          return updateDate >= weekStart && updateDate <= weekEnd;
        });
      });

      const submissionCount = projects.reduce((acc, project) => {
        const progressUpdates = project.progressUpdates || [];
        const count = progressUpdates.filter((update) => {
          const updateDate = new Date(update.createdAt);
          return updateDate >= weekStart && updateDate <= weekEnd;
        }).length;
        return acc + count;
      }, 0);

      heatmap.push({
        weekNumber,
        year,
        weekStart,
        weekEnd,
        hasSubmissions,
        submissionCount,
        weekLabel: `W${weekNumber}`,
        projects: projects.map((p) => p._id),
      });
    }

    return heatmap;
  };

  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const calculateCurrentStreak = (heatmap) => {
    let streak = 0;
    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i].hasSubmissions) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const totalWeeks = heatmapData.length;
  const submittedWeeks = heatmapData.filter(
    (week) => week.hasSubmissions,
  ).length;
  const consistencyRate =
    totalWeeks > 0 ? (submittedWeeks / totalWeeks) * 100 : 0;
  const currentStreak = calculateCurrentStreak(heatmapData);

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
          Submission Consistency & Streaks
        </h3>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-midnight-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Consistency Rate</p>
            <p className="text-cyan-400 font-bold text-base">
              {consistencyRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-midnight-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Submitted Weeks</p>
            <p className="text-emerald-400 font-bold text-base">
              {submittedWeeks}/{totalWeeks}
            </p>
          </div>
          <div className="bg-midnight-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Current Streak</p>
            <p className="text-blue-400 font-bold text-base">
              {currentStreak} weeks
            </p>
          </div>
          <div className="bg-midnight-900/80 border border-slate-800 rounded-xl p-3">
            <p className="text-slate-400 text-[10px] uppercase font-semibold">Active Projects</p>
            <p className="text-purple-400 font-bold text-base">
              {new Set(heatmapData.flatMap((w) => w.projects)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-midnight-900/60 border border-slate-800 rounded-xl p-4 overflow-x-auto">
        <div className="min-w-max">
          {/* Week blocks */}
          <div className="flex gap-2">
            {heatmapData.map((week, index) => {
              return (
                <div key={index} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-lg cursor-pointer transition-all flex items-center justify-center text-[10px] font-bold ${
                      week.hasSubmissions
                        ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-neon-cyan border border-cyan-400/50"
                        : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                    title={`${week.weekLabel}: ${week.submissionCount} submissions`}
                  >
                    {week.submissionCount || 0}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {week.weekLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="font-medium">Legend:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-900 border border-slate-800 rounded-xs" />
              <span>No Activity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-cyan-500 rounded-xs shadow-neon-cyan" />
              <span>Sprint Progress Logged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionConsistencyHeatmap;
