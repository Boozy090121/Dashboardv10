import React from 'react';

/**
 * Placeholder component for tabs with potential loading issues
 */
const PlaceholderComponent = ({ tabName = 'This Tab' }) => {
  return (
    <div className="placeholder-tab" style={{
      margin: '20px 0',
      padding: '30px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      border: '1px dashed #D1D5DB'
    }}>
      <div className="placeholder-content" style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <h2 style={{
          color: '#00518A',
          marginBottom: '16px',
          fontSize: '20px'
        }}>{tabName} Content</h2>
        <p style={{
          color: '#6B7280',
          marginBottom: '16px',
          fontSize: '14px'
        }}>This content is temporarily unavailable. We're working to fix this issue.</p>
        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#6B7280'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>Common reasons for tab loading issues:</p>
          <ul style={{ 
            textAlign: 'left',
            paddingLeft: '20px',
            margin: '0'
          }}>
            <li>JavaScript errors in component code</li>
            <li>Missing data dependencies</li>
            <li>CSS conflicts preventing proper display</li>
            <li>Browser caching older versions of files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderComponent; 