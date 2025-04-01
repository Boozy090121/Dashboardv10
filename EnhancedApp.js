import React, { useState } from 'react';
import { DataProvider } from './DataContext';
import Dashboard from './Dashboard';

// Import any additional analytics components that exist
const CustomerCommentAnalysis = (() => {
  try {
    return require('./CustomerCommentAnalysis').default;
  } catch (e) {
    return null;
  }
})();

const ReviewAnalysis = (() => {
  try {
    return require('./ReviewAnalysis').default;
  } catch (e) {
    return null;
  }
})();

const ProcessFlowVisualization = (() => {
  try {
    return require('./ProcessFlowVisualization').default;
  } catch (e) {
    return null;
  }
})();

const FormErrorAnalysis = (() => {
  try {
    return require('./FormErrorAnalysis').default;
  } catch (e) {
    return null;
  }
})();

const LotAnalytics = (() => {
  try {
    return require('./LotAnalytics').default;
  } catch (e) {
    return null;
  }
})();

const InsightsDashboard = (() => {
  try {
    return require('./InsightsDashboard').default;
  } catch (e) {
    return null;
  }
})();

const EnhancedApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: Dashboard },
    ...(CustomerCommentAnalysis ? [{ id: 'comments', label: 'Customer Comments', component: CustomerCommentAnalysis }] : []),
    ...(ReviewAnalysis ? [{ id: 'reviews', label: 'Review Analysis', component: ReviewAnalysis }] : []),
    ...(ProcessFlowVisualization ? [{ id: 'process', label: 'Process Flow', component: ProcessFlowVisualization }] : []),
    ...(FormErrorAnalysis ? [{ id: 'errors', label: 'Form Errors', component: FormErrorAnalysis }] : []),
    ...(LotAnalytics ? [{ id: 'lots', label: 'Lot Analytics', component: LotAnalytics }] : []),
    ...(InsightsDashboard ? [{ id: 'insights', label: 'Insights', component: InsightsDashboard }] : [])
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;
  
  return (
    <DataProvider>
      <div className="app-container">
        {tabs.length > 1 && (
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
        )}
        
        <ActiveComponent />
      </div>
    </DataProvider>
  );
};

export default EnhancedApp;
