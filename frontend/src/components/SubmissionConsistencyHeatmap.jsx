import React, { useState, useEffect } from "react";
import api from "../api";

const SubmissionConsistencyHeatmap = ({ studentId, height = 400 }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (studentId) {
      fetchSubmissionData();
    }
  }, [studentId]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);

      // Get all projects for the student
      const projectsResponse = await api.get("/projects");
      const studentProjects = projectsResponse.data.filter(
        (p) => p.studentId._id === studentId || p.studentId === studentId,
      );

      // Generate heatmap data for the last 12 weeks
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
    const weeksBack = 12; // Show last 12 weeks
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

      // Check if any submissions were made during this week
      const hasSubmissions = projects.some((project) => {
        // Check progress updates
        const progressUpdates = project.progressUpdates || [];
        const hasProgressUpdate = progressUpdates.some((update) => {
          const updateDate = new Date(update.createdAt);
          return updateDate >= weekStart && updateDate <= weekEnd;
        });

        // Check milestone submissions
        const hasMilestoneSubmission = project.milestones.some((milestone) => {
          if (!milestone.submittedAt) return false;
          const submittedDate = new Date(milestone.submittedAt);
          return submittedDate >= weekStart && submittedDate <= weekEnd;
        });

        return hasProgressUpdate || hasMilestoneSubmission;
      });

      heatmap.push({
        weekNumber,
        year,
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        weekLabel: `Week ${weekNumber}`,
        submissions: hasSubmissions ? 1 : 0,
        hasSubmissions,
        intensity: hasSubmissions ? 100 : 0,
        projects: projects.filter((p) => {
          const progressUpdates = p.progressUpdates || [];
          const hasProgressUpdate = progressUpdates.some((update) => {
            const updateDate = new Date(update.createdAt);
            return updateDate >= weekStart && updateDate <= weekEnd;
          });
          const hasMilestoneSubmission = p.milestones.some((milestone) => {
            if (!milestone.submittedAt) return false;
            const submittedDate = new Date(milestone.submittedAt);
            return submittedDate >= weekStart && submittedDate <= weekEnd;
          });
          return hasProgressUpdate || hasMilestoneSubmission;
        }).length,
      });
    }

    return heatmap.reverse(); // Show most recent weeks first
  };

  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const pastDaysOfYear = (d - yearStart) / 86400000;
    return Math.ceil((pastDaysOfYear + yearStart.getUTCDay() + 1) / 7);
  };

  const getMonthName = (monthIndex) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[monthIndex];
  };

  const getIntensityColor = (intensity) => {
    if (intensity === 100) return "#22c55e"; // Green - submitted
    if (intensity === 0) return "#374151"; // Gray - not submitted
    return "#6b7280"; // Default gray
  };

  const getCellSize = () => {
    const containerWidth = 800; // Approximate container width
    const cellSize = Math.floor(containerWidth / 14); // 12 weeks + labels
    return Math.max(40, Math.min(60, cellSize)); // Between 40-60px
  };

  const cellSize = getCellSize();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary-500 mx-auto mb-2"></div>
          <p>Loading submission data...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalWeeks = heatmapData.length;
  const submittedWeeks = heatmapData.filter(
    (week) => week.hasSubmissions,
  ).length;
  const consistencyRate =
    totalWeeks > 0 ? (submittedWeeks / totalWeeks) * 100 : 0;
  const currentStreak = calculateCurrentStreak(heatmapData);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Submission Consistency
        </h3>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Consistency Rate</p>
            <p className="text-white font-bold text-lg">
              {consistencyRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Submitted Weeks</p>
            <p className="text-green-400 font-bold text-lg">
              {submittedWeeks}/{totalWeeks}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Current Streak</p>
            <p className="text-blue-400 font-bold text-lg">
              {currentStreak} weeks
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Total Projects</p>
            <p className="text-purple-400 font-bold text-lg">
              {new Set(heatmapData.flatMap((w) => w.projects)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 overflow-x-auto">
        <div className="min-w-max">
          {/* Month headers */}
          <div className="flex mb-2">
            <div className="w-16 text-center text-xs text-slate-500 font-medium">
              Week
            </div>
            {heatmapData.map((week, index) => {
              const monthName = getMonthName(
                new Date(week.weekStart).getMonth(),
              );
              const prevMonth =
                index > 0
                  ? getMonthName(
                      new Date(heatmapData[index - 1].weekStart).getMonth(),
                    )
                  : "";
              const showMonth = monthName !== prevMonth;
              return (
                <div key={index} className="flex-1 text-center">
                  {showMonth && (
                    <div className="text-xs text-slate-400 font-medium border-b border-slate-700 pb-1">
                      {monthName}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 pt-1">
                    {week.weekLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Heatmap Grid */}
          <div className="flex">
            <div className="w-16 text-xs text-slate-500 font-medium">
              Status
            </div>
            <div className="flex">
              {heatmapData.map((week, index) => (
                <div
                  key={index}
                  className="relative group"
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                >
                  <div
                    className={`absolute inset-0 rounded cursor-pointer transition-all duration-200 hover:scale-110 ${
                      week.hasSubmissions
                        ? "bg-green-500 hover:bg-green-400"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                    style={{
                      backgroundColor: getIntensityColor(week.intensity),
                    }}
                    title={`${week.weekLabel}: ${week.hasSubmissions ? "Submitted" : "No submission"} (${week.projects} project${week.projects.length !== 1 ? "s" : ""})`}
                  />

                  {/* Week number overlay */}
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white pointer-events-none">
                    {week.weekNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-slate-400">Submitted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700 rounded"></div>
          <span className="text-slate-400">No Submission</span>
        </div>
      </div>

      {/* Consistency Message */}
      <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              consistencyRate >= 80
                ? "bg-green-500"
                : consistencyRate >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          ></div>
          <div>
            <p className="text-white font-medium">
              {consistencyRate >= 80
                ? "Excellent"
                : consistencyRate >= 60
                  ? "Good"
                  : "Needs Improvement"}{" "}
              Submission Consistency
            </p>
            <p className="text-slate-400 text-sm">
              You've submitted updates in {consistencyRate.toFixed(0)}% of the
              last {totalWeeks} weeks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateCurrentStreak = (heatmapData) => {
  let streak = 0;
  for (let i = heatmapData.length - 1; i >= 0; i--) {
    if (heatmapData[i].hasSubmissions) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export default SubmissionConsistencyHeatmap;
