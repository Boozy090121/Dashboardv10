import DashboardHeader from './DashboardHeader';
import React, { useMemo } from 'react';
import { useDataContext } from './DataContext';

const Dashboard = () => {
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  
  // Memoize calculated values to prevent recalculations on re-render
  const metrics = useMemo(() => {
    if (!data || !data.overview) {
      return {
        totalRecords: 0,
        totalLots: 0,
        rftRate: 0,
        issueCount: 0
      };
    }
    
    return {
      totalRecords: data.overview.totalRecords || 0,
      totalLots: data.overview.totalLots || 0,
      rftRate: data.overview.overallRFTRate || 0,
      issueCount: data.overview.issueDistribution 
        ? data.overview.issueDistribution.reduce((sum, item) => sum + item.value, 0) 
        : 0
    };
  }, [data]);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !data) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={refreshData} className="refresh-button">
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <DashboardHeader title="Manufacturing Dashboard" onRefresh={refreshData} lastUpdated={lastUpdated} timeRange={timeRange} setTimeRange={setTimeRange} />
        <h1>Manufacturing Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={refreshData} className="refresh-button">
            Refresh Data
          </button>
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Records</h3>
          <div className="metric-value">{metrics.totalRecords.toLocaleString()}</div>
        </div>
        
        <div className="metric-card">
          <h3>Total Lots</h3>
          <div className="metric-value">{metrics.totalLots.toLocaleString()}</div>
        </div>
        
        <div className="metric-card">
          <h3>RFT Rate</h3>
          <div className="metric-value">{metrics.rftRate.toFixed(1)}%</div>
        </div>
        
        <div className="metric-card">
          <h3>Quality Issues</h3>
          <div className="metric-value">{metrics.issueCount.toLocaleString()}</div>
        </div>
      </div>
      
      {data && data.overview && data.overview.issueDistribution && (
        <div className="chart-container">
          <h3>Issue Distribution</h3>
          <div className="issue-bars">
            {data.overview.issueDistribution.map((issue, index) => (
              <div key={index} className="issue-bar-container">
                <div className="issue-bar-label">{issue.name}</div>
                <div className="issue-bar" style={{ width: `${Math.min(100, issue.value / metrics.issueCount * 100)}%` }}>
                  <span className="issue-bar-value">{issue.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && <div className="overlay-loading">Refreshing...</div>}
    </div>
  );
};

export default Dashboard; 
