// Vercel build preparation script
const fs = require('fs');
const path = require('path');

console.log('Running Vercel build preparation...');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Ensure public/data directory exists
const dataDir = path.join(__dirname, 'public', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating public/data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure index.html exists in public directory
const indexHtmlFile = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexHtmlFile)) {
  console.log('Creating index.html in public directory...');
  fs.writeFileSync(indexHtmlFile, `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1a73e8" />
    <meta
      name="description"
      content="Manufacturing Dashboard - Performance Metrics"
    />
    <title>Manufacturing Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
      // Set initial tab to Process Flow for testing
      window.location.hash = 'process-flow';
      
      // Add debug listeners for data loading
      window.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, checking for data directory');
        
        // Test if data file is accessible
        fetch('/data/complete-data.json')
          .then(response => {
            console.log('Data fetch response:', response.status);
            if (!response.ok) {
              throw new Error('Failed to fetch data file: ' + response.status);
            }
            return response.json();
          })
          .then(data => {
            console.log('Data file loaded successfully, has process flow:', 
                      Boolean(data?.commercialProcess?.processFlow));
          })
          .catch(error => {
            console.error('Error fetching data file:', error);
          });
      });
    </script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`);
  console.log('index.html created successfully!');
} else {
  console.log('index.html already exists, skipping creation.');
}

