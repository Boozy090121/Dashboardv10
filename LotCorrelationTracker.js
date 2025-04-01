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
  const { filterDataByTimeRange, dateRange } = useTimeFilter ? useTimeFilter() : { filterDataByTimeRange: () => [], dateRange: {} };
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
  
  // Simple fallback layout to ensure rendering
  return (
    <div className="lot-correlation-container">
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Lot Analytics Dashboard</h1>
        </div>
        
        <div className="header-filters">
          <div className="filter-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={showErrorsOnly} 
                onChange={() => setShowErrorsOnly(!showErrorsOnly)} 
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
                onChange={() => setShowCriticalPath(!showCriticalPath)} 
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Show Critical Path</span>
          </div>
          
          <button onClick={refreshData} className="refresh-button">
            Refresh Data
          </button>
        </div>
      </div>

      <div className="lot-metrics-grid">
        <div className="lot-metric-card">
          <h3>Total Lots</h3>
          <div className="lot-metric-value">78</div>
          <div className="lot-metric-trend positive">
            ↑ 2.6% from previous period
          </div>
        </div>
        <div className="lot-metric-card">
          <h3>Cycle Time (Avg)</h3>
          <div className="lot-metric-value">21.8d</div>
          <div className="lot-metric-trend positive">
            ↓ 9.5% from previous period
          </div>
        </div>
        <div className="lot-metric-card">
          <h3>First-Time-Right</h3>
          <div className="lot-metric-value">92.3%</div>
          <div className="lot-metric-trend positive">
            ↑ 1.7% from previous period
          </div>
        </div>
        <div className="lot-metric-card">
          <h3>Bottlenecks</h3>
          <div className="lot-metric-value">2</div>
          <div className="lot-metric-trend negative">
            ↑ 1 from previous period
          </div>
        </div>
      </div>

      <div className="selected-lot-flow">
        <h2 className="section-title">Lot Flow Analysis</h2>
        <p>Select a lot from the table below to see detailed flow analysis</p>
        
        <div className="lot-table">
          <table>
            <thead>
              <tr>
                <th>Lot Number</th>
                <th>Product</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Cycle Time</th>
                <th>Issues</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className={selectedLot === "L23456" ? "selected" : ""}>
                <td>L23456</td>
                <td>Product A</td>
                <td>2023-11-01</td>
                <td><span className="lot-status complete">Complete</span></td>
                <td>14 days</td>
                <td><span className="error-count">1</span></td>
                <td><button className="view-details-btn" onClick={() => setSelectedLot("L23456")}>View Flow</button></td>
              </tr>
              <tr className={selectedLot === "L23457" ? "selected" : ""}>
                <td>L23457</td>
                <td>Product B</td>
                <td>2023-11-05</td>
                <td><span className="lot-status in-progress">In Progress</span></td>
                <td>7 days</td>
                <td><span className="error-count">1</span></td>
                <td><button className="view-details-btn" onClick={() => setSelectedLot("L23457")}>View Flow</button></td>
              </tr>
              <tr className={selectedLot === "L23458" ? "selected" : ""}>
                <td>L23458</td>
                <td>Product A</td>
                <td>2023-10-20</td>
                <td><span className="lot-status complete">Complete</span></td>
                <td>21 days</td>
                <td><span className="error-count">2</span></td>
                <td><button className="view-details-btn" onClick={() => setSelectedLot("L23458")}>View Flow</button></td>
              </tr>
              <tr className={selectedLot === "L23459" ? "selected" : ""}>
                <td>L23459</td>
                <td>Product C</td>
                <td>2023-10-15</td>
                <td><span className="lot-status complete">Complete</span></td>
                <td>15 days</td>
                <td><span className="no-errors">None</span></td>
                <td><button className="view-details-btn" onClick={() => setSelectedLot("L23459")}>View Flow</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LotCorrelationTracker; 