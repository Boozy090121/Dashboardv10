import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useStorageContext } from './StorageProvider';

// Create context for time filtering
const TimeFilterContext = createContext(null);

// Custom hook for components to access the time filter context
export const useTimeFilterContext = () => {
  const context = useContext(TimeFilterContext);
  if (!context) {
    throw new Error('useTimeFilterContext must be used within a TimeFilterProvider');
  }
  return context;
};

export const TimeFilterProvider = ({ children }) => {
  const { getItem, setItem } = useStorageContext();
  
  // Initialize time range from localStorage or default to 6m
  const [timeRange, setTimeRange] = useState(() => {
    return getItem('time-filter-range', '6m'); // Default to 6 months
  });
  
  // Initialize custom date range if saved
  const [customDateRange, setCustomDateRange] = useState(() => {
    return getItem('time-filter-custom-range', {
      start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days ago
      end: new Date().toISOString().split('T')[0] // Today
    });
  });
  
  // Save time range to localStorage when it changes
  useEffect(() => {
    setItem('time-filter-range', timeRange);
  }, [timeRange, setItem]);
  
  // Save custom date range to localStorage when it changes
  useEffect(() => {
    setItem('time-filter-custom-range', customDateRange);
  }, [customDateRange, setItem]);
  
  // Get date range based on selected timeRange
  const getDateRange = useCallback(() => {
    const today = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '12m':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'custom':
        return {
          start: new Date(customDateRange.start),
          end: new Date(customDateRange.end)
        };
      default:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
    }
    
    return {
      start: startDate,
      end: today
    };
  }, [timeRange, customDateRange]);
  
  // Format a date range for display
  const formatDateRange = useCallback(() => {
    const { start, end } = getDateRange();
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [getDateRange]);
  
  return (
    <TimeFilterContext.Provider value={{
      timeRange,
      setTimeRange,
      customDateRange,
      setCustomDateRange,
      getDateRange,
      formatDateRange
    }}>
      {children}
    </TimeFilterContext.Provider>
  );
};

export default TimeFilterContext; 