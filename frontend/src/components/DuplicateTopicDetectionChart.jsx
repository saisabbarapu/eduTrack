import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DuplicateTopicDetectionChart = ({ duplicateData, height = 300 }) => {
  // Process data for chart
  const getRiskLevel = (similarity) => {
    if (similarity >= 80) return { level: 'High Duplicate Risk', color: '#ef4444', bgColor: '#ef444420' };
    if (similarity >= 60) return { level: 'Medium Risk', color: '#eab308', bgColor: '#eab30820' };
    if (similarity >= 40) return { level: 'Low Risk', color: '#3b82f6', bgColor: '#3b82f620' };
    return { level: 'Very Low Risk', color: '#22c55e', bgColor: '#22c55e20' };
  };

  if (!duplicateData || !duplicateData.matches || duplicateData.matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <p className="mb-2">🔍</p>
          <p>No similar topics found</p>
          <p className="text-xs mt-1">Your topic appears to be unique</p>
        </div>
      </div>
    );
  }

  // Take top 5 most similar topics
  const topResults = duplicateData.matches.slice(0, 5);
  
  // Prepare data for Chart.js
  const labels = topResults.map(match => {
    const title = match.title || match.existingTitle || 'Unknown Topic';
    return title.length > 30 ? title.substring(0, 30) + '...' : title;
  });
  
  const similarities = topResults.map(match => match.similarity || match.score || 0);
  const backgroundColors = topResults.map(match => {
    const similarity = match.similarity || match.score || 0;
    return getRiskLevel(similarity).color;
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Similarity Score (%)',
        data: similarities,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 40
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12
          },
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Similarity Score',
          color: '#9ca3af',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            const match = topResults[dataIndex];
            return match.title || match.existingTitle || 'Unknown Topic';
          },
          label: function(context) {
            const dataIndex = context.dataIndex;
            const match = topResults[dataIndex];
            const similarity = match.similarity || match.score || 0;
            const risk = getRiskLevel(similarity);
            return [
              `Similarity: ${similarity}%`,
              `Risk Level: ${risk.level}`,
              `Student: ${match.studentName || 'Unknown'}`,
              `Department: ${match.department || 'Unknown'}`
            ];
          },
          afterLabel: function(context) {
            const dataIndex = context.dataIndex;
            const match = topResults[dataIndex];
            const abstract = match.abstract || match.existingAbstract || '';
            if (abstract.length > 0) {
              return [
                '',
                '📝 Abstract:',
                abstract.length > 100 
                  ? abstract.substring(0, 100) + '...' 
                  : abstract
              ];
            }
            return [];
          }
        }
      },
      title: {
        display: false
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // Calculate statistics
  const highestSimilarity = Math.max(...similarities);
  const averageSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  const highRiskCount = similarities.filter(sim => sim >= 80).length;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Duplicate Topic Detection Results</h3>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Highest Similarity</p>
            <p className={`font-bold text-lg ${highestSimilarity >= 80 ? 'text-red-400' : highestSimilarity >= 60 ? 'text-yellow-400' : 'text-green-400'}`}>
              {highestSimilarity.toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Average Similarity</p>
            <p className="text-white font-bold text-lg">{averageSimilarity.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-slate-400 text-xs">High Risk Topics</p>
            <p className={`font-bold text-lg ${highRiskCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {highRiskCount}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: height }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Risk Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-slate-400">High Risk (≥80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-slate-400">Medium Risk (60-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-slate-400">Low Risk (40-59%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-slate-400">Very Low Risk (&lt;40%)</span>
        </div>
      </div>

      {/* High Risk Alert */}
      {highRiskCount > 0 && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-400 text-lg">⚠️</div>
            <div>
              <p className="text-red-400 font-medium mb-1">High Duplicate Risk Detected</p>
              <p className="text-slate-300 text-sm">
                Found {highRiskCount} topic{highRiskCount > 1 ? 's' : ''} with ≥80% similarity. 
                Consider modifying your topic or abstract to ensure originality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicateTopicDetectionChart;
