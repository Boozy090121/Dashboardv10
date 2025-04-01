import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import PlaceholderComponent from './PlaceholderComponent';

// Log that App.js was loaded
console.log('App.js file loaded');

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    console.log('ErrorBoundary constructed');
  }

  static getDerivedStateFromError(error) {
    console.log('ErrorBoundary caught error:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tab component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('ErrorBoundary rendering fallback UI');
      return <PlaceholderComponent tabName={this.props.tabName || "Tab"} />;
    }
    console.log('ErrorBoundary rendering children');
    return this.props.children;
  }
}

/**
 * Main application component with tab navigation
 */
const App = () => {
  console.log('App component rendering started');
  
  // Add critical inline styles to ensure tabs render correctly
  useEffect(() => {
    console.log('Adding critical inline styles');
    const style = document.createElement('style');
    style.innerHTML = `
      /* Critical tab fix with highest priority */
      body #root .app-container {
        max-width: 1400px !important;
        margin: 0 auto !important;
        padding: 20px !important;
        position: relative !important;
      }
      
      body #root .tabs-container {
        display: flex !important;
        overflow-x: auto !important;
        border-bottom: 1px solid #E5E7EB !important;
        margin-bottom: 24px !important;
        scrollbar-width: thin !important;
        position: relative !important;
        width: 100% !important;
      }
      
      body #root .app-container .tabs-container .tab-button {
        display: inline-flex !important;
        align-items: center !important;
        padding: 12px 16px !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        color: #6B7280 !important;
        border: none !important;
        background: transparent !important;
        cursor: pointer !important;
        white-space: nowrap !important;
        position: relative !important;
        transition: all 250ms ease !important;
        gap: 8px !important;
      }
      
      body #root .app-container .tabs-container .tab-button.active {
        color: #CC2030 !important;
        font-weight: 600 !important;
      }
      
      body #root .app-container .tabs-container .tab-button svg {
        width: 16px !important;
        height: 16px !important;
      }
      
      body #root .app-container .tabs-container .tab-button.active svg {
        stroke: #CC2030 !important;
        color: #CC2030 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Force a reload if the app has been loaded for more than 10 seconds and is in a bad state
  useEffect(() => {
    console.log('Setting up tab button check timeout');
    const loadTimeout = setTimeout(() => {
      if (document.querySelectorAll('.tab-button').length === 0) {
        console.log('Tab buttons not rendered properly, forcing reload');
        window.location.reload();
      } else {
        console.log('Tab buttons detected:', document.querySelectorAll('.tab-button').length);
      }
    }, 10000);
    
    return () => clearTimeout(loadTimeout);
  }, []);

  // Check URL for initial tab selection
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL hash for tab indicators
    const hash = window.location.hash.replace('#', '');
    console.log('URL hash:', hash);
    
    // If hash matches a valid tab, use that
    const validTabs = ['dashboard', 'process-flow', 'lot-analytics', 'visualizations', 'intelligence', 'insights', 'customer-comments'];
    if (validTabs.includes(hash)) {
      console.log('Setting initial tab from URL:', hash);
      return hash;
    }
    
    // Default to dashboard if no valid hash
    console.log('No valid hash, defaulting to dashboard');
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
      id: 'visualizations', 
      label: 'Visualizations',
      component: EnhancedVisualizations,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.5"></path>
          <path d="M16 2v4"></path>
          <path d="M8 2v4"></path>
          <path d="M3 10h18"></path>
          <circle cx="18" cy="18" r="3"></circle>
          <path d="m19.5 19.5 2.5 2.5"></path>
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

  // Get the active component to render with fallback to Dashboard
  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];
  const ActiveComponent = activeTabData.component;
  console.log('Rendering component for tab:', activeTab, 'Component:', ActiveComponent?.name || 'Unknown');
  
  useEffect(() => {
    console.log('App component mounted');
    return () => console.log('App component unmounted');
  }, []);
  
  return (
    <StorageProvider>
      <DataProvider>
        <TimeFilterProvider>
          <div className="app-container" style={{maxWidth: '1400px', margin: '0 auto', padding: '20px', position: 'relative'}}>
            <div className="tabs-container" style={{display: 'flex', overflowX: 'auto', borderBottom: '1px solid #E5E7EB', marginBottom: '24px'}}>
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    color: activeTab === tab.id ? '#CC2030' : '#6B7280',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    gap: '8px'
                  }}
                  onClick={() => {
                    console.log(`Tab ${tab.id} clicked`);
                    setActiveTab(tab.id);
                  }}
                >
                  <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', color: activeTab === tab.id ? '#CC2030' : '#6B7280'}}>
                    {tab.icon}
                  </span>
                  <span className="tab-label" style={{marginLeft: '8px'}}>{tab.label}</span>
                </button>
              ))}
            </div>
            
            <ErrorBoundary tabName={activeTabData.label}>
              <Suspense fallback={<div style={{padding: '40px', textAlign: 'center'}}>Loading {activeTabData.label}...</div>}>
                <div style={{border: '1px solid #f0f0f0', padding: '5px', marginBottom: '10px', fontSize: '12px', color: '#666'}}>
                  Debug: Rendering {activeTabData.label} component ({activeTab})
                </div>
                <ActiveComponent />
              </Suspense>
            </ErrorBoundary>
          </div>
        </TimeFilterProvider>
      </DataProvider>
    </StorageProvider>
  );
};

export default App;
