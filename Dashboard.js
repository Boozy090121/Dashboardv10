import React, { useMemo, useState, useCallback } from 'react';
import { useDataContext } from './DataContext';
import DashboardHeader from './DashboardHeader';
import MetricCard from './MetricCard';
import AdvancedChart from './AdvancedChart';
import DashboardGrid from './DashboardGrid';

const Dashboard = () => {
  const { data, isLoading, error, refreshData, lastUpdated } = useDataContext();
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 12m, ytd
  
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
      <DashboardHeader 
        title="Manufacturing Dashboard" 
        onRefresh={refreshData} 
        lastUpdated={lastUpdated} 
        timeRange={timeRange} 
        setTimeRange={setTimeRange} 
      />
      
      {/* Metric cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Records"
          value={data?.overview?.totalRecords || 1245}
          previousValue={data?.overview?.totalRecords ? data.overview.totalRecords - 25 : 1220}
          trend="up"
          trendData={[
            { value: 1190 },
            { value: 1205 },
            { value: 1215 },
            { value: 1220 },
            { value: 1235 },
            { value: data?.overview?.totalRecords || 1245 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Production', value: 458 },
            { label: 'Quality', value: 326 },
            { label: 'Packaging', value: 278 },
            { label: 'Logistics', value: 183 }
          ]}
        />
        
        <MetricCard
          title="Total Lots"
          value={data?.overview?.totalLots || 78}
          previousValue={data?.overview?.totalLots ? data.overview.totalLots - 2 : 76}
          trend="up"
          status={data?.overview?.totalLots > 80 ? 'warning' : 'normal'}
          trendData={[
            { value: 71 },
            { value: 73 },
            { value: 74 },
            { value: 76 },
            { value: 77 },
            { value: data?.overview?.totalLots || 78 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Released', value: 65 },
            { label: 'In Process', value: 13 }
          ]}
        />
        
        <MetricCard
          title="Overall RFT Rate"
          value={data?.overview?.overallRFTRate || 92.3}
          previousValue={data?.overview?.overallRFTRate ? data.overview.overallRFTRate - 1.5 : 90.8}
          trend="up"
          percentage={true}
          status={
            (data?.overview?.overallRFTRate || 92.3) >= 95 ? 'success' : 
            (data?.overview?.overallRFTRate || 92.3) >= 90 ? 'normal' :
            (data?.overview?.overallRFTRate || 92.3) >= 85 ? 'warning' : 'critical'
          }
          goal={95}
          goalLabel="Target RFT"
          trendData={[
            { value: 88.5 },
            { value: 89.2 },
            { value: 90.1 },
            { value: 90.8 },
            { value: 91.5 },
            { value: data?.overview?.overallRFTRate || 92.3 }
          ]}
          showDetails={true}
          detailMetrics={[
            { label: 'Record Level', value: data?.overview?.overallRFTRate || 92.3 },
            { label: 'Lot Level', value: data?.overview?.lotQuality?.percentage || 95.3 }
          ]}
        />
        
        <MetricCard
          title="Avg. Cycle Time"
          value={data?.processMetrics?.totalCycleTime?.average || 21.8}
          previousValue={data?.processMetrics?.totalCycleTime?.average ? data.processMetrics.totalCycleTime.average + 2.3 : 24.1}
          trend="down"
          goal={data?.processMetrics?.totalCycleTime?.target || 18.0}
          goalLabel="Target Time"
          status={
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 18 ? 'success' : 
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 22 ? 'normal' :
            (data?.processMetrics?.totalCycleTime?.average || 21.8) <= 25 ? 'warning' : 'critical'
          }
          trendData={cycleTimeTrendData}
          showDetails={true}
          detailMetrics={[
            { label: 'Min Observed', value: data?.processMetrics?.totalCycleTime?.minimum || 16.2 },
            { label: 'Max Observed', value: data?.processMetrics?.totalCycleTime?.maximum || 36.2 }
          ]}
        />
      </div>
      
      {/* Charts grid */}
      <DashboardGrid>
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
      </DashboardGrid>
      
      {isLoading && <div className="overlay-loading">Refreshing...</div>}
    </div>
  );
};

export default Dashboard; 
