// Component Verification Script
// This is just a test script to help debug component loading issues
console.log('Component Verification Script');

try {
  // Check if React is available
  const React = require('react');
  console.log('✅ React is available');

  // Check if components are loadable
  const componentsToCheck = [
    { name: 'App', path: './src/App' },
    { name: 'Dashboard', path: './src/Dashboard' },
    { name: 'ProcessAnalysis', path: './src/ProcessAnalysis' },
    { name: 'LotCorrelationTracker', path: './src/LotCorrelationTracker' },
    { name: 'IntelligenceEngine', path: './src/IntelligenceEngine' },
    { name: 'EnhancedVisualizations', path: './src/EnhancedVisualizations' },
    { name: 'HistoricalAnalysis', path: './src/HistoricalAnalysis' },
    { name: 'TimeFilterContext', path: './src/TimeFilterContext' },
    { name: 'DataContext', path: './src/DataContext' }
  ];

  componentsToCheck.forEach(component => {
    try {
      require(component.path);
      console.log(`✅ ${component.name} loaded successfully`);
    } catch (error) {
      console.error(`❌ ${component.name} failed to load: ${error.message}`);
    }
  });

  // Check if CSS files are available
  const cssFilesToCheck = [
    { name: 'index.css', path: './src/index.css' },
    { name: 'enhanced-components.css', path: './src/enhanced-components.css' }
  ];

  const fs = require('fs');
  cssFilesToCheck.forEach(file => {
    try {
      fs.accessSync(file.path, fs.constants.R_OK);
      console.log(`✅ ${file.name} is accessible`);
    } catch (error) {
      console.error(`❌ ${file.name} is not accessible: ${error.message}`);
    }
  });

  console.log('Component verification completed');
} catch (error) {
  console.error('Verification script error:', error);
} 