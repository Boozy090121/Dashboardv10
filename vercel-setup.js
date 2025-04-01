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

// Define the list of required component files
const componentFiles = [
  { name: 'DataContext.js', path: 'src/DataContext.js', content: fs.readFileSync(path.join(__dirname, 'src/DataContext.js'), 'utf8') },
  { name: 'App.js', path: 'src/App.js', content: fs.readFileSync(path.join(__dirname, 'src/App.js'), 'utf8') },
  { name: 'Dashboard.js', path: 'src/Dashboard.js', content: fs.readFileSync(path.join(__dirname, 'src/Dashboard.js'), 'utf8') },
  { name: 'index.js', path: 'src/index.js', content: fs.readFileSync(path.join(__dirname, 'src/index.js'), 'utf8') },
  { name: 'index.css', path: 'src/index.css', content: fs.readFileSync(path.join(__dirname, 'src/index.css'), 'utf8') },
  { name: 'MetricCard.js', path: 'src/MetricCard.js', content: fs.readFileSync(path.join(__dirname, 'src/MetricCard.js'), 'utf8') },
  { name: 'AdvancedChart.js', path: 'src/AdvancedChart.js', content: fs.readFileSync(path.join(__dirname, 'src/AdvancedChart.js'), 'utf8') },
  { name: 'DashboardGrid.js', path: 'src/DashboardGrid.js', content: fs.readFileSync(path.join(__dirname, 'src/DashboardGrid.js'), 'utf8') }
];

// Ensure src directory exists
const srcDir = path.join(__dirname, 'src');
if (!fs.existsSync(srcDir)) {
  console.log('Creating src directory...');
  fs.mkdirSync(srcDir, { recursive: true });
}

// Copy each file to the destination if it doesn't exist
componentFiles.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  const fileDir = path.dirname(filePath);
  
  // Ensure the directory exists
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }
  
  // Write the file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.content);
    console.log(`Created ${file.name}`);
  }
});

console.log('Vercel build preparation completed successfully!'); 