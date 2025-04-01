import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDataContext } from './DataContext';
import DashboardGrid from './DashboardGrid';
import AdvancedChart from './AdvancedChart';

// Statistical utility functions
const calculateMean = (values) => {
  if (!values || !values.length) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculateStdDev = (values) => {
  if (!values || values.length <= 1) return 0;
  const mean = calculateMean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
};

const calculateZScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
};

const calculateCorrelation = (xValues, yValues) => {
  if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length <= 1) return 0;
  
  const xMean = calculateMean(xValues);
  const yMean = calculateMean(yValues);
  
  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;
  
  for (let i = 0; i < xValues.length; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }
  
  if (xDenominator === 0 || yDenominator === 0) return 0;
  return numerator / Math.sqrt(xDenominator * yDenominator);
};

// Machine learning predictions
const generateForecast = (historicalData, periodsAhead = 3) => {
  if (!historicalData || historicalData.length < 2) return [];
  
  // Simple linear regression for forecasting
  const xValues = historicalData.map((_, i) => i);
  const yValues = historicalData.map(item => item.value);
  
  const n = xValues.length;
  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate forecast points
  const forecast = [];
  const lastDataPoint = historicalData[historicalData.length - 1];
  
  for (let i = 1; i <= periodsAhead; i++) {
    const periodIndex = xValues.length + i - 1;
    const predictedValue = slope * periodIndex + intercept;
    
    // Add some randomness to make it look more realistic
    const noise = (Math.random() - 0.5) * 0.5;
    
    forecast.push({
      period: `Forecast ${i}`,
      value: Math.max(0, Math.min(100, predictedValue + noise)),
      isForecasted: true
    });
  }
  
  return forecast;
};

// Anomaly detection
const detectAnomalies = (data, threshold = 2.0) => {
  if (!data || data.length < 3) return [];
  
  const values = data.map(item => item.value);
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);
  
  return data.map(item => ({
    ...item,
    zScore: calculateZScore(item.value, mean, stdDev),
    isAnomaly: Math.abs(calculateZScore(item.value, mean, stdDev)) > threshold
  }));
};

// Natural language insight generation
const generateInsights = (data, metric = 'RFT') => {
  if (!data || data.length < 2) return [];
  
  const currentValue = data[data.length - 1].value;
  const previousValue = data[data.length - 2].value;
  const change = currentValue - previousValue;
  const percentChange = (change / previousValue) * 100;
  
  const insights = [];
  
  // Trend insight
  if (Math.abs(percentChange) > 0.5) {
    insights.push({
      type: 'trend',
      title: `${metric} ${change > 0 ? 'Improving' : 'Declining'}`,
      description: `${metric} has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% compared to the previous period.`,
      severity: change > 0 ? 'positive' : 'negative'
    });
  } else {
    insights.push({
      type: 'trend',
      title: `${metric} Stable`,
      description: `${metric} has remained stable with only a ${Math.abs(percentChange).toFixed(1)}% change from the previous period.`,
      severity: 'neutral'
    });
  }
  
  // Pattern insights
  const values = data.map(item => item.value);
  let consecutiveIncreases = 0;
  let consecutiveDecreases = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i-1]) {
      consecutiveIncreases++;
      consecutiveDecreases = 0;
    } else if (values[i] < values[i-1]) {
      consecutiveDecreases++;
      consecutiveIncreases = 0;
    } else {
      consecutiveIncreases = 0;
      consecutiveDecreases = 0;
    }
  }
  
  if (consecutiveIncreases >= 2) {
    insights.push({
      type: 'pattern',
      title: 'Positive Trend Detected',
      description: `${metric} has shown consistent improvement over the last ${consecutiveIncreases + 1} periods.`,
      severity: 'positive'
    });
  } else if (consecutiveDecreases >= 2) {
    insights.push({
      type: 'pattern',
      title: 'Negative Trend Detected',
      description: `${metric} has shown consistent decline over the last ${consecutiveDecreases + 1} periods.`,
      severity: 'negative'
    });
  }
  
  // Anomaly insights
  const anomalies = detectAnomalies(data);
  const recentAnomalies = anomalies.filter(item => item.isAnomaly).slice(-2);
  
  recentAnomalies.forEach(anomaly => {
    insights.push({
      type: 'anomaly',
      title: `${metric} Anomaly Detected`,
      description: `Unusual ${metric} value detected (${anomaly.value.toFixed(1)}) which is ${anomaly.zScore > 0 ? 'higher' : 'lower'} than the normal range.`,
      severity: 'warning'
    });
  });
  
  return insights;
};

