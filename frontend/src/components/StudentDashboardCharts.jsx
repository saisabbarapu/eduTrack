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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12 text-slate-400">
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
          "#ef4444", // Not Started - Red
          "#f59e0b", // In Progress - Yellow
          "#10b981", // Completed - Green
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
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
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
        backgroundColor: "#8b5cf6",
        borderColor: "#7c3aed",
        borderWidth: 2,
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
          color: "#e2e8f0",
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Status Distribution - Doughnut Chart */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Project Status Distribution
        </h3>
        <div className="h-64">
          <Doughnut
            data={statusData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
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
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          {Object.entries(analyticsData.statusDistribution).map(
            ([status, count]) => (
              <div key={status} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    status === "Not Started"
                      ? "bg-red-500"
                      : status === "In Progress"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                ></div>
                <span className="text-slate-300">
                  {status}: {count}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Weekly Progress Updates - Line Chart */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Weekly Progress Updates
        </h3>
        <div className="h-64">
          <Line
            data={weeklyData}
            options={{
              ...chartOptions,
              scales: {
                x: {
                  grid: {
                    color: "#374151",
                  },
                  ticks: {
                    color: "#9ca3af",
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "#374151",
                  },
                  ticks: {
                    color: "#9ca3af",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Review Scores - Bar Chart */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">
          Review Scores by Guide
        </h3>
        <div className="h-64">
          <Bar
            data={reviewData}
            options={{
              ...chartOptions,
              scales: {
                x: {
                  grid: {
                    color: "#374151",
                  },
                  ticks: {
                    color: "#9ca3af",
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 10,
                  grid: {
                    color: "#374151",
                  },
                  ticks: {
                    color: "#9ca3af",
                  },
                },
              },
            }}
          />
        </div>
        <div className="mt-4 text-sm text-slate-400">
          Average Score:{" "}
          {analyticsData.reviewScores.length > 0
            ? (
                analyticsData.reviewScores.reduce(
                  (sum, r) => sum + r.score,
                  0,
                ) / analyticsData.reviewScores.length
              ).toFixed(1)
            : "N/A"}{" "}
          / 10
        </div>
      </div>
    </div>
  );
}
