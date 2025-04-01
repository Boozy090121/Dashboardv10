import React, { useState, useMemo, useCallback } from 'react';
import { useDataContext } from './DataContext';
import { useTimeFilter } from './TimeFilterContext';
import DashboardGrid from './DashboardGrid';
import AdvancedChart from './AdvancedChart';

// Utility functions for historical analysis
const calculateYearOverYearChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

const calculateMovingAverage = (data, period = 3) => {
  if (!data || data.length === 0) return [];
  
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // Not enough data for full window
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].value;
      }
      result.push({
        ...data[i],
        movingAvg: sum / period
      });
    }
  }
  return result;
};

const calculateLinearRegression = (data) => {
  if (!data || data.length < 2) return { slope: 0, intercept: 0, r2: 0 };
  
  const xValues = data.map((_, i) => i);
  const yValues = data.map(d => d.value);
  
  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((total, x, i) => total + x * yValues[i], 0);
  const sumXX = xValues.reduce((total, x) => total + x * x, 0);
  const sumYY = yValues.reduce((total, y) => total + y * y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared (coefficient of determination)
  const yMean = sumY / n;
  const ssRes = yValues.reduce((total, y, i) => {
    const prediction = slope * xValues[i] + intercept;
    return total + Math.pow(y - prediction, 2);
  }, 0);
  const ssTot = yValues.reduce((total, y) => total + Math.pow(y - yMean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);
  
  return { slope, intercept, r2 };
};

const detectSeasonality = (data, period = 12) => {
  if (!data || data.length < period * 2) {
    return { isPresent: false, strength: 0 };
  }
  
  // Calculate correlation between each period
  const correlations = [];
  
  for (let i = 0; i < data.length - period; i++) {
    const segment1 = data.slice(i, i + period).map(d => d.value);
    const segment2 = data.slice(i + period, i + period * 2).map(d => d.value);
    
    if (segment2.length === period) {
      // Calculate correlation between the two segments
      const mean1 = segment1.reduce((a, b) => a + b, 0) / period;
      const mean2 = segment2.reduce((a, b) => a + b, 0) / period;
      
      let num = 0;
      let den1 = 0;
      let den2 = 0;
      
      for (let j = 0; j < period; j++) {
        const diff1 = segment1[j] - mean1;
        const diff2 = segment2[j] - mean2;
        
        num += diff1 * diff2;
        den1 += diff1 * diff1;
        den2 += diff2 * diff2;
      }
      
      const corr = num / (Math.sqrt(den1) * Math.sqrt(den2));
      correlations.push(corr);
    }
  }
  
  // Average correlation indicates seasonality strength
  const avgCorr = correlations.length ? 
    correlations.reduce((a, b) => a + b, 0) / correlations.length : 0;
  
  return {
    isPresent: avgCorr > 0.5, // Threshold for determining seasonality
    strength: avgCorr
  };
};

// Main component
const HistoricalAnalysis = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const { filterType, dateRange, changeFilterType } = useTimeFilter();
  const [selectedComparisonType, setSelectedComparisonType] = useState('yoy'); // 'yoy', 'qoq', 'mom'
  const [selectedMetric, setSelectedMetric] = useState('rft');
  
  // Process historical RFT data
  const rftHistoricalData = useMemo(() => {
    if (!data?.historicalRFT?.monthly) {
      // Generate mock data if none exists
      return Array.from({ length: 36 }, (_, i) => {
        const date = new Date(2021, i % 12, 1);
        const seasonalComponent = Math.sin((i % 12) / 11 * Math.PI) * 2;
        const trendComponent = i * 0.05;
        const randomComponent = Math.random() * 2 - 1;
        
        return {
          date: date.toISOString(),
          value: 90 + trendComponent + seasonalComponent + randomComponent,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          quarter: Math.floor(date.getMonth() / 3) + 1
        };
      });
    }
    
    return data.historicalRFT.monthly;
  }, [data]);
  
  // Filter based on selected time range
  const filteredHistoricalData = useMemo(() => {
    // Apply time filter from context
    return rftHistoricalData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }, [rftHistoricalData, dateRange]);
  
  // Calculate year-over-year comparison data
  const yearOverYearData = useMemo(() => {
    const currentYearData = filteredHistoricalData.filter(
      item => item.year === new Date().getFullYear()
    );
    
    const previousYearData = filteredHistoricalData.filter(
      item => item.year === new Date().getFullYear() - 1
    );
    
    // Match by month and calculate changes
    return currentYearData.map(currentItem => {
      const previousItem = previousYearData.find(
        item => item.month === currentItem.month
      );
      
      const yoyChange = previousItem ? 
        calculateYearOverYearChange(currentItem.value, previousItem.value) : null;
      
      return {
        ...currentItem,
        previousValue: previousItem?.value || null,
        yoyChange
      };
    });
  }, [filteredHistoricalData]);
  
  // Calculate quarter-over-quarter comparison data
  const quarterOverQuarterData = useMemo(() => {
    // Group data by year and quarter
    const quarterlyData = {};
    
    filteredHistoricalData.forEach(item => {
      const key = `${item.year}-Q${item.quarter}`;
      if (!quarterlyData[key]) {
        quarterlyData[key] = {
          year: item.year,
          quarter: item.quarter,
          values: []
        };
      }
      quarterlyData[key].values.push(item.value);
    });
    
    // Calculate average for each quarter
    const quarterAverages = Object.entries(quarterlyData).map(([key, data]) => {
      const avgValue = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
      return {
        key,
        year: data.year,
        quarter: data.quarter,
        value: avgValue
      };
    });
    
    // Sort by year and quarter
    quarterAverages.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });
    
    // Calculate QoQ changes
    for (let i = 1; i < quarterAverages.length; i++) {
      quarterAverages[i].previousValue = quarterAverages[i-1].value;
      quarterAverages[i].qoqChange = calculateYearOverYearChange(
        quarterAverages[i].value, 
        quarterAverages[i].previousValue
      );
    }
    
    return quarterAverages;
  }, [filteredHistoricalData]);
  
  // Calculate moving averages to smooth data
  const dataWithMovingAverage = useMemo(() => {
    return calculateMovingAverage(filteredHistoricalData, 3);
  }, [filteredHistoricalData]);
  
  // Calculate linear regression for trend analysis
  const regressionAnalysis = useMemo(() => {
    return calculateLinearRegression(filteredHistoricalData);
  }, [filteredHistoricalData]);
  
  // Detect seasonality in the data
  const seasonalityAnalysis = useMemo(() => {
    return detectSeasonality(filteredHistoricalData, 12);
  }, [filteredHistoricalData]);
  
  // Trend stability assessment based on regression and variation
  const trendStabilityData = useMemo(() => {
    if (filteredHistoricalData.length < 2) return { isStable: true, volatility: 0 };
    
    // Calculate standard deviation of residuals from regression line
    const values = filteredHistoricalData.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Calculate residuals from the regression line
    const residuals = filteredHistoricalData.map((item, i) => {
      const predicted = regressionAnalysis.slope * i + regressionAnalysis.intercept;
      return Math.abs(item.value - predicted);
    });
    
    // Calculate standard deviation of residuals
    const avgResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const variance = residuals.reduce((sum, r) => sum + Math.pow(r - avgResidual, 2), 0) / residuals.length;
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation as a measure of volatility
    const volatility = (stdDev / mean) * 100;
    
    // Assess stability based on volatility threshold
    const isStable = volatility < 5; // 5% threshold for stability
    
    return { isStable, volatility };
  }, [filteredHistoricalData, regressionAnalysis]);
  
  // Data with regression line for visualization
  const dataWithRegressionLine = useMemo(() => {
    if (filteredHistoricalData.length === 0) return [];
    
    // Add regression line points
    const withRegression = [...filteredHistoricalData];
    
    for (let i = 0; i < filteredHistoricalData.length; i++) {
      withRegression[i] = {
        ...withRegression[i],
        trend: regressionAnalysis.slope * i + regressionAnalysis.intercept
      };
    }
    
    return withRegression;
  }, [filteredHistoricalData, regressionAnalysis]);
  
  // Event handlers
  const handleComparisonTypeChange = useCallback((e) => {
    setSelectedComparisonType(e.target.value);
  }, []);
  
  const handleMetricChange = useCallback((e) => {
    setSelectedMetric(e.target.value);
  }, []);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading historical data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !data) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={refreshData} className="refresh-button">
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="historical-analysis-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Historical Analysis</h1>
        </div>
        
        <div className="header-filters">
          <div className="filter-group">
            <label htmlFor="comparison-select">Comparison:</label>
            <select 
              id="comparison-select"
              value={selectedComparisonType}
              onChange={handleComparisonTypeChange}
              className="comparison-select"
            >
              <option value="yoy">Year over Year</option>
              <option value="qoq">Quarter over Quarter</option>
              <option value="mom">Month over Month</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="metric-select">Metric:</label>
            <select 
              id="metric-select"
              value={selectedMetric}
              onChange={handleMetricChange}
              className="metric-select"
            >
              <option value="rft">RFT Rate</option>
              <option value="cycletime">Cycle Time</option>
              <option value="defects">Defect Rate</option>
              <option value="yield">Process Yield</option>
            </select>
          </div>
          
          <button onClick={refreshData} className="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1.06-6.7-2.82"></path>
              <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1.06-6.7 2.82"></path>
              <path d="m3 12 3-3 3 3"></path>
            </svg>
            Refresh Analysis
          </button>
        </div>
      </div>
      
      {/* Main Grid */}
      <DashboardGrid>
        {/* YOY Comparative Analysis */}
        <DashboardGrid.Widget
          title={selectedComparisonType === 'yoy' ? 'Year-over-Year Analysis' : 
                 selectedComparisonType === 'qoq' ? 'Quarter-over-Quarter Analysis' : 
                 'Month-over-Month Analysis'}
          size="large"
          onRefresh={() => refreshData()}
        >
          <div className="comparative-analysis">
            <div className="chart-container" style={{ height: 300 }}>
              <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                {/* X and Y axes */}
                <line x1="50" y1="250" x2="750" y2="250" stroke="#d1d5db" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="250" stroke="#d1d5db" strokeWidth="1" />
                
                {/* Reference line at zero for change */}
                <line x1="50" y1="150" x2="750" y2="150" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Current period data */}
                <polyline
                  points={
                    selectedComparisonType === 'yoy' ? 
                      yearOverYearData.map((point, i) => {
                        const x = 50 + (i * 700) / (yearOverYearData.length - 1);
                        const y = 250 - ((point.value - 80) * 200) / 20; // Scale to 80-100% range
                        return `${x},${y}`;
                      }).join(' ') :
                    selectedComparisonType === 'qoq' ?
                      quarterOverQuarterData.slice(-4).map((point, i) => { // Last 4 quarters
                        const x = 50 + (i * 700) / 3; // 4 points evenly spaced
                        const y = 250 - ((point.value - 80) * 200) / 20;
                        return `${x},${y}`;
                      }).join(' ') :
                      dataWithMovingAverage.filter(d => d && d.movingAvg).map((point, i, arr) => {
                        const x = 50 + (i * 700) / (arr.length - 1);
                        const y = 250 - ((point.movingAvg - 80) * 200) / 20;
                        return `${x},${y}`;
                      }).join(' ')
                  }
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                
                {/* Previous period data */}
                {selectedComparisonType === 'yoy' && (
                  <polyline
                    points={
                      yearOverYearData.filter(d => d.previousValue).map((point, i, arr) => {
                        const x = 50 + (i * 700) / (arr.length - 1);
                        const y = 250 - ((point.previousValue - 80) * 200) / 20;
                        return `${x},${y}`;
                      }).join(' ')
                    }
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
                
                {/* Data points */}
                {(selectedComparisonType === 'yoy' ? 
                  yearOverYearData : 
                  selectedComparisonType === 'qoq' ?
                  quarterOverQuarterData.slice(-4) :
                  dataWithMovingAverage.filter(d => d && d.movingAvg)
                ).map((point, i, arr) => {
                  const x = 50 + (i * 700) / (arr.length - 1);
                  const y = 250 - ((
                    selectedComparisonType === 'mom' ? 
                    point.movingAvg : point.value
                  ) - 80) * 200 / 20;
                  
                  const changeValue = point.yoyChange || point.qoqChange;
                  const isPositive = changeValue > 0;
                  
                  return (
                    <React.Fragment key={`point-${i}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      
                      {/* Show change values */}
                      {changeValue !== null && Math.abs(changeValue) > 0.5 && (
                        <text
                          x={x}
                          y={y - 10}
                          fontSize="10"
                          fill={isPositive ? "#10b981" : "#ef4444"}
                          textAnchor="middle"
                        >
                          {isPositive ? "+" : ""}{changeValue.toFixed(1)}%
                        </text>
                      )}
                    </React.Fragment>
                  );
                })}
                
                {/* X-axis labels */}
                {(selectedComparisonType === 'yoy' ? 
                  yearOverYearData : 
                  selectedComparisonType === 'qoq' ?
                  quarterOverQuarterData.slice(-4) :
                  dataWithMovingAverage.filter((d, i) => i % 3 === 0 && d && d.movingAvg)
                ).map((point, i, arr) => {
                  const x = 50 + (i * 700) / (arr.length - 1);
                  
                  const label = selectedComparisonType === 'qoq' ?
                    `Q${point.quarter} ${point.year}` :
                    new Date(point.date).toLocaleDateString(undefined, { 
                      month: 'short',
                      year: '2-digit'
                    });
                  
                  return (
                    <text
                      key={`label-${i}`}
                      x={x}
                      y="270"
                      fontSize="10"
                      textAnchor="middle"
                      fill="#6b7280"
                    >
                      {label}
                    </text>
                  );
                })}
                
                {/* Y-axis labels */}
                {[80, 85, 90, 95, 100].map((value, i) => (
                  <text
                    key={`y-label-${i}`}
                    x="40"
                    y={250 - ((value - 80) * 200) / 20}
                    fontSize="10"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="#6b7280"
                  >
                    {value}%
                  </text>
                ))}
              </svg>
            </div>
            
            <div className="comparative-legend">
              <div className="legend-item">
                <span className="legend-color current"></span>
                <span className="legend-label">Current Period</span>
              </div>
              
              {selectedComparisonType === 'yoy' && (
                <div className="legend-item">
                  <span className="legend-color previous"></span>
                  <span className="legend-label">Previous Year</span>
                </div>
              )}
              
              <div className="legend-item">
                <span className="legend-badge positive">+2.1%</span>
                <span className="legend-label">Positive Change</span>
              </div>
              
              <div className="legend-item">
                <span className="legend-badge negative">-1.5%</span>
                <span className="legend-label">Negative Change</span>
              </div>
            </div>
            
            <div className="comparative-summary">
              <div className="summary-metric">
                <div className="metric-name">Average Change</div>
                <div className="metric-value">
                  {selectedComparisonType === 'yoy' ?
                    (yearOverYearData
                      .filter(d => d.yoyChange !== null)
                      .reduce((sum, d) => sum + d.yoyChange, 0) / 
                      yearOverYearData.filter(d => d.yoyChange !== null).length
                    ).toFixed(1) :
                    selectedComparisonType === 'qoq' ?
                    (quarterOverQuarterData
                      .filter(d => d.qoqChange !== null)
                      .reduce((sum, d) => sum + d.qoqChange, 0) / 
                      quarterOverQuarterData.filter(d => d.qoqChange !== null).length
                    ).toFixed(1) :
                    "N/A"
                  }%
                </div>
              </div>
              
              <div className="summary-metric">
                <div className="metric-name">Largest Improvement</div>
                <div className="metric-value">
                  {selectedComparisonType === 'yoy' ?
                    Math.max(...yearOverYearData
                      .filter(d => d.yoyChange !== null)
                      .map(d => d.yoyChange)
                    ).toFixed(1) :
                    selectedComparisonType === 'qoq' ?
                    Math.max(...quarterOverQuarterData
                      .filter(d => d.qoqChange !== null)
                      .map(d => d.qoqChange)
                    ).toFixed(1) :
                    "N/A"
                  }%
                </div>
              </div>
              
              <div className="summary-metric">
                <div className="metric-name">Statistical Significance</div>
                <div className="metric-value">
                  {regressionAnalysis.r2 > 0.7 ? 
                    "Strong" : regressionAnalysis.r2 > 0.3 ? 
                    "Moderate" : "Weak"}
                </div>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Trend Stability Analysis */}
        <DashboardGrid.Widget
          title="Trend Stability Analysis"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="trend-stability-analysis">
            <div className="stability-indicators">
              <div className="stability-indicator">
                <div className="indicator-name">Trend Direction</div>
                <div className={`indicator-value ${regressionAnalysis.slope > 0 ? 'positive' : regressionAnalysis.slope < 0 ? 'negative' : 'neutral'}`}>
                  {regressionAnalysis.slope > 0 ? 
                    "Improving" : regressionAnalysis.slope < 0 ? 
                    "Declining" : "Stable"}
                </div>
              </div>
              
              <div className="stability-indicator">
                <div className="indicator-name">Trend Strength (R²)</div>
                <div className={`indicator-value ${regressionAnalysis.r2 > 0.7 ? 'strong' : regressionAnalysis.r2 > 0.3 ? 'moderate' : 'weak'}`}>
                  {regressionAnalysis.r2.toFixed(2)}
                </div>
              </div>
              
              <div className="stability-indicator">
                <div className="indicator-name">Volatility</div>
                <div className={`indicator-value ${trendStabilityData.volatility < 3 ? 'low' : trendStabilityData.volatility < 7 ? 'medium' : 'high'}`}>
                  {trendStabilityData.volatility.toFixed(1)}%
                </div>
              </div>
              
              <div className="stability-indicator">
                <div className="indicator-name">Seasonality</div>
                <div className={`indicator-value ${seasonalityAnalysis.isPresent ? 'present' : 'absent'}`}>
                  {seasonalityAnalysis.isPresent ? 
                    `Present (${(seasonalityAnalysis.strength * 100).toFixed(0)}%)` : 
                    "Not Detected"}
                </div>
              </div>
            </div>
            
            <div className="trend-chart" style={{ height: 200 }}>
              <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* X and Y axes */}
                <line x1="50" y1="150" x2="750" y2="150" stroke="#d1d5db" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="150" stroke="#d1d5db" strokeWidth="1" />
                
                {/* Data points with regression line */}
                <polyline
                  points={dataWithRegressionLine.map((point, i, arr) => {
                    const x = 50 + (i * 700) / (arr.length - 1);
                    const y = 150 - ((point.value - 80) * 100) / 20;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                
                {/* Regression line */}
                <line
                  x1="50"
                  y1={150 - ((regressionAnalysis.intercept - 80) * 100) / 20}
                  x2="750"
                  y2={150 - (((regressionAnalysis.slope * (dataWithRegressionLine.length - 1) + regressionAnalysis.intercept) - 80) * 100) / 20}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                
                {/* Data points */}
                {dataWithRegressionLine.map((point, i, arr) => {
                  const x = 50 + (i * 700) / (arr.length - 1);
                  const y = 150 - ((point.value - 80) * 100) / 20;
                  
                  return (
                    <circle
                      key={`point-${i}`}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>
            
            <div className="trend-legend">
              <div className="legend-item">
                <span className="legend-color data"></span>
                <span className="legend-label">Actual Data</span>
              </div>
              <div className="legend-item">
                <span className="legend-color regression"></span>
                <span className="legend-label">Linear Trend (R² = {regressionAnalysis.r2.toFixed(2)})</span>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Performance Against Targets */}
        <DashboardGrid.Widget
          title="Performance Against Target"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="target-performance">
            <div className="target-gauge">
              <svg width="200" height="120" viewBox="0 0 200 120">
                {/* Gauge background */}
                <path 
                  d="M20,100 A80,80 0 0,1 180,100" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                />
                
                {/* Colored sections */}
                <path 
                  d="M20,100 A80,80 0 0,1 60,41.4" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                />
                
                <path 
                  d="M60,41.4 A80,80 0 0,1 100,20" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                />
                
                <path 
                  d="M100,20 A80,80 0 0,1 140,41.4" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                />
                
                <path 
                  d="M140,41.4 A80,80 0 0,1 180,100" 
                  fill="none" 
                  stroke="#0ea5e9" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                />
                
                {/* Gauge needle */}
                {(() => {
                  // Calculate needle position based on current value
                  const targetValue = 95;
                  const currentValue = filteredHistoricalData.length > 0 ? 
                    filteredHistoricalData[filteredHistoricalData.length - 1].value : 92;
                  const percentage = (currentValue - 80) / 20; // Scale 80-100 to 0-1
                  const angle = -180 * percentage;
                  
                  const needleX = 100 + 80 * Math.sin(angle * Math.PI / 180);
                  const needleY = 100 - 80 * Math.cos(angle * Math.PI / 180);
                  
                  return (
                    <>
                      <line 
                        x1="100" 
                        y1="100" 
                        x2={needleX} 
                        y2={needleY} 
                        stroke="#1f2937" 
                        strokeWidth="2" 
                      />
                      <circle cx="100" cy="100" r="5" fill="#1f2937" />
                      
                      {/* Target indicator */}
                      <circle 
                        cx={100 + 80 * Math.sin(((targetValue - 80) / 20 * -180) * Math.PI / 180)} 
                        cy={100 - 80 * Math.cos(((targetValue - 80) / 20 * -180) * Math.PI / 180)} 
                        r="3" 
                        fill="#ef4444" 
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    </>
                  );
                })()}
                
                {/* Value labels */}
                <text x="20" y="115" fontSize="12" textAnchor="middle">80%</text>
                <text x="60" y="56.4" fontSize="12" textAnchor="middle">85%</text>
                <text x="100" y="35" fontSize="12" textAnchor="middle">90%</text>
                <text x="140" y="56.4" fontSize="12" textAnchor="middle">95%</text>
                <text x="180" y="115" fontSize="12" textAnchor="middle">100%</text>
                
                {/* Current value */}
                <text x="100" y="75" fontSize="20" fontWeight="bold" textAnchor="middle">
                  {filteredHistoricalData.length > 0 ? 
                    filteredHistoricalData[filteredHistoricalData.length - 1].value.toFixed(1) : 92.3}%
                </text>
                
                <text x="100" y="95" fontSize="12" textAnchor="middle">Current Value</text>
              </svg>
            </div>
            
            <div className="target-metrics">
              <div className="target-metric">
                <div className="metric-name">Target</div>
                <div className="metric-value">95.0%</div>
              </div>
              
              <div className="target-metric">
                <div className="metric-name">Gap</div>
                <div className="metric-value">
                  {(95.0 - (filteredHistoricalData.length > 0 ? 
                    filteredHistoricalData[filteredHistoricalData.length - 1].value : 92.3)
                  ).toFixed(1)}%
                </div>
              </div>
              
              <div className="target-metric">
                <div className="metric-name">Forecast to Meet</div>
                <div className="metric-value">
                  {regressionAnalysis.slope <= 0 ? 
                    "Not on track" : 
                    `~${Math.ceil((95.0 - (filteredHistoricalData.length > 0 ? 
                      filteredHistoricalData[filteredHistoricalData.length - 1].value : 92.3)) / 
                      (regressionAnalysis.slope * 0.25))} months`
                  }
                </div>
              </div>
              
              <div className="target-metric">
                <div className="metric-name">Best Historical</div>
                <div className="metric-value">
                  {Math.max(...filteredHistoricalData.map(d => d.value)).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="target-achievement-history">
              <h4>Target Achievement History</h4>
              <div className="achievement-timeline">
                {filteredHistoricalData.slice(-12).map((data, index) => (
                  <div 
                    key={index} 
                    className={`timeline-marker ${data.value >= 95 ? 'achieved' : 'missed'}`}
                    title={`${new Date(data.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: ${data.value.toFixed(1)}%`}
                  >
                    <div className="marker-dot"></div>
                    <div className="marker-label">
                      {new Date(data.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
      </DashboardGrid>
    </div>
  );
};

export default HistoricalAnalysis; 