import React, { createContext, useContext } from 'react';

console.log('DataContext file loaded');

const DataContext = createContext(null);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  console.log('DataProvider rendering');
  
  // Simplified mock data
  const mockData = {
    overview: {
      totalRecords: 1245,
      totalLots: 78,
      overallRFTRate: 92.3,
    },
    processMetrics: {
      totalCycleTime: {
        average: 21.8,
      }
    },
    commercialProcess: {
      processFlow: [
        { name: "Assembly", avgDuration: 3.5, deviationRate: "5.1" },
        { name: "Quality Control", avgDuration: 2.8, deviationRate: "8.2" },
      ]
    },
    lotData: {
      lots: [
        { id: "LOT001", status: "Complete", rftRate: 95.7 },
        { id: "LOT002", status: "In Progress", rftRate: 91.2 }
      ]
    },
    commentAnalysis: {
      totalComments: 482,
      categories: [
        { name: "Quality", count: 156 },
        { name: "Delivery", count: 98 }
      ]
    }
  };

  const contextValue = {
    isLoading: false,
    error: null,
    data: mockData,
    lastUpdated: new Date(),
    refreshData: () => console.log('Mock refresh called')
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 