import React, { useState } from 'react';

/**
 * MetricCard component displays a standardized metric visualization with trends and goals
 */
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
  trendData = [],
  subtitle,
  tooltip
}) => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
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
  
  // Define trend indicators and their styling
  const getTrendIndicator = () => {
    if (trend === 'up') {
      return {
        icon: '↑',
        className: 'text-green-500',
        ariaLabel: 'Increasing'
      };
    } else if (trend === 'down') {
      return {
        icon: '↓',
        className: 'text-red-500',
        ariaLabel: 'Decreasing'
      };
    } else {
      return {
        icon: '–',
        className: 'text-gray-400',
        ariaLabel: 'No change'
      };
    }
  };
  
  const trendIndicator = getTrendIndicator();

  // Status border styling
  const getStatusClass = () => {
    switch(status) {
      case 'success':
        return 'border-l-4 border-success';
      case 'warning':
        return 'border-l-4 border-warning';
      case 'critical':
        return 'border-l-4 border-error';
      default:
        return 'border-l-4 border-transparent';
    }
  };

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
    <div className={`metric-card ${getStatusClass()}`}>
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
      
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      
      <div className="metric-value-container">
        <div className="metric-value" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
          {formatValue(value)}
          {tooltip && showTooltip && (
            <div className="metric-tooltip">
              {tooltip}
            </div>
          )}
        </div>
        
        {previousValue !== undefined && (
          <div className={`metric-trend ${trendIndicator.className}`}>
            <span className="trend-icon" aria-label={trendIndicator.ariaLabel}>{trendIndicator.icon}</span>
            <span className="trend-value">{Math.abs(trendPercentage)}%</span>
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
            <span>{formatValue(value)} of {formatValue(goal)}</span>
            <span>{goalLabel}</span>
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
              title={`${item.label}: ${formatValue(item.value)}`}
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