import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if localStorage is available on mount
  useEffect(() => {
    try {
      // Try to access localStorage
      const testKey = 'storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      setIsAvailable(true);
      setError(null);
    } catch (err) {
      console.error('localStorage is not available:', err);
      setIsAvailable(false);
      setError(`Storage not available: ${err.message || 'Unknown error'}`);
    }
  }, []);
  
  // Safely get item from localStorage
  const getItem = (key, defaultValue = null) => {
    if (!isAvailable) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(`Error getting item ${key} from localStorage:`, err);
      return defaultValue;
    }
  };
  
  // Safely set item in localStorage
  const setItem = (key, value) => {
    if (!isAvailable) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error setting item ${key} in localStorage:`, err);
      return false;
    }
  };
  
  // Safely remove item from localStorage
  const removeItem = (key) => {
    if (!isAvailable) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error removing item ${key} from localStorage:`, err);
      return false;
    }
  };
  
  // Clear all items from localStorage
  const clear = () => {
    if (!isAvailable) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      console.error('Error clearing localStorage:', err);
      return false;
    }
  };
  
  // Get total storage usage
  const getStorageUsage = () => {
    if (!isAvailable) return { used: 0, total: 0, percentage: 0 };
    
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
      }
      
      // Assume 5MB limit (common in browsers)
      const totalLimit = 5 * 1024 * 1024;
      const usagePercentage = (totalSize / totalLimit) * 100;
      
      return {
        used: totalSize,
        total: totalLimit,
        percentage: usagePercentage
      };
    } catch (err) {
      console.error('Error calculating storage usage:', err);
      return { used: 0, total: 0, percentage: 0 };
    }
  };
  
  return (
    <StorageContext.Provider value={{
      isAvailable,
      error,
      getItem,
      setItem,
      removeItem,
      clear,
      getStorageUsage
    }}>
      {children}
      
      {/* Display warning if storage is not available */}
      {!isAvailable && (
        <div className="storage-warning">
          <div className="storage-warning-content">
            <div className="warning-icon">⚠️</div>
            <div className="warning-message">
              <strong>Warning:</strong> Local storage is not available. Your settings and preferences will not be saved.
              <p className="warning-details">{error}</p>
            </div>
            <button className="close-warning" onClick={() => {
              const warning = document.querySelector('.storage-warning');
              if (warning) warning.style.display = 'none';
            }}>×</button>
          </div>
          
          <style jsx>{`
            .storage-warning {
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 9999;
              max-width: 400px;
              background-color: #fff8e6;
              border: 1px solid #ffd34e;
              border-radius: 6px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              animation: slide-in 0.3s ease-out;
            }
            
            @keyframes slide-in {
              from {
                transform: translateY(100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
            
            .storage-warning-content {
              display: flex;
              padding: 12px 16px;
              align-items: flex-start;
            }
            
            .warning-icon {
              font-size: 20px;
              margin-right: 12px;
              flex-shrink: 0;
            }
            
            .warning-message {
              flex: 1;
              font-size: 14px;
              line-height: 1.4;
              color: #664d03;
            }
            
            .warning-details {
              margin-top: 6px;
              font-size: 12px;
              color: #997404;
            }
            
            .close-warning {
              background: none;
              border: none;
              font-size: 20px;
              line-height: 1;
              color: #997404;
              cursor: pointer;
              padding: 0 0 0 12px;
              margin-left: 8px;
            }
            
            .close-warning:hover {
              color: #664d03;
            }
          `}</style>
        </div>
      )}
    </StorageContext.Provider>
  );
};

export default StorageContext; 