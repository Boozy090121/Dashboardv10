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

console.log('Running Vercel build preparation...');

// Ensure directories exist
const dirs = [publicDir, dataDir, srcDir];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating ${dir} directory...`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

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