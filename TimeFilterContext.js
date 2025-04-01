import React, { createContext, useContext } from 'react';

console.log('TimeFilterContext file loaded');

const TimeFilterContext = createContext({
  filterType: '6m',
  dateRange: { start: new Date(), end: new Date() },
  displayRange: 'Last 6 months',
  changeFilterType: () => {},
  filterDataByTimeRange: (data) => data
});

export const useTimeFilterContext = () => useContext(TimeFilterContext);
export const useTimeFilter = useTimeFilterContext;

export const TimeFilterProvider = ({ children }) => {
  console.log('TimeFilterProvider rendering');
  
  return (
    <TimeFilterContext.Provider value={{
      filterType: '6m',
      dateRange: { start: new Date(), end: new Date() },
      displayRange: 'Last 6 months',
      changeFilterType: () => {
        console.log('changeFilterType called');
      },
      filterDataByTimeRange: (data) => {
        console.log('filterDataByTimeRange called');
        return data;
      }
    }}>
      {children}
    </TimeFilterContext.Provider>
  );
};

export default TimeFilterContext; 