import React from 'react';

// Widget component
const Widget = ({ 
  children, 
  title, 
  size = 'medium', 
  onRefresh = null,
  onExpand = null,
  expanded = false
}) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(title.replace(/\\s+/g, '-').toLowerCase());
    }
  };
  
  const handleExpand = () => {
    if (onExpand) {
      onExpand(title.replace(/\\s+/g, '-').toLowerCase());
    }
  };

  // Apply CSS classes based on widget size and expansion state
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-4',
    full: 'col-span-1 md:col-span-4'
  };
  
  const widgetClasses = `widget ${sizeClasses[size] || 'col-span-1'} ${expanded ? 'expanded' : ''}`;

  return (
    <div className={widgetClasses}>
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        <div className="widget-actions">
          {onExpand && (
            <button className="expand-widget-button" onClick={handleExpand} title={expanded ? "Collapse" : "Expand"}>
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
                {expanded ? (
                  <>
                    <polyline points="4 14 10 14 10 20"></polyline>
                    <polyline points="20 10 14 10 14 4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </>
                ) : (
                  <>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </>
                )}
              </svg>
            </button>
          )}
          
          {onRefresh && (
            <button className="refresh-widget-button" onClick={handleRefresh}>
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
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

// Main dashboard grid
const DashboardGrid = ({ children, responsive = true, className = '' }) => {
  return (
    <div className={`dashboard-grid ${responsive ? 'responsive' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Add Widget as a static property
DashboardGrid.Widget = Widget;

export default DashboardGrid; 