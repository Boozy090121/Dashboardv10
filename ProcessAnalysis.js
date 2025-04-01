import React, { useState, useMemo, useCallback } from 'react';
import { useDataContext } from './DataContext';
import DashboardGrid from './DashboardGrid';

const ProcessAnalysis = () => {
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  const [expandedStep, setExpandedStep] = useState(null);
  const [timeFilter, setTimeFilter] = useState('6m');
  
  // Process step data with enhanced analysis
  const processStepsData = useMemo(() => {
    if (!data?.processMetrics?.cycleTimeBreakdown) {
      // Generate mock data if API data is not available
      return [
        { 
          id: 'prep', 
          name: 'Order Preparation', 
          time: 2.6, 
          target: 2.0,
          bottleneck: false,
          variation: 'medium',
          trend: 'stable',
          issues: [
            { name: 'Documentation errors', frequency: 14, impact: 0.4 },
            { name: 'System delays', frequency: 8, impact: 0.2 }
          ],
          subSteps: [
            { name: 'Document creation', time: 0.8 },
            { name: 'Material requisition', time: 1.2 },
            { name: 'Order verification', time: 0.6 }
          ]
        },
        { 
          id: 'proc', 
          name: 'Processing', 
          time: 7.8, 
          target: 6.5,
          bottleneck: true,
          variation: 'high',
          trend: 'increasing',
          issues: [
            { name: 'Equipment downtime', frequency: 23, impact: 1.2 },
            { name: 'Material issues', frequency: 18, impact: 0.8 },
            { name: 'Operator training', frequency: 11, impact: 0.4 }
          ],
          subSteps: [
            { name: 'Material preparation', time: 1.5 },
            { name: 'Primary processing', time: 3.2 },
            { name: 'Secondary processing', time: 2.4 },
            { name: 'Process verification', time: 0.7 }
          ]
        },
        { 
          id: 'qa', 
          name: 'Quality Assessment', 
          time: 3.4, 
          target: 3.0,
          bottleneck: false,
          variation: 'low',
          trend: 'decreasing',
          issues: [
            { name: 'Equipment calibration', frequency: 7, impact: 0.3 },
            { name: 'Test failures', frequency: 12, impact: 0.6 }
          ],
          subSteps: [
            { name: 'Visual inspection', time: 0.8 },
            { name: 'Instrument testing', time: 1.7 },
            { name: 'Documentation review', time: 0.9 }
          ]
        },
        { 
          id: 'pkg', 
          name: 'Packaging', 
          time: 4.2, 
          target: 3.5,
          bottleneck: false,
          variation: 'medium',
          trend: 'stable',
          issues: [
            { name: 'Material unavailability', frequency: 16, impact: 0.7 },
            { name: 'Equipment issues', frequency: 9, impact: 0.4 }
          ],
          subSteps: [
            { name: 'Primary packaging', time: 1.8 },
            { name: 'Secondary packaging', time: 1.5 },
            { name: 'Labeling', time: 0.5 },
            { name: 'Package verification', time: 0.4 }
          ]
        },
        { 
          id: 'ship', 
          name: 'Release/Shipping', 
          time: 3.8, 
          target: 3.0,
          bottleneck: false,
          variation: 'medium',
          trend: 'decreasing',
          issues: [
            { name: 'Documentation delays', frequency: 18, impact: 0.8 },
            { name: 'Logistics coordination', frequency: 13, impact: 0.6 }
          ],
          subSteps: [
            { name: 'Final documentation', time: 1.2 },
            { name: 'QA release', time: 0.8 },
            { name: 'Shipping preparation', time: 1.0 },
            { name: 'Dispatch', time: 0.8 }
          ]
        }
      ];
    }
    
    // Transform API data if available
    return data.processMetrics.cycleTimeBreakdown.map(step => ({
      id: step.id || step.step.toLowerCase().replace(/\s+/g, ''),
      name: step.step,
      time: step.time,
      target: step.target || step.time * 0.85, // Assume 15% reduction target if not specified
      bottleneck: step.bottleneck || false,
      variation: step.variation || 'medium',
      trend: step.trend || 'stable',
      issues: step.issues || [],
      subSteps: step.subSteps || []
    }));
  }, [data]);
  
  // Calculate total process time and other aggregate metrics
  const processMetrics = useMemo(() => {
    const totalTime = processStepsData.reduce((sum, step) => sum + step.time, 0);
    const totalTarget = processStepsData.reduce((sum, step) => sum + step.target, 0);
    const bottlenecks = processStepsData.filter(step => step.bottleneck);
    const bottleneckTime = bottlenecks.reduce((sum, step) => sum + step.time, 0);
    
    return {
      totalTime,
      totalTarget,
      improvement: (totalTime - totalTarget) / totalTime * 100,
      bottlenecks,
      bottleneckTime,
      bottleneckImpact: bottleneckTime / totalTime * 100
    };
  }, [processStepsData]);
  
  // Toggle expanded step view
  const toggleStepExpansion = useCallback((stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  }, [expandedStep]);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading process analysis data...</p>
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
    <div className="process-analysis-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Process Flow Analysis</h1>
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
          
          <button onClick={refreshData} className="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1.06-6.7-2.82"></path>
              <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1.06-6.7 2.82"></path>
              <path d="m3 12 3-3 3 3"></path>
            </svg>
            Refresh Data
          </button>
          
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      {/* Overall Process Summary */}
      <div className="process-metrics-summary">
        <div className="process-summary-card">
          <div className="summary-label">Total Cycle Time</div>
          <div className="summary-value">{processMetrics.totalTime.toFixed(1)} days</div>
          <div className="summary-target">Target: {processMetrics.totalTarget.toFixed(1)} days</div>
        </div>
        
        <div className="process-summary-card">
          <div className="summary-label">Improvement Opportunity</div>
          <div className="summary-value">{processMetrics.improvement.toFixed(1)}%</div>
          <div className="summary-target">
            {(processMetrics.totalTime - processMetrics.totalTarget).toFixed(1)} days
          </div>
        </div>
        
        <div className="process-summary-card">
          <div className="summary-label">Bottleneck Impact</div>
          <div className="summary-value">{processMetrics.bottleneckImpact.toFixed(1)}%</div>
          <div className="summary-target">
            {processMetrics.bottleneckTime.toFixed(1)} days in {processMetrics.bottlenecks.length} steps
          </div>
        </div>
        
        <div className="process-summary-card">
          <div className="summary-label">Value-Added Time</div>
          <div className="summary-value">62.4%</div>
          <div className="summary-target">
            Non-value added: 37.6%
          </div>
        </div>
      </div>
      
      {/* Process Flow Visualization */}
      <div className="process-flow-container">
        <h2 className="section-title">Process Flow Timeline</h2>
        
        <div className="process-flow-visualization">
          <div className="timeline-header">
            <div className="timeline-start">Start</div>
            <div className="timeline-end">End</div>
          </div>
          
          <div className="timeline-scale">
            {Array.from({ length: Math.ceil(processMetrics.totalTime) + 1 }).map((_, i) => (
              <div key={i} className="timeline-marker">
                <div className="timeline-tick"></div>
                <div className="timeline-label">{i}</div>
              </div>
            ))}
          </div>
          
          <div className="process-steps">
            {processStepsData.map((step, index) => {
              // Calculate the position and width based on cumulative time
              const previousStepsTime = processStepsData
                .slice(0, index)
                .reduce((sum, prevStep) => sum + prevStep.time, 0);
              
              const stepStartPercent = (previousStepsTime / processMetrics.totalTime) * 100;
              const stepWidthPercent = (step.time / processMetrics.totalTime) * 100;
              
              return (
                <div key={step.id} className="process-step-wrapper">
                  <div 
                    className={`process-step-block ${step.bottleneck ? 'bottleneck' : ''} ${expandedStep === step.id ? 'expanded' : ''}`}
                    style={{ 
                      left: `${stepStartPercent}%`, 
                      width: `${stepWidthPercent}%` 
                    }}
                    onClick={() => toggleStepExpansion(step.id)}
                  >
                    <div className="step-header">
                      <div className="step-name">{step.name}</div>
                      <div className="step-time">
                        {step.time.toFixed(1)} days
                        <span className={`trend-indicator ${step.trend}`}>
                          {step.trend === 'increasing' ? '↑' : step.trend === 'decreasing' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="step-target-bar">
                      <div className="step-target-marker" style={{ left: `${(step.target / step.time) * 100}%` }}></div>
                    </div>
                    
                    {step.bottleneck && <div className="bottleneck-indicator">Bottleneck</div>}
                    
                    <div className="step-variation-indicator">
                      <span className={`variation-dot ${step.variation}`}></span>
                      <span className="variation-label">{step.variation} variability</span>
                    </div>
                  </div>
                  
                  {expandedStep === step.id && (
                    <div className="step-details-panel">
                      <div className="step-details-content">
                        <h3>{step.name} Analysis</h3>
                        
                        <div className="step-metrics">
                          <div className="step-metric">
                            <div className="metric-name">Current Time</div>
                            <div className="metric-value">{step.time.toFixed(1)} days</div>
                          </div>
                          <div className="step-metric">
                            <div className="metric-name">Target Time</div>
                            <div className="metric-value">{step.target.toFixed(1)} days</div>
                          </div>
                          <div className="step-metric">
                            <div className="metric-name">Opportunity</div>
                            <div className="metric-value">{((step.time - step.target) / step.time * 100).toFixed(1)}%</div>
                          </div>
                          <div className="step-metric">
                            <div className="metric-name">Variation</div>
                            <div className="metric-value">{step.variation}</div>
                          </div>
                        </div>
                        
                        {/* Sub-steps breakdown */}
                        <div className="substeps-breakdown">
                          <h4>Sub-Steps Breakdown</h4>
                          <div className="substeps-chart">
                            {step.subSteps.map((subStep, i) => (
                              <div key={i} className="substep-item">
                                <div className="substep-bar-container">
                                  <div 
                                    className="substep-bar"
                                    style={{ 
                                      width: `${(subStep.time / step.time) * 100}%`,
                                      backgroundColor: `hsl(${210 + i * 30}, 80%, 55%)` 
                                    }}
                                  >
                                    <span className="substep-time">{subStep.time.toFixed(1)}</span>
                                  </div>
                                </div>
                                <div className="substep-name">{subStep.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Issues analysis */}
                        {step.issues && step.issues.length > 0 && (
                          <div className="step-issues">
                            <h4>Common Issues</h4>
                            <div className="issues-chart">
                              {step.issues.map((issue, i) => (
                                <div key={i} className="issue-item">
                                  <div className="issue-name">{issue.name}</div>
                                  <div className="issue-metrics">
                                    <div className="issue-frequency">
                                      <div className="frequency-label">Frequency</div>
                                      <div className="frequency-bar-container">
                                        <div 
                                          className="frequency-bar"
                                          style={{ width: `${(issue.frequency / 30) * 100}%` }}
                                        ></div>
                                      </div>
                                      <div className="frequency-value">{issue.frequency}</div>
                                    </div>
                                    <div className="issue-impact">
                                      <div className="impact-label">Impact (days)</div>
                                      <div className="impact-value">{issue.impact.toFixed(1)}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Recommendations */}
                        <div className="step-recommendations">
                          <h4>Improvement Recommendations</h4>
                          <ul className="recommendations-list">
                            {step.id === 'prep' && (
                              <>
                                <li>Implement electronic documentation system to reduce errors</li>
                                <li>Create standardized templates for common order types</li>
                              </>
                            )}
                            {step.id === 'proc' && (
                              <>
                                <li>Implement preventive maintenance program to reduce equipment downtime</li>
                                <li>Enhance operator training on critical process steps</li>
                                <li>Implement material quality checks before processing begins</li>
                              </>
                            )}
                            {step.id === 'qa' && (
                              <>
                                <li>Implement automated testing where possible to reduce manual testing time</li>
                                <li>Develop checklist-based approach for common test failures</li>
                              </>
                            )}
                            {step.id === 'pkg' && (
                              <>
                                <li>Improve material inventory management to ensure availability</li>
                                <li>Consider equipment upgrades to improve packaging efficiency</li>
                              </>
                            )}
                            {step.id === 'ship' && (
                              <>
                                <li>Streamline documentation approval process</li>
                                <li>Improve coordination with logistics providers</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottleneck Analysis */}
      <DashboardGrid>
        <DashboardGrid.Widget
          title="Bottleneck Analysis"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="bottleneck-analysis">
            <h3>Critical Path Impact</h3>
            <p className="description">The impact of bottlenecks on overall cycle time</p>
            
            <div className="bottleneck-chart">
              <div className="impact-bars">
                {processStepsData
                  .filter(step => step.bottleneck)
                  .map((step, index) => (
                    <div key={index} className="impact-bar-item">
                      <div className="impact-name">{step.name}</div>
                      <div className="impact-bar-container">
                        <div 
                          className="impact-bar"
                          style={{ 
                            width: `${(step.time / processMetrics.totalTime) * 100}%`,
                            backgroundColor: `hsl(0, 80%, ${65 - index * 5}%)` 
                          }}
                        >
                          <span className="impact-value">{((step.time / processMetrics.totalTime) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="bottleneck-metrics">
                <div className="metric">
                  <div className="metric-label">Total Bottleneck Time</div>
                  <div className="metric-value">{processMetrics.bottleneckTime.toFixed(1)} days</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Process Efficiency Loss</div>
                  <div className="metric-value">{processMetrics.bottleneckImpact.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Time Variation Analysis"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="variation-analysis">
            <h3>Process Step Stability</h3>
            <p className="description">Comparing time variation across process steps</p>
            
            <div className="variation-chart">
              {processStepsData.map((step, index) => (
                <div key={index} className="variation-item">
                  <div className="variation-bar-group">
                    <div className="variation-step-name">{step.name}</div>
                    
                    <div className="variation-box-plot">
                      <div className="box-plot-line"></div>
                      
                      <div 
                        className={`box-plot-box ${step.variation}`}
                        style={{ 
                          width: step.variation === 'high' ? '70%' : 
                                 step.variation === 'medium' ? '45%' : '25%'
                        }}
                      >
                        <div className="median-line"></div>
                      </div>
                      
                      <div className="variation-marker min"></div>
                      <div className="variation-marker max"></div>
                    </div>
                    
                    <div className="variation-indicator">
                      <span className={`variation-dot ${step.variation}`}></span>
                      <span className="variation-label">{step.variation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Process Optimization Opportunities"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="optimization-opportunities">
            <div className="opportunities-chart">
              <div className="opportunity-bars">
                {processStepsData
                  .sort((a, b) => (b.time - b.target) - (a.time - a.target))
                  .map((step, index) => (
                    <div key={index} className="opportunity-bar-item">
                      <div className="opportunity-name">{step.name}</div>
                      <div className="opportunity-bar-container">
                        <div 
                          className="opportunity-bar"
                          style={{ 
                            width: `${((step.time - step.target) / (processMetrics.totalTime - processMetrics.totalTarget)) * 100}%`,
                            backgroundColor: `hsl(${210}, 80%, ${60 - index * 5}%)` 
                          }}
                        >
                          <span className="opportunity-value">{(step.time - step.target).toFixed(1)} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="optimization-summary">
              <div className="optimization-metric">
                <div className="metric-label">Total Opportunity</div>
                <div className="metric-value">{(processMetrics.totalTime - processMetrics.totalTarget).toFixed(1)} days</div>
              </div>
              <div className="optimization-metric">
                <div className="metric-label">Projected Improvement</div>
                <div className="metric-value">{processMetrics.improvement.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Value Stream Analysis"
          size="medium"
          onRefresh={() => refreshData()}
        >
          <div className="value-stream-analysis">
            <div className="value-stream-chart">
              <div className="value-stream-pie">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="#e5e7eb" />
                  <path
                    d="M70,70 L70,10 A60,60 0 0,1 121.96,100 Z"
                    fill="#3b82f6"
                  />
                  <text x="70" y="70" textAnchor="middle" fontSize="18" fontWeight="600" fill="#1f2937">62.4%</text>
                  <text x="70" y="90" textAnchor="middle" fontSize="12" fill="#6b7280">Value Added</text>
                </svg>
              </div>
              
              <div className="value-analysis">
                <h4>Value Analysis</h4>
                <div className="value-metrics">
                  <div className="value-metric">
                    <div className="value-label">Value Added</div>
                    <div className="value-bar-container">
                      <div className="value-bar va" style={{ width: '62.4%' }}>
                        <span className="value-percent">62.4%</span>
                      </div>
                    </div>
                    <div className="value-time">13.5 days</div>
                  </div>
                  
                  <div className="value-metric">
                    <div className="value-label">Business Non-Value Added</div>
                    <div className="value-bar-container">
                      <div className="value-bar bnva" style={{ width: '24.1%' }}>
                        <span className="value-percent">24.1%</span>
                      </div>
                    </div>
                    <div className="value-time">5.2 days</div>
                  </div>
                  
                  <div className="value-metric">
                    <div className="value-label">Non-Value Added</div>
                    <div className="value-bar-container">
                      <div className="value-bar nva" style={{ width: '13.5%' }}>
                        <span className="value-percent">13.5%</span>
                      </div>
                    </div>
                    <div className="value-time">2.9 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
      </DashboardGrid>
      
      {isLoading && <div className="overlay-loading">Refreshing process analysis...</div>}
    </div>
  );
};

export default ProcessAnalysis; 