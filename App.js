import React, { useState } from 'react';
import { DataProvider } from './DataContext';
import Dashboard from './Dashboard';
import AdvancedAnalytics from './AdvancedAnalytics';
import ProcessAnalysis from './ProcessAnalysis';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Define all available tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: Dashboard },
    { id: 'analytics', label: 'Advanced Analytics', component: AdvancedAnalytics },
    { id: 'process', label: 'Process Analysis', component: ProcessAnalysis },
    { id: 'lots', label: 'Lot Analytics', component: () => <div className="placeholder-tab">Lot Analytics Dashboard</div> },
    { id: 'comments', label: 'Customer Comments', component: () => <div className="placeholder-tab">Customer Comment Analysis</div> },
    { id: 'insights', label: 'Insights', component: () => <div className="placeholder-tab">Data Insights Dashboard</div> }
  ];

  // Get the active component to render
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;
  
  return (
    <DataProvider>
      <div className="app-container">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <ActiveComponent />
      </div>
    </DataProvider>
  );
};

export default App;
