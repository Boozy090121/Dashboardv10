import React, { useState, useMemo, useCallback } from 'react';
import { useDataContext } from './DataContext';
import { useTimeFilter } from './TimeFilterContext';
import DashboardGrid from './DashboardGrid';
import AdvancedChart from './AdvancedChart';

// Process capability calculation utility functions
const calculateCpk = (mean, stdDev, upperSpec, lowerSpec) => {
  if (stdDev === 0) return 0;
  const upperCpk = (upperSpec - mean) / (3 * stdDev);
  const lowerCpk = (mean - lowerSpec) / (3 * stdDev);
  return Math.min(upperCpk, lowerCpk);
};

const calculateCp = (stdDev, upperSpec, lowerSpec) => {
  if (stdDev === 0) return 0;
  return (upperSpec - lowerSpec) / (6 * stdDev);
};

// Control limits calculation
const calculateControlLimits = (data, field) => {
  if (!data || !data.length) return { ucl: 0, lcl: 0, cl: 0 };
  
  const values = data.map(item => item[field]);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Calculate moving range
  const ranges = [];
  for (let i = 1; i < values.length; i++) {
    ranges.push(Math.abs(values[i] - values[i-1]));
  }
  
  const avgRange = ranges.length ? ranges.reduce((sum, r) => sum + r, 0) / ranges.length : 0;
  
  // Standard SPC constants for I-MR chart
  const d2 = 1.128; // For n=2 subgroups
  const d3 = 0.853; // For n=2 subgroups
  const d4 = 3.267; // For n=2 subgroups
  
  // Calculate control limits
  const sigma = avgRange / d2;
  const cl = mean;
  const ucl = mean + 3 * sigma;
  const lcl = mean - 3 * sigma;
  
  // Range chart limits
  const rUcl = d4 * avgRange;
  const rLcl = 0; // Lower limit for range chart is typically zero
  
  return { 
    ucl, 
    lcl: Math.max(0, lcl), // Don't go below zero for certain metrics
    cl, 
    sigma,
    rUcl,
    rLcl,
    rCl: avgRange
  };
};

