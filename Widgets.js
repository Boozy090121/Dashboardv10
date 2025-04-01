import React, { useState, useEffect, useCallback } from 'react';
import { useDataContext } from './DataContext';
import { useTimeFilterContext } from './TimeFilterContext';
import { useStorageContext } from './StorageProvider';
import AdvancedChart from './AdvancedChart';
import MetricCard from './MetricCard';

const Widgets = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const { timeRange } = useTimeFilterContext();
  const { getItem, setItem, isAvailable } = useStorageContext();
  const [widgets, setWidgets] = useState(() => {
    // Use the storage context to get the widgets
    return getItem('dashboard-widgets', defaultWidgets);
  });
  const [availableWidgets, setAvailableWidgets] = useState(widgetCatalog);
  const [editMode, setEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState(null);
  
  // Save widgets to localStorage when they change
  useEffect(() => {
    // Use the storage context to set the widgets
    setItem('dashboard-widgets', widgets);
  }, [widgets, setItem]);
  
  // Add a widget to the dashboard
  const addWidget = useCallback((widgetType) => {
    const widgetToAdd = availableWidgets.find(w => w.type === widgetType);
    if (!widgetToAdd) return;
    
    const newWidget = {
      id: `widget-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...widgetToAdd,
      position: {
        x: 0,
        y: widgets.length > 0 ? Math.max(...widgets.map(w => w.position.y)) + 1 : 0
      }
    };
    
    setWidgets(prev => [...prev, newWidget]);
  }, [widgets, availableWidgets]);
  
  // Remove a widget from the dashboard
  const removeWidget = useCallback((widgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);
  
  // Handle widget drag start
  const handleDragStart = useCallback((e, widget) => {
    setIsDragging(true);
    setDraggedWidget(widget);
    
    // Add visual feedback for dragging
    if (e.target.classList.contains('widget-header')) {
      e.target.parentNode.classList.add('dragging');
    } else {
      e.target.classList.add('dragging');
    }
  }, []);
  
  // Handle widget drag end
  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    setDraggedWidget(null);
    
    // Remove dragging class from all elements
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  }, []);
  
  // Handle widget drop for reordering
  const handleDragOver = useCallback((e, targetWidget) => {
    e.preventDefault();
    if (!isDragging || !draggedWidget || draggedWidget.id === targetWidget.id) return;
    
    // Reorder widgets
    setWidgets(prev => {
      const updatedWidgets = [...prev];
      const draggedIndex = updatedWidgets.findIndex(w => w.id === draggedWidget.id);
      const targetIndex = updatedWidgets.findIndex(w => w.id === targetWidget.id);
      
      // Swap positions
      const tempPos = { ...updatedWidgets[draggedIndex].position };
      updatedWidgets[draggedIndex].position = { ...updatedWidgets[targetIndex].position };
      updatedWidgets[targetIndex].position = tempPos;
      
      return updatedWidgets;
    });
  }, [isDragging, draggedWidget]);
  
  // Toggle widget edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading widget data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !data) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={refreshData} className="refresh-button">
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="widgets-container">
      <div className="widgets-header">
        <h1>Custom Dashboard Widgets</h1>
        <div className="widgets-actions">
          <button 
            className={`edit-button ${editMode ? 'active' : ''}`} 
            onClick={toggleEditMode}
          >
            {editMode ? 'Done Editing' : 'Edit Dashboard'}
          </button>
          {editMode && (
            <div className="widget-catalog-dropdown">
              <button className="add-widget-button">Add Widget</button>
              <div className="dropdown-content">
                {availableWidgets.map(widget => (
                  <div 
                    key={widget.type} 
                    className="dropdown-item"
                    onClick={() => addWidget(widget.type)}
                  >
                    {widget.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {widgets.length === 0 ? (
        <div className="empty-widgets">
          <h3>No widgets added yet!</h3>
          <p>Click "Edit Dashboard" and then "Add Widget" to get started.</p>
        </div>
      ) : (
        <div className="widgets-grid">
          {widgets.sort((a, b) => 
            a.position.y === b.position.y 
              ? a.position.x - b.position.x 
              : a.position.y - b.position.y
          ).map(widget => (
            <div 
              key={widget.id}
              className={`widget-container ${widget.size || 'medium'} ${editMode ? 'editable' : ''}`}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, widget)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, widget)}
            >
              <div className="widget-header">
                <h3>{widget.name}</h3>
                {editMode && (
                  <button 
                    className="remove-widget" 
                    onClick={() => removeWidget(widget.id)}
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className="widget-content">
                {renderWidgetContent(widget, data, timeRange)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .widgets-container {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .widgets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .widgets-header h1 {
          color: #374151;
          margin: 0;
        }
        
        .widgets-actions {
          display: flex;
          gap: 1rem;
        }
        
        .edit-button, .add-widget-button {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .edit-button:hover, .add-widget-button:hover {
          background-color: #e5e7eb;
        }
        
        .edit-button.active {
          background-color: #3b82f6;
          color: white;
          border-color: #2563eb;
        }
        
        .widget-catalog-dropdown {
          position: relative;
          display: inline-block;
        }
        
        .dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background-color: white;
          min-width: 160px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .widget-catalog-dropdown:hover .dropdown-content {
          display: block;
        }
        
        .dropdown-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .dropdown-item:hover {
          background-color: #f3f4f6;
        }
        
        .empty-widgets {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          text-align: center;
          color: #6b7280;
        }
        
        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1rem;
        }
        
        .widget-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .widget-container.small {
          grid-column: span 4;
        }
        
        .widget-container.medium {
          grid-column: span 6;
        }
        
        .widget-container.large {
          grid-column: span 12;
        }
        
        .widget-container.editable {
          cursor: grab;
          border: 1px dashed #d1d5db;
        }
        
        .widget-container.dragging {
          opacity: 0.5;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .widget-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
        }
        
        .remove-widget {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #9ca3af;
        }
        
        .remove-widget:hover {
          color: #ef4444;
        }
        
        .widget-content {
          padding: 1rem;
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};

// Helper function to render the appropriate widget content based on type
const renderWidgetContent = (widget, data, timeRange) => {
  if (!data) return <div className="widget-placeholder">No data available</div>;
  
  switch (widget.type) {
    case 'metric-card':
      return (
        <MetricCard
          title={widget.name}
          value={getDataFromPath(data, widget.dataPath)?.value || 0}
          previousValue={getDataFromPath(data, widget.dataPath)?.previousValue}
          trend={getDataFromPath(data, widget.dataPath)?.trend || 'stable'}
          percentage={widget.isPercentage}
          showDetails={false}
        />
      );
      
    case 'rft-chart':
      return (
        <AdvancedChart
          title="RFT Rate Trend"
          data={data?.overview?.processTimeline || []}
          type="line"
          xDataKey="month"
          yDataKey="recordRFT"
          percentage={true}
          comparisonValue={95}
          comparisonLabel="Target"
          height={200}
        />
      );
      
    case 'cycle-time-chart':
      return (
        <AdvancedChart
          title="Cycle Time Trend"
          data={data?.processMetrics?.cycleTimesByMonth || []}
          type="line"
          xDataKey="month"
          yDataKey="averageCycleTime"
          height={200}
        />
      );
      
    case 'issue-distribution':
      return (
        <AdvancedChart
          title="Issue Distribution"
          data={data?.overview?.issueDistribution || []}
          type="pie"
          xDataKey="name"
          yDataKey="value"
          height={200}
        />
      );
      
    case 'dept-performance':
      return (
        <AdvancedChart
          title="Department Performance"
          data={data?.internalRFT?.departmentPerformance || []}
          type="bar"
          xDataKey="department"
          yDataKey="rftRate"
          percentage={true}
          height={200}
        />
      );
      
    default:
      return <div className="widget-placeholder">Unknown widget type</div>;
  }
};

// Helper to safely get nested data using a path string like "overview.totalRecords"
const getDataFromPath = (data, path) => {
  if (!data || !path) return null;
  
  try {
    return path.split('.').reduce((obj, key) => obj[key], data);
  } catch (error) {
    console.warn(`Error accessing data path: ${path}`, error);
    return null;
  }
};

// Default widgets for new users
const defaultWidgets = [
  {
    id: 'default-1',
    type: 'metric-card',
    name: 'Total Records',
    dataPath: 'overview.totalRecords',
    size: 'small',
    position: { x: 0, y: 0 }
  },
  {
    id: 'default-2',
    type: 'rft-chart',
    name: 'RFT Rate Trend',
    size: 'medium',
    position: { x: 1, y: 0 }
  },
  {
    id: 'default-3',
    type: 'issue-distribution',
    name: 'Issue Distribution',
    size: 'medium',
    position: { x: 0, y: 1 }
  }
];

// Available widgets catalog
const widgetCatalog = [
  { type: 'metric-card', name: 'Metric Card', size: 'small' },
  { type: 'rft-chart', name: 'RFT Rate Chart', size: 'medium' },
  { type: 'cycle-time-chart', name: 'Cycle Time Chart', size: 'medium' },
  { type: 'issue-distribution', name: 'Issue Distribution', size: 'medium' },
  { type: 'dept-performance', name: 'Department Performance', size: 'medium' }
];

export default Widgets; 