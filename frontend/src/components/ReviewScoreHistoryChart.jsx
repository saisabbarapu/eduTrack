import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const ReviewScoreHistoryChart = ({ projectId, height = 260 }) => {
  const [reviewData, setReviewData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/projects/${projectId}/reviews`);

        const processedData = response.data
          .filter(
            (review) => review.score !== null && review.score !== undefined,
          )
          .map((review, index) => ({
            id: review._id,
            reviewNumber: index + 1,
            date: new Date(review.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            fullDate: review.createdAt,
            score: review.score,
            status: review.status,
            comments: review.comments || "No remarks",
            milestoneName: review.milestoneName || "General Review",
            guideName: review.guideId?.name || "Faculty Guide",
          }))
          .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

        setReviewData(processedData);
      } catch (error) {
        console.error("Failed to fetch review data:", error);
        setReviewData([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchReviewData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
        <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mr-2" />
        Loading review history...
      </div>
    );
  }

  if (!reviewData.length) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500">
        <div className="text-center">
          <p className="text-base mb-1">📝</p>
          <p className="text-xs text-slate-300 font-medium">No review scores recorded yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Reviews will appear here as faculty evaluates milestones
          </p>
        </div>
      </div>
    );
  }

  const averageScore =
    reviewData.reduce((sum, review) => sum + review.score, 0) /
    reviewData.length;
  const highestScore = Math.max(...reviewData.map((r) => r.score));

  const labels = reviewData.map((r) => r.date);
  const scores = reviewData.map((r) => r.score);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Score (/10)",
        data: scores,
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.15)",
        borderWidth: 2.5,
        pointBackgroundColor: "#a855f7",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
        fill: true,
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
        max: 10,
        grid: { color: "#141c2e" },
        ticks: { color: "#64748b", font: { size: 10 }, stepSize: 2 },
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

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Review Score History
        </h4>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Avg: <strong className="text-white">{averageScore.toFixed(1)}/10</strong></span>
          <span>Peak: <strong className="text-emerald-400">{highestScore}/10</strong></span>
        </div>
      </div>

      <div style={{ height }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ReviewScoreHistoryChart;
