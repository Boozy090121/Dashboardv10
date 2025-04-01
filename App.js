import React, { useState, useEffect } from 'react';
import { DataProvider } from './DataContext';
import { TimeFilterProvider } from './TimeFilterContext';
import { StorageProvider } from './StorageProvider';
import Dashboard from './Dashboard';
import ProcessAnalysis from './ProcessAnalysis';
import IntelligenceEngine from './IntelligenceEngine';
import LotCorrelationTracker from './LotCorrelationTracker';
import EnhancedVisualizations from './EnhancedVisualizations';
import HistoricalAnalysis from './HistoricalAnalysis';
import CustomerCommentAnalysis from './CustomerCommentAnalysis';
import Widgets from './Widgets';
import UserSettings from './UserSettings';

/**
 * Main application component with tab navigation
 */
const App = () => {
  // Check URL for initial tab selection
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL hash for #process-flow or other tab indicators
    const hash = window.location.hash.replace('#', '');
    console.log('URL hash:', hash);
    
    // If hash matches a valid tab, use that
    if (['dashboard', 'intelligence', 'process-flow', 'lot-analytics', 
         'visualizations', 'historical', 'customer-comments', 'widgets', 'settings'].includes(hash)) {
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
  
  // Define all available tabs to match the existing structure
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      component: Dashboard,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    { 
      id: 'process-flow', 
      label: 'Process Flow',
      component: ProcessAnalysis,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="m7 17 4-8 4 4 4-10"></path>
        </svg>
      )
    },
    { 
      id: 'lot-analytics', 
      label: 'Lot Analytics',
      component: LotCorrelationTracker,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20v-6"></path>
          <path d="M6 20v-6"></path>
          <path d="M18 20v-6"></path>
          <path d="M6 14c0-4 2-8 6-8s6 4 6 8"></path>
        </svg>
      )
    },
    { 
      id: 'customer-comments', 
      label: 'Customer Comments',
      component: CustomerCommentAnalysis,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    { 
      id: 'intelligence', 
      label: 'Intelligence Engine',
      component: IntelligenceEngine,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 5 6 10 8 10s8-5 8-10a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
        </svg>
      )
    },
    { 
      id: 'insights', 
      label: 'Insights',
      component: HistoricalAnalysis,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3"></path>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      )
    },
    { 
      id: 'widgets', 
      label: 'Widgets',
      component: Widgets,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="6" height="6"></rect>
          <rect x="14" y="4" width="6" height="6"></rect>
          <rect x="4" y="14" width="6" height="6"></rect>
          <rect x="14" y="14" width="6" height="6"></rect>
        </svg>
      )
    },
    { 
      id: 'settings', 
      label: 'Settings',
      component: UserSettings,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  // Get the active component to render
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;
  console.log('Rendering component for tab:', activeTab, 'Component:', ActiveComponent?.name || 'Unknown');
  
  return (
    <StorageProvider>
      <DataProvider>
        <TimeFilterProvider>
          <div className="app-container">
            <div className="tabs-container">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <ActiveComponent />
          </div>
        </TimeFilterProvider>
      </DataProvider>
    </StorageProvider>
  );
};

export default App;
