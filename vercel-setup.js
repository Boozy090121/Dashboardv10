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

// Create debug-index.js
console.log('Creating debug-index.js...');
fs.writeFileSync(path.join(__dirname, 'src', 'debug-index.js'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
import SimplifiedApp from './SimplifiedApp';
import './index.css';
import './enhanced-components.css';
import './pci-enhanced-styles.css';
import './tab-fix.css';

console.log('debug-index.js loaded');

// Initialize the application with React 18 syntax
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SimplifiedApp />
  </React.StrictMode>
);

// Add console message to notify that we're using the debug version
console.log('%c DEBUG MODE ACTIVE ', 'background: #CC2030; color: white; font-size: 16px; padding: 4px 8px;');
console.log('Using simplified app for debugging');

// Add a reload button for testing
setTimeout(() => {
  const debugControls = document.createElement('div');
  debugControls.style.position = 'fixed';
  debugControls.style.bottom = '20px';
  debugControls.style.right = '20px';
  debugControls.style.zIndex = '9999';
  debugControls.style.display = 'flex';
  debugControls.style.gap = '10px';
  
  const reloadButton = document.createElement('button');
  reloadButton.innerText = 'Reload';
  reloadButton.style.backgroundColor = '#00518A';
  reloadButton.style.color = 'white';
  reloadButton.style.border = 'none';
  reloadButton.style.padding = '8px 12px';
  reloadButton.style.borderRadius = '4px';
  reloadButton.style.cursor = 'pointer';
  reloadButton.onclick = () => window.location.reload();
  
  const toggleConsoleButton = document.createElement('button');
  toggleConsoleButton.innerText = 'Log State';
  toggleConsoleButton.style.backgroundColor = '#CC2030';
  toggleConsoleButton.style.color = 'white';
  toggleConsoleButton.style.border = 'none';
  toggleConsoleButton.style.padding = '8px 12px';
  toggleConsoleButton.style.borderRadius = '4px';
  toggleConsoleButton.style.cursor = 'pointer';
  toggleConsoleButton.onclick = () => {
    console.log('Current hash:', window.location.hash);
    console.log('Active tab elements:', document.querySelectorAll('.tab-button.active').length);
    console.log('Tab button elements:', document.querySelectorAll('.tab-button').length);
  };
  
  debugControls.appendChild(reloadButton);
  debugControls.appendChild(toggleConsoleButton);
  document.body.appendChild(debugControls);
}, 1000);
`);

// Create index.html with all necessary features
console.log('Creating index.html with all features...');
fs.writeFileSync(path.join(publicDir, 'index.html'), `<!DOCTYPE html>
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
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
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

// Create site.webmanifest for PWA support
console.log('Creating site.webmanifest...');
fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), `{
  "name": "Manufacturing Dashboard",
  "short_name": "Mfg Dashboard",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#1a73e8",
  "background_color": "#ffffff",
  "display": "standalone"
}`);

