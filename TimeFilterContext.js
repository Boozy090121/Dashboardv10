import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Create time filter context
const TimeFilterContext = createContext(null);

// Custom hook to access the time filter context
export const useTimeFilter = () => {
  const context = useContext(TimeFilterContext);
  if (!context) {
    throw new Error('useTimeFilter must be used within a TimeFilterProvider');
  }
  return context;
};

// Helper function to parse date range from filter type
const getDateRangeFromFilter = (filterType) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filterType) {
    case '1m': {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 1);
      return { start, end: today };
    }
    case '3m': {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 3);
      return { start, end: today };
    }
    case '6m': {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 6);
      return { start, end: today };
    }
    case '12m': {
      const start = new Date(today);
      start.setFullYear(start.getFullYear() - 1);
      return { start, end: today };
    }
    case 'ytd': {
      const start = new Date(today.getFullYear(), 0, 1);
      return { start, end: today };
    }
    case 'q1': {
      const year = today.getFullYear();
      const start = new Date(year, 0, 1);
      const end = new Date(year, 2, 31);
      return { start, end };
    }
    case 'q2': {
      const year = today.getFullYear();
      const start = new Date(year, 3, 1);
      const end = new Date(year, 5, 30);
      return { start, end };
    }
    case 'q3': {
      const year = today.getFullYear();
      const start = new Date(year, 6, 1);
      const end = new Date(year, 8, 30);
      return { start, end };
    }
    case 'q4': {
      const year = today.getFullYear();
      const start = new Date(year, 9, 1);
      const end = new Date(year, 11, 31);
      return { start, end };
    }
    case 'fy': {
      // Using July 1 - June 30 as fiscal year (adjust as needed)
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      let fiscalYearStart, fiscalYearEnd;
      
      if (currentMonth >= 6) { // July - December
        fiscalYearStart = new Date(currentYear, 6, 1);
        fiscalYearEnd = new Date(currentYear + 1, 5, 30);
      } else { // January - June
        fiscalYearStart = new Date(currentYear - 1, 6, 1);
        fiscalYearEnd = new Date(currentYear, 5, 30);
      }
      
      return { start: fiscalYearStart, end: fiscalYearEnd };
    }
    case 'custom':
      // Custom range will be set separately
      return { start: null, end: null };
    default:
      // Default to 6 months
      const start = new Date(today);
      start.setMonth(start.getMonth() - 6);
      return { start, end: today };
  }
};

// Time Filter Provider Component
export const TimeFilterProvider = ({ children }) => {
  const [filterType, setFilterType] = useState('6m');
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  
  // Get the effective date range based on filter type
  const dateRange = useMemo(() => {
    if (filterType === 'custom' && customDateRange.start && customDateRange.end) {
      return customDateRange;
    }
    return getDateRangeFromFilter(filterType);
  }, [filterType, customDateRange]);
  
  // Format for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle filter type change
  const changeFilterType = useCallback((newFilter) => {
    setFilterType(newFilter);
  }, []);
  
  // Handle custom date range change
  const setCustomRange = useCallback((start, end) => {
    setCustomDateRange({ start, end });
    setFilterType('custom');
  }, []);
  
  // Comparison helper
  const getComparisonRange = useCallback(() => {
    const { start, end } = dateRange;
    if (!start || !end) return { start: null, end: null };
    
    const rangeMs = end.getTime() - start.getTime();
    const comparisonEnd = new Date(start);
    const comparisonStart = new Date(new Date(start).getTime() - rangeMs);
    
    return { start: comparisonStart, end: comparisonEnd };
  }, [dateRange]);
  
  // Formatted display string
  const displayRange = useMemo(() => {
    if (filterType === 'custom') {
      if (customDateRange.start && customDateRange.end) {
        return `${formatDate(customDateRange.start)} - ${formatDate(customDateRange.end)}`;
      }
      return 'Custom Range';
    }
    
    if (filterType === 'ytd') {
      return 'Year to Date';
    }
    
    if (filterType === 'fy') {
      return 'Current Fiscal Year';
    }
    
    if (filterType.startsWith('q')) {
      return `Q${filterType.charAt(1)} ${new Date().getFullYear()}`;
    }
    
    // For 1m, 3m, 6m, 12m
    const duration = filterType.charAt(0);
    return `Last ${duration} Month${duration !== '1' ? 's' : ''}`;
  }, [filterType, customDateRange, formatDate]);
  
  // Filter values for API/data filtering
  const filterValues = useMemo(() => {
    return {
      startDate: dateRange.start,
      endDate: dateRange.end,
      filterType,
      isCustomRange: filterType === 'custom',
      comparisonRange: getComparisonRange(),
      displayText: displayRange
    };
  }, [dateRange, filterType, getComparisonRange, displayRange]);
  
  // Check if a specific date is within the selected range
  const isDateInRange = useCallback((date) => {
    if (!dateRange.start || !dateRange.end || !date) return false;
    const checkDate = new Date(date);
    return checkDate >= dateRange.start && checkDate <= dateRange.end;
  }, [dateRange]);
  
  // Filter an array of objects with date properties
  const filterDataByTimeRange = useCallback((dataArray, dateField) => {
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }
    
    if (!dateField || !dateRange.start || !dateRange.end) {
      return dataArray;
    }
    
    return dataArray.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }, [dateRange]);
  
  // Create context value
  const contextValue = useMemo(() => ({
    filterType,
    dateRange,
    filterValues,
    displayRange,
    changeFilterType,
    setCustomRange,
    isDateInRange,
    filterDataByTimeRange,
    getComparisonRange
  }), [
    filterType,
    dateRange,
    filterValues,
    displayRange,
    changeFilterType,
    setCustomRange,
    isDateInRange,
    filterDataByTimeRange,
    getComparisonRange
  ]);
  
  return (
    <TimeFilterContext.Provider value={contextValue}>
      {children}
    </TimeFilterContext.Provider>
  );
};

export default TimeFilterContext; 