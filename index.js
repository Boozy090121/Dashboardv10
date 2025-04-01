// This is a test comment to verify edits are being applied
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './enhanced-components.css';
import './pci-enhanced-styles.css';  // Moved to end to ensure it has highest priority
import './tab-fix.css';  // Added tab-fix.css last to ensure it overrides everything else

// Add global error handler
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  // Report critical errors to UI
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Error')) {
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'fixed';
    errorContainer.style.bottom = '20px';
    errorContainer.style.right = '20px';
    errorContainer.style.background = '#f44336';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '10px 20px';
    errorContainer.style.borderRadius = '4px';
    errorContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    errorContainer.style.zIndex = '9999';
    errorContainer.style.maxWidth = '80%';
    errorContainer.style.overflow = 'auto';
    errorContainer.innerText = `Error: ${args.join(' ')}`;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.style.marginLeft = '10px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => document.body.removeChild(errorContainer);
    errorContainer.appendChild(closeBtn);
    
    document.body.appendChild(errorContainer);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(errorContainer)) {
        document.body.removeChild(errorContainer);
      }
    }, 10000);
  }
};

// Add custom event listener for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Check for critical browser features
const debugInfo = {
  userAgent: navigator.userAgent,
  browserSupport: {
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    fetch: !!window.fetch,
    promises: !!window.Promise,
    objectAssign: !!Object.assign
  }
};

console.log('Browser capabilities:', debugInfo);

// Initialize the application with React 18 syntax
// Not using StrictMode to avoid double rendering effects
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Add a reload button for emergencies
setTimeout(() => {
  const debugContainer = document.createElement('div');
  debugContainer.style.position = 'fixed';
  debugContainer.style.top = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.zIndex = '9999';
  
  const reloadButton = document.createElement('button');
  reloadButton.innerText = 'Reload Page';
  reloadButton.style.backgroundColor = '#CC2030';
  reloadButton.style.color = 'white';
  reloadButton.style.border = 'none';
  reloadButton.style.padding = '8px 12px';
  reloadButton.style.borderRadius = '4px';
  reloadButton.style.cursor = 'pointer';
  reloadButton.style.fontSize = '12px';
  reloadButton.onclick = () => window.location.reload(true); // Force reload from server
  
  debugContainer.appendChild(reloadButton);
  document.body.appendChild(debugContainer);
}, 5000); 