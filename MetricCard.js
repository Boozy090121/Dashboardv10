import React, { useState } from 'react';

const MetricCard = ({
  title,
  value,
  previousValue,
  trend = 'neutral',
  percentage = false,
  goal,
  goalLabel = 'Target',
  status = 'normal',
  showDetails = false,
  detailMetrics = [],
  trendData = []
}) => {
  const [showDetailView, setShowDetailView] = useState(false);
  
  const formatValue = (val) => {
    if (val === undefined || val === null) return '-';
    if (percentage) return val.toFixed(1) + '%';
    return val.toLocaleString();
  };
  
  const calculateTrendPercentage = () => {
    if (!previousValue || previousValue === 0) return 0;
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };

  const trendPercentage = calculateTrendPercentage();
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–';
  const trendClass = 
    trend === 'up' ? 'text-green-500' : 
    trend === 'down' ? 'text-red-500' : 
    'text-gray-400';

  const statusClass = 
    status === 'success' ? 'border-l-4 border-green-500' : 
    status === 'warning' ? 'border-l-4 border-yellow-500' : 
    status === 'critical' ? 'border-l-4 border-red-500' : 
    'border-l-4 border-transparent';

  const toggleDetails = () => {
    setShowDetailView(!showDetailView);
  };

  // Calculate goal percentage for progress bar
  const goalPercentage = goal ? Math.min(100, (value / goal) * 100) : 0;
  
  // Calculate heights for mini chart bars
  const maxTrendValue = trendData.length > 0 
    ? Math.max(...trendData.map(item => item.value))
    : 0;
    
  const getBarHeight = (val) => {
    if (maxTrendValue === 0) return '0%';
    return `${Math.max(10, (val / maxTrendValue) * 100)}%`;
  };

  return (
    <div className={`metric-card ${statusClass}`}>
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {showDetails && (
          <button 
            className="details-button" 
            onClick={toggleDetails}
            aria-label="Toggle details"
          >
            {showDetailView ? '−' : '+'}
          </button>
        )}
      </div>
      
      <div className="metric-value-container">
        <div className="metric-value">{formatValue(value)}</div>
        
        {previousValue !== undefined && (
          <div className={`metric-trend ${trendClass}`}>
            <span>{trendIcon}</span>
            <span>{Math.abs(trendPercentage)}%</span>
          </div>
        )}
      </div>
      
      {/* Progress toward goal */}
      {goal && (
        <div className="metric-goal">
          <div className="goal-bar-container">
            <div className="goal-bar-background">
              <div 
                className="goal-bar-progress"
                style={{ width: `${goalPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="goal-text">
            <span>Current</span>
            <span>{goalLabel}: {formatValue(goal)}</span>
          </div>
        </div>
      )}
      
      {/* Mini chart */}
      {trendData.length > 0 && (
        <div className="metric-mini-chart">
          {trendData.map((item, idx) => (
            <div 
              key={idx}
              className="mini-chart-bar"
              style={{ 
                height: getBarHeight(item.value),
                opacity: idx === trendData.length - 1 ? 1 : 0.6 + (idx * 0.1)
              }}
            ></div>
          ))}
        </div>
      )}
      
      {/* Detail metrics */}
      {showDetails && showDetailView && detailMetrics.length > 0 && (
        <div className="metric-details">
          <div className="details-header">
            <h4>Details</h4>
          </div>
          <div className="details-content">
            {detailMetrics.map((metric, idx) => (
              <div key={idx} className="detail-item">
                <span className="detail-label">{metric.label}</span>
                <span className="detail-value">{formatValue(metric.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard; 