// Create robots.txt
console.log('Creating robots.txt...');
fs.writeFileSync(path.join(publicDir, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /debug
Disallow: /data/`);

// Create sitemap.xml
console.log('Creating sitemap.xml...');
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.vercel.app/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/dashboard</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/process-flow</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/lot-analytics</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/visualizations</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/intelligence</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/insights</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/customer-comments</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);

// Update package.json scripts
console.log('Updating package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
packageJson.scripts = {
  ...packageJson.scripts,
  "debug": "node vercel-setup.js && REACT_APP_ENTRY_POINT=./src/debug-index.js react-scripts start",
  "vercel-build": "npm run vercel-setup && CI=false DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false react-scripts build"
};
fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2));

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

// Create StorageProvider.js
console.log('Creating StorageProvider.js...');
fs.writeFileSync(path.join(srcDir, 'StorageProvider.js'), `
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context for storage availability
const StorageContext = createContext(null);

// Hook to use storage context
export const useStorageContext = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorageContext must be used within a StorageProvider');
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if localStorage is available on mount
  useEffect(() => {
    try {
      // Try to access localStorage
      const testKey = 'storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      setIsAvailable(true);
      setError(null);
    } catch (err) {
      console.error('localStorage is not available:', err);
      setIsAvailable(false);
      setError(\`Storage not available: \${err.message || 'Unknown error'}\`);
    }
  }, []);
  
  // Safely get item from localStorage
  const getItem = (key, defaultValue = null) => {
    if (!isAvailable) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(\`Error getting item \${key} from localStorage:\`, err);
      return defaultValue;
    }
  };
  
  // Safely set item in localStorage
  const setItem = (key, value) => {
    if (!isAvailable) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(\`Error setting item \${key} in localStorage:\`, err);
      return false;
    }
  };
  
  // Safely remove item from localStorage
  const removeItem = (key) => {
    if (!isAvailable) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(\`Error removing item \${key} from localStorage:\`, err);
      return false;
    }
  };
  
  // Clear all items from localStorage
  const clear = () => {
    if (!isAvailable) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      console.error('Error clearing localStorage:', err);
      return false;
    }
  };
  
  // Get total storage usage
  const getStorageUsage = () => {
    if (!isAvailable) return { used: 0, total: 0, percentage: 0 };
    
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
      }
      
      // Assume 5MB limit (common in browsers)
      const totalLimit = 5 * 1024 * 1024;
      const usagePercentage = (totalSize / totalLimit) * 100;
      
      return {
        used: totalSize,
        total: totalLimit,
        percentage: usagePercentage
      };
    } catch (err) {
      console.error('Error calculating storage usage:', err);
      return { used: 0, total: 0, percentage: 0 };
    }
  };
  
  return (
    <StorageContext.Provider value={{
      isAvailable,
      error,
      getItem,
      setItem,
      removeItem,
      clear,
      getStorageUsage
    }}>
      {children}
      
      {/* Display warning if storage is not available */}
      {!isAvailable && (
        <div className="storage-warning">
          <div className="storage-warning-content">
            <div className="warning-icon">⚠️</div>
            <div className="warning-message">
              <strong>Warning:</strong> Local storage is not available. Your settings and preferences will not be saved.
              <p className="warning-details">{error}</p>
            </div>
            <button className="close-warning" onClick={() => {
              const warning = document.querySelector('.storage-warning');
              if (warning) warning.style.display = 'none';
            }}>×</button>
          </div>
        </div>
      )}
    </StorageContext.Provider>
  );
};

export default StorageContext;
`);

// Create TimeFilterContext.js
console.log('Creating TimeFilterContext.js...');
fs.writeFileSync(path.join(srcDir, 'TimeFilterContext.js'), `
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStorageContext } from './StorageProvider';

// Create context for time filtering
const TimeFilterContext = createContext(null);

// Custom hook for components to access the time filter context
export const useTimeFilterContext = () => {
  const context = useContext(TimeFilterContext);
  if (!context) {
    throw new Error('useTimeFilterContext must be used within a TimeFilterProvider');
  }
  return context;
};

export const TimeFilterProvider = ({ children }) => {
  const { getItem, setItem } = useStorageContext();
  
  // Initialize time range from localStorage or default to 6m
  const [timeRange, setTimeRange] = useState(() => {
    return getItem('time-filter-range', '6m'); // Default to 6 months
  });
  
  // Initialize custom date range if saved
  const [customDateRange, setCustomDateRange] = useState(() => {
    return getItem('time-filter-custom-range', {
      start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days ago
      end: new Date().toISOString().split('T')[0] // Today
    });
  });
  
  // Save time range to localStorage when it changes
  useEffect(() => {
    setItem('time-filter-range', timeRange);
  }, [timeRange, setItem]);
  
  // Save custom date range to localStorage when it changes
  useEffect(() => {
    setItem('time-filter-custom-range', customDateRange);
  }, [customDateRange, setItem]);
  
  // Get date range based on selected timeRange
  const getDateRange = useCallback(() => {
    const today = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '12m':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'custom':
        return {
          start: new Date(customDateRange.start),
          end: new Date(customDateRange.end)
        };
      default:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
    }
    
    return {
      start: startDate,
      end: today
    };
  }, [timeRange, customDateRange]);
  
  // Format a date range for display
  const formatDateRange = useCallback(() => {
    const { start, end } = getDateRange();
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return \`\${formatDate(start)} - \${formatDate(end)}\`;
  }, [getDateRange]);
  
  return (
    <TimeFilterContext.Provider value={{
      timeRange,
      setTimeRange,
      customDateRange,
      setCustomDateRange,
      getDateRange,
      formatDateRange
    }}>
      {children}
    </TimeFilterContext.Provider>
  );
};

export default TimeFilterContext;
`);

// Create App.js with proper routing and DEBUG logging
console.log('Creating App.js with enhanced routing...');
fs.writeFileSync(path.join(srcDir, 'App.js'), `
import React, { useState, useEffect } from 'react';
import { DataProvider } from './DataContext';
import { TimeFilterProvider } from './TimeFilterContext';
import { StorageProvider } from './StorageProvider';
import Dashboard from './Dashboard';
import ProcessAnalysis from './ProcessAnalysis';
import IntelligenceEngine from './IntelligenceEngine';
import LotCorrelationTracker from './LotCorrelationTracker';
import EnhancedVisualizations from './EnhancedVisualizations';
import HistoricalAnalysis from './HistoricalAnalysis';
import CustomerCommentAnalysis from './CustomerCommentAnalysis';
import Widgets from './Widgets';
import UserSettings from './UserSettings';

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
         'visualizations', 'historical', 'customer-comments', 'widgets', 'settings'].includes(hash)) {
      console.log('Setting initial tab from URL:', hash);
      return hash;
    }
    
    // Default to dashboard if no valid hash
    return 'dashboard';
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
      component: CustomerCommentAnalysis,
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
    },
    { 
      id: 'widgets', 
      label: 'Widgets',
      component: Widgets,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="6" height="6"></rect>
          <rect x="14" y="4" width="6" height="6"></rect>
          <rect x="4" y="14" width="6" height="6"></rect>
          <rect x="14" y="14" width="6" height="6"></rect>
        </svg>
      )
    },
    { 
      id: 'settings', 
      label: 'Settings',
      component: UserSettings,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  // Get the active component to render
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;
  console.log('Rendering component for tab:', activeTab, 'Component:', ActiveComponent?.name || 'Unknown');
  
  return (
    <StorageProvider>
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
    </StorageProvider>
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

export default ProcessAnalysis;
`);

// Create CustomerCommentAnalysis.js
console.log('Creating CustomerCommentAnalysis.js...');
fs.writeFileSync(path.join(srcDir, 'CustomerCommentAnalysis.js'), `import React, { useState, useMemo, useEffect } from 'react';
import { useDataContext } from './DataContext';

const CustomerCommentAnalysis = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedComment, setExpandedComment] = useState(null);
  
  // Process customer comment data
  const commentData = useMemo(() => {
    if (!data || !data.customerComments) {
      // Default data if customer comments not available
      return [
        {
          id: 1,
          customer: 'Acme Pharmaceuticals',
          date: '2025-05-15',
          category: 'quality',
          content: 'We noticed inconsistencies in the documentation provided with batch PX-45892. Some sections were missing required information about testing parameters.',
          sentiment: 'negative',
          priority: 'high',
          status: 'open',
          keywords: ['documentation', 'inconsistent', 'missing', 'testing parameters'],
          responseTime: null
        },
        {
          id: 2,
          customer: 'BioTech Solutions',
          date: '2025-05-12',
          category: 'delivery',
          content: 'The latest shipment arrived two days ahead of schedule, which helped us meet our production timeline. Great work on the expedited delivery!',
          sentiment: 'positive',
          priority: 'medium',
          status: 'closed',
          keywords: ['delivery', 'ahead of schedule', 'expedited'],
          responseTime: '2h 15m'
        },
        {
          id: 3,
          customer: 'MedCore Devices',
          date: '2025-05-10',
          category: 'product',
          content: 'The latest batch meets all specifications and has shown excellent performance in our initial testing. Quality is consistent with previous deliveries.',
          sentiment: 'positive',
          priority: 'low',
          status: 'closed',
          keywords: ['quality', 'specifications', 'consistent', 'performance'],
          responseTime: '4h 30m'
        },
        {
          id: 4,
          customer: 'Global Health Products',
          date: '2025-05-08',
          category: 'service',
          content: 'Your technical support team was extremely helpful in resolving our questions about the validation process. Response was prompt and comprehensive.',
          sentiment: 'positive',
          priority: 'medium',
          status: 'closed',
          keywords: ['support', 'validation', 'responsive', 'helpful'],
          responseTime: '1h 10m'
        },
        {
          id: 5,
          customer: 'Pharma Innovations',
          date: '2025-05-05',
          category: 'quality',
          content: 'We identified several deviations in the latest batch that required additional testing on our end. This caused delays in our production schedule.',
          sentiment: 'negative',
          priority: 'high',
          status: 'in-progress',
          keywords: ['deviations', 'additional testing', 'delays'],
          responseTime: '5h 45m'
        }
      ];
    }
    
    return data.customerComments;
  }, [data]);
  
  // Filter and sort the comments
  const filteredComments = useMemo(() => {
    return commentData
      .filter(comment => {
        // Category filter
        if (selectedCategory !== 'all' && comment.category !== selectedCategory) {
          return false;
        }
        
        // Search term filter
        if (searchTerm && !comment.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !comment.customer.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Sentiment filter
        if (sentimentFilter !== 'all' && comment.sentiment !== sentimentFilter) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort logic
        if (sortBy === 'date') {
          return sortOrder === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'priority') {
          const priorityValues = { 'low': 1, 'medium': 2, 'high': 3 };
          return sortOrder === 'asc'
            ? priorityValues[a.priority] - priorityValues[b.priority]
            : priorityValues[b.priority] - priorityValues[a.priority];
        } else if (sortBy === 'sentiment') {
          const sentimentValues = { 'negative': 1, 'neutral': 2, 'positive': 3 };
          return sortOrder === 'asc'
            ? sentimentValues[a.sentiment] - sentimentValues[b.sentiment]
            : sentimentValues[b.sentiment] - sentimentValues[a.sentiment];
        }
        return 0;
      });
  }, [commentData, selectedCategory, searchTerm, sentimentFilter, sortBy, sortOrder]);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const total = commentData.length;
    const positive = commentData.filter(c => c.sentiment === 'positive').length;
    const negative = commentData.filter(c => c.sentiment === 'negative').length;
    const open = commentData.filter(c => c.status === 'open').length;
    const inProgress = commentData.filter(c => c.status === 'in-progress').length;
    const closed = commentData.filter(c => c.status === 'closed').length;
    const highPriority = commentData.filter(c => c.priority === 'high').length;
    
    // Calculate average response time (for comments that have response time)
    const commentsWithResponse = commentData.filter(c => c.responseTime);
    let avgResponseTime = 'N/A';
    
    if (commentsWithResponse.length > 0) {
      // Convert response times to minutes
      const responseTimes = commentsWithResponse.map(c => {
        const match = c.responseTime.match(/(\d+)h\\s+(\d+)m/);
        if (match) {
          const hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          return hours * 60 + minutes;
        }
        return 0;
      });
      
      // Calculate average in minutes
      const totalMinutes = responseTimes.reduce((sum, time) => sum + time, 0);
      const avgMinutes = Math.round(totalMinutes / responseTimes.length);
      
      // Convert back to hours and minutes
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      avgResponseTime = \`\${hours}h \${minutes}m\`;
    }
    
    return {
      total,
      positive,
      negative,
      neutral: total - positive - negative,
      positivePercentage: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativePercentage: total > 0 ? Math.round((negative / total) * 100) : 0,
      open,
      inProgress,
      closed,
      highPriority,
      avgResponseTime
    };
  }, [commentData]);
  
  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'quality', label: 'Quality' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'product', label: 'Product' },
    { id: 'service', label: 'Service' },
    { id: 'documentation', label: 'Documentation' }
  ];
  
  // Toggle comment expansion
  const toggleCommentExpansion = (commentId) => {
    setExpandedComment(expandedComment === commentId ? null : commentId);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customer comment data...</p>
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
    <div className="customer-comment-analysis">
      <div className="comment-analysis-header">
        <h1>Customer Comment Analysis</h1>
        <div className="comment-metrics-container">
          <div className="comment-metric">
            <div className="metric-value">{metrics.total}</div>
            <div className="metric-label">Total Comments</div>
          </div>
          <div className="comment-metric positive">
            <div className="metric-value">{metrics.positivePercentage}%</div>
            <div className="metric-label">Positive</div>
          </div>
          <div className="comment-metric negative">
            <div className="metric-value">{metrics.negativePercentage}%</div>
            <div className="metric-label">Negative</div>
          </div>
          <div className="comment-metric">
            <div className="metric-value">{metrics.open}</div>
            <div className="metric-label">Open</div>
          </div>
          <div className="comment-metric">
            <div className="metric-value">{metrics.avgResponseTime}</div>
            <div className="metric-label">Avg Response</div>
          </div>
        </div>
      </div>
      
      <div className="comments-filter-container">
        <div className="filter-group">
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category.id}
                className={\`category-button \${selectedCategory === category.id ? 'active' : ''}\`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="filter-group">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sentiment-filter">
            <select 
              value={sentimentFilter} 
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="sentiment-select"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="comments-list-container">
        <div className="comments-list-header">
          <div className="column-header date" onClick={() => handleSortChange('date')}>
            Date
            {sortBy === 'date' && (
              <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="column-header customer">Customer</div>
          <div className="column-header content">Comment</div>
          <div className="column-header priority" onClick={() => handleSortChange('priority')}>
            Priority
            {sortBy === 'priority' && (
              <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="column-header sentiment" onClick={() => handleSortChange('sentiment')}>
            Sentiment
            {sortBy === 'sentiment' && (
              <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="column-header status">Status</div>
        </div>
        
        <div className="comments-list">
          {filteredComments.length > 0 ? (
            filteredComments.map(comment => (
              <div 
                key={comment.id} 
                className={\`comment-item \${expandedComment === comment.id ? 'expanded' : ''}\`}
                onClick={() => toggleCommentExpansion(comment.id)}
              >
                <div className="comment-summary">
                  <div className="comment-date">
                    {new Date(comment.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </div>
                  <div className="comment-customer">{comment.customer}</div>
                  <div className="comment-content">
                    {comment.content.length > 60 
                      ? \`\${comment.content.substring(0, 60)}...\` 
                      : comment.content}
                  </div>
                  <div className={\`comment-priority \${comment.priority}\`}>
                    {comment.priority.charAt(0).toUpperCase() + comment.priority.slice(1)}
                  </div>
                  <div className={\`comment-sentiment \${comment.sentiment}\`}>
                    {comment.sentiment === 'positive' && '👍'}
                    {comment.sentiment === 'neutral' && '😐'}
                    {comment.sentiment === 'negative' && '👎'}
                    {comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1)}
                  </div>
                  <div className={\`comment-status \${comment.status}\`}>
                    {comment.status.charAt(0).toUpperCase() + comment.status.slice(1).replace('-', ' ')}
                  </div>
                </div>
                
                {expandedComment === comment.id && (
                  <div className="comment-details">
                    <div className="comment-full-content">
                      <h4>Full Comment</h4>
                      <p>{comment.content}</p>
                    </div>
                    
                    <div className="comment-metadata">
                      <div className="metadata-section">
                        <h4>Response Time</h4>
                        <p>{comment.responseTime || 'Not yet responded'}</p>
                      </div>
                      
                      <div className="metadata-section">
                        <h4>Keywords</h4>
                        <div className="keywords-list">
                          {comment.keywords.map((keyword, index) => (
                            <span key={index} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="metadata-section">
                        <h4>Category</h4>
                        <p>{comment.category.charAt(0).toUpperCase() + comment.category.slice(1)}</p>
                      </div>
                    </div>
                    
                    <div className="comment-actions">
                      <button className="action-button">Mark as Resolved</button>
                      <button className="action-button">Assign</button>
                      <button className="action-button">Add Response</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-comments-message">
              No comments match your current filters. Try adjusting your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCommentAnalysis;
`);

// Create Widgets.js
console.log('Creating Widgets.js...');
fs.writeFileSync(path.join(srcDir, 'Widgets.js'), `
import React, { useState, useEffect, useCallback } from 'react';
import { useDataContext } from './DataContext';
import { useTimeFilterContext } from './TimeFilterContext';
import { useStorageContext } from './StorageProvider';
import AdvancedChart from './AdvancedChart';
import MetricCard from './MetricCard';

const Widgets = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const { timeRange } = useTimeFilterContext();
  const { getItem, setItem, isAvailable } = useStorageContext();
  
  const [widgets, setWidgets] = useState(() => {
    // Use the storage context to get the widgets
    return getItem('dashboard-widgets', defaultWidgets);
  });
  const [availableWidgets, setAvailableWidgets] = useState(widgetCatalog);
  const [editMode, setEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState(null);
  
  // Save widgets to localStorage when they change
  useEffect(() => {
    // Use the storage context to set the widgets
    setItem('dashboard-widgets', widgets);
  }, [widgets, setItem]);
  
  // Add a widget to the dashboard
  const addWidget = useCallback((widgetType) => {
    const widgetToAdd = availableWidgets.find(w => w.type === widgetType);
    if (!widgetToAdd) return;
    
    const newWidget = {
      id: \`widget-\${Date.now()}-\${Math.floor(Math.random() * 1000)}\`,
      ...widgetToAdd,
      position: {
        x: 0,
        y: widgets.length > 0 ? Math.max(...widgets.map(w => w.position.y)) + 1 : 0
      }
    };
    
    setWidgets(prev => [...prev, newWidget]);
  }, [widgets, availableWidgets]);
  
  // Remove a widget from the dashboard
  const removeWidget = useCallback((widgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);
  
  // Handle widget drag start
  const handleDragStart = useCallback((e, widget) => {
    setIsDragging(true);
    setDraggedWidget(widget);
    
    // Add visual feedback for dragging
    if (e.target.classList.contains('widget-header')) {
      e.target.parentNode.classList.add('dragging');
    } else {
      e.target.classList.add('dragging');
    }
  }, []);
  
  // Handle widget drag end
  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    setDraggedWidget(null);
    
    // Remove dragging class from all elements
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  }, []);
  
  // Handle widget drop for reordering
  const handleDragOver = useCallback((e, targetWidget) => {
    e.preventDefault();
    if (!isDragging || !draggedWidget || draggedWidget.id === targetWidget.id) return;
    
    // Reorder widgets
    setWidgets(prev => {
      const updatedWidgets = [...prev];
      const draggedIndex = updatedWidgets.findIndex(w => w.id === draggedWidget.id);
      const targetIndex = updatedWidgets.findIndex(w => w.id === targetWidget.id);
      
      // Swap positions
      const tempPos = { ...updatedWidgets[draggedIndex].position };
      updatedWidgets[draggedIndex].position = { ...updatedWidgets[targetIndex].position };
      updatedWidgets[targetIndex].position = tempPos;
      
      return updatedWidgets;
    });
  }, [isDragging, draggedWidget]);
  
  // Toggle widget edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading widget data...</p>
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
    <div className="widgets-container">
      <div className="widgets-header">
        <h1>Custom Dashboard Widgets</h1>
        <div className="widgets-actions">
          <button 
            className={\`edit-button \${editMode ? 'active' : ''}\`} 
            onClick={toggleEditMode}
          >
            {editMode ? 'Done Editing' : 'Edit Dashboard'}
          </button>
          {editMode && (
            <div className="widget-catalog-dropdown">
              <button className="add-widget-button">Add Widget</button>
              <div className="dropdown-content">
                {availableWidgets.map(widget => (
                  <div 
                    key={widget.type} 
                    className="dropdown-item"
                    onClick={() => addWidget(widget.type)}
                  >
                    {widget.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {widgets.length === 0 ? (
        <div className="empty-widgets">
          <h3>No widgets added yet!</h3>
          <p>Click "Edit Dashboard" and then "Add Widget" to get started.</p>
        </div>
      ) : (
        <div className="widgets-grid">
          {widgets.sort((a, b) => 
            a.position.y === b.position.y 
              ? a.position.x - b.position.x 
              : a.position.y - b.position.y
          ).map(widget => (
            <div 
              key={widget.id}
              className={\`widget-container \${widget.size || 'medium'} \${editMode ? 'editable' : ''}\`}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, widget)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, widget)}
            >
              <div className="widget-header">
                <h3>{widget.name}</h3>
                {editMode && (
                  <button 
                    className="remove-widget" 
                    onClick={() => removeWidget(widget.id)}
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className="widget-content">
                {renderWidgetContent(widget, data, timeRange)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to render the appropriate widget content based on type
const renderWidgetContent = (widget, data, timeRange) => {
  if (!data) return <div className="widget-placeholder">No data available</div>;
  
  switch (widget.type) {
    case 'metric-card':
      return (
        <MetricCard
          title={widget.name}
          value={getDataFromPath(data, widget.dataPath)?.value || 0}
          previousValue={getDataFromPath(data, widget.dataPath)?.previousValue}
          trend={getDataFromPath(data, widget.dataPath)?.trend || 'stable'}
          percentage={widget.isPercentage}
          showDetails={false}
        />
      );
      
    case 'rft-chart':
      return (
        <AdvancedChart
          title="RFT Rate Trend"
          data={data?.overview?.processTimeline || []}
          type="line"
          xDataKey="month"
          yDataKey="recordRFT"
          percentage={true}
          comparisonValue={95}
          comparisonLabel="Target"
          height={200}
        />
      );
      
    case 'cycle-time-chart':
      return (
        <AdvancedChart
          title="Cycle Time Trend"
          data={data?.processMetrics?.cycleTimesByMonth || []}
          type="line"
          xDataKey="month"
          yDataKey="averageCycleTime"
          height={200}
        />
      );
      
    case 'issue-distribution':
      return (
        <AdvancedChart
          title="Issue Distribution"
          data={data?.overview?.issueDistribution || []}
          type="pie"
          xDataKey="name"
          yDataKey="value"
          height={200}
        />
      );
      
    case 'dept-performance':
      return (
        <AdvancedChart
          title="Department Performance"
          data={data?.internalRFT?.departmentPerformance || []}
          type="bar"
          xDataKey="department"
          yDataKey="rftRate"
          percentage={true}
          height={200}
        />
      );
      
    default:
      return <div className="widget-placeholder">Unknown widget type</div>;
  }
};

// Helper to safely get nested data using a path string like "overview.totalRecords"
const getDataFromPath = (data, path) => {
  if (!data || !path) return null;
  
  try {
    return path.split('.').reduce((obj, key) => obj[key], data);
  } catch (error) {
    console.warn(\`Error accessing data path: \${path}\`, error);
    return null;
  }
};

// Default widgets for new users
const defaultWidgets = [
  {
    id: 'default-1',
    type: 'metric-card',
    name: 'Total Records',
    dataPath: 'overview.totalRecords',
    size: 'small',
    position: { x: 0, y: 0 }
  },
  {
    id: 'default-2',
    type: 'rft-chart',
    name: 'RFT Rate Trend',
    size: 'medium',
    position: { x: 1, y: 0 }
  },
  {
    id: 'default-3',
    type: 'issue-distribution',
    name: 'Issue Distribution',
    size: 'medium',
    position: { x: 0, y: 1 }
  }
];

// Available widgets catalog
const widgetCatalog = [
  { type: 'metric-card', name: 'Metric Card', size: 'small' },
  { type: 'rft-chart', name: 'RFT Rate Chart', size: 'medium' },
  { type: 'cycle-time-chart', name: 'Cycle Time Chart', size: 'medium' },
  { type: 'issue-distribution', name: 'Issue Distribution', size: 'medium' },
  { type: 'dept-performance', name: 'Department Performance', size: 'medium' }
];

export default Widgets;
`);

// Create UserSettings.js
console.log('Creating UserSettings.js...');
fs.writeFileSync(path.join(srcDir, 'UserSettings.js'), `
import React, { useState, useEffect } from 'react';
import { useStorageContext } from './StorageProvider';

const UserSettings = () => {
  const { getItem, setItem, isAvailable, getStorageUsage, clear } = useStorageContext();
  
  // Load settings from storage or use defaults
  const [settings, setSettings] = useState(() => {
    return getItem('user-settings', {
      theme: 'light',
      colorMode: 'default',
      dataRefreshInterval: 5,
      chartAnimations: true,
      highContrastMode: false,
      showHelp: true,
      decimalPrecision: 1,
      defaultTimeRange: '6m',
      notificationsEnabled: true,
      dashboardDensity: 'comfortable'
    });
  });
  
  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaved, setIsSaved] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });
  
  // Get storage info on mount
  useEffect(() => {
    if (isAvailable) {
      setStorageInfo(getStorageUsage());
    }
  }, [isAvailable, getStorageUsage]);
  
  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Reset saved status
    setIsSaved(false);
  };
  
  // Save settings
  const saveSettings = () => {
    setItem('user-settings', settings);
    setIsSaved(true);
    
    // Update theme on body element
    document.body.dataset.theme = settings.theme;
    document.body.dataset.colorMode = settings.colorMode;
    document.body.dataset.highContrast = settings.highContrastMode;
    document.body.dataset.density = settings.dashboardDensity;
    
    // Show save confirmation briefly
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
    
    // Update storage info
    setStorageInfo(getStorageUsage());
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    if (window.confirm('Reset all settings to default values?')) {
      const defaultSettings = {
        theme: 'light',
        colorMode: 'default',
        dataRefreshInterval: 5,
        chartAnimations: true,
        highContrastMode: false,
        showHelp: true,
        decimalPrecision: 1,
        defaultTimeRange: '6m',
        notificationsEnabled: true,
        dashboardDensity: 'comfortable'
      };
      
      setSettings(defaultSettings);
      setItem('user-settings', defaultSettings);
      setIsSaved(true);
      
      // Update theme on body element
      document.body.dataset.theme = defaultSettings.theme;
      document.body.dataset.colorMode = defaultSettings.colorMode;
      document.body.dataset.highContrast = defaultSettings.highContrastMode;
      document.body.dataset.density = defaultSettings.dashboardDensity;
      
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    }
  };
  
  // Clear all stored data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      clear();
      window.location.reload();
    }
  };
  
  // If storage is not available, show a message
  if (!isAvailable) {
    return (
      <div className="settings-container">
        <div className="settings-header">
          <h1>User Settings</h1>
        </div>
        
        <div className="storage-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Local Storage Unavailable</h3>
            <p>Your browser does not support or has disabled local storage. Settings cannot be saved.</p>
            <p>Try enabling cookies and local storage in your browser settings, or try a different browser.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>User Settings</h1>
        <div className="settings-actions">
          {isSaved && <div className="save-indicator">Settings saved!</div>}
          <button className="reset-button" onClick={resetSettings}>Reset to Default</button>
          <button className="save-button" onClick={saveSettings} disabled={isSaved}>
            {isSaved ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <button 
            className={\`sidebar-tab \${activeTab === 'appearance' ? 'active' : ''}\`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button 
            className={\`sidebar-tab \${activeTab === 'data' ? 'active' : ''}\`}
            onClick={() => setActiveTab('data')}
          >
            Data Preferences
          </button>
          <button 
            className={\`sidebar-tab \${activeTab === 'notifications' ? 'active' : ''}\`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={\`sidebar-tab \${activeTab === 'storage' ? 'active' : ''}\`}
            onClick={() => setActiveTab('storage')}
          >
            Storage
          </button>
        </div>
        
        <div className="settings-panel">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-group">
              <h2>Appearance Settings</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="theme">Theme</label>
                  <div className="setting-description">
                    Choose your preferred color scheme
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="theme" 
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="colorMode">Color Mode</label>
                  <div className="setting-description">
                    Set the color scheme for charts and visualizations
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="colorMode" 
                    value={settings.colorMode}
                    onChange={(e) => handleSettingChange('colorMode', e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="colorblind">Colorblind-friendly</option>
                    <option value="monochrome">Monochrome</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="pastel">Pastel</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="dashboardDensity">Dashboard Density</label>
                  <div className="setting-description">
                    Adjust the spacing and density of dashboard elements
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="dashboardDensity" 
                    value={settings.dashboardDensity}
                    onChange={(e) => handleSettingChange('dashboardDensity', e.target.value)}
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                    <option value="cozy">Cozy</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="highContrastMode">High Contrast Mode</label>
                  <div className="setting-description">
                    Increase contrast for better readability
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="highContrastMode" 
                    checked={settings.highContrastMode}
                    onChange={(e) => handleSettingChange('highContrastMode', e.target.checked)}
                  />
                  <label htmlFor="highContrastMode" className="toggle-label"></label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="chartAnimations">Chart Animations</label>
                  <div className="setting-description">
                    Enable or disable animations for charts and visualizations
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="chartAnimations" 
                    checked={settings.chartAnimations}
                    onChange={(e) => handleSettingChange('chartAnimations', e.target.checked)}
                  />
                  <label htmlFor="chartAnimations" className="toggle-label"></label>
                </div>
              </div>
            </div>
          )}
          
          {/* Data Preferences Tab */}
          {activeTab === 'data' && (
            <div className="settings-group">
              <h2>Data Preferences</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="dataRefreshInterval">Data Refresh Interval (minutes)</label>
                  <div className="setting-description">
                    How often the dashboard data automatically refreshes
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="dataRefreshInterval" 
                    value={settings.dataRefreshInterval}
                    onChange={(e) => handleSettingChange('dataRefreshInterval', Number(e.target.value))}
                  >
                    <option value="0">Never (Manual only)</option>
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="decimalPrecision">Decimal Precision</label>
                  <div className="setting-description">
                    Number of decimal places to display for numeric values
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="decimalPrecision" 
                    value={settings.decimalPrecision}
                    onChange={(e) => handleSettingChange('decimalPrecision', Number(e.target.value))}
                  >
                    <option value="0">0 decimals</option>
                    <option value="1">1 decimal</option>
                    <option value="2">2 decimals</option>
                    <option value="3">3 decimals</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="defaultTimeRange">Default Time Range</label>
                  <div className="setting-description">
                    Default time period for reports and charts
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="defaultTimeRange" 
                    value={settings.defaultTimeRange}
                    onChange={(e) => handleSettingChange('defaultTimeRange', e.target.value)}
                  >
                    <option value="1m">1 Month</option>
                    <option value="3m">3 Months</option>
                    <option value="6m">6 Months</option>
                    <option value="12m">12 Months</option>
                    <option value="ytd">Year to Date</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-group">
              <h2>Notification Settings</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="notificationsEnabled">Enable Notifications</label>
                  <div className="setting-description">
                    Show system notifications for important events
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="notificationsEnabled" 
                    checked={settings.notificationsEnabled}
                    onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  />
                  <label htmlFor="notificationsEnabled" className="toggle-label"></label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="showHelp">Show Help Tips</label>
                  <div className="setting-description">
                    Display tooltips and help information throughout the application
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="showHelp" 
                    checked={settings.showHelp}
                    onChange={(e) => handleSettingChange('showHelp', e.target.checked)}
                  />
                  <label htmlFor="showHelp" className="toggle-label"></label>
                </div>
              </div>
            </div>
          )}
          
          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div className="settings-group">
              <h2>Storage Management</h2>
              
              <div className="storage-info">
                <h3>Local Storage Usage</h3>
                <div className="storage-progress-container">
                  <div 
                    className="storage-progress-bar" 
                    style={{ width: \`\${Math.min(storageInfo.percentage, 100)}%\` }}
                  ></div>
                </div>
                <div className="storage-details">
                  <span>{(storageInfo.used / 1024).toFixed(2)} KB used</span>
                  <span>of {(storageInfo.total / (1024 * 1024)).toFixed(2)} MB available</span>
                </div>
              </div>
              
              <div className="storage-actions">
                <button className="clear-data-button" onClick={clearAllData}>
                  Clear All Stored Data
                </button>
                <p className="clear-data-warning">
                  This will reset all settings, preferences, and local data. This action cannot be undone.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
`);

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
import './enhanced-components.css';

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

.dashboard-container .metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.dashboard-container .metric-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-container .metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.dashboard-container .metric-title {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.dashboard-container .metric-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.dashboard-container .metric-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.dashboard-container .trend-up {
  color: #4caf50;
}

.dashboard-container .trend-down {
  color: #f44336;
}

/* Issue distribution */
.dashboard-container .issue-distribution {
  margin-top: 16px;
}

.dashboard-container .issue-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.dashboard-container .issue-name {
  width: 150px;
  font-size: 14px;
}

.dashboard-container .issue-bar-container {
  flex-grow: 1;
  height: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 0 12px;
  overflow: hidden;
}

.dashboard-container .issue-bar {
  height: 100%;
  border-radius: 4px;
}

.dashboard-container .issue-value {
  width: 40px;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

/* RFT Performance */
.dashboard-container .rft-performance {
  margin-top: 16px;
}

.dashboard-container .rft-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.dashboard-container .rft-name {
  width: 80px;
  font-size: 14px;
}

.dashboard-container .rft-bar-container {
  flex-grow: 1;
  height: 24px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 0 12px;
  overflow: hidden;
}

.dashboard-container .rft-bar {
  height: 100%;
  border-radius: 4px;
}

.dashboard-container .rft-percentage {
  width: 60px;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

/* Trend Chart */
.dashboard-container .trend-chart {
  margin-top: 16px;
  height: 240px;
  display: flex;
  flex-direction: column;
}

.dashboard-container .trend-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.dashboard-container .trend-label {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.dashboard-container .trend-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding-top: 20px;
}

.dashboard-container .trend-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.dashboard-container .trend-bar {
  width: 24px;
  border-radius: 4px 4px 0 0;
}

.dashboard-container .trend-value {
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
}`);

console.log('Vercel setup completed successfully!');