// Ensure data file exists with complete data including processFlow
const dataFile = path.join(dataDir, 'complete-data.json');
if (!fs.existsSync(dataFile)) {
  console.log('Creating complete data file with processFlow data...');
  
  // Full dashboard data with processFlow
  const completeData = {
    "overview": {
      "totalRecords": 1245,
      "totalLots": 78,
      "overallRFTRate": 92.3,
      "lotQuality": {
        "pass": 72,
        "fail": 6,
        "percentage": 92.3
      },
      "rftPerformance": [
        { "name": "Pass", "value": 1149, "percentage": 92.3 },
        { "name": "Fail", "value": 96, "percentage": 7.7 }
      ],
      "issueDistribution": [
        { "name": "Documentation Error", "value": 42 },
        { "name": "Process Deviation", "value": 28 },
        { "name": "Equipment Issue", "value": 15 },
        { "name": "Material Issue", "value": 11 }
      ],
      "processTimeline": [
        { "month": "Jan", "recordRFT": 90.2, "lotRFT": 91.5 },
        { "month": "Feb", "recordRFT": 91.4, "lotRFT": 92.0 },
        { "month": "Mar", "recordRFT": 92.8, "lotRFT": 93.1 },
        { "month": "Apr", "recordRFT": 91.5, "lotRFT": 92.3 },
        { "month": "May", "recordRFT": 92.3, "lotRFT": 93.5 },
        { "month": "Jun", "recordRFT": 93.1, "lotRFT": 94.0 }
      ],
      "rftByMonth": [
        { "month": "Jan", "value": 90.2 },
        { "month": "Feb", "value": 91.4 },
        { "month": "Mar", "value": 92.8 },
        { "month": "Apr", "value": 91.5 },
        { "month": "May", "value": 92.3 },
        { "month": "Jun", "value": 93.1 }
      ]
    },
    "processMetrics": {
      "totalCycleTime": {
        "average": 21.8,
        "minimum": 16.2,
        "maximum": 36.2,
        "target": 18.0
      },
      "cycleTimeBreakdown": [
        { "step": "Bulk Receipt", "time": 1.2 },
        { "step": "Assembly", "time": 3.5 },
        { "step": "PCI Review", "time": 3.2 },
        { "step": "NN Review", "time": 3.0 },
        { "step": "Packaging", "time": 2.4 },
        { "step": "Final Review", "time": 1.8 },
        { "step": "Release", "time": 1.0 }
      ],
      "cycleTimesByMonth": [
        { "month": "2025-01", "averageCycleTime": 24.2 },
        { "month": "2025-02", "averageCycleTime": 23.5 },
        { "month": "2025-03", "averageCycleTime": 22.8 },
        { "month": "2025-04", "averageCycleTime": 22.3 },
        { "month": "2025-05", "averageCycleTime": 21.9 },
        { "month": "2025-06", "averageCycleTime": 21.8 }
      ]
    },
    "internalRFT": {
      "departmentPerformance": [
        { "department": "Production", "rftRate": 93.7, "pass": 328, "fail": 22 },
        { "department": "Quality", "rftRate": 95.4, "pass": 248, "fail": 12 },
        { "department": "Packaging", "rftRate": 91.2, "pass": 187, "fail": 18 },
        { "department": "Logistics", "rftRate": 86.7, "pass": 156, "fail": 24 }
      ],
      "detailedAnalysis": {
        "departmentByMonth": [
          { "month": "Jan", "Production": 91.2, "Quality": 93.5, "Packaging": 89.8, "Logistics": 84.3 },
          { "month": "Feb", "Production": 91.8, "Quality": 94.0, "Packaging": 90.1, "Logistics": 84.9 },
          { "month": "Mar", "Production": 92.4, "Quality": 94.5, "Packaging": 90.5, "Logistics": 85.5 },
          { "month": "Apr", "Production": 93.0, "Quality": 94.9, "Packaging": 90.8, "Logistics": 86.0 },
          { "month": "May", "Production": 93.4, "Quality": 95.2, "Packaging": 91.0, "Logistics": 86.3 },
          { "month": "Jun", "Production": 93.7, "Quality": 95.4, "Packaging": 91.2, "Logistics": 86.7 }
        ],
        "errorTypes": [
          { "department": "Production", "Documentation": 10, "Process": 6, "Equipment": 4, "Material": 2 },
          { "department": "Quality", "Documentation": 6, "Process": 3, "Equipment": 2, "Material": 1 },
          { "department": "Packaging", "Documentation": 8, "Process": 5, "Equipment": 3, "Material": 2 },
          { "department": "Logistics", "Documentation": 12, "Process": 6, "Equipment": 4, "Material": 2 }
        ]
      }
    },
    "externalRFT": {
      "records": [
        { "id": "EXT-1001", "date": "2023-06-01", "lot": "B1001", "customer": "Customer A", "product": "Product A", "issueType": "Documentation", "status": "Closed" }
      ],
      "summary": {
        "totalComplaints": 100,
        "resolvedComplaints": 82,
        "pendingComplaints": 18,
        "resolutionRate": "82.0"
      },
      "customerComments": [
        { "name": "Documentation", "count": 38, "sentiment": "negative" },
        { "name": "Quality", "count": 27, "sentiment": "negative" },
        { "name": "Delivery", "count": 18, "sentiment": "neutral" },
        { "name": "Packaging", "count": 12, "sentiment": "positive" },
        { "name": "Other", "count": 5, "sentiment": "neutral" }
      ]
    },
    "commercialProcess": {
      "records": [
        { "id": "CP-1001", "date": "2023-06-01", "lot": "B1001", "product": "Product A", "stage": "Assembly", "duration": 3.5, "status": "Completed", "deviation": false },
        { "id": "CP-1002", "date": "2023-06-05", "lot": "B1002", "product": "Product B", "stage": "Quality Control", "duration": 2.8, "status": "In Progress", "deviation": true },
        { "id": "CP-1003", "date": "2023-06-10", "lot": "B1003", "product": "Product C", "stage": "Packaging", "duration": 2.4, "status": "On Hold", "deviation": true }
      ],
      "summary": {
        "totalLots": 78,
        "completedLots": 72,
        "inProgressLots": 4,
        "onHoldLots": 2,
        "completionRate": "92.3"
      },
      "processFlow": [
        { "name": "Assembly", "count": 78, "avgDuration": 3.5, "deviationRate": "5.1" },
        { "name": "Quality Control", "count": 76, "avgDuration": 2.8, "deviationRate": "8.2" },
        { "name": "Packaging", "count": 74, "avgDuration": 2.4, "deviationRate": "4.1" },
        { "name": "Final Review", "count": 72, "avgDuration": 1.8, "deviationRate": "2.8" }
      ],
      "insights": [
        "Quality control stage accounts for 40% of the total process time",
        "Deviations occur most frequently during the filling stage",
        "Process efficiency has improved by 15% since last quarter"
      ],
      "cycleTimeData": {
        "targetTime": 10.5,
        "stagesData": [
          { "name": "Assembly", "target": 3.0, "actual": 3.5, "min": 2.8, "max": 4.2 },
          { "name": "Quality Control", "target": 2.5, "actual": 2.8, "min": 2.2, "max": 3.5 },
          { "name": "Packaging", "target": 2.0, "actual": 2.4, "min": 1.8, "max": 3.0 },
          { "name": "Final Review", "target": 1.5, "actual": 1.8, "min": 1.3, "max": 2.5 }
        ],
        "trendData": [
          { "month": "Jan", "value": 12.5 },
          { "month": "Feb", "value": 12.1 },
          { "month": "Mar", "value": 11.7 },
          { "month": "Apr", "value": 11.3 },
          { "month": "May", "value": 10.9 },
          { "month": "Jun", "value": 10.5 }
        ]
      }
    }
  };

  // Write the complete data to the file
  fs.writeFileSync(dataFile, JSON.stringify(completeData, null, 2));
  console.log('Complete data file created successfully with processFlow data!');
} else {
  // Update existing data file to ensure it has the processFlow component
  console.log('Data file exists, ensuring it has processFlow data...');
  try {
    const existingData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Check if processFlow exists
    if (!existingData.commercialProcess || !existingData.commercialProcess.processFlow) {
      console.log('Adding processFlow data to existing data file...');
      
      // Ensure commercialProcess exists
      if (!existingData.commercialProcess) {
        existingData.commercialProcess = {};
      }
      
      // Add processFlow data
      existingData.commercialProcess.processFlow = [
        { "name": "Assembly", "count": 78, "avgDuration": 3.5, "deviationRate": "5.1" },
        { "name": "Quality Control", "count": 76, "avgDuration": 2.8, "deviationRate": "8.2" },
        { "name": "Packaging", "count": 74, "avgDuration": 2.4, "deviationRate": "4.1" },
        { "name": "Final Review", "count": 72, "avgDuration": 1.8, "deviationRate": "2.8" }
      ];
      
      // Update the file
      fs.writeFileSync(dataFile, JSON.stringify(existingData, null, 2));
      console.log('Updated existing data file with processFlow data!');
    } else {
      console.log('Existing data file already has processFlow data.');
    }
  } catch (error) {
    console.error('Error updating data file:', error);
    console.log('Creating new data file with complete data...');
    
    // Create a basic data file with the essential processFlow data
    const basicData = {
      commercialProcess: {
        processFlow: [
          { "name": "Assembly", "count": 78, "avgDuration": 3.5, "deviationRate": "5.1" },
          { "name": "Quality Control", "count": 76, "avgDuration": 2.8, "deviationRate": "8.2" },
          { "name": "Packaging", "count": 74, "avgDuration": 2.4, "deviationRate": "4.1" },
          { "name": "Final Review", "count": 72, "avgDuration": 1.8, "deviationRate": "2.8" }
        ]
      }
    };
    
    fs.writeFileSync(dataFile, JSON.stringify(basicData, null, 2));
    console.log('Created new data file with essential processFlow data!');
  }
}

