// Vercel build preparation script
const fs = require('fs');
const path = require('path');

console.log('Running Vercel build preparation...');

// Ensure public/data directory exists
const dataDir = path.join(__dirname, 'public', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating public/data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure data file exists
const dataFile = path.join(dataDir, 'complete-data.json');
if (!fs.existsSync(dataFile)) {
  console.log('Creating sample data file...');
  
  // Sample dashboard data
  const sampleData = {
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
      ]
    }
  };

  // Write the sample data to the file
  fs.writeFileSync(dataFile, JSON.stringify(sampleData, null, 2));
  console.log('Sample data file created successfully!');
} else {
  console.log('Data file already exists, skipping creation.');
}

// Ensure src directory exists and contains required files
const srcDir = path.join(__dirname, 'src');
if (!fs.existsSync(srcDir)) {
  console.log('Creating src directory...');
  fs.mkdirSync(srcDir, { recursive: true });
  
  // Check if we need to create minimal files
  if (!fs.existsSync(path.join(srcDir, 'index.js'))) {
    console.log('Creating minimal source files...');
    
    // Create DataContext.js
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
      const response = await fetch(\`\${window.location.origin}/data/complete-data.json\`, { signal });
      
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      if (!response.ok) {
        throw new Error(\`Failed to load data: \${response.status} \${response.statusText}\`);
      }
      
      const data = await response.json();
      
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        setState({
          isLoading: false,
          error: null,
          data,
          lastUpdated: new Date()
        });
        
        console.log('Dashboard data loaded successfully');
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
    
    // Create Dashboard.js
    fs.writeFileSync(path.join(srcDir, 'Dashboard.js'), `
import React, { useMemo } from 'react';
import { useDataContext } from './DataContext';

const Dashboard = () => {
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  
  // Memoize calculated values to prevent recalculations on re-render
  const metrics = useMemo(() => {
    if (!data || !data.overview) {
      return {
        totalRecords: 0,
        totalLots: 0,
        rftRate: 0,
        issueCount: 0
      };
    }
    
    return {
      totalRecords: data.overview.totalRecords || 0,
      totalLots: data.overview.totalLots || 0,
      rftRate: data.overview.overallRFTRate || 0,
      issueCount: data.overview.issueDistribution 
        ? data.overview.issueDistribution.reduce((sum, item) => sum + item.value, 0) 
        : 0
    };
  }, [data]);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Manufacturing Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={refreshData} className="refresh-button">
            Refresh Data
          </button>
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Records</h3>
          <div className="metric-value">{metrics.totalRecords.toLocaleString()}</div>
        </div>
        
        <div className="metric-card">
          <h3>Total Lots</h3>
          <div className="metric-value">{metrics.totalLots.toLocaleString()}</div>
        </div>
        
        <div className="metric-card">
          <h3>RFT Rate</h3>
          <div className="metric-value">{metrics.rftRate.toFixed(1)}%</div>
        </div>
        
        <div className="metric-card">
          <h3>Quality Issues</h3>
          <div className="metric-value">{metrics.issueCount.toLocaleString()}</div>
        </div>
      </div>
      
      {data && data.overview && data.overview.issueDistribution && (
        <div className="chart-container">
          <h3>Issue Distribution</h3>
          <div className="issue-bars">
            {data.overview.issueDistribution.map((issue, index) => (
              <div key={index} className="issue-bar-container">
                <div className="issue-bar-label">{issue.name}</div>
                <div className="issue-bar" style={{ width: \`\${Math.min(100, issue.value / metrics.issueCount * 100)}%\` }}>
                  <span className="issue-bar-value">{issue.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && <div className="overlay-loading">Refreshing...</div>}
    </div>
  );
};

export default Dashboard;
    `);
    
    // Create App.js
    fs.writeFileSync(path.join(srcDir, 'App.js'), `
import React from 'react';
import { DataProvider } from './DataContext';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <DataProvider>
      <div className="app-container">
        <Dashboard />
      </div>
    </DataProvider>
  );
};

export default App;
    `);
    
    // Create index.js
    fs.writeFileSync(path.join(srcDir, 'index.js'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize the application with React 18 syntax
// Not using StrictMode to avoid double rendering effects
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
    `);
    
    // Create index.css
    fs.writeFileSync(path.join(srcDir, 'index.css'), `
/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.5;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Dashboard styles */
.dashboard-container {
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #222;
}

.dashboard-actions {
  display: flex;
  align-items: center;
}

.refresh-button {
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #1660c9;
}

.last-updated {
  margin-left: 16px;
  font-size: 12px;
  color: #666;
}

/* Metrics grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.metric-card h3 {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #222;
}

/* Chart styles */
.chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.chart-container h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 20px;
}

.issue-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-bar-container {
  display: flex;
  align-items: center;
}

.issue-bar-label {
  width: 180px;
  font-size: 14px;
  color: #333;
  padding-right: 16px;
}

.issue-bar {
  height: 24px;
  background-color: #1a73e8;
  border-radius: 4px;
  position: relative;
  min-width: 40px;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
}

.issue-bar-value {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

/* Loading and error states */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 300px;
  padding: 40px;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a73e8;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.error-container h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #d32f2f;
}

.error-container p {
  margin-bottom: 16px;
  color: #666;
  max-width: 500px;
}

.overlay-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  text-align: center;
  color: #1a73e8;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
}
    `);
    
    console.log('Source files created successfully!');
  } else {
    console.log('Source files already exist, skipping creation.');
  }
}

console.log('Vercel build preparation completed successfully!'); 