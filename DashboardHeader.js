import React from 'react';

const DashboardHeader = ({ title, onRefresh, lastUpdated, timeRange, setTimeRange }) => {
  return (
    <div className="dashboard-header">
      <div className="header-with-banner">
        <div className="header-banner novo-gradient"></div>
        <h1>{title || "Manufacturing Dashboard"}</h1>
      </div>
      
      <div className="header-actions">
        {setTimeRange && (
          <div className="time-range-controls">
            {['1m', '3m', '6m', '12m', 'ytd'].map((range) => (
              <button
                key={range}
                className={`time-range-button ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        
        <button onClick={onRefresh} className="refresh-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1.06-6.7-2.82"></path>
            <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1.06-6.7 2.82"></path>
            <path d="m3 12 3-3 3 3"></path>
          </svg>
          Refresh Data
        </button>
        
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
