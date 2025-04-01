import React, { useState, useEffect } from 'react';
import { useStorageContext } from './StorageProvider';

const UserSettings = () => {
  const { getItem, setItem, isAvailable, getStorageUsage, clear } = useStorageContext();
  
  // Load settings from storage or use defaults
  const [settings, setSettings] = useState(() => {
    return getItem('user-settings', {
      theme: 'light',
      colorMode: 'default',
      dataRefreshInterval: 5,
      chartAnimations: true,
      highContrastMode: false,
      showHelp: true,
      decimalPrecision: 1,
      defaultTimeRange: '6m',
      notificationsEnabled: true,
      dashboardDensity: 'comfortable'
    });
  });
  
  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaved, setIsSaved] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });
  
  // Get storage info on mount
  useEffect(() => {
    if (isAvailable) {
      setStorageInfo(getStorageUsage());
    }
  }, [isAvailable, getStorageUsage]);
  
  // Handle setting changes
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Reset saved status
    setIsSaved(false);
  };
  
  // Save settings
  const saveSettings = () => {
    setItem('user-settings', settings);
    setIsSaved(true);
    
    // Update theme on body element
    document.body.dataset.theme = settings.theme;
    document.body.dataset.colorMode = settings.colorMode;
    document.body.dataset.highContrast = settings.highContrastMode;
    document.body.dataset.density = settings.dashboardDensity;
    
    // Show save confirmation briefly
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
    
    // Update storage info
    setStorageInfo(getStorageUsage());
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    if (window.confirm('Reset all settings to default values?')) {
      const defaultSettings = {
        theme: 'light',
        colorMode: 'default',
        dataRefreshInterval: 5,
        chartAnimations: true,
        highContrastMode: false,
        showHelp: true,
        decimalPrecision: 1,
        defaultTimeRange: '6m',
        notificationsEnabled: true,
        dashboardDensity: 'comfortable'
      };
      
      setSettings(defaultSettings);
      setItem('user-settings', defaultSettings);
      setIsSaved(true);
      
      // Update theme on body element
      document.body.dataset.theme = defaultSettings.theme;
      document.body.dataset.colorMode = defaultSettings.colorMode;
      document.body.dataset.highContrast = defaultSettings.highContrastMode;
      document.body.dataset.density = defaultSettings.dashboardDensity;
      
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    }
  };
  
  // Clear all stored data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      clear();
      window.location.reload();
    }
  };
  
  // If storage is not available, show a message
  if (!isAvailable) {
    return (
      <div className="settings-container">
        <div className="settings-header">
          <h1>User Settings</h1>
        </div>
        
        <div className="storage-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Local Storage Unavailable</h3>
            <p>Your browser does not support or has disabled local storage. Settings cannot be saved.</p>
            <p>Try enabling cookies and local storage in your browser settings, or try a different browser.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>User Settings</h1>
        <div className="settings-actions">
          {isSaved && <div className="save-indicator">Settings saved!</div>}
          <button className="reset-button" onClick={resetSettings}>Reset to Default</button>
          <button className="save-button" onClick={saveSettings} disabled={isSaved}>
            {isSaved ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <button 
            className={`sidebar-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data Preferences
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            Storage
          </button>
        </div>
        
        <div className="settings-panel">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-group">
              <h2>Appearance Settings</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="theme">Theme</label>
                  <div className="setting-description">
                    Choose your preferred color scheme
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="theme" 
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="colorMode">Color Mode</label>
                  <div className="setting-description">
                    Set the color scheme for charts and visualizations
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="colorMode" 
                    value={settings.colorMode}
                    onChange={(e) => handleSettingChange('colorMode', e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="colorblind">Colorblind-friendly</option>
                    <option value="monochrome">Monochrome</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="pastel">Pastel</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="dashboardDensity">Dashboard Density</label>
                  <div className="setting-description">
                    Adjust the spacing and density of dashboard elements
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="dashboardDensity" 
                    value={settings.dashboardDensity}
                    onChange={(e) => handleSettingChange('dashboardDensity', e.target.value)}
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                    <option value="cozy">Cozy</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="highContrastMode">High Contrast Mode</label>
                  <div className="setting-description">
                    Increase contrast for better readability
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="highContrastMode" 
                    checked={settings.highContrastMode}
                    onChange={(e) => handleSettingChange('highContrastMode', e.target.checked)}
                  />
                  <label htmlFor="highContrastMode" className="toggle-label"></label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="chartAnimations">Chart Animations</label>
                  <div className="setting-description">
                    Enable or disable animations for charts and visualizations
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="chartAnimations" 
                    checked={settings.chartAnimations}
                    onChange={(e) => handleSettingChange('chartAnimations', e.target.checked)}
                  />
                  <label htmlFor="chartAnimations" className="toggle-label"></label>
                </div>
              </div>
            </div>
          )}
          
          {/* Data Preferences Tab */}
          {activeTab === 'data' && (
            <div className="settings-group">
              <h2>Data Preferences</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="dataRefreshInterval">Data Refresh Interval (minutes)</label>
                  <div className="setting-description">
                    How often the dashboard data automatically refreshes
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="dataRefreshInterval" 
                    value={settings.dataRefreshInterval}
                    onChange={(e) => handleSettingChange('dataRefreshInterval', Number(e.target.value))}
                  >
                    <option value="0">Never (Manual only)</option>
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="decimalPrecision">Decimal Precision</label>
                  <div className="setting-description">
                    Number of decimal places to display for numeric values
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="decimalPrecision" 
                    value={settings.decimalPrecision}
                    onChange={(e) => handleSettingChange('decimalPrecision', Number(e.target.value))}
                  >
                    <option value="0">0 decimals</option>
                    <option value="1">1 decimal</option>
                    <option value="2">2 decimals</option>
                    <option value="3">3 decimals</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="defaultTimeRange">Default Time Range</label>
                  <div className="setting-description">
                    Default time period for reports and charts
                  </div>
                </div>
                <div className="setting-control">
                  <select 
                    id="defaultTimeRange" 
                    value={settings.defaultTimeRange}
                    onChange={(e) => handleSettingChange('defaultTimeRange', e.target.value)}
                  >
                    <option value="1m">1 Month</option>
                    <option value="3m">3 Months</option>
                    <option value="6m">6 Months</option>
                    <option value="12m">12 Months</option>
                    <option value="ytd">Year to Date</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-group">
              <h2>Notification Settings</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="notificationsEnabled">Enable Notifications</label>
                  <div className="setting-description">
                    Show system notifications for important events
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="notificationsEnabled" 
                    checked={settings.notificationsEnabled}
                    onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  />
                  <label htmlFor="notificationsEnabled" className="toggle-label"></label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label htmlFor="showHelp">Show Help Tips</label>
                  <div className="setting-description">
                    Display tooltips and help information throughout the application
                  </div>
                </div>
                <div className="setting-control toggle-control">
                  <input 
                    type="checkbox" 
                    id="showHelp" 
                    checked={settings.showHelp}
                    onChange={(e) => handleSettingChange('showHelp', e.target.checked)}
                  />
                  <label htmlFor="showHelp" className="toggle-label"></label>
                </div>
              </div>
            </div>
          )}
          
          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div className="settings-group">
              <h2>Storage Management</h2>
              
              <div className="storage-info">
                <h3>Local Storage Usage</h3>
                <div className="storage-progress-container">
                  <div 
                    className="storage-progress-bar" 
                    style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="storage-details">
                  <span>{(storageInfo.used / 1024).toFixed(2)} KB used</span>
                  <span>of {(storageInfo.total / (1024 * 1024)).toFixed(2)} MB available</span>
                </div>
              </div>
              
              <div className="storage-actions">
                <button className="clear-data-button" onClick={clearAllData}>
                  Clear All Stored Data
                </button>
                <p className="clear-data-warning">
                  This will reset all settings, preferences, and local data. This action cannot be undone.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .settings-container {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          color: #1f2937;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .settings-header h1 {
          color: #374151;
          margin: 0;
        }
        
        .settings-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .save-indicator {
          background: #ecfdf5;
          color: #065f46;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        
        .save-button, .reset-button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .save-button {
          background-color: #3b82f6;
          color: white;
          border: none;
        }
        
        .save-button:hover {
          background-color: #2563eb;
        }
        
        .save-button:disabled {
          background-color: #93c5fd;
          cursor: default;
        }
        
        .reset-button {
          background-color: white;
          color: #4b5563;
          border: 1px solid #d1d5db;
        }
        
        .reset-button:hover {
          background-color: #f3f4f6;
        }
        
        .settings-content {
          display: flex;
          gap: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .settings-sidebar {
          width: 200px;
          border-right: 1px solid #e5e7eb;
          padding: 1.5rem 0;
        }
        
        .sidebar-tab {
          width: 100%;
          text-align: left;
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.875rem;
          color: #4b5563;
          transition: all 0.2s;
        }
        
        .sidebar-tab:hover {
          background-color: #f3f4f6;
        }
        
        .sidebar-tab.active {
          background-color: #f3f4f6;
          color: #1f2937;
          font-weight: 500;
          border-left: 3px solid #3b82f6;
        }
        
        .settings-panel {
          flex: 1;
          padding: 2rem;
        }
        
        .settings-group h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #374151;
          font-size: 1.25rem;
        }
        
        .setting-item {
          display: flex;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .setting-item:last-child {
          border-bottom: none;
        }
        
        .setting-label {
          flex: 1;
        }
        
        .setting-label label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.25rem;
          color: #1f2937;
        }
        
        .setting-description {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .setting-control {
          width: 200px;
        }
        
        .setting-control select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          background-color: white;
          font-size: 0.875rem;
        }
        
        .toggle-control {
          display: flex;
          align-items: center;
        }
        
        .toggle-control input[type="checkbox"] {
          display: none;
        }
        
        .toggle-label {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
          background-color: #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .toggle-label::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: white;
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }
        
        input:checked + .toggle-label {
          background-color: #3b82f6;
        }
        
        input:checked + .toggle-label::after {
          left: 26px;
        }
        
        .storage-error {
          background-color: #fee2e2;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .error-icon {
          font-size: 1.5rem;
        }
        
        .error-content h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #991b1b;
        }
        
        .error-content p {
          margin: 0.25rem 0;
          color: #b91c1c;
        }
        
        .storage-info {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .storage-info h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #374151;
        }
        
        .storage-progress-container {
          height: 10px;
          width: 100%;
          background-color: #e5e7eb;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .storage-progress-bar {
          height: 100%;
          background-color: #3b82f6;
          border-radius: 5px;
        }
        
        .storage-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .storage-actions {
          margin-top: 2rem;
        }
        
        .clear-data-button {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .clear-data-button:hover {
          background-color: #dc2626;
        }
        
        .clear-data-warning {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default UserSettings; 