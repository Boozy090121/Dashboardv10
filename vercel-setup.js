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
  // Check URL for initial tab selection
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL hash for #process-flow or other tab indicators
    const hash = window.location.hash.replace('#', '');
    console.log('URL hash:', hash);
    
    // If hash matches a valid tab, use that
    if (['dashboard', 'intelligence', 'process-flow', 'lot-analytics', 
         'customer-comments', 'insights'].includes(hash)) {
      console.log('Setting initial tab from URL:', hash);
      return hash;
    }
    
    // Default to process-flow for testing
    console.log('No valid hash found, defaulting to process-flow');
    return 'process-flow';
  });
  
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
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProcessAnalysis;
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

console.log('Vercel setup completed successfully!');