// Ensure src directory exists
const srcDir = path.join(__dirname, 'src');
if (!fs.existsSync(srcDir)) {
  console.log('Creating src directory...');
  fs.mkdirSync(srcDir, { recursive: true });
}

// Create DataContext.js with enhanced logging
console.log('Creating DataContext.js with enhanced logging...');
fs.writeFileSync(path.join(srcDir, 'DataContext.js'), `
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Create the data context
const DataContext = createContext(null);

// Custom hook for components to access the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Single state object to reduce state updates
  const [state, setState] = useState({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null
  });

  // Keep track of fetch AbortController
  const abortControllerRef = useRef(null);
  
  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load data function wrapped in useCallback
  const loadData = useCallback(async () => {
    // If there's already a fetch in progress, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for this fetch
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    // Update loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch data with abort signal
      console.log('Fetching data from:', \`\${window.location.origin}/data/complete-data.json\`);
      const response = await fetch(\`\${window.location.origin}/data/complete-data.json\`, { signal });
      
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      if (!response.ok) {
        throw new Error(\`Failed to load data: \${response.status} \${response.statusText}\`);
      }
      
      const data = await response.json();
      
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        console.log('Dashboard data loaded successfully');
        
        // Check for processFlow data specifically
        if (data && data.commercialProcess && data.commercialProcess.processFlow) {
          console.log('ProcessFlow data found:', data.commercialProcess.processFlow);
        } else {
          console.warn('ProcessFlow data not found in loaded JSON!');
          if (data && data.commercialProcess) {
            console.log('commercialProcess keys:', Object.keys(data.commercialProcess));
          } else if (data) {
            console.log('Top-level keys:', Object.keys(data));
          }
        }
        
        setState({
          isLoading: false,
          error: null,
          data,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      // Don't update state if the error was due to an aborted fetch
      if (error.name === 'AbortError') {
        console.log('Data fetch was aborted');
        return;
      }
      
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        console.error('Error loading data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data function
  const refreshData = useCallback(() => {
    console.log('Manual refresh requested');
    loadData();
  }, [loadData]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    lastUpdated: state.lastUpdated,
    refreshData
  }), [
    state.isLoading,
    state.error,
    state.data,
    state.lastUpdated,
    refreshData
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
`);

