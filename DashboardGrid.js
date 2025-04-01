import React from 'react';

// Widget subcomponent for DashboardGrid
const Widget = ({ title, children, size = 'medium', onRefresh }) => {
  const sizeClass = 
    size === 'small' ? 'col-span-1' : 
    size === 'medium' ? 'col-span-2' : 
    size === 'large' ? 'col-span-4' : 
    'col-span-2';

  return (
    <div className={`widget ${sizeClass}`}>
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="refresh-widget-button"
            aria-label="Refresh widget"
          >
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

// Main DashboardGrid component
const DashboardGrid = ({ children }) => {
  return (
    <div className="dashboard-grid responsive">
      {children}
    </div>
  );
};

// Attach the Widget component to DashboardGrid
DashboardGrid.Widget = Widget;

export default DashboardGrid; 