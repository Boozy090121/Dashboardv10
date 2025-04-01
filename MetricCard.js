import React, { useState } from 'react';
import { TrendingUp, TrendingDown, MoreHorizontal, X } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  previousValue,
  trend = 'none',
  percentage = false,
  currency = false,
  status = 'normal',
  goal = null,
  goalLabel = 'Target',
  trendData = [],
  showDetails = false,
  detailMetrics = []
}) => {
  const [showingDetails, setShowingDetails] = useState(false);
  
  // Calculate the change percentage
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return 0;
    return ((value - previousValue) / Math.abs(previousValue)) * 100;
  };
  
  const change = calculateChange();
  
  // Format the displayed value
  const formatValue = (val) => {
    if (val === null || val === undefined) return '-';
    
    // For large numbers, use locale string (adds commas)
    let formatted = typeof val === 'number' && val >= 1000 
      ? val.toLocaleString() 
      : val;
    
    // Format based on type
    if (percentage) {
      formatted = typeof val === 'number' ? val.toFixed(1) + '%' : val;
    } else if (currency) {
      formatted = typeof val === 'number' ? '$' + val.toLocaleString() : val;
    } else if (typeof val === 'number' && !Number.isInteger(val)) {
      formatted = val.toFixed(1);
    }
    
    return formatted;
  };
  
  // Status color mapping
  const statusColors = {
    success: 'bg-green-50 text-green-700',
    normal: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
    critical: 'bg-red-50 text-red-700'
  };
  
  const trendColors = {
    up: change >= 0 ? 'text-green-500' : 'text-red-500',
    down: change >= 0 ? 'text-red-500' : 'text-green-500',
    none: 'text-gray-400'
  };
  
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {showDetails && (
          <button 
            className="details-button"
            onClick={() => setShowingDetails(!showingDetails)}
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>
      
      <div className="metric-value-container">
        <div className="metric-value">{formatValue(value)}</div>
        
        {trend !== 'none' && (
          <div className={`metric-trend ${trendColors[trend]}`}>
            {trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      {goal !== null && (
        <div className="metric-goal">
          <div className="goal-bar-container">
            <div className="goal-bar-background">
              <div 
                className="goal-bar-progress"
                style={{ 
                  width: `${Math.min(100, (value / goal) * 100)}%`,
                  backgroundColor: status === 'critical' ? '#ef4444' : 
                                   status === 'warning' ? '#f59e0b' : 
                                   status === 'success' ? '#10b981' : '#3b82f6'
                }}
              />
            </div>
          </div>
          <div className="goal-text">
            <span>{goalLabel}: {formatValue(goal)}</span>
          </div>
        </div>
      )}
      
      {/* Show mini chart if trendData exists */}
      {trendData && trendData.length > 0 && !showingDetails && (
        <div className="metric-mini-chart">
          {trendData.map((point, i) => (
            <div 
              key={i}
              className="mini-chart-bar"
              style={{ 
                height: `${(point.value / Math.max(...trendData.map(p => p.value))) * 24}px`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Detail View */}
      {showingDetails && showDetails && (
        <div className="metric-details">
          <div className="details-header">
            <h4>Breakdown</h4>
            <button onClick={() => setShowingDetails(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="details-content">
            {detailMetrics.map((metric, index) => (
              <div key={index} className="detail-item">
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