// Vercel build preparation script
const fs = require('fs');
const path = require('path');

// Define all file paths upfront
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(publicDir, 'data');
const srcDir = path.join(__dirname, 'src');
const dataFile = path.join(dataDir, 'complete-data.json');
const debugIndexFile = path.join(srcDir, 'debug-index.js');
const indexHtmlFile = path.join(publicDir, 'index.html');
const mainIndexFile = path.join(srcDir, 'index.js');
const appFile = path.join(srcDir, 'App.js');
const indexCssFile = path.join(srcDir, 'index.css');

console.log('Running Vercel build preparation...');

// Ensure directories exist
const dirs = [publicDir, dataDir, srcDir];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating ${dir} directory...`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create main index.js
console.log('Creating main index.js...');
fs.writeFileSync(mainIndexFile, `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

// Create App.js
console.log('Creating App.js...');
fs.writeFileSync(appFile, `
import React, { useState } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      <div className="tabs-container">
        <button 
          className={\`tab-button \${activeTab === 'dashboard' ? 'active' : ''}\`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={\`tab-button \${activeTab === 'process-flow' ? 'active' : ''}\`}
          onClick={() => setActiveTab('process-flow')}
        >
          Process Flow
        </button>
      </div>
      <div className="content-container">
        <h1>Manufacturing Dashboard</h1>
        <p>Welcome to the Manufacturing Performance Dashboard</p>
      </div>
    </div>
  );
}

export default App;
`);

// Create index.css
console.log('Creating index.css...');
fs.writeFileSync(indexCssFile, `
:root {
  --primary-color: #1a73e8;
  --secondary-color: #4285f4;
  --background-color: #f5f7fa;
  --text-color: #333333;
  --border-color: #e0e0e0;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background-color);
  color: var(--text-color);
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.tabs-container {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tab-button.active {
  color: var(--primary-color);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.content-container {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
}

p {
  margin: 0;
  color: #666;
}
`);

// Create debug-index.js
console.log('Creating debug-index.js...');
fs.writeFileSync(debugIndexFile, `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

console.log('Debug mode enabled');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
`);

// Create minimal data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  console.log('Creating placeholder data file...');
  fs.writeFileSync(dataFile, JSON.stringify({
    overview: {
      totalRecords: 1245,
      totalLots: 78,
      overallRFTRate: 92.3,
      issueDistribution: [
        { name: "Documentation Error", value: 42 },
        { name: "Process Deviation", value: 28 },
        { name: "Equipment Issue", value: 15 },
        { name: "Material Issue", value: 11 }
      ]
    }
  }, null, 2));
}

// Create index.html with all necessary features
console.log('Creating index.html with all features...');
fs.writeFileSync(indexHtmlFile, `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1a73e8" />
    <meta name="description" content="Manufacturing Dashboard - Performance Metrics" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Mfg Dashboard" />
    <meta name="application-name" content="Manufacturing Dashboard" />
    <meta name="msapplication-TileColor" content="#1a73e8" />
    
    <title>Manufacturing Dashboard</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <link rel="manifest" href="site.webmanifest" crossorigin="use-credentials">
    
    <script>
      // Register service worker if supported
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              console.log('ServiceWorker registration successful');
            })
            .catch(err => {
              console.log('ServiceWorker registration failed: ', err);
            });
        });
      }

      // Set initial tab to Process Flow for testing
      window.location.hash = 'process-flow';
      
      // Add debug listeners for data loading
      window.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, checking for data directory');
        
        // Test if manifest is accessible
        fetch('/site.webmanifest')
          .then(response => {
            console.log('Manifest fetch response:', response.status);
            return response.json();
          })
          .catch(error => {
            console.error('Error fetching manifest:', error);
          });
        
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

// Create placeholder icons if they don't exist
const iconSizes = {
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
  'favicon-32x32.png': 32,
  'favicon-16x16.png': 16,
  'apple-touch-icon.png': 180
};

Object.entries(iconSizes).forEach(([filename, size]) => {
  const iconPath = path.join(publicDir, filename);
  if (!fs.existsSync(iconPath)) {
    console.log(`Creating placeholder icon: ${filename}`);
    // Create a minimal 1x1 pixel PNG as placeholder
    const base64Icon = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const iconBuffer = Buffer.from(base64Icon, 'base64');
    fs.writeFileSync(iconPath, iconBuffer);
  }
});

// Create site.webmanifest for PWA support
console.log('Creating site.webmanifest...');
const manifestContent = {
  "name": "Manufacturing Dashboard",
  "short_name": "Mfg Dashboard",
  "description": "Manufacturing Performance Metrics Dashboard",
  "id": "/",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a73e8",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "android-chrome-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Process Flow",
      "url": "/process-flow",
      "icons": [{ "src": "android-chrome-192x192.png", "sizes": "192x192" }]
    }
  ]
};

// Create the webmanifest file in the public directory
const manifestFile = path.join(publicDir, 'site.webmanifest');
console.log('Writing webmanifest to:', manifestFile);
fs.writeFileSync(manifestFile, JSON.stringify(manifestContent, null, 2));

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