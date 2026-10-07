import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function StudentDashboardCharts({ analyticsData, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs">
        No analytics data available
      </div>
    );
  }

  // Prepare data for charts
  const statusData = {
    labels: Object.keys(analyticsData.statusDistribution),
    datasets: [
      {
        data: Object.values(analyticsData.statusDistribution),
        backgroundColor: [
          "#ef4444", // Red
          "#f59e0b", // Yellow
          "#10b981", // Green
        ],
        borderWidth: 0,
      },
    ],
  };

  const weeklyData = {
    labels: Object.keys(analyticsData.weeklyUpdates).slice(-8), // Last 8 weeks
    datasets: [
      {
        label: "Progress Updates",
        data: Object.values(analyticsData.weeklyUpdates).slice(-8),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const reviewData = {
    labels: analyticsData.reviewScores.map((_, index) => `Review ${index + 1}`),
    datasets: [
      {
        label: "Review Score",
        data: analyticsData.reviewScores.map((r) => r.score),
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { size: 11 },
          padding: 16,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Project Status Distribution - Doughnut Chart */}
      <div className="saas-card rounded-2xl p-5 border border-slate-800">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
          Detailed Status Distribution
        </h3>
        <div className="h-60">
          <Doughnut
            data={statusData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  backgroundColor: "#0b0f19",
                  titleColor: "#f8fafc",
                  bodyColor: "#94a3b8",
                  borderColor: "#1e293b",
                  borderWidth: 1,
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed || 0;
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0,
                      );
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Weekly Progress - Line Chart */}
      <div className="saas-card rounded-2xl p-5 border border-slate-800">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
          Weekly Progress Trajectory
        </h3>
        <div className="h-60">
          <Line
            data={weeklyData}
            options={{
              ...chartOptions,
              scales: {
                x: {
                  grid: { color: "#141c2e" },
                  ticks: { color: "#64748b", font: { size: 10 } },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: "#141c2e" },
                  ticks: { color: "#64748b", font: { size: 10 } },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Review Scores - Bar Chart */}
      <div className="saas-card rounded-2xl p-5 border border-slate-800 lg:col-span-2">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
          Faculty Milestone Review Performance
        </h3>
        <div className="h-60">
          <Bar
            data={reviewData}
            options={{
              ...chartOptions,
              scales: {
                x: {
                  grid: { color: "#141c2e" },
                  ticks: { color: "#64748b", font: { size: 10 } },
                },
                y: {
                  beginAtZero: true,
                  max: 10,
                  grid: { color: "#141c2e" },
                  ticks: { color: "#64748b", font: { size: 10 } },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
