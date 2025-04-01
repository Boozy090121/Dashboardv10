import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Create the data context
const DataContext = createContext(null);

// Custom hook for components to access the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Single state object to reduce state updates
  const [state, setState] = useState({
    isLoading: true,
    error: null,
    data: null,
    lastUpdated: null
  });

  // Keep track of fetch AbortController
  const abortControllerRef = useRef(null);
  
  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load data function wrapped in useCallback
  const loadData = useCallback(async () => {
    // If there's already a fetch in progress, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for this fetch
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    // Update loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Define possible paths to try for the data file
    const dataPaths = [
      `${window.location.origin}/data/complete-data.json`,
      `${window.location.origin}/public/data/complete-data.json`,
      `/data/complete-data.json`, 
      `./data/complete-data.json`
    ];
    
    // Try each path until one works
    let success = false;
    
    for (const dataPath of dataPaths) {
      if (success) break;
      
      try {
        console.log(`Attempting to fetch data from: ${dataPath}`);
        const response = await fetch(dataPath, { signal });
        
        // Check if component is still mounted
        if (!isMountedRef.current) return;
        
        if (!response.ok) {
          console.warn(`Failed to load from ${dataPath}: ${response.status} ${response.statusText}`);
          continue; // Try next path
        }
        
        // If we reach here, the fetch was successful
        const data = await response.json();
        success = true;
        
        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          console.log(`Dashboard data loaded successfully from ${dataPath}`);
          
          // Check for processFlow data specifically
          if (data && data.commercialProcess && data.commercialProcess.processFlow) {
            console.log('ProcessFlow data found:', data.commercialProcess.processFlow);
          } else {
            console.warn('ProcessFlow data not found in loaded JSON!');
            if (data && data.commercialProcess) {
              console.log('commercialProcess keys:', Object.keys(data.commercialProcess));
            } else if (data) {
              console.log('Top-level keys:', Object.keys(data));
            }
          }
          
          setState({
            isLoading: false,
            error: null,
            data,
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        // Don't update state if the error was due to an aborted fetch
        if (error.name === 'AbortError') {
          console.log('Data fetch was aborted');
          return;
        }
        
        console.error(`Error loading data from ${dataPath}:`, error);
        // Continue to try next path instead of failing immediately
      }
    }
    
    // If we tried all paths and none worked, set an error
    if (!success && isMountedRef.current) {
      console.error('Failed to load data from any source');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load dashboard data after trying multiple sources'
      }));
      
      // As a last resort, use static data
      const staticData = {
        commercialProcess: {
          processFlow: [
            { "name": "Assembly", "count": 78, "avgDuration": 3.5, "deviationRate": "5.1" },
            { "name": "Quality Control", "count": 76, "avgDuration": 2.8, "deviationRate": "8.2" },
            { "name": "Packaging", "count": 74, "avgDuration": 2.4, "deviationRate": "4.1" },
            { "name": "Final Review", "count": 72, "avgDuration": 1.8, "deviationRate": "2.8" }
          ]
        }
      };
      
      console.log('Using static fallback data');
      setState(prev => ({
        ...prev,
        data: staticData,
        error: 'Using fallback data - some features may be limited'
      }));
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data function
  const refreshData = useCallback(() => {
    console.log('Manual refresh requested');
    loadData();
  }, [loadData]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    lastUpdated: state.lastUpdated,
    refreshData
  }), [
    state.isLoading,
    state.error,
    state.data,
    state.lastUpdated,
    refreshData
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext; 