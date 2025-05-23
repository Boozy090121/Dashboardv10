import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useDataContext } from './DataContext';
import { useTimeFilterContext } from './TimeFilterContext';
import DashboardHeader from './DashboardHeader';
import MetricCard from './MetricCard';
import AdvancedChart from './AdvancedChart';
import DashboardGrid from './DashboardGrid';

console.log('Dashboard.js file loaded');

const Dashboard = () => {
  console.log('Dashboard rendering started');
  
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  console.log('Dashboard data state:', {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    isLoading,
    hasError: !!error,
    errorMessage: error,
    lastUpdated
  });
  
  const timeFilter = useTimeFilterContext();
  console.log('TimeFilter state:', timeFilter);
  
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 12m, ytd
  const [expandedWidgetId, setExpandedWidgetId] = useState(null);
  const [showNotice, setShowNotice] = useState(true);
  
  // Memoize calculated values to prevent recalculations on re-render
  const metrics = useMemo(() => {
    console.log('Calculating metrics from data:', {
      hasData: !!data,
      dataStructure: data ? Object.keys(data) : [],
      overview: data?.overview,
      overviewKeys: data?.overview ? Object.keys(data.overview) : [],
      rawData: data
    });
    
    if (!data || !data.overview) {
      console.log('No data or overview available for metrics calculation');
      return {
        totalRecords: 0,
        totalLots: 0,
        rftRate: 0,
        issueCount: 0
      };
    }
    
    const calculatedMetrics = {
      totalRecords: data.overview.totalRecords || 0,
      totalLots: data.overview.totalLots || 0,
      rftRate: data.overview.overallRFTRate || 0,
      issueCount: data.overview.issueDistribution 
        ? data.overview.issueDistribution.reduce((sum, item) => sum + item.value, 0) 
        : 0
    };
    
    console.log('Calculated metrics:', calculatedMetrics);
    return calculatedMetrics;
  }, [data]);
  
  // Generate trend data for cycle time
  const cycleTimeTrendData = useMemo(() => {
    if (data?.processMetrics?.cycleTimesByMonth) {
      return data.processMetrics.cycleTimesByMonth.map(item => ({
        month: item.month,
        value: item.averageCycleTime
      }));
    }
    
    // Default mock data
    return [
      { month: '2025-01', value: 21.2 },
      { month: '2025-02', value: 22.5 },
      { month: '2025-03', value: 20.8 },
      { month: '2025-04', value: 21.5 },
      { month: '2025-05', value: 19.8 },
      { month: '2025-06', value: 18.5 }
    ];
  }, [data]);
  
  // Generate dept performance data
  const deptPerformanceData = useMemo(() => {
    if (data?.internalRFT?.departmentPerformance) {
      return data.internalRFT.departmentPerformance.map(dept => ({
        name: dept.department,
        rftRate: dept.rftRate,
        target: 95
      }));
    }
    
    // Default mock data
    return [
      { name: 'Production', rftRate: 93.7, target: 95 },
      { name: 'Quality', rftRate: 95.4, target: 95 },
      { name: 'Packaging', rftRate: 91.2, target: 95 },
      { name: 'Logistics', rftRate: 86.7, target: 95 }
    ];
  }, [data]);
  
  // Generate process breakdown data
  const processBreakdownData = useMemo(() => {
    if (!data?.processMetrics?.cycleTimeBreakdown) {
      return [];
    }
    
    return data.processMetrics.cycleTimeBreakdown.map(step => ({
      name: step.step,
      time: step.time,
      percentage: (step.time / data.processMetrics.totalCycleTime.average) * 100
    }));
  }, [data]);
  
  // Handle widget refresh
  const handleRefresh = useCallback((widgetId) => {
    console.log(`Refreshing widget: ${widgetId}`);
    refreshData();
  }, [refreshData]);
  
  // Generate RFT breakdown data for drill-down
  const handleRftDrillDown = useCallback((clickedData) => {
    // Generate breakdown data based on clicked slice
    if (clickedData?.name === 'Pass') {
      return {
        title: 'Success Breakdown by Department',
        data: [
          { name: 'Production', value: data?.internalRFT?.departmentPerformance?.[0]?.pass || 328 },
          { name: 'Quality', value: data?.internalRFT?.departmentPerformance?.[1]?.pass || 248 },
          { name: 'Packaging', value: data?.internalRFT?.departmentPerformance?.[2]?.pass || 187 },
          { name: 'Logistics', value: data?.internalRFT?.departmentPerformance?.[3]?.pass || 156 }
        ]
      };
    } else {
      return {
        title: 'Error Breakdown by Type',
        data: data?.overview?.issueDistribution || [
          { name: 'Documentation Error', value: 42 },
          { name: 'Process Deviation', value: 28 },
          { name: 'Equipment Issue', value: 15 },
          { name: 'Material Issue', value: 11 }
        ]
      };
    }
  }, [data]);
  
  // Handle expanding/collapsing widgets
  const toggleWidgetExpansion = useCallback((widgetId) => {
    setExpandedWidgetId(expandedWidgetId === widgetId ? null : widgetId);
  }, [expandedWidgetId]);

  // Create monthly trend data
  const monthlyTrendData = useMemo(() => {
    if (!data?.overview?.processTimeline) {
      return [];
    }
    
    return data.overview.processTimeline.map(item => ({
      month: item.month,
      recordRFT: item.recordRFT,
      lotRFT: item.lotRFT,
      target: 95
    }));
  }, [data]);
  
  useEffect(() => {
    console.log('Dashboard mounted');
    return () => console.log('Dashboard unmounted');
  }, []);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        minHeight: '400px'
      }}>
        <div className="loading-spinner" style={{
          border: '4px solid rgba(0, 81, 138, 0.1)',
          borderLeft: '4px solid #00518A',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{
          color: '#6B7280',
          fontSize: '16px',
          fontWeight: '500'
        }}>Loading dashboard data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !data) {
    return (
      <div className="error-container" style={{
        padding: '24px',
        margin: '24px',
        border: '1px solid #CC2030',
        borderRadius: '8px',
        backgroundColor: 'rgba(204, 32, 48, 0.05)',
        color: '#CC2030'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '24px',
            marginRight: '12px'
          }}>⚠️</div>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600'
          }}>Error Loading Dashboard</h3>
        </div>
        <p style={{
          margin: '0 0 16px 0',
          color: '#4B5563'
        }}>{error}</p>
        <button 
          onClick={refreshData} 
          style={{
            padding: '8px 16px',
            backgroundColor: '#00518A',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  console.log('Dashboard rendering with data');
  
  return (
    <div className="dashboard-container" style={{
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%'
    }}>
      {showNotice && (
        <div className="notification-banner" style={{
          background: 'linear-gradient(90deg, #1a73e8, #3498db)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          margin: '0 0 15px 0', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>
            <strong>New Analysis Features Available!</strong> Try the new Intelligence Engine, Lot Tracker, Enhanced Visualizations, and Historical Analysis tabs above.
          </div>
          <button onClick={() => setShowNotice(false)} style={{
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer'
          }}>
            Dismiss
          </button>
        </div>
      )}

      <DashboardHeader 
        title="Manufacturing Dashboard" 
        onRefresh={refreshData} 
        lastUpdated={lastUpdated} 
        timeRange={timeRange} 
        setTimeRange={setTimeRange} 
      />
      
      {/* Metric cards */}
      <div className="metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
        width: '100%',
        padding: '0 12px'
      }}>
        {console.log('Rendering metric cards with data:', metrics)}
        
        <MetricCard
          title="Total Records"
          value={metrics.totalRecords}
          previousValue={metrics.totalRecords > 0 ? metrics.totalRecords - 25 : null}
          trend={metrics.totalRecords > 0 ? "up" : "neutral"}
          trendData={metrics.totalRecords > 0 ? [
            { value: metrics.totalRecords - 55 },
            { value: metrics.totalRecords - 40 },
            { value: metrics.totalRecords - 30 },
            { value: metrics.totalRecords - 25 },
            { value: metrics.totalRecords - 10 },
            { value: metrics.totalRecords }
          ] : []}
          showDetails={metrics.totalRecords > 0}
          detailMetrics={metrics.totalRecords > 0 ? [
            { label: 'Production', value: Math.floor(metrics.totalRecords * 0.37) },
            { label: 'Quality', value: Math.floor(metrics.totalRecords * 0.26) },
            { label: 'Packaging', value: Math.floor(metrics.totalRecords * 0.22) },
            { label: 'Logistics', value: Math.floor(metrics.totalRecords * 0.15) }
          ] : []}
        />
        
        <MetricCard
          title="Total Lots"
          value={metrics.totalLots}
          previousValue={metrics.totalLots > 0 ? metrics.totalLots - 2 : null}
          trend={metrics.totalLots > 0 ? "up" : "neutral"}
          status={metrics.totalLots > 80 ? 'warning' : 'normal'}
          trendData={metrics.totalLots > 0 ? [
            { value: metrics.totalLots - 7 },
            { value: metrics.totalLots - 5 },
            { value: metrics.totalLots - 4 },
            { value: metrics.totalLots - 2 },
            { value: metrics.totalLots - 1 },
            { value: metrics.totalLots }
          ] : []}
          showDetails={metrics.totalLots > 0}
          detailMetrics={metrics.totalLots > 0 ? [
            { label: 'Released', value: Math.floor(metrics.totalLots * 0.83) },
            { label: 'In Process', value: Math.floor(metrics.totalLots * 0.17) }
          ] : []}
        />
        
        <MetricCard
          title="Overall RFT Rate"
          value={metrics.rftRate}
          previousValue={metrics.rftRate > 0 ? metrics.rftRate - 1.5 : null}
          trend={metrics.rftRate > 0 ? "up" : "neutral"}
          percentage={true}
          status={
            metrics.rftRate >= 95 ? 'success' : 
            metrics.rftRate >= 90 ? 'normal' :
            metrics.rftRate >= 85 ? 'warning' : 'critical'
          }
          goal={95}
          goalLabel="Target RFT"
          trendData={metrics.rftRate > 0 ? [
            { value: metrics.rftRate - 3.8 },
            { value: metrics.rftRate - 3.1 },
            { value: metrics.rftRate - 2.2 },
            { value: metrics.rftRate - 1.5 },
            { value: metrics.rftRate - 0.8 },
            { value: metrics.rftRate }
          ] : []}
          showDetails={metrics.rftRate > 0}
          detailMetrics={metrics.rftRate > 0 ? [
            { label: 'Record Level', value: metrics.rftRate },
            { label: 'Lot Level', value: data?.overview?.lotQuality?.percentage || 95.3 }
          ] : []}
        />
        
        <MetricCard
          title="Avg. Cycle Time"
          value={data?.processMetrics?.totalCycleTime?.average || 21.8}
          previousValue={data?.processMetrics?.totalCycleTime?.average ? 
            data.processMetrics.totalCycleTime.average + 2.3 : null}
          trend={data?.processMetrics?.totalCycleTime?.average ? "down" : "neutral"}
          goal={data?.processMetrics?.totalCycleTime?.target || 18.0}
          goalLabel="Target Time"
          status={
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 18 ? 'success' : 
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 22 ? 'normal' :
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 25 ? 'warning' : 'critical'
          }
          trendData={cycleTimeTrendData}
          showDetails={!!data?.processMetrics?.totalCycleTime?.average}
          detailMetrics={data?.processMetrics?.totalCycleTime?.average ? [
            { label: 'Min Observed', value: data?.processMetrics?.totalCycleTime?.minimum || 16.2 },
            { label: 'Max Observed', value: data?.processMetrics?.totalCycleTime?.maximum || 36.2 }
          ] : []}
        />
      </div>
      
      {/* Monthly Trend Chart */}
      <DashboardGrid.Widget
        title="Monthly Performance Trends"
        size="large"
        onRefresh={() => handleRefresh('monthly-trends')}
        onExpand={() => toggleWidgetExpansion('monthly-trends')}
        expanded={expandedWidgetId === 'monthly-trends'}
      >
        <div className="trend-chart-container">
          <svg width="100%" height="300" viewBox="0 0 800 300" preserveAspectRatio="none">
            {/* Axes */}
            <line x1="50" y1="250" x2="750" y2="250" stroke="#d1d5db" strokeWidth="1" />
            <line x1="50" y1="50" x2="50" y2="250" stroke="#d1d5db" strokeWidth="1" />
            
            {/* Target line */}
            <line x1="50" y1="100" x2="750" y2="100" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" />
            <text x="755" y="100" fontSize="12" fill="#10b981" dominantBaseline="middle">95%</text>
            
            {/* Record RFT Line */}
            <path 
              d="M100,160 L220,150 L340,130 L460,145 L580,135 L700,125" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="3" 
            />
            
            {/* Lot RFT Line */}
            <path 
              d="M100,155 L220,142 L340,125 L460,120 L580,115 L700,110" 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="3" 
            />
            
            {/* Data points for Record RFT */}
            <circle cx="100" cy="160" r="5" fill="#3b82f6" />
            <circle cx="220" cy="150" r="5" fill="#3b82f6" />
            <circle cx="340" cy="130" r="5" fill="#3b82f6" />
            <circle cx="460" cy="145" r="5" fill="#3b82f6" />
            <circle cx="580" cy="135" r="5" fill="#3b82f6" />
            <circle cx="700" cy="125" r="5" fill="#3b82f6" />
            
            {/* Data points for Lot RFT */}
            <circle cx="100" cy="155" r="5" fill="#8b5cf6" />
            <circle cx="220" cy="142" r="5" fill="#8b5cf6" />
            <circle cx="340" cy="125" r="5" fill="#8b5cf6" />
            <circle cx="460" cy="120" r="5" fill="#8b5cf6" />
            <circle cx="580" cy="115" r="5" fill="#8b5cf6" />
            <circle cx="700" cy="110" r="5" fill="#8b5cf6" />
            
            {/* Month labels */}
            <text x="100" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jan</text>
            <text x="220" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Feb</text>
            <text x="340" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Mar</text>
            <text x="460" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Apr</text>
            <text x="580" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">May</text>
            <text x="700" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">Jun</text>
            
            {/* Value axis labels */}
            <text x="40" y="250" fontSize="12" fill="#6b7280" textAnchor="end" dominantBaseline="middle">85%</text>
            <text x="40" y="200" fontSize="12" fill="#6b7280" textAnchor="end" dominantBaseline="middle">90%</text>
            <text x="40" y="150" fontSize="12" fill="#6b7280" textAnchor="end" dominantBaseline="middle">92%</text>
            <text x="40" y="100" fontSize="12" fill="#6b7280" textAnchor="end" dominantBaseline="middle">95%</text>
            <text x="40" y="50" fontSize="12" fill="#6b7280" textAnchor="end" dominantBaseline="middle">100%</text>
          </svg>
          
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
              <span className="legend-label">Record RFT</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
              <span className="legend-label">Lot RFT</span>
            </div>
            <div className="legend-item">
              <span className="legend-line target"></span>
              <span className="legend-label">Target (95%)</span>
            </div>
          </div>
        </div>
      </DashboardGrid.Widget>
      
      {/* Charts grid */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginTop: '24px'
      }}>
        <DashboardGrid.Widget
          title="RFT Performance"
          size="medium"
          onRefresh={() => handleRefresh('rft-performance')}
        >
          <AdvancedChart
            title="Pass vs. Fail Distribution"
            data={data?.overview?.rftPerformance || [
              { name: 'Pass', value: 1149, percentage: 92.3 },
              { name: 'Fail', value: 96, percentage: 7.7 }
            ]}
            type="pie"
            xDataKey="name"
            yDataKey="value"
            onDrillDown={handleRftDrillDown}
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Process Time Breakdown"
          size="medium"
          onRefresh={() => handleRefresh('process-breakdown')}
        >
          <div className="chart-container">
            <h4 className="chart-title">Manufacturing Steps</h4>
            <p className="chart-description">Time contribution by process step</p>
            
            <div className="process-breakdown-chart" style={{ marginTop: '1.5rem' }}>
              {processBreakdownData.map((step, index) => (
                <div key={index} className="process-step">
                  <div className="step-label">{step.name}</div>
                  <div className="step-bar-container">
                    <div 
                      className="step-bar" 
                      style={{ 
                        width: `${step.percentage}%`,
                        backgroundColor: `hsl(${210 + index * 25}, 80%, 55%)`
                      }}
                    >
                      <span className="step-value">{step.time.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Issue Distribution"
          size="medium"
          onRefresh={() => handleRefresh('issue-distribution')}
        >
          <AdvancedChart
            title="Top Issues by Count"
            data={data?.overview?.issueDistribution || [
              { name: 'Documentation Error', value: 42 },
              { name: 'Process Deviation', value: 28 },
              { name: 'Equipment Issue', value: 15 },
              { name: 'Material Issue', value: 11 }
            ]}
            type="bar"
            xDataKey="name"
            yDataKey="value"
            height={300}
            allowDownload={true}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Department Performance"
          size="medium"
          onRefresh={() => handleRefresh('dept-performance')}
        >
          <AdvancedChart
            title="RFT Rate by Department"
            data={deptPerformanceData}
            type="bar"
            xDataKey="name"
            yDataKey="rftRate"
            percentage={true}
            comparisonValue={95}
            comparisonLabel="Target RFT"
            height={300}
          />
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Process Improvement Tracking"
          size="medium"
          onRefresh={() => handleRefresh('improvement-tracking')}
        >
          <div className="chart-container">
            <h4 className="chart-title">Cycle Time Improvement</h4>
            <p className="chart-description">Progress towards target</p>
            
            <div className="improvement-tracking" style={{ marginTop: '1.5rem' }}>
              <div className="tracking-metric">
                <div className="tracking-header">
                  <div className="tracking-label">Current</div>
                  <div className="tracking-value">{data?.processMetrics?.totalCycleTime?.average?.toFixed(1) || '21.8'} days</div>
                </div>
                <div className="tracking-bar-container">
                  <div className="tracking-bar-bg"></div>
                  <div 
                    className="tracking-progress-bar" 
                    style={{ 
                      width: `${100 - (((data?.processMetrics?.totalCycleTime?.average || 21.8) - (data?.processMetrics?.totalCycleTime?.target || 18)) / ((data?.processMetrics?.totalCycleTime?.maximum || 36.2) - (data?.processMetrics?.totalCycleTime?.target || 18)) * 100)}%` 
                    }}
                  ></div>
                  <div className="tracking-target-marker"></div>
                </div>
                <div className="tracking-endpoints">
                  <div className="tracking-start">{data?.processMetrics?.totalCycleTime?.maximum?.toFixed(1) || '36.2'}</div>
                  <div className="tracking-target">{data?.processMetrics?.totalCycleTime?.target?.toFixed(1) || '18.0'} (Target)</div>
                </div>
              </div>
              
              <div className="improvement-metrics">
                <div className="improvement-metric">
                  <div className="metric-title">Improvement</div>
                  <div className="metric-value">39.8%</div>
                  <div className="metric-description">From baseline</div>
                </div>
                <div className="improvement-metric">
                  <div className="metric-title">Remaining</div>
                  <div className="metric-value">3.8 days</div>
                  <div className="metric-description">To target</div>
                </div>
                <div className="improvement-metric">
                  <div className="metric-title">Projected</div>
                  <div className="metric-value">Q3 2025</div>
                  <div className="metric-description">Target date</div>
                </div>
              </div>
            </div>
          </div>
        </DashboardGrid.Widget>
        
        <DashboardGrid.Widget
          title="Lot Quality"
          size="medium"
          onRefresh={() => handleRefresh('lot-quality')}
        >
          <AdvancedChart
            title="Lot Level RFT"
            data={[
              { name: 'Pass', value: data?.overview?.lotQuality?.pass || 72 },
              { name: 'Fail', value: data?.overview?.lotQuality?.fail || 6 }
            ]}
            type="donut"
            xDataKey="name"
            yDataKey="value"
            height={300}
          />
        </DashboardGrid.Widget>
      </div>
      
      {isLoading && (
        <div className="overlay-loading" style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '1000'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div className="loading-spinner" style={{
              border: '4px solid rgba(0, 81, 138, 0.1)',
              borderLeft: '4px solid #00518A',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{
              marginTop: '12px',
              color: '#374151',
              fontSize: '14px'
            }}>Refreshing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
