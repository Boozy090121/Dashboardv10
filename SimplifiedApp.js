// Simplified App.js for debugging
import React, { useState, useEffect } from 'react';
import { DataProvider } from './DataContext';
import { TimeFilterProvider } from './TimeFilterContext';
import { StorageProvider } from './StorageProvider';

console.log('SimplifiedApp.js file loaded');

const SimplifiedApp = () => {
  console.log('SimplifiedApp rendering started');
  
  // Check URL for initial tab selection
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL hash for tab indicators
    const hash = window.location.hash.replace('#', '');
    console.log('URL hash:', hash);
    
    // If hash matches a valid tab, use that
    if (['dashboard', 'process-flow', 'lot-analytics', 'visualizations', 'intelligence', 'insights', 'customer-comments'].includes(hash)) {
      console.log('Setting initial tab from URL:', hash);
      return hash;
    }
    
    // Default to dashboard if no valid hash
    return 'dashboard';
  });
  
  // Update URL when tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);
  
  // Simple placeholder component
  const PlaceholderComponent = ({name}) => (
    <div style={{
      padding: "20px", 
      background: "#f0f0f0", 
      margin: "20px", 
      borderRadius: "8px",
      textAlign: "center"
    }}>
      <h2 style={{marginBottom: "10px"}}>{name} Component</h2>
      <p>This is a placeholder for the {name} tab content.</p>
    </div>
  );

  // Define tabs with simple components
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: () => <PlaceholderComponent name="Dashboard" /> },
    { id: 'process-flow', label: 'Process Flow', component: () => <PlaceholderComponent name="Process Flow" /> },
    { id: 'lot-analytics', label: 'Lot Analytics', component: () => <PlaceholderComponent name="Lot Analytics" /> },
    { id: 'visualizations', label: 'Visualizations', component: () => <PlaceholderComponent name="Visualizations" /> },
    { id: 'intelligence', label: 'Intelligence', component: () => <PlaceholderComponent name="Intelligence" /> },
    { id: 'insights', label: 'Insights', component: () => <PlaceholderComponent name="Insights" /> },
    { id: 'customer-comments', label: 'Customer Comments', component: () => <PlaceholderComponent name="Customer Comments" /> },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || tabs[0].component;
  
  return (
    <StorageProvider>
      <DataProvider>
        <TimeFilterProvider>
          <div className="app-container" style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px"
          }}>
            <h1 style={{
              marginBottom: "20px",
              color: "#00518A"
            }}>PCI Manufacturing Dashboard</h1>
            
            <div className="tabs-container" style={{
              display: "flex",
              overflowX: "auto",
              borderBottom: "1px solid #E5E7EB",
              marginBottom: "20px"
            }}>
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  style={{
                    padding: "10px 15px",
                    margin: "0 5px",
                    border: "none",
                    backgroundColor: activeTab === tab.id ? "#00518A" : "transparent",
                    color: activeTab === tab.id ? "white" : "black",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <ActiveComponent />
            
            <div style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              fontSize: "14px"
            }}>
              <h3>Debug Information</h3>
              <p>Active Tab: {activeTab}</p>
              <p>URL Hash: {window.location.hash}</p>
              <p>Rendered at: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </TimeFilterProvider>
      </DataProvider>
    </StorageProvider>
  );
};

export default SimplifiedApp; 