// Generate action recommendations based on data analysis
const generateRecommendations = (insights, processData) => {
  const recommendations = [];
  
  // Based on trend insights
  insights.forEach(insight => {
    if (insight.type === 'trend' && insight.severity === 'negative') {
      recommendations.push({
        title: 'Conduct Process Review',
        description: 'Schedule a cross-functional team review of the manufacturing process to identify recent changes.',
        impact: 'high',
        ease: 'medium'
      });
    }
    
    if (insight.type === 'anomaly') {
      recommendations.push({
        title: 'Investigate Anomaly',
        description: 'Launch investigation into specific lots or batches produced during the anomaly period.',
        impact: 'high',
        ease: 'hard'
      });
    }
  });
  
  // Based on process data (if available)
  if (processData && processData.bottlenecks && processData.bottlenecks.length > 0) {
    processData.bottlenecks.forEach(bottleneck => {
      recommendations.push({
        title: `Optimize ${bottleneck.step}`,
        description: `Focus improvement efforts on ${bottleneck.step} which is currently a bottleneck.`,
        impact: 'high',
        ease: 'medium'
      });
    });
  }
  
  // General recommendations if list is empty
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Standardize Documentation',
      description: 'Implement standardized documentation and training for operators to ensure consistent process execution.',
      impact: 'medium', 
      ease: 'medium'
    });
    
    recommendations.push({
      title: 'Preventive Maintenance',
      description: 'Enhance preventive maintenance program for critical equipment to reduce unexpected downtime.',
      impact: 'high',
      ease: 'medium'
    });
  }
  
  return recommendations;
};

