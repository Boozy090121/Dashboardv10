import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDataContext } from './DataContext';

const ProcessAnalysis = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const [expandedStep, setExpandedStep] = useState(null);
  
  // Add debugging effect for data
  useEffect(() => {
    if (data) {
      console.log('Process Analysis component received data');
      console.log('commercialProcess exists:', Boolean(data.commercialProcess));
      if (data.commercialProcess) {
        console.log('processFlow exists:', Boolean(data.commercialProcess.processFlow));
        console.log('processFlow data:', data.commercialProcess.processFlow);
      }
    }
  }, [data]);
  
  // Process step data with enhanced analysis - use real data from JSON if available
  const processStepsData = useMemo(() => {
    if (data && data.commercialProcess && data.commercialProcess.processFlow) {
      console.log('Using real processFlow data');
      return data.commercialProcess.processFlow.map(step => ({
        id: step.name.toLowerCase().replace(/\s+/g, '-'),
        name: step.name,
        time: step.avgDuration,
        target: step.avgDuration * 0.9, // Assuming target is 10% lower than actual
        bottleneck: parseFloat(step.deviationRate) > 5, // Bottleneck if deviation rate > 5%
        variation: parseFloat(step.deviationRate) > 7 ? 'high' : parseFloat(step.deviationRate) > 4 ? 'medium' : 'low',
        trend: 'stable' // Default to stable if no trend data
      }));
    }
    
    // Fallback to static data if data not available
    console.log('Using fallback static data');
    return [
      { 
        id: 'prep', 
        name: 'Order Preparation', 
        time: 2.6, 
        target: 2.0,
        bottleneck: false,
        variation: 'medium',
        trend: 'stable'
      },
      { 
        id: 'proc', 
        name: 'Processing', 
        time: 7.8, 
        target: 6.5,
        bottleneck: true,
        variation: 'high',
        trend: 'increasing'
      },
      { 
        id: 'qa', 
        name: 'Quality Assessment', 
        time: 3.4, 
        target: 3.0,
        bottleneck: false,
        variation: 'low',
        trend: 'decreasing'
      },
      { 
        id: 'pkg', 
        name: 'Packaging', 
        time: 4.2, 
        target: 3.5,
        bottleneck: false,
        variation: 'medium',
        trend: 'stable'
      },
      { 
        id: 'ship', 
        name: 'Release/Shipping', 
        time: 3.8, 
        target: 3.0,
        bottleneck: false,
        variation: 'medium',
        trend: 'decreasing'
      }
    ];
  }, [data]);
  
  // Calculate total process time and other aggregate metrics
  const processMetrics = useMemo(() => {
    const totalTime = processStepsData.reduce((sum, step) => sum + step.time, 0);
    const totalTarget = processStepsData.reduce((sum, step) => sum + step.target, 0);
    
    return {
      totalTime,
      totalTarget
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
        <p>Loading process flow data...</p>
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
  
  // Reliable rendering that doesn't depend on data
  return (
    <div className="process-flow-container">
      <div className="process-flow-header">
        <h1>Process Flow Visualization</h1>
      </div>
      
      <div className="process-flow-timeline-container">
        <div className="process-flow-visualization">
          <div className="timeline-header">
            <div className="timeline-start">Start</div>
            <div className="timeline-end">End ({processMetrics.totalTime.toFixed(1)} days)</div>
          </div>
          
          <div className="timeline-scale">
            {Array.from({ length: Math.ceil(processMetrics.totalTime) + 1 }).map((_, i) => (
              <div key={i} className="timeline-marker" style={{ left: `${(i / processMetrics.totalTime) * 100}%` }}>
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
                        
                        {/* Improvement Recommendations */}
                        <div className="step-recommendations">
                          <h4>Improvement Recommendations</h4>
                          <ul className="recommendations-list">
                            {step.id === 'assembly' && (
                              <>
                                <li>Implement electronic documentation system</li>
                                <li>Create standardized templates</li>
                              </>
                            )}
                            {step.id === 'quality-control' && (
                              <>
                                <li>Implement preventive maintenance program</li>
                                <li>Enhance operator training</li>
                                <li>Implement pre-processing quality checks</li>
                              </>
                            )}
                            {step.id === 'packaging' && (
                              <>
                                <li>Improve material inventory management</li>
                                <li>Consider equipment upgrades</li>
                              </>
                            )}
                            {step.id === 'final-review' && (
                              <>
                                <li>Streamline documentation approval process</li>
                                <li>Improve coordination with logistics providers</li>
                              </>
                            )}
                            {!['assembly', 'quality-control', 'packaging', 'final-review'].includes(step.id) && (
                              <>
                                <li>Analyze process for improvement opportunities</li>
                                <li>Review standard operating procedures</li>
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

      <div className="process-flow-instructions">
        <p>Click on any process step for detailed analysis and recommendations</p>
      </div>
    </div>
  );
};

export default ProcessAnalysis; 