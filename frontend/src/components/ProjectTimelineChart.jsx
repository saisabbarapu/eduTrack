import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const ProjectTimelineChart = ({ project, height = 300 }) => {
  const [timelineData, setTimelineData] = useState(null);

  useEffect(() => {
    if (project && project.milestones) {
      const processedData = processTimelineData(project);
      setTimelineData(processedData);
    }
  }, [project]);

  const processTimelineData = (project) => {
    const defaultMilestones = [
      { name: "Topic Approval", status: "pending" },
      { name: "Proposal", status: "pending" },
      { name: "Review-1", status: "pending" },
      { name: "Review-2", status: "pending" },
      { name: "Final Submission", status: "pending" },
    ];

    const milestones = (project.milestones || defaultMilestones).map(
      (milestone, index) => {
        const milestoneData = {
          name: milestone.name,
          status: milestone.status || "pending",
          expectedStart: 0,
          expectedEnd: 0,
          actualStart: 0,
          actualEnd: 0,
        };

        const expectedStartPercent =
          (index / (project.milestones?.length || 5)) * 100;
        const expectedEndPercent =
          ((index + 1) / (project.milestones?.length || 5)) * 100;

        milestoneData.expectedStart = expectedStartPercent;
        milestoneData.expectedEnd = expectedEndPercent;

        if (milestone.status === "approved" || milestone.status === "completed") {
          milestoneData.actualStart = expectedStartPercent;
          milestoneData.actualEnd = expectedEndPercent;
        } else if (milestone.status === "submitted") {
          milestoneData.actualStart = expectedStartPercent;
          milestoneData.actualEnd = expectedStartPercent + (expectedEndPercent - expectedStartPercent) * 0.7;
        }

        return milestoneData;
      },
    );

    return milestones;
  };

  if (!timelineData) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
        Loading timeline data...
      </div>
    );
  }

  const chartData = {
    labels: timelineData.map((m) => m.name),
    datasets: [
      {
        label: "Expected Timeline",
        data: timelineData.map((m) => [m.expectedStart, m.expectedEnd]),
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "Actual Progress",
        data: timelineData.map((m) => [m.actualStart, m.actualEnd]),
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: "#141c2e" },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          callback: (value) => `${value}%`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#94a3b8", font: { size: 11 }, padding: 12 },
      },
      tooltip: {
        backgroundColor: "#0b0f19",
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        borderColor: "#1e293b",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Project Milestone Timeline
        </h4>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-blue-500/50 rounded-xs" /> Planned
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> Completed
          </span>
        </div>
      </div>

      <div style={{ height }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ProjectTimelineChart;
