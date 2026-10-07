import React, { useState, useEffect } from "react";
import api from "../api";
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
} from "chart.js";
import { Pie, Line, Bar, Doughnut } from "react-chartjs-2";

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
);

export default function GuideDashboardCharts({ guideId, loading }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [reviewWorkload, setReviewWorkload] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          analyticsRes,
          workloadRes,
        ] = await Promise.all([
          api.get(`/guide/analytics/${guideId}`),
          api.get(`/guide/review-workload/${guideId}`),
        ]);

        setAnalyticsData(analyticsRes.data);
        setReviewWorkload(workloadRes.data);
      } catch (error) {
        console.error("Error fetching guide charts data:", error);
      }
    };

    if (guideId) {
      fetchAllData();
    }
  }, [guideId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
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

  // Chart data setup
  const statusData = {
    labels: Object.keys(analyticsData.statusDistribution),
    datasets: [
      {
        label: "Projects",
        data: Object.values(analyticsData.statusDistribution),
        backgroundColor: [
          "#ef4444",
          "#f59e0b",
          "#10b981",
        ],
        borderRadius: 6,
      },
    ],
  };

  const weeklyData = {
    labels: Object.keys(analyticsData.weeklySubmissions).slice(-8),
    datasets: [
      {
        label: "Submissions",
        data: Object.values(analyticsData.weeklySubmissions).slice(-8),
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const riskData = {
    labels: Object.keys(analyticsData.riskLevels),
    datasets: [
      {
        data: Object.values(analyticsData.riskLevels),
        backgroundColor: [
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ],
        borderWidth: 0,
      },
    ],
  };

  const deptData = {
    labels: Object.keys(analyticsData.departmentWise),
    datasets: [
      {
        data: Object.values(analyticsData.departmentWise),
        backgroundColor: [
          "#8b5cf6",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ec4899",
        ],
        borderWidth: 0,
      },
    ],
  };

  const workloadData = {
    labels: reviewWorkload.map((item) => item.period),
    datasets: [
      {
        label: "Pending Reviews",
        data: reviewWorkload.map((item) => item.pending),
        backgroundColor: "#f59e0b",
        borderRadius: 4,
      },
      {
        label: "Completed Reviews",
        data: reviewWorkload.map((item) => item.completed),
        backgroundColor: "#10b981",
        borderRadius: 4,
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
    <div className="space-y-6">
      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            Projects by Status
          </h3>
          <div className="h-60">
            <Bar data={statusData} options={{
              ...chartOptions,
              scales: {
                x: { grid: { color: "rgba(255, 255, 255, 0.08)" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
                y: { grid: { color: "rgba(255, 255, 255, 0.08)" }, ticks: { color: "#94a3b8", font: { size: 10 } } }
              }
            }} />
          </div>
        </div>

        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            Weekly Student Submissions
          </h3>
          <div className="h-60">
            <Line data={weeklyData} options={{
              ...chartOptions,
              scales: {
                x: { grid: { color: "rgba(255, 255, 255, 0.08)" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
                y: { grid: { color: "rgba(255, 255, 255, 0.08)" }, ticks: { color: "#94a3b8", font: { size: 10 } } }
              }
            }} />
          </div>
        </div>

        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Risk Levels</h3>
          <div className="h-60">
            <Doughnut data={riskData} options={chartOptions} />
          </div>
        </div>

        <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Department-wise Students
          </h3>
          <div className="h-60">
            <Pie data={deptData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Review Workload Chart */}
      <div className="glossy-card rounded-3xl p-6 border border-white/[0.12] shadow-glossy-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
          Review Workload
        </h3>
        <div className="h-60">
          <Bar
            data={workloadData}
            options={{
              ...chartOptions,
              scales: {
                x: {
                  stacked: true,
                  grid: { color: "rgba(255, 255, 255, 0.08)" },
                  ticks: { color: "#94a3b8", font: { size: 10 } },
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  grid: { color: "rgba(255, 255, 255, 0.08)" },
                  ticks: { color: "#94a3b8", font: { size: 10 } },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
