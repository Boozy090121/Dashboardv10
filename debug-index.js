// Debug entry point for simplified app testing
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