// Main component
const EnhancedVisualizations = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const { filterDataByTimeRange } = useTimeFilter();
  const [selectedMetric, setSelectedMetric] = useState('rft');
  const [selectedParameter, setSelectedParameter] = useState('all');
  
  // Process the data with enhanced filtering
  const processData = useMemo(() => {
    if (!data?.processData?.parameters) {
      // Generate mock data if none exists
      return {
        parameters: [
          {
            name: "Temperature",
            data: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(2023, 10, i + 1).toISOString(),
              value: 120 + Math.random() * 5, // Random values around 120
              upperSpec: 125,
              lowerSpec: 115,
              target: 120
            }))
          },
          {
            name: "Pressure",
            data: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(2023, 10, i + 1).toISOString(),
              value: 50 + Math.sin(i * 0.3) * 3 + Math.random() * 2, // Sinusoidal pattern with noise
              upperSpec: 55,
              lowerSpec: 45,
              target: 50
            }))
          },
          {
            name: "Flow Rate",
            data: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(2023, 10, i + 1).toISOString(),
              value: 30 + (i < 15 ? 0 : 3) + Math.random() * 2, // Step change at i=15
              upperSpec: 35,
              lowerSpec: 25,
              target: 30
            }))
          },
          {
            name: "pH",
            data: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(2023, 10, i + 1).toISOString(),
              value: 7.0 + Math.random() * 0.4 - 0.2, // Random values around 7.0
              upperSpec: 7.5,
              lowerSpec: 6.5,
              target: 7.0
            }))
          }
        ],
        correlations: [
          { parameter1: "Temperature", parameter2: "Pressure", correlation: 0.85 },
          { parameter1: "Temperature", parameter2: "Flow Rate", correlation: 0.32 },
          { parameter1: "Temperature", parameter2: "pH", correlation: -0.15 },
          { parameter1: "Pressure", parameter2: "Flow Rate", correlation: 0.67 },
          { parameter1: "Pressure", parameter2: "pH", correlation: 0.12 },
          { parameter1: "Flow Rate", parameter2: "pH", correlation: -0.22 }
        ]
      };
    }
    
    return data.processData;
  }, [data]);
  
  // Filter process data based on selected time range
  const filteredParameterData = useMemo(() => {
    return processData.parameters.map(param => ({
      ...param,
      data: filterDataByTimeRange(param.data, 'date')
    }));
  }, [processData, filterDataByTimeRange]);
  
  // Get data for the selected parameter
  const selectedParameterData = useMemo(() => {
    if (selectedParameter === 'all') {
      return filteredParameterData;
    }
    
    return filteredParameterData.filter(param => 
      param.name === selectedParameter
    );
  }, [filteredParameterData, selectedParameter]);
  
  // Calculate SPC control limits for selected parameter
  const controlLimits = useMemo(() => {
    if (selectedParameter === 'all') {
      return filteredParameterData.map(param => ({
        name: param.name,
        limits: calculateControlLimits(param.data, 'value')
      }));
    }
    
    const paramData = filteredParameterData.find(param => param.name === selectedParameter);
    if (!paramData) return [];
    
    return [{
      name: paramData.name,
      limits: calculateControlLimits(paramData.data, 'value')
    }];
  }, [filteredParameterData, selectedParameter]);
  
  // Calculate process capability metrics for selected parameter
  const processCapabilities = useMemo(() => {
    return selectedParameterData.map(param => {
      const values = param.data.map(item => item.value);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Calculate standard deviation
      const squareDiffs = values.map(value => {
        const diff = value - mean;
        return diff * diff;
      });
      const variance = squareDiffs.reduce((sum, sqrDiff) => sum + sqrDiff, 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Use first data point for specs (assuming all data points have same specs)
      const { upperSpec, lowerSpec, target } = param.data[0] || { upperSpec: 0, lowerSpec: 0, target: 0 };
      
      // Calculate process capability
      const cp = calculateCp(stdDev, upperSpec, lowerSpec);
      const cpk = calculateCpk(mean, stdDev, upperSpec, lowerSpec);
      
      // Calculate sigma level
      const sigmaLevel = 3 * cpk;
      
      // Calculate defects per million opportunities (DPMO)
      const z = (mean - lowerSpec) / stdDev; // Z-score for lower spec
      const ppm = normsdist(z) * 1000000; // Approximate PPM below lower spec
      
      return {
        name: param.name,
        mean,
        stdDev,
        cp,
        cpk,
        sigmaLevel,
        ppm,
        target,
        upperSpec,
        lowerSpec,
        data: param.data
      };
    });
  }, [selectedParameterData]);
  
  // Prepare SPC chart data
  const spcChartData = useMemo(() => {
    if (selectedParameter === 'all' || !selectedParameterData.length) return [];
    
    const paramData = selectedParameterData[0];
    const limits = controlLimits[0]?.limits;
    
    if (!limits) return [];
    
    return paramData.data.map((point, index) => ({
      x: index + 1, // Point number
      date: new Date(point.date).toLocaleDateString(),
      value: point.value,
      ucl: limits.ucl,
      lcl: limits.lcl,
      cl: limits.cl,
      target: point.target,
      outOfControl: point.value > limits.ucl || point.value < limits.lcl
    }));
  }, [selectedParameterData, controlLimits, selectedParameter]);
  
  // Prepare correlation matrix data
  const correlationMatrixData = useMemo(() => {
    const parameters = filteredParameterData.map(param => param.name);
    const matrix = [];
    
    // Create matrix cells
    for (let i = 0; i < parameters.length; i++) {
      for (let j = 0; j < parameters.length; j++) {
        if (i === j) {
          // Diagonal - parameter name
          matrix.push({
            row: i,
            col: j,
            value: 1, // Self correlation is always 1
            type: 'diagonal',
            label: parameters[i]
          });
        } else {
          // Find correlation between parameters[i] and parameters[j]
          const correlation = processData.correlations.find(
            c => (c.parameter1 === parameters[i] && c.parameter2 === parameters[j]) ||
                 (c.parameter1 === parameters[j] && c.parameter2 === parameters[i])
          );
          
          matrix.push({
            row: i,
            col: j,
            value: correlation ? correlation.correlation : 0,
            type: 'correlation'
          });
        }
      }
    }
    
    return {
      parameters,
      matrix
    };
  }, [filteredParameterData, processData.correlations]);
  
  // Prepare Pareto data
  const paretoData = useMemo(() => {
    // Use defect categories or mock data
    if (!data?.defects?.categories) {
      return [
        { name: "Documentation Error", count: 42 },
        { name: "Process Deviation", count: 28 },
        { name: "Equipment Issue", count: 15 },
        { name: "Material Issue", count: 11 },
        { name: "Operator Error", count: 8 },
        { name: "Environmental", count: 5 },
        { name: "Other", count: 3 }
      ].sort((a, b) => b.count - a.count);
    }
    
    return [...data.defects.categories].sort((a, b) => b.count - a.count);
  }, [data]);
  
  // Calculate cumulative percentage for Pareto chart
  const paretoWithCumulative = useMemo(() => {
    const total = paretoData.reduce((sum, item) => sum + item.count, 0);
    let cumulative = 0;
    
    return paretoData.map(item => {
      const percentage = (item.count / total) * 100;
      cumulative += percentage;
      
      return {
        ...item,
        percentage,
        cumulative
      };
    });
  }, [paretoData]);
  
  // Prepare risk heatmap data
  const riskHeatmapData = useMemo(() => {
    // Use risk data or mock data
    if (!data?.risks) {
      return [
        { category: "Equipment Failure", probability: 3, impact: 4, riskScore: 12, mitigation: "Preventive maintenance program" },
        { category: "Material Shortage", probability: 4, impact: 3, riskScore: 12, mitigation: "Increase safety stock" },
        { category: "Documentation Error", probability: 4, impact: 2, riskScore: 8, mitigation: "Electronic verification system" },
        { category: "Operator Error", probability: 3, impact: 3, riskScore: 9, mitigation: "Training program" },
        { category: "Power Outage", probability: 2, impact: 5, riskScore: 10, mitigation: "Backup generator" },
        { category: "Contamination", probability: 2, impact: 5, riskScore: 10, mitigation: "Enhanced cleanroom protocols" },
        { category: "Regulatory Change", probability: 3, impact: 4, riskScore: 12, mitigation: "Regulatory monitoring team" },
        { category: "IT System Failure", probability: 2, impact: 4, riskScore: 8, mitigation: "System redundancy" },
        { category: "Shipping Delay", probability: 4, impact: 2, riskScore: 8, mitigation: "Multiple logistics providers" }
      ];
    }
    
    return data.risks;
  }, [data]);
  
  // Event Handlers
  const handleParameterChange = useCallback((e) => {
    setSelectedParameter(e.target.value);
  }, []);
  
  const handleMetricChange = useCallback((e) => {
    setSelectedMetric(e.target.value);
  }, []);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading visualization data...</p>
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
    <div className="enhanced-visualizations-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Enhanced Visualizations</h1>
        </div>
        
        <div className="header-filters">
          <div className="filter-group">
            <label htmlFor="parameter-select">Parameter:</label>
            <select 
              id="parameter-select"
              value={selectedParameter}
              onChange={handleParameterChange}
              className="parameter-select"
            >
              <option value="all">All Parameters</option>
              {filteredParameterData.map(param => (
                <option key={param.name} value={param.name}>
                  {param.name}
                </option>
              ))}
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
              <option value="defects">Defect Analysis</option>
              <option value="parameters">Process Parameters</option>
              <option value="risk">Risk Analysis</option>
            </select>
          </div>
          
          <button onClick={refreshData} className="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1.06-6.7-2.82"></path>
              <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1.06-6.7 2.82"></path>
              <path d="m3 12 3-3 3 3"></path>
            </svg>
            Refresh Visualizations
          </button>
        </div>
      </div>
      
      {/* Visualization Grid */}
      <DashboardGrid>
        {/* SPC Chart */}
        <DashboardGrid.Widget
          title="Statistical Process Control (SPC) Chart"
          size="large"
          onRefresh={() => refreshData()}
        >
          {selectedParameter !== 'all' && spcChartData.length > 0 ? (
            <div className="spc-chart-container">
              <div className="chart-header">
                <h3>{selectedParameter} Control Chart</h3>
                <div className="control-limits-legend">
                  <div className="legend-item">
                    <span className="legend-color ucl"></span>
                    <span className="legend-label">UCL: {spcChartData[0].ucl.toFixed(2)}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color cl"></span>
                    <span className="legend-label">CL: {spcChartData[0].cl.toFixed(2)}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color lcl"></span>
                    <span className="legend-label">LCL: {spcChartData[0].lcl.toFixed(2)}</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color target"></span>
                    <span className="legend-label">Target: {spcChartData[0].target.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="spc-chart" style={{ height: 300 }}>
                <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                  {/* X and Y axes */}
                  <line x1="50" y1="250" x2="750" y2="250" stroke="#d1d5db" strokeWidth="1" />
                  <line x1="50" y1="50" x2="50" y2="250" stroke="#d1d5db" strokeWidth="1" />
                  
                  {/* X-axis labels */}
                  {spcChartData.filter((_, i) => i % 5 === 0).map((point, i) => (
                    <text 
                      key={`x-label-${i}`} 
                      x={50 + (i * 5 * 700) / (spcChartData.length - 1)} 
                      y="270" 
                      fontSize="10" 
                      textAnchor="middle"
                    >
                      {point.x}
                    </text>
                  ))}
                  
                  {/* Control limits */}
                  <line 
                    x1="50" 
                    y1={250 - ((spcChartData[0].ucl - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    x2="750" 
                    y2={250 - ((spcChartData[0].ucl - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    stroke="#ef4444" 
                    strokeWidth="1" 
                    strokeDasharray="5,5" 
                  />
                  
                  <line 
                    x1="50" 
                    y1={250 - ((spcChartData[0].lcl - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    x2="750" 
                    y2={250 - ((spcChartData[0].lcl - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    stroke="#ef4444" 
                    strokeWidth="1" 
                    strokeDasharray="5,5" 
                  />
                  
                  <line 
                    x1="50" 
                    y1={250 - ((spcChartData[0].cl - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    x2="750" 
                    y2={250 - ((spcChartData[0].cl - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    stroke="#9ca3af" 
                    strokeWidth="1" 
                  />
                  
                  {/* Target line */}
                  <line 
                    x1="50" 
                    y1={250 - ((spcChartData[0].target - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    x2="750" 
                    y2={250 - ((spcChartData[0].target - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                        (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)))} 
                    stroke="#10b981" 
                    strokeWidth="1" 
                    strokeDasharray="3,3" 
                  />
                  
                  {/* Data points and line */}
                  <polyline
                    points={spcChartData.map((point, i) => {
                      const x = 50 + (i * 700) / (spcChartData.length - 1);
                      const y = 250 - ((point.value - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                              (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)));
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  
                  {spcChartData.map((point, i) => {
                    const x = 50 + (i * 700) / (spcChartData.length - 1);
                    const y = 250 - ((point.value - Math.min(...spcChartData.map(d => d.lcl))) * 200) / 
                            (Math.max(...spcChartData.map(d => d.ucl)) - Math.min(...spcChartData.map(d => d.lcl)));
                    
                    return (
                      <circle
                        key={`point-${i}`}
                        cx={x}
                        cy={y}
                        r={point.outOfControl ? 5 : 3}
                        fill={point.outOfControl ? "#ef4444" : "#3b82f6"}
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
              </div>
              
              <div className="out-of-control-points">
                <h4>Out of Control Points</h4>
                {spcChartData.filter(point => point.outOfControl).length > 0 ? (
                  <div className="out-of-control-list">
                    {spcChartData.filter(point => point.outOfControl).map((point, i) => (
                      <div key={`ooc-${i}`} className="out-of-control-item">
                        <span className="point-number">Point {point.x}</span>
                        <span className="point-date">{point.date}</span>
                        <span className="point-value">{point.value.toFixed(2)}</span>
                        <span className="ooc-badge">Out of Control</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-ooc-points">
                    <p>No out of control points detected.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="parameter-selection-message">
              <p>Please select a specific parameter to view SPC chart</p>
            </div>
          )}
        </DashboardGrid.Widget>
        
        {/* Process Capability */}
        <DashboardGrid.Widget
          title="Process Capability Analysis"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="process-capability-container">
            {processCapabilities.map((capability, index) => (
              <div key={index} className="capability-card">
                <div className="capability-header">
                  <h3>{capability.name}</h3>
                </div>
                
                <div className="capability-metrics">
                  <div className="capability-metric">
                    <span className="metric-name">Cp</span>
                    <span className={`metric-value ${capability.cp >= 1.33 ? 'good' : capability.cp >= 1.0 ? 'moderate' : 'poor'}`}>
                      {capability.cp.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="capability-metric">
                    <span className="metric-name">Cpk</span>
                    <span className={`metric-value ${capability.cpk >= 1.33 ? 'good' : capability.cpk >= 1.0 ? 'moderate' : 'poor'}`}>
                      {capability.cpk.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="capability-metric">
                    <span className="metric-name">σ Level</span>
                    <span className="metric-value">
                      {capability.sigmaLevel.toFixed(1)}σ
                    </span>
                  </div>
                  
                  <div className="capability-metric">
                    <span className="metric-name">DPMO</span>
                    <span className="metric-value">
                      {capability.ppm.toFixed(0)}
                    </span>
                  </div>
                </div>
                
                <div className="capability-distribution">
                  <div className="spec-limits">
                    <div className="limit-marker lsl" style={{ left: '10%' }}>
                      <div className="limit-line"></div>
                      <div className="limit-label">LSL: {capability.lowerSpec}</div>
                    </div>
                    
                    <div className="limit-marker target" style={{ left: '50%' }}>
                      <div className="limit-line"></div>
                      <div className="limit-label">Target: {capability.target}</div>
                    </div>
                    
                    <div className="limit-marker usl" style={{ left: '90%' }}>
                      <div className="limit-line"></div>
                      <div className="limit-label">USL: {capability.upperSpec}</div>
                    </div>
                  </div>
                  
                  <div className="distribution-curve">
                    <svg width="100%" height="80" viewBox="0 0 100 80" preserveAspectRatio="none">
                      <path 
                        d="M0,80 C20,80 35,5 50,5 C65,5 80,80 100,80" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2" 
                      />
                      <path 
                        d="M0,80 C20,80 35,5 50,5 C65,5 80,80 100,80 L100,80 L0,80 Z" 
                        fill="rgba(59, 130, 246, 0.1)" 
                      />
                      
                      {/* Mean indicator */}
                      <line 
                        x1="50" 
                        y1="5" 
                        x2="50" 
                        y2="80" 
                        stroke="#3b82f6" 
                        strokeWidth="1" 
                        strokeDasharray="3,3" 
                      />
                      <text x="50" y="15" textAnchor="middle" fontSize="8" fill="#3b82f6">μ: {capability.mean.toFixed(1)}</text>
                    </svg>
                  </div>
                </div>
                
                <div className="capability-status">
                  <div className={`status-indicator ${capability.cpk >= 1.33 ? 'good' : capability.cpk >= 1.0 ? 'moderate' : 'poor'}`}>
                    Process {capability.cpk >= 1.33 ? 'Capable' : capability.cpk >= 1.0 ? 'Marginally Capable' : 'Not Capable'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardGrid.Widget>
        
        {/* Pareto Chart */}
        <DashboardGrid.Widget
          title="Pareto Analysis with Cost Impact"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="pareto-chart-container">
            <div className="chart-header">
              <h3>Defect Category Analysis</h3>
            </div>
            
            <div className="pareto-chart" style={{ height: 300 }}>
              <div className="chart-body" style={{ height: '90%' }}>
                <div className="bars-container">
                  {paretoWithCumulative.map((item, index) => (
                    <div key={index} className="pareto-bar-group">
                      <div className="pareto-bar-container">
                        <div 
                          className="pareto-bar"
                          style={{ height: `${(item.count / Math.max(...paretoData.map(d => d.count))) * 100}%` }}
                        >
                          <span className="bar-value">{item.count}</span>
                        </div>
                        <div className="bar-cost-impact" style={{ width: `${Math.min(100, item.percentage * 0.8)}%` }}>
                          <span className="cost-value">${(item.count * 100).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="bar-label">{item.name}</div>
                    </div>
                  ))}
                </div>
                
                <div className="cumulative-line">
                  <svg width="100%" height="100%" preserveAspectRatio="none">
                    <polyline
                      points={paretoWithCumulative.map((item, i) => {
                        const x = (i * 100) / (paretoWithCumulative.length - 1);
                        const y = 100 - item.cumulative;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    
                    {paretoWithCumulative.map((item, i) => {
                      const x = (i * 100) / (paretoWithCumulative.length - 1);
                      const y = 100 - item.cumulative;
                      
                      return (
                        <circle
                          key={`cum-${i}`}
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="3"
                          fill="#ef4444"
                        />
                      );
                    })}
                    
                    {/* 80% line */}
                    <line
                      x1="0"
                      y1="20%"
                      x2="100%"
                      y2="20%"
                      stroke="#9ca3af"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    <text x="101%" y="20%" fontSize="10" fill="#9ca3af" dominantBaseline="middle">80%</text>
                  </svg>
                </div>
              </div>
              
              <div className="pareto-legend">
                <div className="legend-item">
                  <span className="legend-color bar"></span>
                  <span className="legend-label">Defect Count</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color line"></span>
                  <span className="legend-label">Cumulative %</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color cost"></span>
                  <span className="legend-label">Cost Impact</span>
                </div>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Correlation Matrix */}
        <DashboardGrid.Widget
          title="Multi-Variable Correlation Matrix"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="correlation-matrix-container">
            <div className="matrix-header">
              <h3>Parameter Correlation Analysis</h3>
              <p className="matrix-description">
                Correlation between process parameters (values range from -1 to 1)
              </p>
            </div>
            
            <div className="correlation-matrix">
              <div className="matrix-grid" style={{ 
                gridTemplateColumns: `repeat(${correlationMatrixData.parameters.length}, 1fr)`,
                gridTemplateRows: `repeat(${correlationMatrixData.parameters.length}, 1fr)`
              }}>
                {correlationMatrixData.matrix.map((cell, index) => {
                  if (cell.type === 'diagonal') {
                    return (
                      <div 
                        key={`cell-${cell.row}-${cell.col}`} 
                        className="matrix-diagonal-cell"
                        style={{ 
                          gridRow: cell.row + 1, 
                          gridColumn: cell.col + 1 
                        }}
                      >
                        {cell.label}
                      </div>
                    );
                  } else {
                    const correlationClass = 
                      Math.abs(cell.value) >= 0.7 ? 'high' :
                      Math.abs(cell.value) >= 0.4 ? 'medium' : 'low';
                    
                    const isPositive = cell.value >= 0;
                    
                    return (
                      <div 
                        key={`cell-${cell.row}-${cell.col}`} 
                        className={`matrix-cell ${correlationClass} ${isPositive ? 'positive' : 'negative'}`}
                        style={{ 
                          gridRow: cell.row + 1, 
                          gridColumn: cell.col + 1,
                          opacity: Math.abs(cell.value)
                        }}
                      >
                        {cell.value.toFixed(2)}
                      </div>
                    );
                  }
                })}
              </div>
              
              <div className="correlation-legend">
                <div className="legend-section">
                  <h4>Correlation Strength</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <span className="legend-color high"></span>
                      <span className="legend-label">Strong (≥0.7)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color medium"></span>
                      <span className="legend-label">Medium (0.4-0.7)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color low"></span>
                      <span className="legend-label">Weak (<0.4)</span>
                    </div>
                  </div>
                </div>
                
                <div className="legend-section">
                  <h4>Correlation Direction</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <span className="legend-color positive"></span>
                      <span className="legend-label">Positive</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color negative"></span>
                      <span className="legend-label">Negative</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        {/* Risk Heatmap */}
        <DashboardGrid.Widget
          title="Risk Heatmap"
          size="large"
          onRefresh={() => refreshData()}
        >
          <div className="risk-heatmap-container">
            <div className="heatmap-header">
              <h3>Manufacturing Risk Analysis</h3>
            </div>
            
            <div className="heatmap-grid">
              <div className="heatmap-axes">
                <div className="y-axis-label">Impact</div>
                <div className="x-axis-label">Probability</div>
                
                <div className="heatmap-cells">
                  {[5, 4, 3, 2, 1].map(impact => (
                    [1, 2, 3, 4, 5].map(probability => {
                      const riskLevel = impact * probability;
                      const riskClass = 
                        riskLevel >= 15 ? 'critical' :
                        riskLevel >= 10 ? 'high' :
                        riskLevel >= 5 ? 'medium' : 'low';
                      
                      const risksInCell = riskHeatmapData.filter(
                        risk => risk.impact === impact && risk.probability === probability
                      );
                      
                      return (
                        <div 
                          key={`cell-${impact}-${probability}`}
                          className={`heatmap-cell ${riskClass}`}
                        >
                          {risksInCell.length > 0 ? (
                            <div className="risk-count">{risksInCell.length}</div>
                          ) : (
                            <div className="risk-score">{riskLevel}</div>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>
                
                <div className="y-axis-labels">
                  {[5, 4, 3, 2, 1].map(value => (
                    <div key={`y-${value}`} className="axis-label">{value}</div>
                  ))}
                </div>
                
                <div className="x-axis-labels">
                  {[1, 2, 3, 4, 5].map(value => (
                    <div key={`x-${value}`} className="axis-label">{value}</div>
                  ))}
                </div>
              </div>
              
              <div className="risk-table">
                <table>
                  <thead>
                    <tr>
                      <th>Risk Category</th>
                      <th>P</th>
                      <th>I</th>
                      <th>Score</th>
                      <th>Level</th>
                      <th>Mitigation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskHeatmapData
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .slice(0, 5)
                      .map((risk, index) => {
                        const riskClass = 
                          risk.riskScore >= 15 ? 'critical' :
                          risk.riskScore >= 10 ? 'high' :
                          risk.riskScore >= 5 ? 'medium' : 'low';
                        
                        return (
                          <tr key={index}>
                            <td>{risk.category}</td>
                            <td>{risk.probability}</td>
                            <td>{risk.impact}</td>
                            <td>{risk.riskScore}</td>
                            <td>
                              <span className={`risk-level ${riskClass}`}>
                                {riskClass.toUpperCase()}
                              </span>
                            </td>
                            <td>{risk.mitigation}</td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="risk-legend">
              <div className="legend-item">
                <span className="legend-color critical"></span>
                <span className="legend-label">Critical Risk (15-25)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color high"></span>
                <span className="legend-label">High Risk (10-14)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color medium"></span>
                <span className="legend-label">Medium Risk (5-9)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color low"></span>
                <span className="legend-label">Low Risk (1-4)</span>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
      </DashboardGrid>
    </div>
  );
};

// Utility function to simulate normal CDF for PPM calculation
const normsdist = (z) => {
  if (typeof z !== 'number') return 0;
  
  // Constants for Abramowitz and Stegun approximation
  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;
  
  if (z >= 0) {
    const t = 1.0 / (1.0 + p * z);
    return (1.0 - c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
  } else {
    const t = 1.0 / (1.0 - p * z);
    return (c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
  }
};

export default EnhancedVisualizations; 