// Create App.js with proper routing and DEBUG logging
console.log('Creating App.js with enhanced routing...');
fs.writeFileSync(path.join(srcDir, 'App.js'), `
import React, { useState, useEffect } from 'react';
import { DataProvider } from './DataContext';
import { TimeFilterProvider } from './TimeFilterContext';
import Dashboard from './Dashboard';
import ProcessAnalysis from './ProcessAnalysis';
import IntelligenceEngine from './IntelligenceEngine';
import LotCorrelationTracker from './LotCorrelationTracker';
import EnhancedVisualizations from './EnhancedVisualizations';
import HistoricalAnalysis from './HistoricalAnalysis';

/**
 * Main application component with tab navigation
 */
const App = () => {
  // Always start with Dashboard tab selected by default
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Update URL when tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);
  
  // Define all available tabs to match the existing structure
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      component: Dashboard,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    { 
      id: 'process-flow', 
      label: 'Process Flow',
      component: ProcessAnalysis,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="m7 17 4-8 4 4 4-10"></path>
        </svg>
      )
    },
    { 
      id: 'lot-analytics', 
      label: 'Lot Analytics',
      component: LotCorrelationTracker,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20v-6"></path>
          <path d="M6 20v-6"></path>
          <path d="M18 20v-6"></path>
          <path d="M6 14c0-4 2-8 6-8s6 4 6 8"></path>
        </svg>
      )
    },
    { 
      id: 'customer-comments', 
      label: 'Customer Comments',
      component: () => <div className="placeholder-tab card"><div className="placeholder-content">Customer Comment Analysis Dashboard</div></div>,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    { 
      id: 'intelligence', 
      label: 'Intelligence Engine',
      component: IntelligenceEngine,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 5 6 10 8 10s8-5 8-10a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
        </svg>
      )
    },
    { 
      id: 'insights', 
      label: 'Insights',
      component: HistoricalAnalysis,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3"></path>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      )
    }
  ];

  // Get the active component to render
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;
  console.log('Rendering component for tab:', activeTab, 'Component:', ActiveComponent?.name || 'Unknown');
  
  return (
    <DataProvider>
      <TimeFilterProvider>
        <div className="app-container">
          <div className="tabs-container">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={\`tab-button \${activeTab === tab.id ? 'active' : ''}\`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <ActiveComponent />
        </div>
      </TimeFilterProvider>
    </DataProvider>
  );
};

export default App;
`);

// Create ProcessAnalysis.js with proper data handling
console.log('Creating ProcessAnalysis.js with enhanced data handling...');
fs.writeFileSync(path.join(srcDir, 'ProcessAnalysis.js'), `import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDataContext } from './DataContext';

const ProcessAnalysis = () => {
  console.log('ProcessAnalysis component rendered');
  const { data, isLoading, error, refreshData } = useDataContext();
  const [expandedStep, setExpandedStep] = useState(null);
  
  // Add debugging effect for data
  useEffect(() => {
    console.log('ProcessAnalysis data effect triggered');
    if (data) {
      console.log('Process Analysis component received data');
      console.log('commercialProcess exists:', Boolean(data.commercialProcess));
      if (data.commercialProcess) {
        console.log('processFlow exists:', Boolean(data.commercialProcess.processFlow));
        if (data.commercialProcess.processFlow) {
          console.log('processFlow data:', data.commercialProcess.processFlow);
        }
      }
    } else {
      console.log('No data received in ProcessAnalysis component');
    }
  }, [data]);
  
  // Process step data with enhanced analysis - use real data from JSON if available
  const processStepsData = useMemo(() => {
    console.log('Computing processStepsData');
    if (data && data.commercialProcess && data.commercialProcess.processFlow) {
      console.log('Using real processFlow data');
      return data.commercialProcess.processFlow.map(step => ({
        id: step.name.toLowerCase().replace(/\\s+/g, '-'),
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
        id: 'assembly', 
        name: 'Assembly', 
        time: 3.5, 
        target: 3.0,
        bottleneck: true,
        variation: 'medium',
        trend: 'stable'
      },
      { 
        id: 'quality-control', 
        name: 'Quality Control', 
        time: 2.8, 
        target: 2.5,
        bottleneck: true,
        variation: 'high',
        trend: 'increasing'
      },
      { 
        id: 'packaging', 
        name: 'Packaging', 
        time: 2.4, 
        target: 2.0,
        bottleneck: false,
        variation: 'low',
        trend: 'decreasing'
      },
      { 
        id: 'final-review', 
        name: 'Final Review', 
        time: 1.8, 
        target: 1.5,
        bottleneck: false,
        variation: 'medium',
        trend: 'stable'
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
    console.log('Rendering loading state');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading process flow data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !data) {
    console.log('Rendering error state:', error);
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
  
  console.log('Rendering process flow visualization');
  
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
              <div key={i} className="timeline-marker" style={{ left: \`\${(i / processMetrics.totalTime) * 100}%\` }}>
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
                    className={\`process-step-block \${step.bottleneck ? 'bottleneck' : ''} \${expandedStep === step.id ? 'expanded' : ''}\`}
                    style={{ 
                      left: \`\${stepStartPercent}%\`, 
                      width: \`\${stepWidthPercent}%\` 
                    }}
                    onClick={() => toggleStepExpansion(step.id)}
                  >
                    <div className="step-header">
                      <div className="step-name">{step.name}</div>
                      <div className="step-time">
                        {step.time.toFixed(1)} days
                        <span className={\`trend-indicator \${step.trend}\`}>
                          {step.trend === 'increasing' ? '↑' : step.trend === 'decreasing' ? '↓' : '→'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="step-target-bar">
                      <div className="step-target-marker" style={{ left: \`\${(step.target / step.time) * 100}%\` }}></div>
                    </div>
                    
                    {step.bottleneck && <div className="bottleneck-indicator">Bottleneck</div>}
                    
                    <div className="step-variation-indicator">
                      <span className={\`variation-dot \${step.variation}\`}></span>
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

export default ProcessAnalysis;`);

