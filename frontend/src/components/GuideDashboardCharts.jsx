import React, { useState, useEffect } from 'react';
import api from '../api';
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
  Legend
} from 'chart.js';
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2';

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
  Legend
);

export default function GuideDashboardCharts({ guideId, loading }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [reviewWorkload, setReviewWorkload] = useState([]);
  const [topRiskProjects, setTopRiskProjects] = useState([]);
  const [completionRate, setCompletionRate] = useState(null);
  const [monthlyReviews, setMonthlyReviews] = useState({});
  const [attentionList, setAttentionList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all chart data
        const [
          analyticsRes,
          workloadRes,
          topRiskRes,
          completionRes,
          monthlyRes,
          attentionRes
        ] = await Promise.all([
          api.get(`/guide/analytics/${guideId}`),
          api.get(`/guide/review-workload/${guideId}`),
          api.get(`/guide/top-risk/${guideId}`),
          api.get(`/guide/completion-rate/${guideId}`),
          api.get(`/guide/reviews/monthly/${guideId}`),
          api.get(`/guide/attention-list/${guideId}`)
        ]);

        setAnalyticsData(analyticsRes.data);
        setReviewWorkload(workloadRes.data);
        setTopRiskProjects(topRiskRes.data);
        setCompletionRate(completionRes.data);
        setMonthlyReviews(monthlyRes.data);
        setAttentionList(attentionRes.data);

      } catch (error) {
        console.error('Error fetching guide dashboard data:', error);
      }
    };

    if (guideId) {
      fetchAllData();
    }
  }, [guideId]);

  const fetchStudentPerformance = async (studentId) => {
    try {
      const response = await api.get(`/guide/student-performance/${studentId}`);
      setStudentPerformance(response.data);
    } catch (error) {
      console.error('Error fetching student performance:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  // Chart 1: Bar Chart - Projects by Status
  const statusData = {
    labels: Object.keys(analyticsData?.statusDistribution || {}),
    datasets: [{
      label: 'Projects',
      data: Object.values(analyticsData?.statusDistribution || {}),
      backgroundColor: ['#3b82f6', '#22c55e', '#ef4444', '#eab308'],
      borderWidth: 0
    }]
  };

  // Chart 2: Line Chart - Weekly Student Submissions
  const weeklyData = {
    labels: Object.keys(analyticsData?.weeklySubmissions || {}),
    datasets: [{
      label: 'Submissions',
      data: Object.values(analyticsData?.weeklySubmissions || {}),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Chart 3: Doughnut Chart - Risk Levels
  const riskData = {
    labels: Object.keys(analyticsData?.riskDistribution || {}),
    datasets: [{
      data: Object.values(analyticsData?.riskDistribution || {}),
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 0
    }]
  };

  // Chart 4: Pie Chart - Department-wise Students
  const deptData = {
    labels: Object.keys(analyticsData?.departmentDistribution || {}),
    datasets: [{
      data: Object.values(analyticsData?.departmentDistribution || {}),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 0
    }]
  };

  // Chart 5: Stacked Bar Chart - Review Workload
  const workloadData = {
    labels: reviewWorkload.map(w => w.projectName),
    datasets: [
      {
        label: 'Pending',
        data: reviewWorkload.map(w => w.pending),
        backgroundColor: '#eab308'
      },
      {
        label: 'Completed',
        data: reviewWorkload.map(w => w.completed),
        backgroundColor: '#22c55e'
      }
    ]
  };

  // Chart 6: Horizontal Bar Chart - Top Risk Projects
  const riskProjectsData = {
    labels: topRiskProjects.map(p => p.projectName),
    datasets: [{
      label: 'Risk %',
      data: topRiskProjects.map(p => p.riskPercentage),
      backgroundColor: topRiskProjects.map(p => p.riskColor),
      borderWidth: 0
    }]
  };

  // Chart 7: Doughnut Chart - Completion Rate
  const completionChartData = {
    labels: Object.keys(completionRate?.completionData || {}),
    datasets: [{
      data: Object.values(completionRate?.completionData || {}),
      backgroundColor: ['#22c55e', '#3b82f6', '#6b7280'],
      borderWidth: 0
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
      {/* Main Analytics Charts - Prompt 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Projects by Status</h3>
          <div className="h-64">
            <Bar data={statusData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Student Submissions</h3>
          <div className="h-64">
            <Line data={weeklyData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Levels</h3>
          <div className="h-64">
            <Doughnut data={riskData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Department-wise Students</h3>
          <div className="h-64">
            <Pie data={deptData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Review Workload Chart - Prompt 2 */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Review Workload</h3>
        <div className="h-64">
          <Bar data={workloadData} options={{
            ...chartOptions,
            scales: {
              x: {
                stacked: true,
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' }
              },
              y: {
                stacked: true,
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' }
              }
            }
          }} />
        </div>
      </div>

      {/* Top Risk Projects Chart - Prompt 3 */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Risk Projects</h3>
        <div className="h-64">
          <Bar data={riskProjectsData} options={{
            ...chartOptions,
            indexAxis: 'y',
            scales: {
              x: {
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' }
              },
              y: {
                grid: { display: false },
                ticks: { color: '#9ca3af' }
              }
            }
          }} />
        </div>
      </div>

      {/* Student Performance Chart - Prompt 4 */}
      {studentPerformance && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Student Performance</h3>
            <button 
              onClick={() => setStudentPerformance(null)}
              className="text-slate-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Milestone Submissions Timeline</h4>
              <div className="h-48">
                <Line 
                  data={{
                    labels: studentPerformance.milestonesTimeline.map(m => 
                      new Date(m.date).toLocaleDateString()
                    ),
                    datasets: [{
                      label: 'Milestones',
                      data: studentPerformance.milestonesTimeline.map((_, index) => index + 1),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Review Scores</h4>
              <div className="h-48">
                <Bar 
                  data={{
                    labels: Object.keys(studentPerformance.averageScores),
                    datasets: [{
                      label: 'Average Score',
                      data: Object.values(studentPerformance.averageScores),
                      backgroundColor: '#22c55e',
                      borderWidth: 0
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Rate Chart - Prompt 5 */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Project Completion Rate</h3>
        <div className="h-64">
          <Doughnut data={completionChartData} options={chartOptions} />
        </div>
        {completionRate && (
          <div className="mt-4 text-center">
            <p className="text-white font-medium">
              Completion Rate: {completionRate.completionRate.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Monthly Review Activity Chart - Prompt 6 */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Review Activity</h3>
        <div className="h-64">
          <Line 
            data={{
              labels: Object.keys(monthlyReviews),
              datasets: [{
                label: 'Reviews',
                data: Object.values(monthlyReviews),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }]
            }} 
            options={chartOptions} 
          />
        </div>
      </div>

      {/* Students Needing Attention Chart - Prompt 7 */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Students Needing Attention</h3>
        <div className="h-64">
          <Bar 
            data={{
              labels: attentionList.map(s => s.studentName),
              datasets: [{
                label: 'Missed Updates',
                data: attentionList.map(s => s.missedUpdates),
                backgroundColor: attentionList.map(s => s.hasHighRisk ? '#ef4444' : '#eab308'),
                borderWidth: 0
              }]
            }} 
            options={chartOptions} 
          />
        </div>
      </div>

      {/* Student Selection for Performance */}
      {!studentPerformance && attentionList.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Student for Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attentionList.map((student, index) => (
              <button
                key={index}
                onClick={() => fetchStudentPerformance(student.studentId)}
                className="text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <p className="text-white font-medium">{student.studentName}</p>
                <p className="text-slate-400 text-sm">{student.rollNumber}</p>
                <p className="text-slate-500 text-xs">{student.department}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
