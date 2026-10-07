import React from "react";
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

const DuplicateTopicDetectionChart = ({ duplicateData, height = 260 }) => {
  const getRiskLevel = (similarity) => {
    if (similarity >= 80)
      return {
        level: "High Duplicate Risk",
        color: "#ef4444",
        bgColor: "#ef444420",
      };
    if (similarity >= 60)
      return { level: "Medium Risk", color: "#f59e0b", bgColor: "#f59e0b20" };
    if (similarity >= 40)
      return { level: "Low Risk", color: "#06b6d4", bgColor: "#06b6d420" };
    return { level: "Unique Topic", color: "#10b981", bgColor: "#10b98120" };
  };

  if (
    !duplicateData ||
    !duplicateData.matches ||
    duplicateData.matches.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500">
        <div className="text-center">
          <p className="text-xl mb-1">✨</p>
          <p className="text-xs font-semibold text-slate-200">No duplicate topics detected</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Your project proposal appears to be completely original</p>
        </div>
      </div>
    );
  }

  const topResults = duplicateData.matches.slice(0, 5);

  const labels = topResults.map((match) => {
    const title = match.title || match.existingTitle || "Topic";
    return title.length > 25 ? title.substring(0, 25) + "..." : title;
  });

  const similarities = topResults.map((match) => {
    return Math.round((match.similarityScore || match.similarity || 0) * 100);
  });

  const colors = similarities.map((sim) => getRiskLevel(sim).color);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Similarity %",
        data: similarities,
        backgroundColor: colors,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: "#141c2e" },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "#141c2e" },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0b0f19",
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        borderColor: "#1e293b",
        borderWidth: 1,
      },
    },
  };

  const highestSimilarity = Math.max(...similarities);
  const highRiskCount = similarities.filter((sim) => sim >= 80).length;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          ML Similarity Matches
        </h4>
        <span className="text-[11px] text-slate-400">
          Max Match: <strong className={highestSimilarity >= 80 ? "text-rose-400" : "text-cyan-400"}>{highestSimilarity}%</strong>
        </span>
      </div>

      <div style={{ height }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {highRiskCount > 0 && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          <strong>Notice:</strong> High similarity with existing archived college projects. Consider adjusting scope or dataset.
        </div>
      )}
    </div>
  );
};

export default DuplicateTopicDetectionChart;
