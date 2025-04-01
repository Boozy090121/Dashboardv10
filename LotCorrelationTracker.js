import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDataContext } from './DataContext';
import { useTimeFilter } from './TimeFilterContext';
import DashboardGrid from './DashboardGrid';
import AdvancedChart from './AdvancedChart';

// Utility functions for lot correlation analysis
const calculateCycleTime = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const findBottlenecks = (processes) => {
  if (!processes || processes.length === 0) return [];
  
  // Find the process with the longest average duration
  const sortedByDuration = [...processes].sort((a, b) => 
    b.averageDuration - a.averageDuration
  );
  
  // Find processes with high wait times
  const highWaitProcesses = processes.filter(p => 
    p.averageWaitTime > (p.targetWaitTime * 1.5)
  );
  
  // Combine the results, prioritizing high wait time processes
  const bottlenecks = [...highWaitProcesses];
  
  // Add the longest process if not already included
  if (sortedByDuration.length > 0 && !bottlenecks.some(b => b.id === sortedByDuration[0].id)) {
    bottlenecks.push(sortedByDuration[0]);
  }
  
  return bottlenecks;
};

const mapErrorPropagation = (lots) => {
  if (!lots || lots.length === 0) return [];
  
  return lots.map(lot => {
    // Track which process stages had errors
    const processesWithErrors = lot.processes
      .filter(process => process.hasError)
      .map(process => process.name);
    
    // Check if errors in earlier stages correlate with later stage errors
    const errorCorrelations = [];
    
    for (let i = 0; i < lot.processes.length - 1; i++) {
      if (lot.processes[i].hasError) {
        for (let j = i + 1; j < lot.processes.length; j++) {
          if (lot.processes[j].hasError) {
            errorCorrelations.push({
              source: lot.processes[i].name,
              target: lot.processes[j].name,
              lot: lot.lotNumber
            });
          }
        }
      }
    }
    
    return {
      ...lot,
      processesWithErrors,
      errorCorrelations
    };
  });
};

