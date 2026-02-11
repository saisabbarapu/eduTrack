import React, { useState, useEffect } from 'react';
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

const ProjectTimelineChart = ({ project, height = 400 }) => {
  const [timelineData, setTimelineData] = useState(null);

  useEffect(() => {
    if (project && project.milestones) {
      const processedData = processTimelineData(project);
      setTimelineData(processedData);
    }
  }, [project]);

  const processTimelineData = (project) => {
    const startDate = new Date(project.startDate || project.createdAt);
    const endDate = new Date(project.expectedEndDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Default milestones if not provided
    const defaultMilestones = [
      { name: 'Topic Approval', status: 'pending' },
      { name: 'Proposal', status: 'pending' },
      { name: 'Review-1', status: 'pending' },
      { name: 'Review-2', status: 'pending' },
      { name: 'Final Submission', status: 'pending' }
    ];

    const milestones = (project.milestones || defaultMilestones).map((milestone, index) => {
      const milestoneData = {
        name: milestone.name,
        status: milestone.status || 'pending',
        expectedStart: 0,
        expectedEnd: 0,
        actualStart: 0,
        actualEnd: 0
      };

      // Calculate expected timeline (evenly distributed)
      const expectedStartPercent = (index / (project.milestones?.length || 5)) * 100;
      const expectedEndPercent = ((index + 1) / (project.milestones?.length || 5)) * 100;
      
      milestoneData.expectedStart = expectedStartPercent;
      milestoneData.expectedEnd = expectedEndPercent;

      // Calculate actual timeline if submitted
      if (milestone.submittedAt) {
        const submittedDate = new Date(milestone.submittedAt);
        const daysFromStart = Math.ceil((submittedDate - startDate) / (1000 * 60 * 60 * 24));
        const actualStartPercent = Math.min((daysFromStart / totalDays) * 100, 100);
        
        milestoneData.actualStart = actualStartPercent;
        
        // If reviewed, calculate end date
        if (milestone.reviewedAt) {
          const reviewedDate = new Date(milestone.reviewedAt);
          const daysFromStartReview = Math.ceil((reviewedDate - startDate) / (1000 * 60 * 60 * 24));
          const actualEndPercent = Math.min((daysFromStartReview / totalDays) * 100, 100);
          milestoneData.actualEnd = actualEndPercent;
        } else {
          // Still pending review, show as ongoing
          milestoneData.actualEnd = actualStartPercent + 2; // Small bar to show submission
        }
      }

      return milestoneData;
    });

    return milestones;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return '#22c55e';
      case 'submitted':
        return '#3b82f6';
      case 'corrections':
        return '#eab308';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (!project || !timelineData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No timeline data available
      </div>
    );
  }

  // Prepare data for Chart.js
  const labels = timelineData.map(m => m.name);
  
  const expectedData = timelineData.map(m => m.expectedEnd - m.expectedStart);
  const actualData = timelineData.map(m => m.actualEnd - m.actualStart);
  const actualStartData = timelineData.map(m => m.actualStart);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Expected Timeline',
        data: expectedData,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1,
        stack: 'expected',
      },
      {
        label: 'Expected Start',
        data: timelineData.map(m => m.expectedStart),
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        stack: 'expected',
      },
      {
        label: 'Actual Progress',
        data: actualData,
        backgroundColor: timelineData.map(m => getStatusColor(m.status)),
        borderColor: timelineData.map(m => getStatusColor(m.status)),
        borderWidth: 1,
        stack: 'actual',
      },
      {
        label: 'Actual Start',
        data: actualStartData,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        stack: 'actual',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          color: timelineData.map(m => getStatusColor(m.status)),
          font: {
            size: 11
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
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const milestone = timelineData[dataIndex];
            
            if (context.dataset.label === 'Expected Timeline') {
              return `Expected: ${milestone.expectedStart.toFixed(1)}% - ${milestone.expectedEnd.toFixed(1)}%`;
            } else if (context.dataset.label === 'Actual Progress') {
              if (milestone.actualEnd > 0) {
                return `Actual: ${milestone.actualStart.toFixed(1)}% - ${milestone.actualEnd.toFixed(1)}%`;
              } else {
                return `Actual: Not started`;
              }
            }
            return '';
          },
          afterLabel: function(context) {
            const dataIndex = context.dataIndex;
            const milestone = timelineData[dataIndex];
            return `Status: ${milestone.status}`;
          }
        }
      },
      title: {
        display: false
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Project Timeline</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-slate-400">Expected Timeline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-slate-400">Actual Progress</span>
          </div>
        </div>
      </div>

      <div style={{ height: height }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-slate-400">Completed/Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-slate-400">Submitted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-slate-400">Corrections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-slate-400">Rejected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-slate-400">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimelineChart;
