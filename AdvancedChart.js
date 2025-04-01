import React, { useState, useCallback } from 'react';

const AdvancedChart = ({
  title,
  description,
  data = [],
  type = 'bar', // 'bar', 'line', 'pie', 'donut', 'area'
  xDataKey,
  yDataKey,
  categories = [],
  height = 300,
  percentage = false,
  comparisonValue,
  comparisonLabel,
  allowDownload = false,
  onDrillDown = null,
}) => {
  const [drillDownData, setDrillDownData] = useState(null);
  
  // Function to handle drill-down click
  const handleDataPointClick = useCallback((item, index) => {
    if (!onDrillDown) return;
    
    const drillDownResult = onDrillDown(item, index);
    if (drillDownResult) {
      setDrillDownData(drillDownResult);
    }
  }, [onDrillDown]);
  
  // Function to go back from drill-down view
  const handleBackClick = useCallback(() => {
    setDrillDownData(null);
  }, []);
  
  // Function to simulate chart download
  const handleDownload = useCallback(() => {
    alert('Chart download simulation: Would download a PNG image of this chart');
  }, []);
  
  // Data formatting helper
  const formatValue = (value) => {
    if (percentage) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };
  
  // Render different chart types based on the type prop
  const renderChart = () => {
    // If we have drill-down data, show that instead
    const chartData = drillDownData ? drillDownData.data : data;
    const chartTitle = drillDownData ? drillDownData.title : title;
    
    // Determine which data to render based on chart type
    switch (type) {
      case 'pie':
      case 'donut':
        return (
          <div className="chart-container">
            <h4 className="chart-title">{chartTitle}</h4>
            <div 
              className="chart-content pie-chart" 
              style={{ height: height, position: 'relative' }}
            >
              <div className="pie-segments">
                {chartData.map((item, index) => {
                  const value = typeof yDataKey === 'string' ? item[yDataKey] : item.value;
                  const name = typeof xDataKey === 'string' ? item[xDataKey] : item.name;
                  const percentage = 
                    item.percentage || 
                    (chartData.reduce((sum, d) => sum + (typeof yDataKey === 'string' ? d[yDataKey] : d.value), 0) > 0
                      ? (value / chartData.reduce((sum, d) => sum + (typeof yDataKey === 'string' ? d[yDataKey] : d.value), 0)) * 100
                      : 0);
                  
                  // For visual purposes, generate colors
                  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                  const color = colors[index % colors.length];
                  
                  // For donut chart, create a circle in the middle
                  const isDonut = type === 'donut';
                  
                  return (
                    <div 
                      key={index}
                      className="pie-segment-container"
                      onClick={() => handleDataPointClick(item, index)}
                      style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
                    >
                      <div 
                        className="pie-segment" 
                        style={{ 
                          backgroundColor: color,
                          width: '80px',
                          height: '80px',
                          marginBottom: '10px',
                          borderRadius: '5px'
                        }}
                      ></div>
                      <div className="pie-label">
                        <div>{name}</div>
                        <div className="pie-value">
                          {formatValue(value)} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Placeholder pie visual */}
              <div className="pie-visual" style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'conic-gradient(#3b82f6 0% 55%, #ef4444 55% 75%, #10b981 75% 90%, #f59e0b 90% 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {type === 'donut' && (
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'white'
                  }}></div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'bar':
        return (
          <div className="chart-container">
            <h4 className="chart-title">{chartTitle}</h4>
            <div className="chart-content bar-chart" style={{ height }}>
              {chartData.map((item, index) => {
                const value = typeof yDataKey === 'string' ? item[yDataKey] : item.value;
                const name = typeof xDataKey === 'string' ? item[xDataKey] : item.name;
                
                // Calculate bar height percentage
                const maxValue = Math.max(...chartData.map(d => 
                  typeof yDataKey === 'string' ? d[yDataKey] : d.value
                ));
                const barHeight = (value / maxValue) * 80; // 80% of container height max
                
                // For visual purposes, generate colors
                const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                const color = colors[index % colors.length];
                
                return (
                  <div 
                    key={index}
                    className="bar-item"
                    onClick={() => handleDataPointClick(item, index)}
                    style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
                  >
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          height: `${barHeight}%`, 
                          backgroundColor: color 
                        }}
                      >
                        <span className="bar-value">{formatValue(value)}</span>
                      </div>
                      
                      {comparisonValue && (
                        <div 
                          className="comparison-line"
                          style={{ 
                            position: 'absolute',
                            width: '100%',
                            height: '2px',
                            backgroundColor: '#000',
                            bottom: `${(comparisonValue / maxValue) * 80}%`,
                          }}
                        />
                      )}
                    </div>
                    <div className="bar-label">{name}</div>
                  </div>
                );
              })}
            </div>
            
            {comparisonValue && comparisonLabel && (
              <div className="comparison-legend">
                <span className="comparison-indicator"></span>
                <span className="comparison-label">{comparisonLabel}: {formatValue(comparisonValue)}</span>
              </div>
            )}
          </div>
        );
        
      case 'line':
        return (
          <div className="chart-container">
            <h4 className="chart-title">{chartTitle}</h4>
            <div className="chart-content line-chart" style={{ height }}>
              <div className="chart-placeholder">
                <div className="line-chart-visual" style={{
                  width: '100%',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between'
                }}>
                  {/* Simplified visual line chart */}
                  <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <path 
                      d="M0,150 C50,120 100,180 150,100 C200,20 250,90 300,60 C350,30 400,50 500,10" 
                      stroke="#3b82f6" 
                      strokeWidth="3" 
                      fill="none"
                    />
                    {comparisonValue && (
                      <line 
                        x1="0" 
                        y1={200 - (comparisonValue / 100 * 200)} 
                        x2="500" 
                        y2={200 - (comparisonValue / 100 * 200)}
                        stroke="#000" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" 
                      />
                    )}
                  </svg>
                </div>
                
                <div className="line-chart-labels">
                  {chartData.map((item, index) => (
                    <div key={index} className="line-label">
                      {typeof xDataKey === 'string' ? item[xDataKey] : item.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {comparisonValue && comparisonLabel && (
              <div className="comparison-legend">
                <span className="comparison-indicator"></span>
                <span className="comparison-label">{comparisonLabel}: {formatValue(comparisonValue)}</span>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className="advanced-chart">
      <div className="chart-header">
        {drillDownData && (
          <button 
            onClick={handleBackClick}
            className="back-button"
          >
            ← Back
          </button>
        )}
        
        {description && (
          <div className="chart-description">{description}</div>
        )}
        
        {allowDownload && (
          <button 
            onClick={handleDownload}
            className="download-button"
          >
            Download
          </button>
        )}
      </div>
      
      {renderChart()}
    </div>
  );
};

export default AdvancedChart; 