const LotCorrelationTracker = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const { filterDataByTimeRange, dateRange } = useTimeFilter();
  const [selectedLot, setSelectedLot] = useState(null);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  
  // Process the lot data with enhanced correlation analysis
  const lotsWithCorrelation = useMemo(() => {
    if (!data?.lotCorrelation?.lots) {
      // Generate mock data if none exists
      const mockLots = [
        {
          lotNumber: "L23456",
          productName: "Product A",
          status: "Complete",
          startDate: "2023-11-01",
          endDate: "2023-11-15",
          processes: [
            { id: "prep", name: "Order Preparation", startDate: "2023-11-01", endDate: "2023-11-03", hasError: false, status: "completed" },
            { id: "proc", name: "Processing", startDate: "2023-11-03", endDate: "2023-11-08", hasError: true, status: "completed", errorDetails: "Temperature deviation" },
            { id: "qa", name: "Quality Assessment", startDate: "2023-11-08", endDate: "2023-11-11", hasError: false, status: "completed" },
            { id: "pkg", name: "Packaging", startDate: "2023-11-11", endDate: "2023-11-14", hasError: false, status: "completed" },
            { id: "ship", name: "Release/Shipping", startDate: "2023-11-14", endDate: "2023-11-15", hasError: false, status: "completed" }
          ]
        },
        {
          lotNumber: "L23457",
          productName: "Product B",
          status: "In Progress",
          startDate: "2023-11-05",
          endDate: null,
          processes: [
            { id: "prep", name: "Order Preparation", startDate: "2023-11-05", endDate: "2023-11-07", hasError: false, status: "completed" },
            { id: "proc", name: "Processing", startDate: "2023-11-07", endDate: "2023-11-12", hasError: false, status: "completed" },
            { id: "qa", name: "Quality Assessment", startDate: "2023-11-12", endDate: null, hasError: true, status: "in-progress", errorDetails: "Documentation error" }
          ]
        },
        {
          lotNumber: "L23458",
          productName: "Product A",
          status: "Complete",
          startDate: "2023-10-20",
          endDate: "2023-11-10",
          processes: [
            { id: "prep", name: "Order Preparation", startDate: "2023-10-20", endDate: "2023-10-22", hasError: false, status: "completed" },
            { id: "proc", name: "Processing", startDate: "2023-10-22", endDate: "2023-10-29", hasError: true, status: "completed", errorDetails: "Equipment calibration error" },
            { id: "qa", name: "Quality Assessment", startDate: "2023-10-29", endDate: "2023-11-02", hasError: true, status: "completed", errorDetails: "Out of specification" },
            { id: "pkg", name: "Packaging", startDate: "2023-11-02", endDate: "2023-11-06", hasError: false, status: "completed" },
            { id: "ship", name: "Release/Shipping", startDate: "2023-11-06", endDate: "2023-11-10", hasError: false, status: "completed" }
          ]
        },
        {
          lotNumber: "L23459",
          productName: "Product C",
          status: "Complete",
          startDate: "2023-10-15",
          endDate: "2023-10-30",
          processes: [
            { id: "prep", name: "Order Preparation", startDate: "2023-10-15", endDate: "2023-10-17", hasError: false, status: "completed" },
            { id: "proc", name: "Processing", startDate: "2023-10-17", endDate: "2023-10-23", hasError: false, status: "completed" },
            { id: "qa", name: "Quality Assessment", startDate: "2023-10-23", endDate: "2023-10-26", hasError: false, status: "completed" },
            { id: "pkg", name: "Packaging", startDate: "2023-10-26", endDate: "2023-10-29", hasError: false, status: "completed" },
            { id: "ship", name: "Release/Shipping", startDate: "2023-10-29", endDate: "2023-10-30", hasError: false, status: "completed" }
          ]
        },
        {
          lotNumber: "L23460",
          productName: "Product B",
          status: "Complete",
          startDate: "2023-11-02",
          endDate: "2023-11-18",
          processes: [
            { id: "prep", name: "Order Preparation", startDate: "2023-11-02", endDate: "2023-11-04", hasError: true, status: "completed", errorDetails: "Missing documentation" },
            { id: "proc", name: "Processing", startDate: "2023-11-04", endDate: "2023-11-10", hasError: false, status: "completed" },
            { id: "qa", name: "Quality Assessment", startDate: "2023-11-10", endDate: "2023-11-13", hasError: true, status: "completed", errorDetails: "Failed inspection" },
            { id: "pkg", name: "Packaging", startDate: "2023-11-13", endDate: "2023-11-16", hasError: true, status: "completed", errorDetails: "Packaging error" },
            { id: "ship", name: "Release/Shipping", startDate: "2023-11-16", endDate: "2023-11-18", hasError: false, status: "completed" }
          ]
        }
      ];
      
      return mockLots;
    }
    
    return data.lotCorrelation.lots;
  }, [data]);
  
  // Filter lots based on the selected time range
  const filteredLots = useMemo(() => {
    return filterDataByTimeRange(lotsWithCorrelation, 'startDate');
  }, [lotsWithCorrelation, filterDataByTimeRange]);
  
  // Apply "errors only" filter if selected
  const displayedLots = useMemo(() => {
    if (!showErrorsOnly) return filteredLots;
    
    return filteredLots.filter(lot => 
      lot.processes.some(process => process.hasError)
    );
  }, [filteredLots, showErrorsOnly]);
  
  // Calculate process-level statistics
  const processStats = useMemo(() => {
    if (!displayedLots || displayedLots.length === 0) return [];
    
    // Get all unique process IDs
    const processIds = [...new Set(
      displayedLots.flatMap(lot => lot.processes.map(process => process.id))
    )];
    
    // Calculate statistics for each process
    return processIds.map(processId => {
      // Find all instances of this process across all lots
      const processInstances = displayedLots.flatMap(lot => 
        lot.processes.filter(process => process.id === processId)
      );
      
      // Calculate durations
      const durations = processInstances
        .filter(process => process.startDate && process.endDate)
        .map(process => calculateCycleTime(process.startDate, process.endDate));
      
      const averageDuration = durations.length > 0 
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
        : 0;
      
      // Calculate error rate
      const errorCount = processInstances.filter(process => process.hasError).length;
      const errorRate = processInstances.length > 0 
        ? (errorCount / processInstances.length) * 100
        : 0;
      
      // Calculate wait times between this process and the next
      const waitTimes = [];
      displayedLots.forEach(lot => {
        const processIndex = lot.processes.findIndex(process => process.id === processId);
        if (processIndex >= 0 && processIndex < lot.processes.length - 1) {
          const currentProcess = lot.processes[processIndex];
          const nextProcess = lot.processes[processIndex + 1];
          
          if (currentProcess.endDate && nextProcess.startDate) {
            const waitTime = calculateCycleTime(currentProcess.endDate, nextProcess.startDate);
            if (waitTime !== null) {
              waitTimes.push(waitTime);
            }
          }
        }
      });
      
      const averageWaitTime = waitTimes.length > 0
        ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length
        : 0;
      
      // Assume target wait time is 1 day (can be adjusted based on actual targets)
      const targetWaitTime = 1;
      
      return {
        id: processId,
        name: processInstances[0]?.name || processId,
        count: processInstances.length,
        averageDuration,
        errorRate,
        errorCount,
        averageWaitTime,
        targetWaitTime
      };
    });
  }, [displayedLots]);
  
  // Identify bottlenecks in the process flow
  const bottlenecks = useMemo(() => {
    return findBottlenecks(processStats);
  }, [processStats]);
  
  // Map error propagation through the manufacturing process
  const lotsWithErrorMapping = useMemo(() => {
    return mapErrorPropagation(displayedLots);
  }, [displayedLots]);
  
  // Calculate correlations between errors at different process stages
  const errorCorrelations = useMemo(() => {
    // Flatten all error correlations from all lots
    const allCorrelations = lotsWithErrorMapping.flatMap(lot => 
      lot.errorCorrelations || []
    );
    
    // Group by source and target
    const correlationMap = new Map();
    
    allCorrelations.forEach(correlation => {
      const key = `${correlation.source}->${correlation.target}`;
      if (!correlationMap.has(key)) {
        correlationMap.set(key, {
          source: correlation.source,
          target: correlation.target,
          count: 0,
          lots: []
        });
      }
      
      const entry = correlationMap.get(key);
      entry.count += 1;
      entry.lots.push(correlation.lot);
    });
    
    return Array.from(correlationMap.values());
  }, [lotsWithErrorMapping]);
  
  // Event Handlers
  const handleLotSelect = useCallback((lotNumber) => {
    setSelectedLot(lotNumber === selectedLot ? null : lotNumber);
  }, [selectedLot]);
  
  const toggleErrorsOnly = useCallback(() => {
    setShowErrorsOnly(!showErrorsOnly);
  }, [showErrorsOnly]);
  
  const toggleCriticalPath = useCallback(() => {
    setShowCriticalPath(!showCriticalPath);
  }, [showCriticalPath]);
  
  // Selected lot details
  const selectedLotDetails = useMemo(() => {
    if (!selectedLot) return null;
    return displayedLots.find(lot => lot.lotNumber === selectedLot) || null;
  }, [selectedLot, displayedLots]);
  
  // Calculate cycle times for the selected lot
  const selectedLotCycleTimes = useMemo(() => {
    if (!selectedLotDetails) return null;
    
    // Calculate cycle time for each process
    const processCycleTimes = selectedLotDetails.processes.map(process => ({
      name: process.name,
      cycleTime: calculateCycleTime(process.startDate, process.endDate) || 0,
      hasError: process.hasError
    }));
    
    // Calculate wait times between processes
    const waitTimes = [];
    for (let i = 0; i < selectedLotDetails.processes.length - 1; i++) {
      const currentProcess = selectedLotDetails.processes[i];
      const nextProcess = selectedLotDetails.processes[i + 1];
      
      if (currentProcess.endDate && nextProcess.startDate) {
        waitTimes.push({
          from: currentProcess.name,
          to: nextProcess.name,
          waitTime: calculateCycleTime(currentProcess.endDate, nextProcess.startDate) || 0
        });
      }
    }
    
    // Calculate total cycle time
    const totalCycleTime = calculateCycleTime(
      selectedLotDetails.startDate,
      selectedLotDetails.endDate
    ) || 0;
    
    return {
      processCycleTimes,
      waitTimes,
      totalCycleTime
    };
  }, [selectedLotDetails]);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading lot correlation data...</p>
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
    <div className="lot-correlation-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Lot Correlation Tracker</h1>
        </div>
        
        <div className="header-filters">
          <div className="filter-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={showErrorsOnly} 
                onChange={toggleErrorsOnly} 
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Show Errors Only</span>
          </div>
          
          <div className="filter-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={showCriticalPath} 
                onChange={toggleCriticalPath} 
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Show Critical Path</span>
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
        </div>
      </div>
      
      {/* Main content */}
      <div className="lot-correlation-content">
        {/* Lot listing */}
        <div className="lot-listing">
          <h2 className="section-title">Manufacturing Lots</h2>
          <p className="lots-count">{displayedLots.length} lots in selected time period</p>
          
          <div className="lots-table">
            <table>
              <thead>
                <tr>
                  <th>Lot Number</th>
                  <th>Product</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Errors</th>
                  <th>Cycle Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedLots.map(lot => {
                  const errorCount = lot.processes.filter(p => p.hasError).length;
                  const cycleTime = calculateCycleTime(lot.startDate, lot.endDate);
                  
                  return (
                    <tr 
                      key={lot.lotNumber}
                      className={`${selectedLot === lot.lotNumber ? 'selected' : ''} ${errorCount > 0 ? 'has-errors' : ''}`}
                    >
                      <td>{lot.lotNumber}</td>
                      <td>{lot.productName}</td>
                      <td>{new Date(lot.startDate).toLocaleDateString()}</td>
                      <td>{lot.endDate ? new Date(lot.endDate).toLocaleDateString() : 'In Progress'}</td>
                      <td>
                        <span className={`status-badge ${lot.status.toLowerCase().replace(' ', '-')}`}>
                          {lot.status}
                        </span>
                      </td>
                      <td>
                        {errorCount > 0 ? (
                          <span className="error-count">{errorCount}</span>
                        ) : (
                          <span className="no-errors">None</span>
                        )}
                      </td>
                      <td>{cycleTime !== null ? `${cycleTime} days` : 'In Progress'}</td>
                      <td>
                        <button 
                          className="view-details-btn"
                          onClick={() => handleLotSelect(lot.lotNumber)}
                        >
                          {selectedLot === lot.lotNumber ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Process flow visualization and bottleneck analysis */}
        <DashboardGrid>
          {/* Process Flow Timeline */}
          <DashboardGrid.Widget
            title="Process Flow Analysis"
            size="large"
            onRefresh={() => refreshData()}
          >
            {selectedLotDetails ? (
              <div className="selected-lot-flow">
                <h3>Process Flow for Lot {selectedLotDetails.lotNumber}</h3>
                
                <div className="process-flow-timeline">
                  <div className="timeline-header">
                    <div className="timeline-start">
                      Start: {new Date(selectedLotDetails.startDate).toLocaleDateString()}
                    </div>
                    <div className="timeline-end">
                      {selectedLotDetails.endDate ? 
                        `End: ${new Date(selectedLotDetails.endDate).toLocaleDateString()}` : 
                        'In Progress'}
                    </div>
                  </div>
                  
                  <div className="process-steps">
                    {selectedLotDetails.processes.map((process, index) => {
                      // Calculate the position and width for this process
                      const totalDuration = selectedLotCycleTimes?.totalCycleTime || 1;
                      let startOffset = 0;
                      
                      // Sum up durations of previous processes
                      for (let i = 0; i < index; i++) {
                        if (selectedLotCycleTimes?.processCycleTimes[i]) {
                          startOffset += selectedLotCycleTimes.processCycleTimes[i].cycleTime;
                        }
                        
                        // Add wait times
                        if (selectedLotCycleTimes?.waitTimes[i]) {
                          startOffset += selectedLotCycleTimes.waitTimes[i].waitTime;
                        }
                      }
                      
                      const processDuration = selectedLotCycleTimes?.processCycleTimes[index]?.cycleTime || 0;
                      const startPercent = (startOffset / totalDuration) * 100;
                      const widthPercent = (processDuration / totalDuration) * 100;
                      
                      return (
                        <div 
                          key={process.id}
                          className={`process-step ${process.hasError ? 'has-error' : ''} ${process.status}`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`
                          }}
                        >
                          <div className="process-step-content">
                            <div className="process-name">{process.name}</div>
                            <div className="process-duration">{processDuration} days</div>
                          </div>
                          
                          {process.hasError && (
                            <div className="error-indicator">
                              <span className="error-icon">!</span>
                              <span className="error-tooltip">{process.errorDetails}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Wait time indicators */}
                  <div className="wait-indicators">
                    {selectedLotCycleTimes?.waitTimes.map((wait, index) => {
                      // Calculate position for wait indicator
                      const totalDuration = selectedLotCycleTimes?.totalCycleTime || 1;
                      let startOffset = 0;
                      
                      // Sum up durations of processes and waits before this wait
                      for (let i = 0; i <= index; i++) {
                        if (selectedLotCycleTimes?.processCycleTimes[i]) {
                          startOffset += selectedLotCycleTimes.processCycleTimes[i].cycleTime;
                        }
                        
                        // Add previous wait times
                        if (i < index && selectedLotCycleTimes?.waitTimes[i]) {
                          startOffset += selectedLotCycleTimes.waitTimes[i].waitTime;
                        }
                      }
                      
                      const startPercent = (startOffset / totalDuration) * 100;
                      const widthPercent = (wait.waitTime / totalDuration) * 100;
                      
                      // Consider as bottleneck if wait time > 1 day
                      const isBottleneck = wait.waitTime > 1;
                      
                      return (
                        <div 
                          key={`wait-${index}`}
                          className={`wait-indicator ${isBottleneck ? 'bottleneck' : ''}`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`
                          }}
                        >
                          {wait.waitTime > 0 && (
                            <div className="wait-label">
                              Wait: {wait.waitTime} {wait.waitTime === 1 ? 'day' : 'days'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="lot-metrics">
                  <div className="lot-metric">
                    <div className="metric-label">Total Cycle Time</div>
                    <div className="metric-value">{selectedLotCycleTimes?.totalCycleTime || 0} days</div>
                  </div>
                  <div className="lot-metric">
                    <div className="metric-label">Process Time</div>
                    <div className="metric-value">
                      {selectedLotCycleTimes?.processCycleTimes.reduce((sum, p) => sum + p.cycleTime, 0) || 0} days
                    </div>
                  </div>
                  <div className="lot-metric">
                    <div className="metric-label">Wait Time</div>
                    <div className="metric-value">
                      {selectedLotCycleTimes?.waitTimes.reduce((sum, w) => sum + w.waitTime, 0) || 0} days
                    </div>
                  </div>
                  <div className="lot-metric">
                    <div className="metric-label">Error Count</div>
                    <div className="metric-value">
                      {selectedLotDetails.processes.filter(p => p.hasError).length}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="process-flow-summary">
                <h3>Process Performance Overview</h3>
                
                <div className="process-bottlenecks">
                  <h4>Process Bottlenecks</h4>
                  
                  {bottlenecks.length > 0 ? (
                    <div className="bottlenecks-list">
                      {bottlenecks.map(bottleneck => (
                        <div key={bottleneck.id} className="bottleneck-item">
                          <div className="bottleneck-name">{bottleneck.name}</div>
                          <div className="bottleneck-metrics">
                            <div className="bottleneck-metric">
                              <span className="metric-label">Avg. Duration:</span>
                              <span className="metric-value">{bottleneck.averageDuration.toFixed(1)} days</span>
                            </div>
                            <div className="bottleneck-metric">
                              <span className="metric-label">Avg. Wait Time:</span>
                              <span className="metric-value">{bottleneck.averageWaitTime.toFixed(1)} days</span>
                            </div>
                            <div className="bottleneck-metric">
                              <span className="metric-label">Error Rate:</span>
                              <span className="metric-value">{bottleneck.errorRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-bottlenecks">
                      No significant bottlenecks detected in the current time period.
                    </div>
                  )}
                </div>
                
                <div className="process-step-metrics">
                  <h4>Process Step Performance</h4>
                  
                  <div className="step-metrics-chart">
                    {processStats.map((process, index) => (
                      <div key={process.id} className="process-metric-item">
                        <div className="process-name">{process.name}</div>
                        <div className="metrics-bars">
                          <div className="metric-bar-group">
                            <div className="metric-label">Duration</div>
                            <div className="metric-bar-container">
                              <div 
                                className="metric-bar duration"
                                style={{ width: `${Math.min(100, process.averageDuration * 10)}%` }}
                              >
                                <span className="metric-value">{process.averageDuration.toFixed(1)} days</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="metric-bar-group">
                            <div className="metric-label">Wait Time</div>
                            <div className="metric-bar-container">
                              <div 
                                className={`metric-bar wait-time ${process.averageWaitTime > process.targetWaitTime ? 'exceeded' : ''}`}
                                style={{ width: `${Math.min(100, process.averageWaitTime * 20)}%` }}
                              >
                                <span className="metric-value">{process.averageWaitTime.toFixed(1)} days</span>
                              </div>
                              {process.targetWaitTime > 0 && (
                                <div 
                                  className="target-marker"
                                  style={{ left: `${process.targetWaitTime * 20}%` }}
                                ></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="metric-bar-group">
                            <div className="metric-label">Error Rate</div>
                            <div className="metric-bar-container">
                              <div 
                                className={`metric-bar error-rate ${process.errorRate > 10 ? 'high' : process.errorRate > 5 ? 'medium' : 'low'}`}
                                style={{ width: `${process.errorRate}%` }}
                              >
                                <span className="metric-value">{process.errorRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DashboardGrid.Widget>
          
          {/* Error Propagation Analysis */}
          <DashboardGrid.Widget
            title="Error Propagation Analysis"
            size="medium"
            onRefresh={() => refreshData()}
          >
            <div className="error-propagation">
              <h3>Error Correlation Between Process Steps</h3>
              
              {errorCorrelations.length > 0 ? (
                <div className="error-correlations">
                  <div className="correlation-chart">
                    <div className="correlation-header">
                      <div className="header-cell">Source Process</div>
                      <div className="header-cell">Target Process</div>
                      <div className="header-cell">Correlation Count</div>
                      <div className="header-cell">Impact Level</div>
                    </div>
                    
                    {errorCorrelations.map((correlation, index) => {
                      // Determine impact level based on count
                      const impactLevel = 
                        correlation.count >= 3 ? 'high' :
                        correlation.count >= 2 ? 'medium' : 'low';
                      
                      return (
                        <div key={index} className="correlation-row">
                          <div className="correlation-cell">{correlation.source}</div>
                          <div className="correlation-cell">{correlation.target}</div>
                          <div className="correlation-cell">{correlation.count}</div>
                          <div className="correlation-cell">
                            <span className={`impact-badge ${impactLevel}`}>
                              {impactLevel.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="correlation-explanation">
                    <p>
                      This analysis shows instances where errors in one process stage correlate with 
                      errors in subsequent stages, indicating potential error propagation through the 
                      manufacturing process.
                    </p>
                    
                    <p>
                      <strong>High impact</strong> correlations should be prioritized for root cause 
                      analysis to prevent error cascades.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="no-correlations">
                  <p>No significant error correlations detected in the current time period.</p>
                  <p>This indicates that errors are not propagating between process steps.</p>
                </div>
              )}
            </div>
          </DashboardGrid.Widget>
          
          {/* Cycle Time Analysis */}
          <DashboardGrid.Widget
            title="Cycle Time Analysis"
            size="medium"
            onRefresh={() => refreshData()}
          >
            <div className="cycle-time-analysis">
              <div className="cycle-time-summary">
                <div className="summary-metric">
                  <div className="metric-title">Average Total Cycle Time</div>
                  <div className="metric-value">
                    {displayedLots
                      .filter(lot => lot.startDate && lot.endDate)
                      .reduce((sum, lot) => sum + calculateCycleTime(lot.startDate, lot.endDate), 0) / 
                      displayedLots.filter(lot => lot.startDate && lot.endDate).length || 0
                    }
                    <span className="unit">days</span>
                  </div>
                </div>
                
                <div className="summary-metric">
                  <div className="metric-title">Shortest Cycle Time</div>
                  <div className="metric-value">
                    {Math.min(
                      ...displayedLots
                        .filter(lot => lot.startDate && lot.endDate)
                        .map(lot => calculateCycleTime(lot.startDate, lot.endDate))
                    )}
                    <span className="unit">days</span>
                  </div>
                </div>
                
                <div className="summary-metric">
                  <div className="metric-title">Longest Cycle Time</div>
                  <div className="metric-value">
                    {Math.max(
                      ...displayedLots
                        .filter(lot => lot.startDate && lot.endDate)
                        .map(lot => calculateCycleTime(lot.startDate, lot.endDate))
                    )}
                    <span className="unit">days</span>
                  </div>
                </div>
              </div>
              
              <div className="cycle-time-breakdown">
                <h4>Cycle Time Breakdown by Product</h4>
                
                {/* Group by product and calculate average cycle times */}
                {[...new Set(displayedLots.map(lot => lot.productName))].map(productName => {
                  const productLots = displayedLots.filter(
                    lot => lot.productName === productName && lot.startDate && lot.endDate
                  );
                  
                  if (productLots.length === 0) return null;
                  
                  const avgCycleTime = productLots.reduce(
                    (sum, lot) => sum + calculateCycleTime(lot.startDate, lot.endDate), 0
                  ) / productLots.length;
                  
                  return (
                    <div key={productName} className="product-cycle-time">
                      <div className="product-name">{productName}</div>
                      <div className="cycle-bar-container">
                        <div 
                          className="cycle-bar"
                          style={{ width: `${Math.min(100, avgCycleTime * 5)}%` }}
                        >
                          <span className="cycle-value">{avgCycleTime.toFixed(1)} days</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DashboardGrid.Widget>
        </DashboardGrid>
      </div>
    </div>
  );
};

export default LotCorrelationTracker; 