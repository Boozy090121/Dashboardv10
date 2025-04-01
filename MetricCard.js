import React, { useState, useMemo, useCallback } from 'react';

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
    if (val === undefined || val === null) {
      console.log('Formatting undefined/null value');
      return '-';
    }
    if (percentage) {
      console.log('Formatting percentage value:', val);
      return Number(val).toFixed(1) + '%';
    }
    console.log('Formatting numeric value:', val);
    return Number(val).toLocaleString();
  };
  
  const calculateTrendPercentage = () => {
    console.log('Calculating trend percentage:', { value, previousValue });
    if (!previousValue || previousValue === 0 || !value) {
      console.log('Cannot calculate trend percentage - missing or zero values');
      return 0;
    }
    const change = ((value - previousValue) / previousValue) * 100;
    console.log('Calculated trend percentage:', change);
    return change.toFixed(1);
  };

  const trendPercentage = calculateTrendPercentage();
  console.log('Final trend percentage:', trendPercentage);
  
  // Define trend indicators and their styling
  const getTrendIndicator = () => {
    console.log('Getting trend indicator for:', trend);
    if (trend === 'up') {
      return {
        icon: '↑',
        className: 'trend-up',
        ariaLabel: 'Increasing'
      };
    } else if (trend === 'down') {
      return {
        icon: '↓',
        className: 'trend-down',
        ariaLabel: 'Decreasing'
      };
    } else {
      return {
        icon: '–',
        className: 'trend-neutral',
        ariaLabel: 'No change'
      };
    }
  };
  
  const trendIndicator = getTrendIndicator();
  console.log('Trend indicator:', trendIndicator);

  // Status border styling
  const getStatusClass = () => {
    console.log('Getting status class for:', status);
    switch(status) {
      case 'success':
        return 'status-success';
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      default:
        return 'status-normal';
    }
  };

  const toggleDetails = () => {
    console.log('Toggling details:', !showDetailView);
    setShowDetailView(!showDetailView);
  };

  // Calculate goal percentage for progress bar
  const goalPercentage = useMemo(() => {
    console.log('Calculating goal percentage:', { value, goal });
    if (!goal || !value) return 0;
    const percentage = Math.min(100, (value / goal) * 100);
    console.log('Calculated goal percentage:', percentage);
    return percentage;
  }, [value, goal]);
  
  // Calculate heights for mini chart bars
  const maxTrendValue = useMemo(() => {
    console.log('Calculating max trend value from:', trendData);
    if (!trendData || trendData.length === 0) return 0;
    const max = Math.max(...trendData.map(item => item.value));
    console.log('Max trend value:', max);
    return max;
  }, [trendData]);
    
  const getBarHeight = useCallback((val) => {
    console.log('Calculating bar height for value:', val);
    if (maxTrendValue === 0 || !val) return '0%';
    const height = `${Math.max(10, (val / maxTrendValue) * 100)}%`;
    console.log('Calculated bar height:', height);
    return height;
  }, [maxTrendValue]);

  console.log('Rendering MetricCard:', {
    title,
    value,
    previousValue,
    trend,
    percentage,
    goal,
    status,
    showDetails,
    hasDetailMetrics: detailMetrics?.length > 0,
    hasTrendData: trendData?.length > 0
  });

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
        <div className="metric-value" 
          onMouseEnter={() => setShowTooltip(true)} 
          onMouseLeave={() => setShowTooltip(false)}
        >
          {formatValue(value)}
          {tooltip && showTooltip && (
            <div className="metric-tooltip">
              {tooltip}
            </div>
          )}
        </div>
        
        {previousValue !== undefined && previousValue !== null && (
          <div className={`metric-trend ${trendIndicator.className}`}>
            <span className="trend-icon" aria-label={trendIndicator.ariaLabel}>{trendIndicator.icon}</span>
            <span className="trend-value">{Math.abs(trendPercentage)}%</span>
          </div>
        )}
      </div>
      
      {/* Progress toward goal */}
      {goal && value && (
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
      {trendData && trendData.length > 0 && (
        <div className="metric-mini-chart">
          {trendData.map((item, idx) => (
            <div 
              key={idx}
              className={`mini-chart-bar ${idx === trendData.length - 1 ? 'current' : ''}`}
              style={{ height: getBarHeight(item.value) }}
              title={`${item.label || ''}: ${formatValue(item.value)}`}
            ></div>
          ))}
        </div>
      )}
      
      {/* Detail metrics */}
      {showDetails && showDetailView && detailMetrics && detailMetrics.length > 0 && (
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