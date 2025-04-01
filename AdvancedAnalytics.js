import React, { useState, useMemo, useCallback } from 'react';
import { useDataContext } from './DataContext';
import DashboardGrid from './DashboardGrid';
import AdvancedChart from './AdvancedChart';

const AdvancedAnalytics = () => {
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  const [timeFilter, setTimeFilter] = useState('6m');
  const [selectedDept, setSelectedDept] = useState('all');
  
  // Process Breakdown Analysis
  const processBreakdownData = useMemo(() => {
    if (!data?.processMetrics?.cycleTimeBreakdown) {
      return [];
    }
    
    return data.processMetrics.cycleTimeBreakdown.map(step => ({
      name: step.step,
      time: step.time,
      percentage: step.time / 
        data.processMetrics.cycleTimeBreakdown.reduce((sum, s) => sum + s.time, 0) * 100
    }));
  }, [data]);
  
  // Generate historical trend data
  const trendData = useMemo(() => {
    if (!data?.overview?.processTimeline) {
      return [];
    }
    
    return data.overview.processTimeline.map(point => ({
      month: point.month,
      recordRFT: point.recordRFT,
      lotRFT: point.lotRFT
    }));
  }, [data]);
  
  // Generate comparative analysis data
  const comparativeData = useMemo(() => {
    if (!data?.internalRFT?.departmentPerformance) {
      return {
        labels: [],
        current: [],
        previous: []
      };
    }
    
    // Simulate previous period data (in a real app, this would come from the API)
    const current = data.internalRFT.departmentPerformance.map(dept => ({
      name: dept.department,
      value: dept.rftRate
    }));
    
    const previous = data.internalRFT.departmentPerformance.map(dept => ({
      name: dept.department,
      value: dept.rftRate - (Math.random() * 5) // Simulate previous period with slightly worse rates
    }));
    
    return {
      labels: current.map(item => item.name),
      current,
      previous
    };
  }, [data]);
  
  // Pareto analysis of issues
  const paretoData = useMemo(() => {
    if (!data?.overview?.issueDistribution) {
      return [];
    }
    
    // Sort issues by frequency (descending)
    const sortedIssues = [...data.overview.issueDistribution]
      .sort((a, b) => b.value - a.value);
    
    // Calculate cumulative percentage
    const totalIssues = sortedIssues.reduce((sum, issue) => sum + issue.value, 0);
    let cumulativeSum = 0;
    
    return sortedIssues.map(issue => {
      cumulativeSum += issue.value;
      return {
        name: issue.name,
        value: issue.value,
        percentage: (issue.value / totalIssues) * 100,
        cumulative: (cumulativeSum / totalIssues) * 100
      };
    });
  }, [data]);
  
  // Process capability analysis
  const processCapabilityData = useMemo(() => {
    // Simulate process capability metrics
    return {
      cpk: 1.33,
      cp: 1.45,
      sigma: 3.8,
      defectsPerMillion: 10800,
      distribution: [
        { x: 1, y: 2 }, { x: 2, y: 5 }, { x: 3, y: 10 },
        { x: 4, y: 20 }, { x: 5, y: 35 }, { x: 6, y: 25 },
        { x: 7, y: 15 }, { x: 8, y: 8 }, { x: 9, y: 3 }
      ]
    };
  }, []);
  
  // Forecast data
  const forecastData = useMemo(() => {
    // Generate trend line with forecast
    if (!data?.overview?.processTimeline) {
      return [];
    }
    
    const historical = data.overview.processTimeline.map(point => ({
      month: point.month,
      value: point.recordRFT,
      type: 'Historical'
    }));
    
    // Generate forecast data (3 months ahead)
    const lastValue = historical[historical.length - 1]?.value || 90;
    const forecast = [
      { month: 'Jul', value: lastValue + 0.5, type: 'Forecast' },
      { month: 'Aug', value: lastValue + 0.8, type: 'Forecast' },
      { month: 'Sep', value: lastValue + 1.1, type: 'Forecast' }
    ];
    
    return [...historical, ...forecast];
  }, [data]);
  
  // Correlation analysis data
  const correlationData = useMemo(() => {
    // Simulate correlation between cycle time and defect rate
    return [
      { cycleTime: 16, defectRate: 4.2 },
      { cycleTime: 18, defectRate: 5.1 },
      { cycleTime: 19, defectRate: 5.8 },
      { cycleTime: 20, defectRate: 6.5 },
      { cycleTime: 21, defectRate: 7.2 },
      { cycleTime: 22, defectRate: 8.0 },
      { cycleTime: 24, defectRate: 8.9 },
      { cycleTime: 26, defectRate: 9.7 },
      { cycleTime: 28, defectRate: 10.4 },
    ];
  }, []);
  
  // Handle widget refresh
  const handleRefresh = useCallback((widgetId) => {
    console.log(`Refreshing widget: ${widgetId}`);
    refreshData();
  }, [refreshData]);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analysis data...</p>
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
    <div className="analytics-container">
      {/* Header with controls */}
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Advanced Analytics</h1>
        </div>
        
        <div className="header-actions">
          <div className="time-range-controls">
            {['1m', '3m', '6m', '12m', 'ytd'].map((range) => (
              <button
                key={range}
                className={`time-range-button ${timeFilter === range ? 'active' : ''}`}
                onClick={() => setTimeFilter(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="department-filter">
            <select 
              className="department-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="production">Production</option>
              <option value="quality">Quality</option>
              <option value="packaging">Packaging</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>
          
          <button onClick={refreshData} className="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1.06-6.7-2.82"></path>
              <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1.06-6.7 2.82"></path>
              <path d="m3 12 3-3 3 3"></path>
            </svg>
            Refresh Analytics
          </button>
          
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      {/* Primary KPI metrics */}
      <div className="analytics-highlights">
        <div className="highlight-card">
          <div className="highlight-label">Overall RFT Rate</div>
          <div className="highlight-value">{data?.overview?.overallRFTRate?.toFixed(1) || '92.3'}%</div>
          <div className="highlight-trend text-green-500">↑ 1.5%</div>
        </div>
        
        <div className="highlight-card">
          <div className="highlight-label">Avg. Cycle Time</div>
          <div className="highlight-value">{data?.processMetrics?.totalCycleTime?.average?.toFixed(1) || '21.8'}</div>
          <div className="highlight-trend text-red-500">↑ 2.3</div>
        </div>
        
        <div className="highlight-card">
          <div className="highlight-label">Sigma Level</div>
          <div className="highlight-value">{processCapabilityData.sigma.toFixed(1)}</div>
          <div className="highlight-trend text-green-500">↑ 0.2</div>
        </div>
        
        <div className="highlight-card">
          <div className="highlight-label">DPMO</div>
          <div className="highlight-value">{processCapabilityData.defectsPerMillion.toLocaleString()}</div>
          <div className="highlight-trend text-green-500">↓ 1,200</div>
        </div>
      </div>
      
      {/* Advanced Charts grid */}
      <DashboardGrid>
        {/* Process Breakdown Analysis */}
        <DashboardGrid.Widget
          title="Process Time Breakdown"
          size="medium"
          onRefresh={() => handleRefresh('process-breakdown')}
        >
          <AdvancedChart
            title="Manufacturing Process Steps"
            data={processBreakdownData}
            type="bar"
            xDataKey="name"
            yDataKey="time"
            description="Time (days) spent at each process step"
            height={300}
            allowDownload={true}
          />
        </DashboardGrid.Widget>
        
        {/* Historical Trend Analysis */}
        <DashboardGrid.Widget
          title="RFT Trend Analysis"
          size="medium"
          onRefresh={() => handleRefresh('rft-trend')}
        >
          <AdvancedChart
            title="6-Month RFT Performance"
            data={trendData}
            type="line"
            categories={['recordRFT', 'lotRFT']}
            percentage={true}
            description="Record-level vs Lot-level RFT rates over time"
            height={300}
            allowDownload={true}
          />
        </DashboardGrid.Widget>
        
        {/* Pareto Analysis Chart */}
        <DashboardGrid.Widget
          title="Pareto Analysis"
          size="medium"
          onRefresh={() => handleRefresh('pareto-analysis')}
        >
          <div className="chart-container">
            <h4 className="chart-title">Issue Pareto Analysis</h4>
            <p className="chart-description">80/20 analysis of manufacturing issues</p>
            
            <div className="pareto-chart" style={{ height: 300 }}>
              <div className="bar-chart" style={{ height: '80%' }}>
                {paretoData.map((item, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          height: `${(item.value / Math.max(...paretoData.map(d => d.value))) * 100}%`,
                          backgroundColor: '#3b82f6'
                        }}
                      >
                        <span className="bar-value">{item.value}</span>
                      </div>
                    </div>
                    <div className="bar-label">{item.name}</div>
                  </div>
                ))}
              </div>
              
              <div className="pareto-line">
                <svg width="100%" height="50" style={{ marginTop: 10 }}>
                  <polyline
                    points="0,50 100,30 200,15 300,8 400,2"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#9ca3af" strokeWidth="1" strokeDasharray="5,5" />
                  <text x="410" y="20" fontSize="12" fill="#9ca3af">80%</text>
                </svg>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Process Capability Analysis */}
        <DashboardGrid.Widget
          title="Process Capability"
          size="medium"
          onRefresh={() => handleRefresh('process-capability')}
        >
          <div className="capability-analysis">
            <div className="capability-metrics">
              <div className="capability-metric">
                <div className="metric-name">Cpk</div>
                <div className="metric-value">{processCapabilityData.cpk.toFixed(2)}</div>
              </div>
              <div className="capability-metric">
                <div className="metric-name">Cp</div>
                <div className="metric-value">{processCapabilityData.cp.toFixed(2)}</div>
              </div>
              <div className="capability-metric">
                <div className="metric-name">Sigma</div>
                <div className="metric-value">{processCapabilityData.sigma.toFixed(1)}σ</div>
              </div>
              <div className="capability-metric">
                <div className="metric-name">DPMO</div>
                <div className="metric-value">{processCapabilityData.defectsPerMillion.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="distribution-chart">
              <h4 className="chart-title">Process Distribution</h4>
              <div className="normal-curve" style={{ height: 150 }}>
                <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <path 
                    d="M0,150 C80,150 120,20 200,20 C280,20 320,150 400,150" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="2" 
                  />
                  <path 
                    d="M0,150 C80,150 120,20 200,20 C280,20 320,150 400,150 L400,150 L0,150 Z" 
                    fill="rgba(59, 130, 246, 0.1)" 
                  />
                  <line x1="140" y1="0" x2="140" y2="150" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="260" y1="0" x2="260" y2="150" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" />
                  <text x="200" y="140" textAnchor="middle" fontSize="12" fill="#6b7280">Process Mean</text>
                </svg>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Comparative Analysis */}
        <DashboardGrid.Widget
          title="RFT Comparative Analysis"
          size="medium"
          onRefresh={() => handleRefresh('comparative-analysis')}
        >
          <div className="chart-container">
            <h4 className="chart-title">Current vs. Previous Period</h4>
            
            <div className="comparative-chart" style={{ height: 300 }}>
              <div className="bar-chart" style={{ height: '100%' }}>
                {comparativeData.labels.map((label, index) => (
                  <div key={index} className="comparative-bar-group">
                    <div className="comparative-label">{label}</div>
                    <div className="bar-pair">
                      <div 
                        className="comparison-bar current"
                        style={{ 
                          height: `${comparativeData.current[index]?.value}%`,
                          maxHeight: '100%'
                        }}
                      >
                        <span className="bar-value">{comparativeData.current[index]?.value.toFixed(1)}%</span>
                      </div>
                      <div 
                        className="comparison-bar previous"
                        style={{ 
                          height: `${comparativeData.previous[index]?.value}%`,
                          maxHeight: '100%'
                        }}
                      >
                        <span className="bar-value">{comparativeData.previous[index]?.value.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color current"></span>
                <span className="legend-label">Current Period</span>
              </div>
              <div className="legend-item">
                <span className="legend-color previous"></span>
                <span className="legend-label">Previous Period</span>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Forecast Analysis */}
        <DashboardGrid.Widget
          title="RFT Forecast"
          size="medium"
          onRefresh={() => handleRefresh('forecast-analysis')}
        >
          <div className="chart-container">
            <h4 className="chart-title">3-Month RFT Forecast</h4>
            
            <div className="forecast-chart" style={{ height: 300 }}>
              <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
                {/* Historical line */}
                <path 
                  d="M0,150 C30,140 60,120 90,110 C120,100 150,105 180,95" 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  fill="none" 
                />
                
                {/* Forecast line - dashed */}
                <path 
                  d="M180,95 C210,85 240,80 270,75 C300,70 330,65 360,60" 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  strokeDasharray="5,5" 
                  fill="none" 
                />
                
                {/* Forecast confidence interval */}
                <path 
                  d="M180,95 C210,85 240,80 270,75 C300,70 330,65 360,60 L360,100 C330,105 300,110 270,115 C240,120 210,125 180,95 Z" 
                  fill="rgba(59, 130, 246, 0.1)" 
                />
                
                {/* Target line */}
                <line x1="0" y1="50" x2="400" y2="50" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" />
                <text x="380" y="45" fontSize="12" fill="#10b981">Target</text>
                
                {/* Divider between historical and forecast */}
                <line x1="180" y1="0" x2="180" y2="300" stroke="#9ca3af" strokeWidth="1" strokeDasharray="5,5" />
              </svg>
              
              <div className="forecast-labels">
                {forecastData.map((point, index) => (
                  <div key={index} className="forecast-label" style={{ left: `${index * (100 / forecastData.length)}%` }}>
                    {point.month}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-line solid"></span>
                <span className="legend-label">Historical Data</span>
              </div>
              <div className="legend-item">
                <span className="legend-line dashed"></span>
                <span className="legend-label">Forecast</span>
              </div>
              <div className="legend-item">
                <span className="legend-line target"></span>
                <span className="legend-label">Target (95%)</span>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Correlation Analysis */}
        <DashboardGrid.Widget
          title="Correlation Analysis"
          size="medium"
          onRefresh={() => handleRefresh('correlation-analysis')}
        >
          <div className="chart-container">
            <h4 className="chart-title">Cycle Time vs. Defect Rate</h4>
            <p className="chart-description">Scatter plot showing correlation (r = 0.94)</p>
            
            <div className="scatter-plot" style={{ height: 300 }}>
              <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none">
                {/* X and Y axes */}
                <line x1="50" y1="250" x2="380" y2="250" stroke="#9ca3af" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="250" stroke="#9ca3af" strokeWidth="1" />
                
                {/* Axis labels */}
                <text x="215" y="280" textAnchor="middle" fontSize="12" fill="#6b7280">Cycle Time (days)</text>
                <text x="20" y="150" textAnchor="middle" fontSize="12" fill="#6b7280" transform="rotate(-90, 20, 150)">Defect Rate (%)</text>
                
                {/* Data points */}
                {correlationData.map((point, index) => (
                  <circle 
                    key={index}
                    cx={(point.cycleTime - 15) * 20 + 50}
                    cy={250 - point.defectRate * 20}
                    r="5"
                    fill="#3b82f6"
                  />
                ))}
                
                {/* Trend line */}
                <line x1="50" y1="220" x2="350" y2="100" stroke="#ef4444" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Root Cause Analysis */}
        <DashboardGrid.Widget
          title="Root Cause Analysis"
          size="medium"
          onRefresh={() => handleRefresh('root-cause-analysis')}
        >
          <div className="chart-container">
            <h4 className="chart-title">Ishikawa (Fishbone) Diagram</h4>
            
            <div className="fishbone-diagram" style={{ height: 300 }}>
              <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                {/* Main spine */}
                <line x1="100" y1="150" x2="700" y2="150" stroke="#000" strokeWidth="2" />
                
                {/* Result box */}
                <rect x="700" y="125" width="80" height="50" fill="#3b82f6" />
                <text x="740" y="155" textAnchor="middle" fontSize="12" fill="white">High Defect Rate</text>
                
                {/* Categories and causes - simplified */}
                {/* People */}
                <line x1="200" y1="150" x2="200" y2="50" stroke="#000" strokeWidth="1" />
                <text x="200" y="40" textAnchor="middle" fontSize="12" fill="#000">People</text>
                
                <line x1="200" y1="80" x2="150" y2="80" stroke="#6b7280" strokeWidth="1" />
                <text x="145" y="80" textAnchor="end" fontSize="10" fill="#6b7280">Training</text>
                
                <line x1="200" y1="100" x2="160" y2="100" stroke="#6b7280" strokeWidth="1" />
                <text x="155" y="100" textAnchor="end" fontSize="10" fill="#6b7280">Experience</text>
                
                {/* Process */}
                <line x1="350" y1="150" x2="350" y2="50" stroke="#000" strokeWidth="1" />
                <text x="350" y="40" textAnchor="middle" fontSize="12" fill="#000">Process</text>
                
                <line x1="350" y1="80" x2="300" y2="80" stroke="#6b7280" strokeWidth="1" />
                <text x="295" y="80" textAnchor="end" fontSize="10" fill="#6b7280">Procedures</text>
                
                <line x1="350" y1="100" x2="310" y2="100" stroke="#6b7280" strokeWidth="1" />
                <text x="305" y="100" textAnchor="end" fontSize="10" fill="#6b7280">Work Instructions</text>
                
                {/* Equipment */}
                <line x1="500" y1="150" x2="500" y2="50" stroke="#000" strokeWidth="1" />
                <text x="500" y="40" textAnchor="middle" fontSize="12" fill="#000">Equipment</text>
                
                <line x1="500" y1="80" x2="450" y2="80" stroke="#6b7280" strokeWidth="1" />
                <text x="445" y="80" textAnchor="end" fontSize="10" fill="#6b7280">Calibration</text>
                
                <line x1="500" y1="100" x2="460" y2="100" stroke="#6b7280" strokeWidth="1" />
                <text x="455" y="100" textAnchor="end" fontSize="10" fill="#6b7280">Maintenance</text>
                
                {/* Materials */}
                <line x1="600" y1="150" x2="600" y2="50" stroke="#000" strokeWidth="1" />
                <text x="600" y="40" textAnchor="middle" fontSize="12" fill="#000">Materials</text>
                
                <line x1="600" y1="80" x2="550" y2="80" stroke="#6b7280" strokeWidth="1" />
                <text x="545" y="80" textAnchor="end" fontSize="10" fill="#6b7280">Quality</text>
                
                <line x1="600" y1="100" x2="560" y2="100" stroke="#6b7280" strokeWidth="1" />
                <text x="555" y="100" textAnchor="end" fontSize="10" fill="#6b7280">Specifications</text>
                
                {/* Environment */}
                <line x1="250" y1="150" x2="250" y2="250" stroke="#000" strokeWidth="1" />
                <text x="250" y="270" textAnchor="middle" fontSize="12" fill="#000">Environment</text>
                
                <line x1="250" y1="220" x2="200" y2="220" stroke="#6b7280" strokeWidth="1" />
                <text x="195" y="220" textAnchor="end" fontSize="10" fill="#6b7280">Temperature</text>
                
                <line x1="250" y1="200" x2="210" y2="200" stroke="#6b7280" strokeWidth="1" />
                <text x="205" y="200" textAnchor="end" fontSize="10" fill="#6b7280">Humidity</text>
                
                {/* Management */}
                <line x1="450" y1="150" x2="450" y2="250" stroke="#000" strokeWidth="1" />
                <text x="450" y="270" textAnchor="middle" fontSize="12" fill="#000">Management</text>
                
                <line x1="450" y1="220" x2="400" y2="220" stroke="#6b7280" strokeWidth="1" />
                <text x="395" y="220" textAnchor="end" fontSize="10" fill="#6b7280">Oversight</text>
                
                <line x1="450" y1="200" x2="410" y2="200" stroke="#6b7280" strokeWidth="1" />
                <text x="405" y="200" textAnchor="end" fontSize="10" fill="#6b7280">Resources</text>
              </svg>
            </div>
          </div>
        </DashboardGrid.Widget>
      </DashboardGrid>
      
      {isLoading && <div className="overlay-loading">Refreshing analytics...</div>}
    </div>
  );
};

export default AdvancedAnalytics; 