// Create additional files to make sure all dependencies are met
console.log('Creating additional required files...');

// Create TimeFilterContext.js - Basic implementation
fs.writeFileSync(path.join(srcDir, 'TimeFilterContext.js'), `
import React, { createContext, useContext, useState } from 'react';

const TimeFilterContext = createContext(null);

export const useTimeFilter = () => useContext(TimeFilterContext);

export const TimeFilterProvider = ({ children }) => {
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  const [preset, setPreset] = useState('6m'); // 1m, 3m, 6m, 1y, all

  return (
    <TimeFilterContext.Provider value={{ timeRange, setTimeRange, preset, setPreset }}>
      {children}
    </TimeFilterContext.Provider>
  );
};

export default TimeFilterContext;
`);

// Create Dashboard.js - Placeholder component
console.log('Creating Dashboard.js placeholder...');
fs.writeFileSync(path.join(srcDir, 'Dashboard.js'), `
import React from 'react';
import { useDataContext } from './DataContext';

const Dashboard = () => {
  const { data, isLoading, error } = useDataContext();
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  // Extract metrics from the data
  const metrics = data?.overview || {};
  const rftRate = metrics.overallRFTRate || 0;
  const totalLots = metrics.totalLots || 0;
  const totalRecords = metrics.totalRecords || 0;
  const issueDistribution = metrics.issueDistribution || [];
  
  return (
    <div className="dashboard-container">
      <h1>Manufacturing Performance Dashboard</h1>
      
      {/* Overview Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Overall RFT Rate</h3>
          </div>
          <div className="metric-value">{rftRate}%</div>
          <div className="metric-trend trend-up">↑ 2.3% vs previous period</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Total Lots</h3>
          </div>
          <div className="metric-value">{totalLots}</div>
          <div className="metric-trend">Total since tracking began</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Total Records</h3>
          </div>
          <div className="metric-value">{totalRecords}</div>
          <div className="metric-trend">Individual process records</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <h3 className="metric-title">Cycle Time</h3>
          </div>
          <div className="metric-value">{data?.processMetrics?.totalCycleTime?.average || 0} days</div>
          <div className="metric-trend trend-down">↓ 1.2 days vs target</div>
        </div>
      </div>
      
      {/* Issues Summary */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Issue Distribution</h2>
        </div>
        <div className="card-content">
          <div className="issue-distribution">
            {issueDistribution.map((issue, index) => (
              <div key={index} className="issue-item">
                <div className="issue-name">{issue.name}</div>
                <div className="issue-bar-container">
                  <div 
                    className="issue-bar" 
                    style={{ 
                      width: \`\${(issue.value / issueDistribution.reduce((sum, i) => sum + i.value, 0)) * 100}%\`, 
                      backgroundColor: index === 0 ? '#f44336' : 
                                      index === 1 ? '#ff9800' : 
                                      index === 2 ? '#2196f3' : 
                                      '#4caf50' 
                    }}
                  ></div>
                </div>
                <div className="issue-value">{issue.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* RFT Performance */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">RFT Performance</h2>
        </div>
        <div className="card-content">
          <div className="rft-performance">
            {data?.overview?.rftPerformance?.map((item, index) => (
              <div key={index} className="rft-item">
                <div className="rft-name">{item.name}</div>
                <div className="rft-bar-container">
                  <div 
                    className="rft-bar" 
                    style={{ 
                      width: \`\${item.percentage}%\`, 
                      backgroundColor: item.name === 'Pass' ? '#4caf50' : '#f44336'
                    }}
                  ></div>
                </div>
                <div className="rft-percentage">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Performance Trend */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent RFT Trend</h2>
        </div>
        <div className="card-content">
          <div className="trend-chart">
            <div className="trend-labels">
              {data?.overview?.rftByMonth?.map((item, index) => (
                <div key={index} className="trend-label">{item.month}</div>
              ))}
            </div>
            <div className="trend-bars">
              {data?.overview?.rftByMonth?.map((item, index) => (
                <div key={index} className="trend-bar-container">
                  <div 
                    className="trend-bar" 
                    style={{ 
                      height: \`\${(item.value / 100) * 200}px\`,
                      backgroundColor: item.value > 92 ? '#4caf50' : 
                                      item.value > 90 ? '#8bc34a' : 
                                      item.value > 85 ? '#ff9800' : '#f44336'
                    }}
                  ></div>
                  <div className="trend-value">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
`);

