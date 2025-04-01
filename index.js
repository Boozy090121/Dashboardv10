import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './enhanced-components.css';

// Initialize the application with React 18 syntax
// Not using StrictMode to avoid double rendering effects
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 