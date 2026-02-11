import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ReviewScoreHistoryChart = ({ projectId, height = 300 }) => {
  const [reviewData, setReviewData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/projects/${projectId}/reviews`);
        
        // Process review data for chart
        const processedData = response.data
          .filter(review => review.score !== null && review.score !== undefined)
          .map((review, index) => ({
            id: review._id,
            reviewNumber: index + 1,
            date: new Date(review.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: '2-digit'
            }),
            fullDate: review.createdAt,
            score: review.score,
            status: review.status,
            comments: review.comments || 'No comments provided',
            milestoneName: review.milestoneName || 'General Review',
            guideName: review.guideId?.name || 'Unknown Guide'
          }))
          .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

        setReviewData(processedData);
      } catch (error) {
        console.error('Failed to fetch review data:', error);
        setReviewData([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchReviewData();
    }
  }, [projectId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#22c55e';
      case 'corrections':
        return '#eab308';
      case 'rejected':
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary-500 mr-2" />
        Loading review history...
      </div>
    );
  }

  if (!reviewData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <p className="mb-2">📊</p>
          <p>No review scores available yet</p>
          <p className="text-xs mt-1">Reviews will appear here once guides provide feedback</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const averageScore = reviewData.reduce((sum, review) => sum + review.score, 0) / reviewData.length;
  const highestScore = Math.max(...reviewData.map(r => r.score));
  const lowestScore = Math.min(...reviewData.map(r => r.score));
  const trend = reviewData.length > 1 
    ? reviewData[reviewData.length - 1].score - reviewData[0].score 
    : 0;

  // Prepare data for Chart.js
  const labels = reviewData.map(r => r.date);
  const scores = reviewData.map(r => r.score);
  const pointColors = reviewData.map(r => getStatusColor(r.status));

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Review Score',
        data: scores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: '#374151',
          display: true
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 2,
          font: {
            size: 12
          },
          callback: function(value) {
            return value + '/10';
          }
        },
        title: {
          display: true,
          text: 'Score (out of 10)',
          color: '#9ca3af',
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e2e8f0',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rectRounded'
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            const review = reviewData[dataIndex];
            return `Review #${review.reviewNumber} - ${review.date}`;
          },
          label: function(context) {
            const dataIndex = context.dataIndex;
            const review = reviewData[dataIndex];
            return [
              `Score: ${review.score}/10`,
              `Status: ${review.status}`,
              `Milestone: ${review.milestoneName}`,
              `Guide: ${review.guideName}`
            ];
          },
          afterLabel: function(context) {
            const dataIndex = context.dataIndex;
            const review = reviewData[dataIndex];
            return [
              '',
              '📝 Guide Remarks:',
              review.comments.length > 100 
                ? review.comments.substring(0, 100) + '...' 
                : review.comments
            ];
          }
        }
      },
      title: {
        display: false
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Review Score History</h3>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Average Score</p>
            <p className="text-white font-bold text-lg">{averageScore.toFixed(1)}/10</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Highest Score</p>
            <p className="text-green-400 font-bold text-lg">{highestScore}/10</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Lowest Score</p>
            <p className="text-red-400 font-bold text-lg">{lowestScore}/10</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Trend</p>
            <p className={`font-bold text-lg ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: height }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-slate-400">Approved (8-10 points)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-slate-400">Corrections (5-7 points)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-slate-400">Rejected (0-4 points)</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewScoreHistoryChart;