// Create IntelligenceEngine.js - Placeholder component
console.log('Creating IntelligenceEngine.js placeholder...');
fs.writeFileSync(path.join(srcDir, 'IntelligenceEngine.js'), `
import React from 'react';

const IntelligenceEngine = () => {
  return (
    <div className="placeholder-tab card">
      <div className="placeholder-content">Intelligence Engine Dashboard</div>
    </div>
  );
};

export default IntelligenceEngine;
`);

// Create LotCorrelationTracker.js - Placeholder component
console.log('Creating LotCorrelationTracker.js placeholder...');
fs.writeFileSync(path.join(srcDir, 'LotCorrelationTracker.js'), `
import React, { useState } from 'react';
import { useDataContext } from './DataContext';

const LotCorrelationTracker = () => {
  const { data, isLoading, error } = useDataContext();
  const [selectedStage, setSelectedStage] = useState(null);
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading lot analytics data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  // Extract lot correlation data
  const lotData = data?.lotCorrelation || {};
  const flowData = lotData.flowData || [];
  const cycleTimeMatrix = lotData.cycleTimeMatrix || [];
  const errorPropagation = lotData.errorPropagation || [];
  
  // Get unique stages from the data
  const stages = [];
  if (cycleTimeMatrix && cycleTimeMatrix.length > 0) {
    cycleTimeMatrix.forEach(item => {
      if (!stages.includes(item.stage)) {
        stages.push(item.stage);
      }
    });
  }
  
  return (
    <div className="lot-correlation-container">
      <h1>Lot Analytics & Correlation</h1>
      
      {/* Process Flow Visualization */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Process Flow</h2>
        </div>
        <div className="card-content">
          <div className="flow-diagram">
            {flowData.map((flow, index) => (
              <div key={index} className="flow-step">
                <div className="flow-source">{flow.source}</div>
                <div className="flow-arrow">→</div>
                <div className="flow-target">{flow.target}</div>
                <div className="flow-value">{flow.value} lots</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Cycle Time Analysis */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Cycle Time Analysis</h2>
        </div>
        <div className="card-content">
          <div className="stage-selector">
            <label>Select Stage: </label>
            <select 
              value={selectedStage || ''}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="">All Stages</option>
              {stages.map((stage, index) => (
                <option key={index} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          
          <div className="cycle-time-matrix">
            <div className="matrix-header">
              <div className="matrix-cell">Stage</div>
              <div className="matrix-cell">Min (days)</div>
              <div className="matrix-cell">Avg (days)</div>
              <div className="matrix-cell">Max (days)</div>
              <div className="matrix-cell">Target (days)</div>
            </div>
            
            {cycleTimeMatrix
              .filter(item => !selectedStage || item.stage === selectedStage)
              .map((item, index) => (
                <div key={index} className="matrix-row">
                  <div className="matrix-cell stage-name">{item.stage}</div>
                  <div className="matrix-cell">{item.min}</div>
                  <div className="matrix-cell avg-value">{item.avg}</div>
                  <div className="matrix-cell">{item.max}</div>
                  <div className="matrix-cell target-value">{item.target}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      
      {/* Error Propagation Analysis */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Error Propagation Analysis</h2>
        </div>
        <div className="card-content">
          <div className="error-propagation">
            {errorPropagation.map((error, index) => (
              <div key={index} className="error-item">
                <div className="error-source">
                  <strong>Source:</strong> {error.sourceStage}
                </div>
                <div className="error-type">
                  <strong>Error Type:</strong> {error.errorType}
                </div>
                <div className="error-count">
                  <strong>Count:</strong> {error.count}
                </div>
                <div className="error-propagation-list">
                  <strong>Propagated To:</strong>
                  <ul>
                    {error.propagatedToStages.map((stage, stageIndex) => (
                      <li key={stageIndex}>{stage}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotCorrelationTracker;
`);

