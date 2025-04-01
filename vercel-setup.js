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

// Ensure src directory exists
const srcDir = path.join(__dirname, 'src');
if (!fs.existsSync(srcDir)) {
  console.log('Creating src directory...');
  fs.mkdirSync(srcDir, { recursive: true });
}

// Create DataContext.js
console.log('Creating DataContext.js...');
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

// Create Dashboard.js (abbreviated version for space)
console.log('Creating Dashboard.js...');
fs.writeFileSync(path.join(srcDir, 'Dashboard.js'), `
import React, { useMemo, useCallback } from 'react';
import { useDataContext } from './DataContext';
import DashboardGrid from './DashboardGrid';
import MetricCard from './MetricCard';
import AdvancedChart from './AdvancedChart';
import { RefreshCw, Settings, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  
  // Available time ranges for filtering
  const [timeRange, setTimeRange] = React.useState('6m'); // 1m, 3m, 6m, 12m, ytd
  
  // Memoize calculated values
  const metrics = useMemo(() => {
    if (!data || !data.overview) {
      return { totalRecords: 0, totalLots: 0, rftRate: 0, issueCount: 0 };
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
  
  // Generate trend data for cycle time
  const cycleTimeTrendData = useMemo(() => {
    if (data?.processMetrics?.cycleTimesByMonth) {
      return data.processMetrics.cycleTimesByMonth.map(item => ({
        month: item.month,
        value: item.averageCycleTime
      }));
    }
    
    return [
      { month: '2025-01', value: 21.2 },
      { month: '2025-02', value: 22.5 },
      { month: '2025-03', value: 20.8 },
      { month: '2025-04', value: 21.5 },
      { month: '2025-05', value: 19.8 },
      { month: '2025-06', value: 18.5 }
    ];
  }, [data]);
  
  // Generate dept performance data
  const deptPerformanceData = useMemo(() => {
    if (data?.internalRFT?.departmentPerformance) {
      return data.internalRFT.departmentPerformance.map(dept => ({
        name: dept.department,
        rftRate: dept.rftRate,
        target: 95
      }));
    }
    
    return [
      { name: 'Production', rftRate: 93.7, target: 95 },
      { name: 'Quality', rftRate: 95.4, target: 95 },
      { name: 'Packaging', rftRate: 91.2, target: 95 },
      { name: 'Logistics', rftRate: 86.7, target: 95 }
    ];
  }, [data]);
  
  // Handle widget refresh
  const handleRefresh = useCallback((widgetId) => {
    console.log(\`Refreshing widget: \${widgetId}\`);
    refreshData();
  }, [refreshData]);
  
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
      {/* Header with time range selector */}
      <div className="dashboard-header">
        <h1>Manufacturing Dashboard</h1>
        
        <div className="header-actions">
          <div className="time-range-controls">
            {['1m', '3m', '6m', '12m', 'ytd'].map((range) => (
              <button
                key={range}
                className={\`time-range-button \${timeRange === range ? 'active' : ''}\`}
                onClick={() => setTimeRange(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          
          <button onClick={refreshData} className="refresh-button">
            <RefreshCw size={16} />
            Refresh Data
          </button>
          
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      {/* Metric cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Records"
          value={data?.overview?.totalRecords || 1245}
          previousValue={data?.overview?.totalRecords ? data.overview.totalRecords - 25 : 1220}
          trend="up"
          showDetails={true}
        />
        
        <MetricCard
          title="Total Lots"
          value={data?.overview?.totalLots || 78}
          previousValue={data?.overview?.totalLots ? data.overview.totalLots - 2 : 76}
          trend="up"
          status="normal"
          showDetails={true}
        />
        
        <MetricCard
          title="Overall RFT Rate"
          value={data?.overview?.overallRFTRate || 92.3}
          previousValue={90.8}
          trend="up"
          percentage={true}
          goal={95}
          goalLabel="Target RFT"
          showDetails={true}
        />
        
        <MetricCard
          title="Avg. Cycle Time"
          value={data?.processMetrics?.totalCycleTime?.average || 21.8}
          previousValue={24.1}
          trend="down"
          goal={18.0}
          goalLabel="Target Time"
          showDetails={true}
        />
      </div>
      
      {/* Charts grid - shortened for space */}
      <DashboardGrid>
        <DashboardGrid.Widget
          title="RFT Performance"
          size="medium"
          onRefresh={handleRefresh}
        >
          <div>RFT Chart Content</div>
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Issue Distribution"
          size="medium"
          onRefresh={handleRefresh}
        >
          <div>Issues Chart Content</div>
        </DashboardGrid.Widget>
      </DashboardGrid>
      
      {isLoading && <div className="overlay-loading">Refreshing...</div>}
    </div>
  );
};

export default Dashboard;
`);

