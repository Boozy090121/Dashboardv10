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
import React, { useMemo, useState, useCallback } from 'react';
import { useDataContext } from './DataContext';
import DashboardGrid from './DashboardGrid';
import MetricCard from './MetricCard';
import AdvancedChart from './AdvancedChart';

const Dashboard = () => {
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 12m, ytd
  
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
  
  // Generate trend data for cycle time
  const cycleTimeTrendData = useMemo(() => {
    if (data?.processMetrics?.cycleTimesByMonth) {
      return data.processMetrics.cycleTimesByMonth.map(item => ({
        month: item.month,
        value: item.averageCycleTime
      }));
    }
    
    // Default mock data
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
    
    // Default mock data
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
  
  // Generate RFT breakdown data for drill-down
  const handleRftDrillDown = useCallback((clickedData) => {
    // Generate breakdown data based on clicked slice
    if (clickedData?.name === 'Pass') {
      return {
        title: 'Success Breakdown by Department',
        data: [
          { name: 'Production', value: data?.internalRFT?.departmentPerformance?.[0]?.pass || 328 },
          { name: 'Quality', value: data?.internalRFT?.departmentPerformance?.[1]?.pass || 248 },
          { name: 'Packaging', value: data?.internalRFT?.departmentPerformance?.[2]?.pass || 187 },
          { name: 'Logistics', value: data?.internalRFT?.departmentPerformance?.[3]?.pass || 156 }
        ]
      };
    } else {
      return {
        title: 'Error Breakdown by Type',
        data: data?.overview?.issueDistribution || [
          { name: 'Documentation Error', value: 42 },
          { name: 'Process Deviation', value: 28 },
          { name: 'Equipment Issue', value: 15 },
          { name: 'Material Issue', value: 11 }
        ]
      };
    }
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
      {/* Header with time range selector */}
      <div className="dashboard-header">
        <div className="header-with-banner">
          <div className="header-banner novo-gradient"></div>
          <h1>Manufacturing Dashboard</h1>
        </div>
        
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
      
      {/* Metric cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Records"
          value={data?.overview?.totalRecords || 1245}
          previousValue={data?.overview?.totalRecords ? data.overview.totalRecords - 25 : 1220}
          trend="up"
          trendData={[
            { value: 1190 },
            { value: 1205 },
            { value: 1215 },
            { value: 1220 },
            { value: 1235 },
            { value: data?.overview?.totalRecords || 1245 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Production', value: 458 },
            { label: 'Quality', value: 326 },
            { label: 'Packaging', value: 278 },
            { label: 'Logistics', value: 183 }
          ]}
        />
        
        <MetricCard
          title="Total Lots"
          value={data?.overview?.totalLots || 78}
          previousValue={data?.overview?.totalLots ? data.overview.totalLots - 2 : 76}
          trend="up"
          status={data?.overview?.totalLots > 80 ? 'warning' : 'normal'}
          trendData={[
            { value: 71 },
            { value: 73 },
            { value: 74 },
            { value: 76 },
            { value: 77 },
            { value: data?.overview?.totalLots || 78 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Released', value: 65 },
            { label: 'In Process', value: 13 }
          ]}
        />
        
        <MetricCard
          title="Overall RFT Rate"
          value={data?.overview?.overallRFTRate || 92.3}
          previousValue={data?.overview?.overallRFTRate ? data.overview.overallRFTRate - 1.5 : 90.8}
          trend="up"
          percentage={true}
          status={
            (data?.overview?.overallRFTRate || 92.3) >= 95 ? 'success' : 
            (data?.overview?.overallRFTRate || 92.3) >= 90 ? 'normal' :
            (data?.overview?.overallRFTRate || 92.3) >= 85 ? 'warning' : 'critical'
          }
          goal={95}
          goalLabel="Target RFT"
          trendData={[
            { value: 88.5 },
            { value: 89.2 },
            { value: 90.1 },
            { value: 90.8 },
            { value: 91.5 },
            { value: data?.overview?.overallRFTRate || 92.3 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Record Level', value: data?.overview?.overallRFTRate || 92.3 },
            { label: 'Lot Level', value: data?.overview?.lotQuality?.percentage || 95.3 }
          ]}
        />
        
        <MetricCard
          title="Avg. Cycle Time"
          value={data?.processMetrics?.totalCycleTime?.average || 21.8}
          previousValue={data?.processMetrics?.totalCycleTime?.average ? data.processMetrics.totalCycleTime.average + 2.3 : 24.1}
          trend="down"
          goal={data?.processMetrics?.totalCycleTime?.target || 18.0}
          goalLabel="Target Time"
          status={
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 18 ? 'success' : 
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 22 ? 'normal' :
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 25 ? 'warning' : 'critical'
          }
          trendData={cycleTimeTrendData}
          showDetails={true}
          detailMetrics={[
            { label: 'Min Observed', value: data?.processMetrics?.totalCycleTime?.minimum || 16.2 },
            { label: 'Max Observed', value: data?.processMetrics?.totalCycleTime?.maximum || 36.2 }
          ]}
        />
      </div>
      
      {/* Charts grid */}
      <DashboardGrid>
        <DashboardGrid.Widget
          title="RFT Performance"
          size="medium"
          onRefresh={() => handleRefresh('rft-performance')}
        >
          <AdvancedChart
            title="Pass vs. Fail Distribution"
            data={data?.overview?.rftPerformance || [
              { name: 'Pass', value: 1149, percentage: 92.3 },
              { name: 'Fail', value: 96, percentage: 7.7 }
            ]}
            type="pie"
            xDataKey="name"
            yDataKey="value"
            onDrillDown={handleRftDrillDown}
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Issue Distribution"
          size="medium"
          onRefresh={() => handleRefresh('issue-distribution')}
        >
          <AdvancedChart
            title="Top Issues by Count"
            data={data?.overview?.issueDistribution || [
              { name: 'Documentation Error', value: 42 },
              { name: 'Process Deviation', value: 28 },
              { name: 'Equipment Issue', value: 15 },
              { name: 'Material Issue', value: 11 }
            ]}
            type="bar"
            xDataKey="name"
            yDataKey="value"
            height={300}
            allowDownload={true}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Department Performance"
          size="medium"
          onRefresh={() => handleRefresh('dept-performance')}
        >
          <AdvancedChart
            title="RFT Rate by Department"
            data={deptPerformanceData}
            type="bar"
            xDataKey="name"
            yDataKey="rftRate"
            percentage={true}
            comparisonValue={95}
            comparisonLabel="Target RFT"
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Lot Quality"
          size="medium"
          onRefresh={() => handleRefresh('lot-quality')}
        >
          <AdvancedChart
            title="Lot Level RFT"
            data={[
              { name: 'Pass', value: data?.overview?.lotQuality?.pass || 72 },
              { name: 'Fail', value: data?.overview?.lotQuality?.fail || 6 }
            ]}
            type="donut"
            xDataKey="name"
            yDataKey="value"
            height={300}
          />
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
import React, { useState } from 'react';
import { DataProvider } from './DataContext';
import Dashboard from './Dashboard';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Define all available tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: Dashboard },
    { id: 'process', label: 'Process Flow', component: () => <div className="placeholder-tab">Process Flow Visualization</div> },
    { id: 'lots', label: 'Lot Analytics', component: () => <div className="placeholder-tab">Lot Analytics Dashboard</div> },
    { id: 'comments', label: 'Customer Comments', component: () => <div className="placeholder-tab">Customer Comment Analysis</div> },
    { id: 'insights', label: 'Insights', component: () => <div className="placeholder-tab">Data Insights Dashboard</div> }
  ];

  // Get the active component to render
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;
  
  return (
    <DataProvider>
      <div className="app-container">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={\`tab-button \${activeTab === tab.id ? 'active' : ''}\`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <ActiveComponent />
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

const MetricCard = ({
  title,
  value,
  previousValue,
  trend = 'neutral',
  percentage = false,
  goal,
  goalLabel = 'Target',
  status = 'normal',
  showDetails = false,
  detailMetrics = [],
  trendData = []
}) => {
  const [showDetailView, setShowDetailView] = useState(false);
  
  const formatValue = (val) => {
    if (val === undefined || val === null) return '-';
    if (percentage) return val.toFixed(1) + '%';
    return val.toLocaleString();
  };
  
  const calculateTrendPercentage = () => {
    if (!previousValue || previousValue === 0) return 0;
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };

  const trendPercentage = calculateTrendPercentage();
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–';
  const trendClass = 
    trend === 'up' ? 'text-green-500' : 
    trend === 'down' ? 'text-red-500' : 
    'text-gray-400';

  const statusClass = 
    status === 'success' ? 'border-l-4 border-green-500' : 
    status === 'warning' ? 'border-l-4 border-yellow-500' : 
    status === 'critical' ? 'border-l-4 border-red-500' : 
    'border-l-4 border-transparent';

  const toggleDetails = () => {
    setShowDetailView(!showDetailView);
  };

  // Calculate goal percentage for progress bar
  const goalPercentage = goal ? Math.min(100, (value / goal) * 100) : 0;
  
  // Calculate heights for mini chart bars
  const maxTrendValue = trendData.length > 0 
    ? Math.max(...trendData.map(item => item.value))
    : 0;
    
  const getBarHeight = (val) => {
    if (maxTrendValue === 0) return '0%';
    return \`\${Math.max(10, (val / maxTrendValue) * 100)}%\`;
  };

  return (
    <div className={\`metric-card \${statusClass}\`}>
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {showDetails && (
          <button 
            className="details-button" 
            onClick={toggleDetails}
            aria-label="Toggle details"
          >
            {showDetailView ? '−' : '+'}
          </button>
        )}
      </div>
      
      <div className="metric-value-container">
        <div className="metric-value">{formatValue(value)}</div>
        
        {previousValue !== undefined && (
          <div className={\`metric-trend \${trendClass}\`}>
            <span>{trendIcon}</span>
            <span>{Math.abs(trendPercentage)}%</span>
          </div>
        )}
      </div>
      
      {/* Progress toward goal */}
      {goal && (
        <div className="metric-goal">
          <div className="goal-bar-container">
            <div className="goal-bar-background">
              <div 
                className="goal-bar-progress"
                style={{ width: \`\${goalPercentage}%\` }}
              ></div>
            </div>
          </div>
          <div className="goal-text">
            <span>Current</span>
            <span>{goalLabel}: {formatValue(goal)}</span>
          </div>
        </div>
      )}
      
      {/* Mini chart */}
      {trendData.length > 0 && (
        <div className="metric-mini-chart">
          {trendData.map((item, idx) => (
            <div 
              key={idx}
              className="mini-chart-bar"
              style={{ 
                height: getBarHeight(item.value),
                opacity: idx === trendData.length - 1 ? 1 : 0.6 + (idx * 0.1)
              }}
            ></div>
          ))}
        </div>
      )}
      
      {/* Detail metrics */}
      {showDetails && showDetailView && detailMetrics.length > 0 && (
        <div className="metric-details">
          <div className="details-header">
            <h4>Details</h4>
          </div>
          <div className="details-content">
            {detailMetrics.map((metric, idx) => (
              <div key={idx} className="detail-item">
                <span className="detail-label">{metric.label}</span>
                <span className="detail-value">{formatValue(metric.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
`);

// Create AdvancedChart.js (simplified)
console.log('Creating AdvancedChart.js...');
fs.writeFileSync(path.join(srcDir, 'AdvancedChart.js'), `
import React, { useState, useCallback } from 'react';

const AdvancedChart = ({
  title,
  description,
  data = [],
  type = 'bar', // 'bar', 'line', 'pie', 'donut', 'area'
  xDataKey,
  yDataKey,
  categories = [],
  height = 300,
  percentage = false,
  comparisonValue,
  comparisonLabel,
  allowDownload = false,
  onDrillDown = null,
}) => {
  const [drillDownData, setDrillDownData] = useState(null);
  
  // Function to handle drill-down click
  const handleDataPointClick = useCallback((item, index) => {
    if (!onDrillDown) return;
    
    const drillDownResult = onDrillDown(item, index);
    if (drillDownResult) {
      setDrillDownData(drillDownResult);
    }
  }, [onDrillDown]);
  
  // Function to go back from drill-down view
  const handleBackClick = useCallback(() => {
    setDrillDownData(null);
  }, []);
  
  // Function to simulate chart download
  const handleDownload = useCallback(() => {
    alert('Chart download simulation: Would download a PNG image of this chart');
  }, []);
  
  // Data formatting helper
  const formatValue = (value) => {
    if (percentage) {
      return \`\${value.toFixed(1)}%\`;
    }
    return value.toLocaleString();
  };
  
  // Render different chart types based on the type prop
  const renderChart = () => {
    // If we have drill-down data, show that instead
    const chartData = drillDownData ? drillDownData.data : data;
    const chartTitle = drillDownData ? drillDownData.title : title;
    
    // Determine which data to render based on chart type
    switch (type) {
      case 'pie':
      case 'donut':
        return (
          <div className="chart-container">
            <h4 className="chart-title">{chartTitle}</h4>
            <div 
              className="chart-content pie-chart" 
              style={{ height: height, position: 'relative' }}
            >
              <div className="pie-segments">
                {chartData.map((item, index) => {
                  const value = typeof yDataKey === 'string' ? item[yDataKey] : item.value;
                  const name = typeof xDataKey === 'string' ? item[xDataKey] : item.name;
                  const percentage = 
                    item.percentage || 
                    (chartData.reduce((sum, d) => sum + (typeof yDataKey === 'string' ? d[yDataKey] : d.value), 0) > 0
                      ? (value / chartData.reduce((sum, d) => sum + (typeof yDataKey === 'string' ? d[yDataKey] : d.value), 0)) * 100
                      : 0);
                  
                  // For visual purposes, generate colors
                  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                  const color = colors[index % colors.length];
                  
                  // For donut chart, create a circle in the middle
                  const isDonut = type === 'donut';
                  
                  return (
                    <div 
                      key={index}
                      className="pie-segment-container"
                      onClick={() => handleDataPointClick(item, index)}
                      style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
                    >
                      <div 
                        className="pie-segment" 
                        style={{ 
                          backgroundColor: color,
                          width: '80px',
                          height: '80px',
                          marginBottom: '10px',
                          borderRadius: '5px'
                        }}
                      ></div>
                      <div className="pie-label">
                        <div>{name}</div>
                        <div className="pie-value">
                          {formatValue(value)} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Placeholder pie visual */}
              <div className="pie-visual" style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'conic-gradient(#3b82f6 0% 55%, #ef4444 55% 75%, #10b981 75% 90%, #f59e0b 90% 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {type === 'donut' && (
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'white'
                  }}></div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'bar':
        return (
          <div className="chart-container">
            <h4 className="chart-title">{chartTitle}</h4>
            <div className="chart-content bar-chart" style={{ height }}>
              {chartData.map((item, index) => {
                const value = typeof yDataKey === 'string' ? item[yDataKey] : item.value;
                const name = typeof xDataKey === 'string' ? item[xDataKey] : item.name;
                
                // Calculate bar height percentage
                const maxValue = Math.max(...chartData.map(d => 
                  typeof yDataKey === 'string' ? d[yDataKey] : d.value
                ));
                const barHeight = (value / maxValue) * 80; // 80% of container height max
                
                // For visual purposes, generate colors
                const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                const color = colors[index % colors.length];
                
                return (
                  <div 
                    key={index}
                    className="bar-item"
                    onClick={() => handleDataPointClick(item, index)}
                    style={{ cursor: onDrillDown ? 'pointer' : 'default' }}
                  >
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          height: \`\${barHeight}%\`, 
                          backgroundColor: color 
                        }}
                      >
                        <span className="bar-value">{formatValue(value)}</span>
                      </div>
                      
                      {comparisonValue && (
                        <div 
                          className="comparison-line"
                          style={{ 
                            position: 'absolute',
                            width: '100%',
                            height: '2px',
                            backgroundColor: '#000',
                            bottom: \`\${(comparisonValue / maxValue) * 80}%\`,
                          }}
                        />
                      )}
                    </div>
                    <div className="bar-label">{name}</div>
                  </div>
                );
              })}
            </div>
            
            {comparisonValue && comparisonLabel && (
              <div className="comparison-legend">
                <span className="comparison-indicator"></span>
                <span className="comparison-label">{comparisonLabel}: {formatValue(comparisonValue)}</span>
              </div>
            )}
          </div>
        );
        
      case 'line':
        return (
          <div className="chart-container">
            <h4 className="chart-title">{chartTitle}</h4>
            <div className="chart-content line-chart" style={{ height }}>
              <div className="chart-placeholder">
                <div className="line-chart-visual" style={{
                  width: '100%',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between'
                }}>
                  {/* Simplified visual line chart */}
                  <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <path 
                      d="M0,150 C50,120 100,180 150,100 C200,20 250,90 300,60 C350,30 400,50 500,10" 
                      stroke="#3b82f6" 
                      strokeWidth="3" 
                      fill="none"
                    />
                    {comparisonValue && (
                      <line 
                        x1="0" 
                        y1={200 - (comparisonValue / 100 * 200)} 
                        x2="500" 
                        y2={200 - (comparisonValue / 100 * 200)}
                        stroke="#000" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" 
                      />
                    )}
                  </svg>
                </div>
                
                <div className="line-chart-labels">
                  {chartData.map((item, index) => (
                    <div key={index} className="line-label">
                      {typeof xDataKey === 'string' ? item[xDataKey] : item.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {comparisonValue && comparisonLabel && (
              <div className="comparison-legend">
                <span className="comparison-indicator"></span>
                <span className="comparison-label">{comparisonLabel}: {formatValue(comparisonValue)}</span>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className="advanced-chart">
      <div className="chart-header">
        {drillDownData && (
          <button 
            onClick={handleBackClick}
            className="back-button"
          >
            ← Back
          </button>
        )}
        
        {description && (
          <div className="chart-description">{description}</div>
        )}
        
        {allowDownload && (
          <button 
            onClick={handleDownload}
            className="download-button"
          >
            Download
          </button>
        )}
      </div>
      
      {renderChart()}
    </div>
  );
};

export default AdvancedChart;
`);

// Create DashboardGrid.js
console.log('Creating DashboardGrid.js...');
fs.writeFileSync(path.join(srcDir, 'DashboardGrid.js'), `
import React from 'react';

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
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1.06-6.7-2.82"></path>
              <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1.06-6.7 2.82"></path>
              <path d="m3 12 3-3 3 3"></path>
            </svg>
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

/* Tabs navigation */
.tabs-container {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-button.active {
  color: #1a73e8;
  border-bottom-color: #1a73e8;
}

.tab-button:hover:not(.active) {
  color: #374151;
  background-color: #f9fafb;
}

.placeholder-tab {
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: #6b7280;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  transition: all 0.2s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
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

.details-button {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}

.details-button:hover {
  background-color: #f7fafc;
  color: #4a5568;
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
}

.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}

.text-gray-400 {
  color: #9ca3af;
}

.metric-goal {
  margin-top: 12px;
}

.goal-bar-container {
  margin-bottom: 4px;
}

.goal-bar-background {
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.goal-bar-progress {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.5s ease;
}

.goal-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.metric-mini-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 24px;
  gap: 2px;
  margin-top: 12px;
}

.mini-chart-bar {
  flex-grow: 1;
  background-color: #3b82f6;
  opacity: 0.7;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

.metric-details {
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.details-header h4 {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  font-weight: 500;
  color: #1f2937;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1024px) {
  .dashboard-grid.responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-grid.responsive {
    grid-template-columns: 1fr;
  }
}

.widget {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;
}

.widget:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
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

.refresh-widget-button {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
}

.refresh-widget-button:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.widget-content {
  padding: 16px;
}

/* Advanced Chart Styles */
.advanced-chart {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
  margin: 0 0 10px 0;
}

.chart-description {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.back-button, .download-button {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover, .download-button:hover {
  background-color: #f9fafb;
  color: #4b5563;
  border-color: #d1d5db;
}

/* Pie Chart Styles */
.pie-chart {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.pie-segments {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  max-width: 60%;
}

.pie-segment-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  cursor: pointer;
  transition: transform 0.2s;
}

.pie-segment-container:hover {
  transform: translateY(-2px);
}

.pie-segment {
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pie-label {
  font-size: 12px;
  text-align: center;
  color: #4b5563;
}

.pie-value {
  font-weight: 500;
  margin-top: 4px;
}

.pie-visual {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Bar Chart Styles */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding-top: 20px;
  height: 250px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  cursor: pointer;
}

.bar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 30px;
  height: 80%;
  transition: transform 0.2s;
}

.bar-item:hover .bar-container {
  transform: translateY(-5px);
}

.bar {
  width: 100%;
  background-color: #3b82f6;
  border-radius: 3px 3px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar-value {
  font-size: 10px;
  font-weight: 500;
  color: white;
  padding: 4px 0;
  white-space: nowrap;
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
  color: #4b5563;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.comparison-indicator {
  display: inline-block;
  width: 12px;
  height: 2px;
  background-color: #000;
}

/* Line Chart Styles */
.line-chart {
  position: relative;
}

.line-chart-visual svg {
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.line-chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.line-label {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  flex: 1;
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
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header banner/artwork */
.header-with-banner {
  display: flex;
  flex-direction: column;
}

.header-banner {
  height: 6px;
  width: 120px;
  margin-bottom: 10px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.novo-gradient {
  background: linear-gradient(to right, #db0032, #0066a4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
`);

console.log('Vercel build preparation completed successfully!'); 