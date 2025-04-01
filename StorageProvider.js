import React, { createContext, useContext } from 'react';

console.log('StorageProvider file loaded');

// Create context for storage availability
const StorageContext = createContext(null);

// Hook to use storage context
export const useStorageContext = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorageContext must be used within a StorageProvider');
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  console.log('StorageProvider rendering');
  
  // Simple implementations that log actions
  const getItem = (key, defaultValue) => {
    console.log(`StorageProvider.getItem('${key}')`);
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return defaultValue;
    }
  };

  const setItem = (key, value) => {
    console.log(`StorageProvider.setItem('${key}')`, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
    }
  };

  const removeItem = (key) => {
    console.log(`StorageProvider.removeItem('${key}')`);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  };

  const value = {
    getItem,
    setItem,
    removeItem
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};

export default StorageContext; 