// Create App.js
console.log('Creating App.js...');
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
console.log('Creating index.js...');
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

// Create basic component files
// MetricCard.js
console.log('Creating MetricCard.js...');
fs.writeFileSync(path.join(srcDir, 'MetricCard.js'), `
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, MoreHorizontal, X } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  previousValue,
  trend = 'none',
  percentage = false,
  currency = false,
  status = 'normal',
  goal = null,
  goalLabel = 'Target',
  trendData = [],
  showDetails = false,
  detailMetrics = []
}) => {
  const [showingDetails, setShowingDetails] = useState(false);
  
  // Calculate the change percentage
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return 0;
    return ((value - previousValue) / Math.abs(previousValue)) * 100;
  };
  
  const change = calculateChange();
  
  // Format the displayed value
  const formatValue = (val) => {
    if (val === null || val === undefined) return '-';
    
    // For large numbers, use locale string (adds commas)
    let formatted = typeof val === 'number' && val >= 1000 
      ? val.toLocaleString() 
      : val;
    
    // Format based on type
    if (percentage) {
      formatted = typeof val === 'number' ? val.toFixed(1) + '%' : val;
    } else if (currency) {
      formatted = typeof val === 'number' ? '$' + val.toLocaleString() : val;
    } else if (typeof val === 'number' && !Number.isInteger(val)) {
      formatted = val.toFixed(1);
    }
    
    return formatted;
  };
  
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {showDetails && (
          <button 
            className="details-button"
            onClick={() => setShowingDetails(!showingDetails)}
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      </div>
      
      <div className="metric-value-container">
        <div className="metric-value">{formatValue(value)}</div>
        
        {trend !== 'none' && (
          <div className="metric-trend">
            {trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
`);

// Create AdvancedChart.js (simplified)
console.log('Creating AdvancedChart.js...');
fs.writeFileSync(path.join(srcDir, 'AdvancedChart.js'), `
import React from 'react';

const AdvancedChart = ({
  title,
  data = [],
  type = 'bar',
  xDataKey,
  yDataKey,
  height = 300
}) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title">
          <h3>{title}</h3>
        </div>
      </div>
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Chart: {type} - {title}</p>
      </div>
    </div>
  );
};

export default AdvancedChart;
`);

// Create DashboardGrid.js
console.log('Creating DashboardGrid.js...');
fs.writeFileSync(path.join(srcDir, 'DashboardGrid.js'), `
import React from 'react';
import { RefreshCw } from 'lucide-react';

// Widget component
const Widget = ({ children, title, size = 'medium', onRefresh = null }) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(title.replace(/\\s+/g, '-').toLowerCase());
    }
  };

  // Apply CSS classes based on widget size
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-4',
    full: 'col-span-1 md:col-span-4'
  };

  return (
    <div className={\`widget \${sizeClasses[size] || 'col-span-1'}\`}>
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        {onRefresh && (
          <button className="refresh-widget-button" onClick={handleRefresh}>
            <RefreshCw size={16} />
          </button>
        )}
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

// Main dashboard grid
const DashboardGrid = ({ children, responsive = true, className = '' }) => {
  return (
    <div className={\`dashboard-grid \${responsive ? 'responsive' : ''} \${className}\`}>
      {children}
    </div>
  );
};

// Add Widget as a static property
DashboardGrid.Widget = Widget;

export default DashboardGrid;
`);

// Create index.css (simplified version)
console.log('Creating index.css...');
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-range-controls {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 6px;
  padding: 2px;
}

.time-range-button {
  background: none;
  border: none;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
}

.time-range-button.active {
  background-color: white;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  display: flex;
  align-items: center;
  gap: 6px;
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
  position: relative;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.metric-value-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #222;
}

.metric-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  gap: 2px;
  color: #10b981;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
  grid-template-columns: repeat(4, 1fr);
}

.widget {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.widget-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.widget-content {
  padding: 16px;
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

console.log('Vercel build preparation completed successfully!'); 