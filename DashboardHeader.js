import React from 'react';

/**
 * DashboardHeader provides the main header for dashboards with title, time controls, and refresh functionality
 */
const DashboardHeader = ({ title, onRefresh, lastUpdated, timeRange, setTimeRange }) => {
  return (
    <div className="dashboard-header">
      <div className="header-with-banner">
        <div className="header-banner novo-gradient"></div>
        <h1>{title || "PCI Analysis Dashboard"}</h1>
      </div>
      
      <div className="dashboard-actions">
        {setTimeRange && (
          <div className="time-filter">
            <div className="time-range-controls">
              {['1m', '3m', '6m', '12m', 'ytd'].map((range) => (
                <button
                  key={range}
                  className={`btn ${timeRange === range ? 'btn-primary' : 'btn-tertiary'} btn-sm`}
                  onClick={() => setTimeRange(range)}
                >
                  {range === 'ytd' ? 'YTD' : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button onClick={onRefresh} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="refresh-icon">
            <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1.06-6.7-2.82"></path>
            <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1.06-6.7 2.82"></path>
            <path d="m3 12 3-3 3 3"></path>
          </svg>
          Refresh Data
        </button>
        
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
