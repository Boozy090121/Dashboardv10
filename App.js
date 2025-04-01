import React from 'react';
import { DataProvider } from './DataContext';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <DataProvider>
      <div className="app-container">
        <Dashboard />
      </div>
    </DataProvider>
  );
};

export default App; 