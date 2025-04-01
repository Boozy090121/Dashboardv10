import React from 'react';
import { RefreshCw } from 'lucide-react';

// Widget component
const Widget = ({ children, title, size = 'medium', onRefresh = null }) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(title.replace(/\s+/g, '-').toLowerCase());
    }
  };

  // Apply CSS classes based on widget size
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-4',
    full: 'col-span-1 md:col-span-4'
  };

  return (
    <div className={`widget ${sizeClasses[size] || 'col-span-1'}`}>
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        {onRefresh && (
          <button className="refresh-widget-button" onClick={handleRefresh}>
            <RefreshCw size={16} />
          </button>
        )}
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