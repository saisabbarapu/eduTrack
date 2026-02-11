import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const DelayPredictionChart = ({ projectId, size = 'small', mlReport = null }) => {
  const [delayRisk, setDelayRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelayRisk = async () => {
      try {
        setLoading(true);
        
        // If mlReport is provided, use it directly
        if (mlReport) {
          setDelayRisk({
            delayRisk: mlReport.delayRisk || 'low',
            percentage: mlReport.delayPercentage || 0
          });
        } else {
          // Otherwise fetch from API
          const response = await api.get(`/ml/delay-risk/${projectId}`);
          setDelayRisk(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch delay risk:', error);
        setDelayRisk({ delayRisk: 'low', percentage: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (projectId || mlReport) {
      fetchDelayRisk();
    }
  }, [projectId, mlReport]);

  const getRiskLevel = (percentage) => {
    if (percentage >= 0 && percentage <= 40) return { 
      level: 'Low Risk', 
      color: '#22c55e', 
      bgColor: '#22c55e20',
      borderColor: '#22c55e'
    };
    if (percentage >= 41 && percentage <= 70) return { 
      level: 'Medium Risk', 
      color: '#eab308', 
      bgColor: '#eab30820',
      borderColor: '#eab308'
    };
    if (percentage >= 71 && percentage <= 100) return { 
      level: 'High Risk', 
      color: '#ef4444', 
      bgColor: '#ef444420',
      borderColor: '#ef4444'
    };
    return { 
      level: 'Unknown', 
      color: '#6b7280', 
      bgColor: '#6b728020',
      borderColor: '#6b7280'
    };
  };

  const getChartData = (percentage) => {
    const riskLevel = getRiskLevel(percentage);
    return {
      datasets: [{
        data: [percentage, 100 - percentage],
        backgroundColor: [riskLevel.color, '#374151'],
        borderColor: [riskLevel.borderColor, '#374151'],
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 100, height: 100, fontSize: '12px', labelSize: '10px' };
      case 'medium':
        return { width: 140, height: 140, fontSize: '16px', labelSize: '12px' };
      case 'large':
        return { width: 180, height: 180, fontSize: '20px', labelSize: '14px' };
      default:
        return { width: 100, height: 100, fontSize: '12px', labelSize: '10px' };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `Delay Risk: ${Math.round(context.parsed)}%`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ width: getSizeConfig().width, height: getSizeConfig().height }}>
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary-500" />
      </div>
    );
  }

  if (!delayRisk) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-xs" style={{ width: getSizeConfig().width, height: getSizeConfig().height }}>
        No Data
      </div>
    );
  }

  const percentage = delayRisk.percentage || 0;
  const riskLevel = getRiskLevel(percentage);
  const chartData = getChartData(percentage);
  const sizeConfig = getSizeConfig();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: sizeConfig.width, height: sizeConfig.height }}>
        <Doughnut data={chartData} options={chartOptions} />
        
        {/* Center text showing percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ marginTop: '20px' }}>
          <span className="font-bold" style={{ color: riskLevel.color, fontSize: sizeConfig.fontSize }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Risk label */}
      <div className="mt-2 text-center">
        <span 
          className="font-medium px-2 py-1 rounded-full text-xs"
          style={{ 
            backgroundColor: riskLevel.bgColor, 
            color: riskLevel.color,
            fontSize: sizeConfig.labelSize
          }}
        >
          {riskLevel.level}
        </span>
      </div>
    </div>
  );
};

export default DelayPredictionChart;
