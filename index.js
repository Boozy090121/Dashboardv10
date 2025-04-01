// This is a test comment to verify edits are being applied
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './enhanced-components.css';
import './pci-enhanced-styles.css';  // Moved to end to ensure it has highest priority

// Initialize the application with React 18 syntax
// Not using StrictMode to avoid double rendering effects
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 