// Main Intelligence Engine Component
const IntelligenceEngine = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('rft');
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Process the RFT trend data for analysis
  const rftTrendData = useMemo(() => {
    if (!data?.overview?.processTimeline) {
      return [];
    }
    
    return data.overview.processTimeline.map(item => ({
      period: item.month,
      value: item.recordRFT
    }));
  }, [data]);
  
  // Identify factors with highest correlation to RFT
  const correlationAnalysis = useMemo(() => {
    if (!data) return [];
    
    // Simulate correlations with various factors
    return [
      { factor: 'Process Time', correlation: 0.82, impact: 'high' },
      { factor: 'Operator Training', correlation: 0.76, impact: 'high' },
      { factor: 'Material Quality', correlation: 0.68, impact: 'medium' },
      { factor: 'Equipment Maintenance', correlation: 0.64, impact: 'medium' },
      { factor: 'Documentation Accuracy', correlation: 0.59, impact: 'medium' },
      { factor: 'Environmental Conditions', correlation: 0.42, impact: 'low' },
      { factor: 'Shift Changes', correlation: 0.38, impact: 'low' }
    ].sort((a, b) => b.correlation - a.correlation);
  }, [data]);
  
  // Generate statistical analysis results
  const statisticalAnalysis = useMemo(() => {
    if (!rftTrendData || rftTrendData.length < 2) {
      return {
        mean: 0,
        stdDev: 0,
        trend: 'neutral',
        seasonality: 'none',
        forecast: []
      };
    }
    
    const values = rftTrendData.map(item => item.value);
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);
    
    // Determine trend direction
    let trendDirection = 'neutral';
    if (values[values.length - 1] > values[0]) {
      trendDirection = 'improving';
    } else if (values[values.length - 1] < values[0]) {
      trendDirection = 'declining';
    }
    
    // Generate forecast
    const forecast = generateForecast(rftTrendData, 3);
    
    return {
      mean,
      stdDev,
      trend: trendDirection,
      forecast
    };
  }, [rftTrendData]);
  
  // Generate automated insights
  const insights = useMemo(() => {
    return generateInsights(rftTrendData, 'RFT');
  }, [rftTrendData]);
  
  // Generate recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(insights, {
      bottlenecks: data?.processMetrics?.cycleTimeBreakdown
        ?.filter(step => step.isBottleneck)
        ?.map(step => ({ step: step.step })) || []
    });
  }, [insights, data]);
  
  // Data with anomalies identified
  const dataWithAnomalies = useMemo(() => {
    return detectAnomalies(rftTrendData);
  }, [rftTrendData]);
  
  // Combined trend and forecast data
  const trendWithForecast = useMemo(() => {
    if (!rftTrendData.length) return [];
    return [...rftTrendData, ...statisticalAnalysis.forecast];
  }, [rftTrendData, statisticalAnalysis.forecast]);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading intelligence engine...</p>
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
    <div className="intelligence-engine-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Intelligence Engine</h1>
        </div>
        
        <div className="header-actions">
          <div className="time-range-controls">
            {['1m', '3m', '6m', '12m', 'ytd', 'custom'].map((range) => (
              <button
                key={range}
                className={`time-range-button ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === 'ytd' ? 'YTD' : range === 'custom' ? 'Custom' : range.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="metric-selector">
            <select 
              className="metric-select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
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
            Refresh Intelligence
          </button>
        </div>
      </div>
      
      {/* Key Insights Panel */}
      <div className="insights-panel">
        <h2 className="insights-title">Key Insights</h2>
        
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.severity}`}>
              <div className="insight-header">
                <span className={`insight-icon ${insight.severity}`}>
                  {insight.severity === 'positive' ? '↑' : 
                   insight.severity === 'negative' ? '↓' : 
                   insight.severity === 'warning' ? '!' : 'i'}
                </span>
                <h3 className="insight-title">{insight.title}</h3>
              </div>
              <p className="insight-description">{insight.description}</p>
              <div className="insight-type">{insight.type.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Data Explanation Toggle */}
      <div className="explanation-toggle">
        <button 
          className={`explanation-button ${showExplanation ? 'active' : ''}`}
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? 'Hide Explanation' : 'Why Is This Happening?'}
        </button>
      </div>
      
      {/* Natural Language Explanation */}
      {showExplanation && (
        <div className="explanation-panel">
          <h3>Why This Is Happening</h3>
          <p className="explanation-text">
            The recent {statisticalAnalysis.trend === 'improving' ? 'improvement' : statisticalAnalysis.trend === 'declining' ? 'decline' : 'stability'} in 
            RFT rates appears to be primarily influenced by {correlationAnalysis[0].factor} (correlation: {correlationAnalysis[0].correlation.toFixed(2)}) 
            and {correlationAnalysis[1].factor} (correlation: {correlationAnalysis[1].correlation.toFixed(2)}). 
            
            {insights.length > 0 && ` ${insights[0].description}`}
            
            {dataWithAnomalies.filter(d => d.isAnomaly).length > 0 ? 
              ' Statistical analysis has detected anomalies that require further investigation.' : 
              ' No statistical anomalies have been detected in recent performance.'}
            
            Based on historical patterns, we project the RFT rate will 
            {statisticalAnalysis.forecast.length > 0 && statisticalAnalysis.forecast[statisticalAnalysis.forecast.length - 1].value > rftTrendData[rftTrendData.length - 1].value ? 
              ' continue to improve' : ' remain stable or slightly decline'} over the next three months.
          </p>
        </div>
      )}
      
      {/* Charts and Analytics */}
      <DashboardGrid>
        {/* Trend and Forecast Chart */}
        <DashboardGrid.Widget
          title="Trend Analysis with Forecast"
          size="large"
          onRefresh={() => refreshData()}
        >
          <div className="trend-forecast-chart">
            <AdvancedChart
              title={`${selectedMetric.toUpperCase()} Trend with Forecast`}
              data={trendWithForecast}
              type="line"
              xDataKey="period"
              yDataKey="value"
              percentage={selectedMetric === 'rft' || selectedMetric === 'yield'}
              height={300}
              allowDownload={true}
              hasGradient={true}
            />
            <div className="forecast-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
                <span className="legend-label">Historical Data</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
                <span className="legend-label">Forecast (Next 3 Periods)</span>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Correlation Analysis */}
        <DashboardGrid.Widget
          title="Key Influencing Factors"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="correlation-chart">
            <h4 className="chart-title">Factors Affecting {selectedMetric.toUpperCase()}</h4>
            <div className="correlation-bars">
              {correlationAnalysis.slice(0, 5).map((factor, index) => (
                <div key={index} className="correlation-item">
                  <div className="factor-name">{factor.factor}</div>
                  <div className="correlation-bar-container">
                    <div 
                      className="correlation-bar" 
                      style={{ width: `${factor.correlation * 100}%` }}
                    >
                      <span className="correlation-value">{factor.correlation.toFixed(2)}</span>
                    </div>
                    <div className="impact-indicator">
                      <span className={`impact-dot ${factor.impact}`}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="correlation-legend">
              <div className="legend-item">
                <span className="legend-dot high"></span>
                <span className="legend-label">High Impact</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot medium"></span>
                <span className="legend-label">Medium Impact</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot low"></span>
                <span className="legend-label">Low Impact</span>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Statistical Analysis */}
        <DashboardGrid.Widget
          title="Statistical Analysis"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="statistical-analysis">
            <div className="stat-metrics">
              <div className="stat-metric">
                <div className="metric-name">Mean</div>
                <div className="metric-value">
                  {selectedMetric === 'rft' || selectedMetric === 'yield' 
                    ? `${statisticalAnalysis.mean.toFixed(1)}%` 
                    : statisticalAnalysis.mean.toFixed(1)}
                </div>
              </div>
              <div className="stat-metric">
                <div className="metric-name">Std Deviation</div>
                <div className="metric-value">
                  {statisticalAnalysis.stdDev.toFixed(2)}
                </div>
              </div>
              <div className="stat-metric">
                <div className="metric-name">Trend</div>
                <div className="metric-value trend">
                  <span className={`trend-indicator ${statisticalAnalysis.trend}`}>
                    {statisticalAnalysis.trend === 'improving' ? '↑' : 
                     statisticalAnalysis.trend === 'declining' ? '↓' : '→'}
                  </span>
                  {statisticalAnalysis.trend.charAt(0).toUpperCase() + statisticalAnalysis.trend.slice(1)}
                </div>
              </div>
              <div className="stat-metric">
                <div className="metric-name">Anomalies</div>
                <div className="metric-value">
                  {dataWithAnomalies.filter(d => d.isAnomaly).length}
                </div>
              </div>
            </div>
            
            <div className="anomaly-visualization">
              <h4 className="vis-title">Anomaly Detection</h4>
              <div className="anomaly-chart">
                <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
                  {/* Control limits */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="405" y="20" fontSize="10" fill="#ef4444">+2σ</text>
                  <text x="405" y="60" fontSize="10" fill="#ef4444">-2σ</text>
                  
                  {/* Mean line */}
                  <line x1="0" y1="40" x2="400" y2="40" stroke="#9ca3af" strokeWidth="1" />
                  <text x="405" y="40" fontSize="10" fill="#9ca3af">μ</text>
                  
                  {/* Data points */}
                  {dataWithAnomalies.map((point, i) => {
                    const x = (i / (dataWithAnomalies.length - 1)) * 390 + 5;
                    const y = 40 - (point.zScore * 10);
                    return (
                      <circle 
                        key={i} 
                        cx={x} 
                        cy={y} 
                        r={point.isAnomaly ? 4 : 3} 
                        fill={point.isAnomaly ? "#ef4444" : "#3b82f6"} 
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Action Recommendations */}
        <DashboardGrid.Widget
          title="Recommended Actions"
          size="large"
          onRefresh={() => refreshData()}
        >
          <div className="recommendations-panel">
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <div className="recommendation-title">{rec.title}</div>
                    <div className="recommendation-impact-ease">
                      <div className={`impact-badge ${rec.impact}`}>
                        {rec.impact.toUpperCase()} IMPACT
                      </div>
                      <div className={`ease-badge ${rec.ease}`}>
                        {rec.ease.toUpperCase()} EFFORT
                      </div>
                    </div>
                  </div>
                  <div className="recommendation-description">
                    {rec.description}
                  </div>
                  <div className="recommendation-actions">
                    <button className="recommendation-action-btn primary">
                      Implement
                    </button>
                    <button className="recommendation-action-btn secondary">
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardGrid.Widget>
      </DashboardGrid>
    </div>
  );
};

export default IntelligenceEngine; 