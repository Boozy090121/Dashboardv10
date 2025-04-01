import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Global Chart.js defaults to match our design system
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.font.weight = '400';
Chart.defaults.color = '#5A5A5A';
Chart.defaults.plugins.tooltip.backgroundColor = '#1F2937';
Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
Chart.defaults.plugins.tooltip.bodyFont = { weight: '400' };
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.boxPadding = 6;
Chart.defaults.plugins.tooltip.usePointStyle = true;
Chart.defaults.elements.line.borderWidth = 2;
Chart.defaults.elements.point.radius = 3;
Chart.defaults.elements.point.hoverRadius = 5;
Chart.defaults.elements.arc.borderWidth = 1;
Chart.defaults.elements.bar.borderRadius = 4;
Chart.defaults.scales.linear.grid.color = '#E5E7EB';
Chart.defaults.scales.linear.grid.borderDash = [4, 4];
Chart.defaults.scales.linear.ticks.padding = 8;
Chart.defaults.animation.duration = 800;
Chart.defaults.animation.easing = 'easeOutQuart';
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

const getColorPalette = () => {
  // Base colors from our design system
  return {
    primary: '#00518A',     // PCI Blue
    secondary: '#CC2030',   // PCI Red
    success: '#0E9F6E',     // Green
    warning: '#FF8800',     // Amber
    accent1: '#3B82F6',     // Blue
    accent2: '#8B5CF6',     // Purple
    accent3: '#EC4899',     // Pink
    neutral: '#9CA3AF',     // Grey
    
    // Lighter versions for backgrounds, fills, etc.
    primaryLight: 'rgba(0, 81, 138, 0.1)',
    secondaryLight: 'rgba(204, 32, 48, 0.1)',
    successLight: 'rgba(14, 159, 110, 0.1)',
    warningLight: 'rgba(255, 136, 0, 0.1)',
    
    // Chart data palette - for consistent multi-series data visualization
    chartPalette: [
      '#00518A', // primary
      '#3B82F6', // accent1
      '#8B5CF6', // accent2
      '#EC4899', // accent3
      '#0E9F6E', // success
      '#FF8800', // warning
      '#CC2030', // secondary
      '#64748B', // neutral variant
    ],
    
    // Use hsl to generate gradients programmatically
    getGradient: (ctx, colorStart, colorEnd) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, colorStart);
      gradient.addColorStop(1, colorEnd);
      return gradient;
    }
  };
};

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
  isLoading = false,
  hasGradient = false,
  className = ''
}) => {
  const [drillDownData, setDrillDownData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const colors = getColorPalette();
  
  // Function to handle drill-down click
  const handleDataPointClick = (item, index) => {
    if (!onDrillDown) return;
    
    const drillDownResult = onDrillDown(item, index);
    if (drillDownResult) {
      setDrillDownData(drillDownResult);
    }
  };
  
  // Function to go back from drill-down view
  const handleBackClick = () => {
    setDrillDownData(null);
  };
  
  // Function to simulate chart download
  const handleDownload = () => {
    alert('Chart download simulation: Would download a PNG image of this chart');
  };
  
  // Data formatting helper
  const formatValue = (value) => {
    if (percentage) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };
  
  // Default dataset styles based on chart type
  const getDatasetDefaults = (type, index = 0) => {
    const colorIndex = index % colors.chartPalette.length;
    const color = colors.chartPalette[colorIndex];
    const secondaryColor = index === 0 ? colors.primary : colors.chartPalette[(index + 2) % colors.chartPalette.length];
    
    switch (type) {
      case 'line':
        return {
          tension: 0.3,
          borderColor: color,
          backgroundColor: hasGradient ? 'transparent' : `${color}30`,
          pointBackgroundColor: color,
          pointBorderColor: '#FFF',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#FFF',
          pointHoverBorderColor: color,
          pointHoverBorderWidth: 3,
          pointHoverRadius: 6,
          fill: hasGradient
        };
      case 'bar':
        return {
          backgroundColor: color,
          hoverBackgroundColor: secondaryColor,
          borderRadius: 4,
          barPercentage: 0.7,
          categoryPercentage: 0.7
        };
      case 'doughnut':
      case 'pie':
        return {
          backgroundColor: colors.chartPalette,
          borderColor: '#FFF',
          borderWidth: 2,
          hoverOffset: 15,
          hoverBorderWidth: 0
        };
      case 'radar':
        return {
          backgroundColor: `${color}30`,
          borderColor: color,
          pointBackgroundColor: color,
          pointHoverBackgroundColor: '#FFF'
        };
      case 'polarArea':
        return {
          backgroundColor: colors.chartPalette.map(c => `${c}90`),
          borderColor: colors.chartPalette,
          borderWidth: 1
        };
      default:
        return {};
    }
  };
  
  // Apply gradient fills for line charts
  const applyGradients = (chart) => {
    if (!hasGradient || !chart || type !== 'line') return;
    
    const ctx = chart.ctx;
    const datasets = chart.data.datasets;
    
    datasets.forEach((dataset, index) => {
      const colorIndex = index % colors.chartPalette.length;
      const color = colors.chartPalette[colorIndex];
      
      // Create gradient from color to transparent
      const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
      gradient.addColorStop(0, `${color}40`);  // 25% opacity
      gradient.addColorStop(1, `${color}00`);  // 0% opacity
      
      dataset.backgroundColor = gradient;
    });
    
    chart.update();
  };

  // Apply default options based on chart type
  const getDefaultOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          titleFont: {
            size: 13,
            weight: '600'
          },
          bodyFont: {
            size: 12,
            weight: '400'
          },
          padding: 12,
          cornerRadius: 6,
          displayColors: true,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            labelColor: function(context) {
              const datasetIndex = context.datasetIndex;
              const colorIndex = datasetIndex % colors.chartPalette.length;
              const color = colors.chartPalette[colorIndex];
              
              return {
                borderColor: color,
                backgroundColor: color
              };
            },
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              
              if (context.parsed.y !== null) {
                // Check if value should be formatted as percentage, currency, etc.
                if (context.dataset.dataType === 'percentage') {
                  label += context.parsed.y + '%';
                } else if (context.dataset.dataType === 'currency') {
                  label += '$' + context.parsed.y.toLocaleString();
                } else {
                  label += context.parsed.y.toLocaleString();
                }
              }
              return label;
            }
          }
        }
      }
    };
    
    // Add type-specific options
    switch (type) {
      case 'line':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#E5E7EB',
                borderDash: [4, 4],
                drawBorder: false
              },
              ticks: {
                padding: 10,
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                padding: 10,
                font: {
                  size: 11
                }
              }
            }
          }
        };
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#E5E7EB',
                borderDash: [4, 4],
                drawBorder: false
              },
              ticks: {
                padding: 10,
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                padding: 10,
                font: {
                  size: 11
                }
              }
            }
          }
        };
      case 'doughnut':
      case 'pie':
        return {
          ...baseOptions,
          cutout: type === 'doughnut' ? '70%' : 0,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: 'right',
              align: 'center'
            }
          }
        };
      case 'radar':
        return {
          ...baseOptions,
          scales: {
            r: {
              ticks: {
                backdropColor: 'transparent',
                font: {
                  size: 11
                }
              },
              grid: {
                color: '#E5E7EB'
              },
              angleLines: {
                color: '#E5E7EB'
              },
              pointLabels: {
                font: {
                  size: 11
                }
              }
            }
          }
        };
      default:
        return baseOptions;
    }
  };

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    // Apply dataset defaults to all datasets
    const enhancedData = {
      ...data,
      datasets: data.datasets.map((dataset, index) => ({
        ...getDatasetDefaults(type, index),
        ...dataset
      }))
    };
    
    // Merge our default options with user provided options
    const enhancedOptions = {
      ...getDefaultOptions(),
      ...options
    };
    
    // Create the chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    chartInstance.current = new Chart(ctx, {
      type,
      data: enhancedData,
      options: enhancedOptions
    });
    
    // Apply gradients after chart is created if needed
    if (hasGradient && type === 'line') {
      applyGradients(chartInstance.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options, type, hasGradient]);

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
    <div className={`advanced-chart ${className}`} style={{ height: `${height}px`, position: 'relative' }}>
      {isLoading && (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <span className="chart-loading-text">Loading chart data...</span>
        </div>
      )}
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
      
      <canvas ref={chartRef}></canvas>
      
      {renderChart()}
    </div>
  );
};

export default AdvancedChart; 