// Create EnhancedVisualizations.js - Placeholder component
console.log('Creating EnhancedVisualizations.js placeholder...');
fs.writeFileSync(path.join(srcDir, 'EnhancedVisualizations.js'), `
import React from 'react';

const EnhancedVisualizations = () => {
  return (
    <div className="placeholder-tab card">
      <div className="placeholder-content">Enhanced Visualizations Dashboard</div>
    </div>
  );
};

export default EnhancedVisualizations;
`);

// Create HistoricalAnalysis.js - Placeholder component
console.log('Creating HistoricalAnalysis.js placeholder...');
fs.writeFileSync(path.join(srcDir, 'HistoricalAnalysis.js'), `
import React from 'react';

const HistoricalAnalysis = () => {
  return (
    <div className="placeholder-tab card">
      <div className="placeholder-content">Historical Analysis Dashboard</div>
    </div>
  );
};

export default HistoricalAnalysis;
`);

// Create index.js file - the entry point for React application
console.log('Creating index.js - React entry point...');
fs.writeFileSync(path.join(srcDir, 'index.js'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

// Create a basic index.css file
console.log('Creating index.css for styling...');
fs.writeFileSync(path.join(srcDir, 'index.css'), `
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.tabs-container {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: none;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
}

.tab-button.active {
  color: #1a73e8;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1a73e8;
}

/* Loading and error states */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  font-size: 18px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1a73e8;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #e53935;
}

.refresh-button {
  padding: 8px 16px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 16px;
  cursor: pointer;
}

/* Placeholder components */
.placeholder-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.placeholder-content {
  font-size: 24px;
  color: #666;
}

.card {
  padding: 20px;
  margin-bottom: 20px;
}

/* Process Flow specific styles */
.process-flow-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.process-flow-header h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.process-flow-timeline-container {
  overflow: hidden;
  position: relative;
  padding: 20px 0;
}

.process-flow-visualization {
  position: relative;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.timeline-start, .timeline-end {
  font-weight: 500;
}

.timeline-scale {
  position: relative;
  height: 24px;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
}

.timeline-tick {
  width: 1px;
  height: 8px;
  background-color: #ddd;
  margin: 0 auto 4px;
}

.timeline-label {
  font-size: 12px;
  color: #888;
  text-align: center;
}

.process-steps {
  position: relative;
  min-height: 200px;
}

.process-step-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.process-step-block {
  background-color: #e3f2fd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
}

.step-header {
  display: flex;
  justify-content: space-between;
}

.step-name {
  font-weight: 600;
}

.step-time {
  color: #666;
}

.step-variation-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.variation-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.variation-dot.high {
  background-color: #f44336;
}

.variation-dot.medium {
  background-color: #ff9800;
}

.variation-dot.low {
  background-color: #4caf50;
}

.step-details-panel {
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  padding: 16px;
}

.bottleneck-indicator {
  display: inline-block;
  background-color: #f44336;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 6px;
}

.step-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.step-metric {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}

.metric-name {
  font-size: 12px;
  color: #777;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
}

.step-recommendations h4 {
  margin-top: 16px;
  margin-bottom: 12px;
}

.recommendations-list {
  margin: 0;
  padding-left: 20px;
}

.recommendations-list li {
  margin-bottom: 8px;
  font-size: 13px;
}

.process-flow-instructions {
  text-align: center;
  margin-top: 16px;
  color: #888;
}
`);

// Create enhanced-components.css for additional styling
console.log('Creating enhanced-components.css for styling placeholders...');
fs.writeFileSync(path.join(srcDir, 'enhanced-components.css'), `
/* Enhanced component styles */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-content {
  margin-bottom: 16px;
}

/* Dashboard specific styles */
.dashboard-container h1 {
  margin-bottom: 24px;
  font-size: 24px;
  color: #333;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-title {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.trend-up {
  color: #4caf50;
}

.trend-down {
  color: #f44336;
}

/* Issue distribution */
.issue-distribution {
  margin-top: 16px;
}

.issue-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.issue-name {
  width: 150px;
  font-size: 14px;
}

.issue-bar-container {
  flex-grow: 1;
  height: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 0 12px;
  overflow: hidden;
}

.issue-bar {
  height: 100%;
  border-radius: 4px;
}

.issue-value {
  width: 40px;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

/* RFT Performance */
.rft-performance {
  margin-top: 16px;
}

.rft-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.rft-name {
  width: 80px;
  font-size: 14px;
}

.rft-bar-container {
  flex-grow: 1;
  height: 24px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 0 12px;
  overflow: hidden;
}

.rft-bar {
  height: 100%;
  border-radius: 4px;
}

.rft-percentage {
  width: 60px;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

/* Trend Chart */
.trend-chart {
  margin-top: 16px;
  height: 240px;
  display: flex;
  flex-direction: column;
}

.trend-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.trend-label {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.trend-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding-top: 20px;
}

.trend-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.trend-bar {
  width: 24px;
  border-radius: 4px 4px 0 0;
}

.trend-value {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
}

/* Placeholder components */
.placeholder-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.placeholder-content {
  font-size: 24px;
  color: #777;
  font-weight: 500;
}

/* Process step styling */
.process-step-wrapper {
  position: relative;
  margin-bottom: 12px;
  height: 80px;
}

.process-step-block {
  position: absolute;
  height: 64px;
  background-color: #e3f2fd;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.process-step-block:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.bottleneck {
  background-color: #ffebee;
  border-left: 3px solid #f44336;
}

.step-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.step-name {
  font-weight: 600;
  font-size: 14px;
}

.step-time {
  font-size: 12px;
  color: #666;
}

.trend-indicator {
  margin-left: 4px;
}

.trend-indicator.increasing {
  color: #f44336;
}

.trend-indicator.decreasing {
  color: #4caf50;
}

.trend-indicator.stable {
  color: #ff9800;
}

.step-target-bar {
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  position: relative;
  margin: 8px 0;
}

.step-target-marker {
  position: absolute;
  width: 2px;
  height: 8px;
  background-color: #333;
  transform: translateX(-1px) translateY(-2px);
}

.step-variation-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #777;
  margin-top: 4px;
}

.variation-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.variation-dot.high {
  background-color: #f44336;
}

.variation-dot.medium {
  background-color: #ff9800;
}

.variation-dot.low {
  background-color: #4caf50;
}

/* Lot Analytics Styles */
.lot-correlation-container h1 {
  margin-bottom: 24px;
  font-size: 24px;
  color: #333;
}

.flow-diagram {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}

.flow-source, .flow-target {
  font-weight: 500;
  min-width: 120px;
}

.flow-arrow {
  color: #1a73e8;
  font-size: 20px;
}

.flow-value {
  margin-left: auto;
  background-color: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.stage-selector {
  margin-bottom: 20px;
}

.stage-selector select {
  margin-left: 8px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.cycle-time-matrix {
  width: 100%;
  border-collapse: collapse;
}

.matrix-header {
  display: flex;
  font-weight: 600;
  background-color: #f5f7fa;
  padding: 12px 8px;
  border-radius: 4px 4px 0 0;
}

.matrix-row {
  display: flex;
  padding: 10px 8px;
  border-bottom: 1px solid #eee;
}

.matrix-row:last-child {
  border-bottom: none;
}

.matrix-cell {
  flex: 1;
}

.stage-name {
  font-weight: 500;
}

.avg-value {
  color: #1a73e8;
  font-weight: 500;
}

.target-value {
  color: #4caf50;
  font-weight: 500;
}

.error-propagation {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.error-item {
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  padding: 16px;
}

.error-source, .error-type, .error-count {
  margin-bottom: 8px;
}

.error-propagation-list ul {
  margin-top: 4px;
  padding-left: 20px;
}

.error-propagation-list li {
  margin-bottom: 4px;
}
`);

console.log('Vercel setup completed successfully!');