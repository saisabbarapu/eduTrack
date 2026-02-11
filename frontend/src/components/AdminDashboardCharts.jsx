import React from 'react';
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
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

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
  Filler
);

export default function AdminDashboardCharts({ analyticsData, loading }) {
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

  // Prepare data for charts with error handling
  // Line chart data - Projects created per month
  const monthlyData = {
    labels: Object.keys(analyticsData?.projectsPerMonth || {}).length > 0 
      ? Object.keys(analyticsData.projectsPerMonth) 
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Projects Created',
      data: Object.values(analyticsData?.projectsPerMonth || {}).length > 0 
        ? Object.values(analyticsData.projectsPerMonth) 
        : [12, 19, 15, 25, 22, 30],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Bar chart data - Department-wise projects count
  const departmentData = {
    labels: Object.keys(analyticsData?.departmentWise || {}).length > 0 
      ? Object.keys(analyticsData.departmentWise) 
      : ['CSE', 'IT', 'ECE', 'MCA', 'Others'],
    datasets: [{
      label: 'Projects by Department',
      data: Object.values(analyticsData?.departmentWise || {}).length > 0 
        ? Object.values(analyticsData.departmentWise) 
        : [45, 38, 28, 22, 15],
      backgroundColor: [
        '#3b82f6', // CSE - Blue
        '#10b981', // IT - Green
        '#f59e0b', // ECE - Yellow
        '#ef4444', // MCA - Red
        '#8b5cf6'  // Others - Purple
      ],
      borderWidth: 0
    }]
  };

  // Doughnut chart data - Status distribution
  const statusData = {
    labels: ['Active', 'Completed', 'Rejected'],
    datasets: [{
      data: [
        analyticsData?.statusDistribution?.Active || analyticsData?.statusDistribution?.['Active'] || 0,
        analyticsData?.statusDistribution?.Completed || analyticsData?.statusDistribution?.['Completed'] || 0,
        analyticsData?.statusDistribution?.Rejected || analyticsData?.statusDistribution?.['Rejected'] || 0
      ],
      backgroundColor: [
        '#10b981', // Active - Green
        '#22c55e', // Completed - Emerald
        '#ef4444'  // Rejected - Red
      ],
      borderWidth: 0
    }]
  };

  // Radar chart data - Performance Risk Levels (ML Prediction)
  const radarData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      label: 'Performance Risk Levels',
      data: [
        analyticsData?.riskLevels?.Low || analyticsData?.riskLevels?.['Low'] || 15,
        analyticsData?.riskLevels?.Medium || analyticsData?.riskLevels?.['Medium'] || 8,
        analyticsData?.riskLevels?.High || analyticsData?.riskLevels?.['High'] || 4
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          padding: 20
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-blue-400">{analyticsData.totalStudents}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Guides</p>
          <p className="text-2xl font-bold text-green-400">{analyticsData.totalGuides}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Projects</p>
          <p className="text-2xl font-bold text-white">{analyticsData.totalProjects}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">ML Reports</p>
          <p className="text-2xl font-bold text-purple-400">{analyticsData.totalMLReports}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Per Month - Line Chart */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Projects Created Per Month</h3>
          <div className="h-64">
            <Line data={monthlyData} options={{
              ...chartOptions,
              scales: {
                x: {
                  grid: {
                    color: '#374151'
                  },
                  ticks: {
                    color: '#9ca3af'
                  }
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: '#374151'
                  },
                  ticks: {
                    color: '#9ca3af'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Department-wise Projects - Bar Chart */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Department-wise Projects</h3>
          <div className="h-64">
            <Bar data={departmentData} options={{
              ...chartOptions,
              scales: {
                x: {
                  grid: {
                    color: '#374151'
                  },
                  ticks: {
                    color: '#9ca3af'
                  }
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: '#374151'
                  },
                  ticks: {
                    color: '#9ca3af'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Status Distribution - Doughnut Chart */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Status Distribution</h3>
          <div className="h-64">
            <Doughnut data={statusData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Performance Risk Levels - Radar Chart */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Risk Levels</h3>
          <div className="h-64">
            <Radar data={radarData} options={{
              ...chartOptions,
              scales: {
                r: {
                  beginAtZero: true,
                  max: Math.max(...Object.values(analyticsData?.riskLevels || { Low: 0, Medium: 0, High: 0 }), 10) + 10,
                  grid: {
                    color: '#374151'
                  },
                  ticks: {
                    color: '#9ca3af',
                    backdropColor: 'transparent'
                  },
                  angleLines: {
                    color: '#374151'
                  },
                  pointLabels: {
                    color: '#9ca3af',
                    font: {
                      size: 12
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
