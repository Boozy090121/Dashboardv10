import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

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
    console.log('Starting to load data...', {
      isMounted: isMountedRef.current,
      hasExistingController: !!abortControllerRef.current,
      currentState: state
    });
    
    // If there's already a fetch in progress, abort it
    if (abortControllerRef.current) {
      console.log('Aborting existing fetch request');
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for this fetch
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    // Update loading state
    setState(prev => {
      console.log('Setting loading state, previous state:', prev);
      return { ...prev, isLoading: true, error: null };
    });
    
    try {
      // Try loading from /data/complete-data.json first
      console.log('Attempting to load from /data/complete-data.json');
      const response = await fetch('/data/complete-data.json', { 
        signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log('Component unmounted during fetch, aborting');
        return;
      }
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        url: response.url
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data parsed:', {
        hasData: !!data,
        topLevelKeys: Object.keys(data),
        overviewPresent: !!data?.overview,
        overviewKeys: data?.overview ? Object.keys(data.overview) : [],
        rawData: data
      });
      
      // Validate data structure
      if (!data || !data.overview) {
        throw new Error('Invalid data structure: missing required fields');
      }
      
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        console.log('Updating state with new data');
        setState(prevState => {
          console.log('State update:', {
            previous: prevState,
            new: {
              isLoading: false,
              error: null,
              data,
              lastUpdated: new Date()
            }
          });
          return {
            isLoading: false,
            error: null,
            data,
            lastUpdated: new Date()
          };
        });
        console.log('State updated successfully');
      }
    } catch (error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Don't update state if the error was due to an aborted fetch
      if (error.name === 'AbortError') {
        console.log('Data fetch was aborted');
        return;
      }
      
      console.error('Error loading data:', error);
      
      // Try fallback location
      try {
        console.log('Attempting to load from fallback location...');
        const fallbackResponse = await fetch('/complete-data.json', { 
          signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!isMountedRef.current) return;
        
        console.log('Fallback response status:', fallbackResponse.status);
        
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to load fallback data: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback data loaded:', {
          hasData: !!fallbackData,
          topLevelKeys: Object.keys(fallbackData),
          overviewPresent: !!fallbackData?.overview
        });
        
        // Validate fallback data structure
        if (!fallbackData || !fallbackData.overview) {
          throw new Error('Invalid fallback data structure: missing required fields');
        }
        
        if (isMountedRef.current) {
          console.log('Data loaded successfully from fallback');
          setState(prevState => {
            console.log('State update from fallback:', {
              previous: prevState,
              new: {
                isLoading: false,
                error: null,
                data: fallbackData,
                lastUpdated: new Date()
              }
            });
            return {
              isLoading: false,
              error: null,
              data: fallbackData,
              lastUpdated: new Date()
            };
          });
        }
      } catch (fallbackError) {
        console.error('Fallback error details:', {
          name: fallbackError.name,
          message: fallbackError.message,
          stack: fallbackError.stack
        });
        
        if (error.name === 'AbortError') return;
        
        if (isMountedRef.current) {
          const errorMessage = 'Failed to load dashboard data. Please check your network connection and try again.';
          console.error('Error loading data from both locations:', error, fallbackError);
          setState(prev => {
            console.log('Error state update:', {
              previous: prev,
              new: {
                ...prev,
                isLoading: false,
                error: errorMessage
              }
            });
            return {
              ...prev,
              isLoading: false,
              error: errorMessage
            };
          });
        }
      }
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