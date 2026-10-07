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
  RadialLinearScale,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";

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
  RadialLinearScale,
  Filler,
);

export default function AdminDashboardCharts({ analyticsData, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
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

  // Line chart data - Projects created per month
  const monthlyData = {
    labels:
      Object.keys(analyticsData?.projectsPerMonth || {}).length > 0
        ? Object.keys(analyticsData.projectsPerMonth)
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Projects Created",
        data:
          Object.values(analyticsData?.projectsPerMonth || {}).length > 0
            ? Object.values(analyticsData.projectsPerMonth)
            : [4, 8, 12, 10, 15, 20],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Bar chart data - Department-wise project counts
  const departmentData = {
    labels:
      Object.keys(analyticsData?.departmentWise || {}).length > 0
        ? Object.keys(analyticsData.departmentWise)
        : ["CSE", "IT", "ECE", "EEE", "MECH"],
    datasets: [
      {
        label: "Projects",
        data:
          Object.values(analyticsData?.departmentWise || {}).length > 0
            ? Object.values(analyticsData.departmentWise)
            : [15, 12, 8, 5, 3],
        backgroundColor: "#06b6d4",
        borderRadius: 6,
      },
    ],
  };

  // Doughnut chart data - Project status distribution
  const statusData = {
    labels:
      Object.keys(analyticsData?.statusDistribution || {}).length > 0
        ? Object.keys(analyticsData.statusDistribution)
        : ["Approved", "Pending", "Rejected", "Completed"],
    datasets: [
      {
        data:
          Object.values(analyticsData?.statusDistribution || {}).length > 0
            ? Object.values(analyticsData.statusDistribution)
            : [20, 10, 5, 8],
        backgroundColor: [
          "#10b981", // Approved - Emerald
          "#f59e0b", // Pending - Amber
          "#ef4444", // Rejected - Red
          "#06b6d4", // Completed - Cyan
        ],
        borderWidth: 0,
      },
    ],
  };

  // Radar chart data - Risk level distribution
  const riskData = {
    labels: ["Low Risk", "Medium Risk", "High Risk"],
    datasets: [
      {
        label: "Risk Profile",
        data: [
          analyticsData?.riskLevels?.Low || 5,
          analyticsData?.riskLevels?.Medium || 3,
          analyticsData?.riskLevels?.High || 2,
        ],
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        borderColor: "#06b6d4",
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#fff",
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
    <div className="space-y-5">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Projects Per Month - Line Chart */}
        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            Projects Created Per Month
          </h3>
          <div className="h-60">
            <Line
              data={monthlyData}
              options={{
                ...chartOptions,
                scales: {
                  x: {
                    grid: { color: "rgba(255, 255, 255, 0.08)" },
                    ticks: { color: "#94a3b8", font: { size: 10 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255, 255, 255, 0.08)" },
                    ticks: { color: "#94a3b8", font: { size: 10 } },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Department-wise Projects - Bar Chart */}
        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            Department-wise Allocations
          </h3>
          <div className="h-60">
            <Bar
              data={departmentData}
              options={{
                ...chartOptions,
                scales: {
                  x: {
                    grid: { color: "rgba(255, 255, 255, 0.08)" },
                    ticks: { color: "#94a3b8", font: { size: 10 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255, 255, 255, 0.08)" },
                    ticks: { color: "#94a3b8", font: { size: 10 } },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Project Status Distribution - Doughnut Chart */}
        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            Status Breakdown
          </h3>
          <div className="h-60">
            <Doughnut
              data={statusData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    backgroundColor: "#0c1020",
                    titleColor: "#f8fafc",
                    bodyColor: "#cbd5e1",
                    borderColor: "rgba(255, 255, 255, 0.15)",
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

        {/* Risk Level Distribution - Radar Chart */}
        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            Institutional Risk Profile
          </h3>
          <div className="h-60">
            <Radar
              data={riskData}
              options={{
                ...chartOptions,
                scales: {
                  r: {
                    angleLines: { color: "rgba(255, 255, 255, 0.08)" },
                    grid: { color: "rgba(255, 255, 255, 0.08)" },
                    pointLabels: { color: "#cbd5e1", font: { size: 10, weight: "bold" } },
                    ticks: { backdropColor: "transparent", color: "#94a3b8", font: { size: 9 } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
