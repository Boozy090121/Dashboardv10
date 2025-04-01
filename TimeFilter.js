import React, { useState, useRef, useEffect } from 'react';
import { useTimeFilter } from './TimeFilterContext';

const TimeFilter = () => {
  const { 
    filterType, 
    dateRange, 
    displayRange, 
    changeFilterType, 
    setCustomRange
  } = useTimeFilter();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const datePickerRef = useRef(null);
  
  // Set up initial dates from context when needed
  useEffect(() => {
    if (filterType === 'custom' && dateRange.start && dateRange.end) {
      setStartDate(formatDateForInput(dateRange.start));
      setEndDate(formatDateForInput(dateRange.end));
    }
  }, [filterType, dateRange]);
  
  // Helper function to format dates for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };
  
  // Handle clicking outside date picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [datePickerRef]);
  
  // Handle setting custom date range
  const handleApplyCustomDates = () => {
    if (startDate && endDate) {
      setCustomRange(new Date(startDate), new Date(endDate));
      setShowDatePicker(false);
    }
  };
  
  return (
    <div className="time-filter-container">
      <div className="filter-buttons">
        <button 
          className={`filter-button ${filterType === '1m' ? 'active' : ''}`}
          onClick={() => changeFilterType('1m')}
        >
          1M
        </button>
        <button 
          className={`filter-button ${filterType === '3m' ? 'active' : ''}`}
          onClick={() => changeFilterType('3m')}
        >
          3M
        </button>
        <button 
          className={`filter-button ${filterType === '6m' ? 'active' : ''}`}
          onClick={() => changeFilterType('6m')}
        >
          6M
        </button>
        <button 
          className={`filter-button ${filterType === '12m' ? 'active' : ''}`}
          onClick={() => changeFilterType('12m')}
        >
          12M
        </button>
        <button 
          className={`filter-button ${filterType === 'ytd' ? 'active' : ''}`}
          onClick={() => changeFilterType('ytd')}
        >
          YTD
        </button>
        <button 
          className={`filter-button ${filterType === 'fy' ? 'active' : ''}`}
          onClick={() => changeFilterType('fy')}
        >
          FY
        </button>
        <div className="custom-date-container">
          <button 
            className={`filter-button custom-date ${filterType === 'custom' ? 'active' : ''}`}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <span>
              {filterType === 'custom' ? displayRange : 'Custom'}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          
          {showDatePicker && (
            <div className="date-picker-dropdown" ref={datePickerRef}>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="date-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancel
                </button>
                <button 
                  className="apply-button"
                  onClick={handleApplyCustomDates}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="current-range">
        {displayRange}
      </div>
    </div>
  );
};

export default TimeFilter; 