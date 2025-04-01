import React, { useState, useMemo, useEffect } from 'react';
import { useDataContext } from './DataContext';

const CustomerCommentAnalysis = () => {
  const { data, isLoading, error, refreshData } = useDataContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedComment, setExpandedComment] = useState(null);
  
  // Process customer comment data
  const commentData = useMemo(() => {
    if (!data || !data.customerComments) {
      // Default data if customer comments not available
      return [
        {
          id: 1,
          customer: 'Acme Pharmaceuticals',
          date: '2025-05-15',
          category: 'quality',
          content: 'We noticed inconsistencies in the documentation provided with batch PX-45892. Some sections were missing required information about testing parameters.',
          sentiment: 'negative',
          priority: 'high',
          status: 'open',
          keywords: ['documentation', 'inconsistent', 'missing', 'testing parameters'],
          responseTime: null
        },
        {
          id: 2,
          customer: 'BioTech Solutions',
          date: '2025-05-12',
          category: 'delivery',
          content: 'The latest shipment arrived two days ahead of schedule, which helped us meet our production timeline. Great work on the expedited delivery!',
          sentiment: 'positive',
          priority: 'medium',
          status: 'closed',
          keywords: ['delivery', 'ahead of schedule', 'expedited'],
          responseTime: '2h 15m'
        },
        {
          id: 3,
          customer: 'MedCore Devices',
          date: '2025-05-10',
          category: 'product',
          content: 'The latest batch meets all specifications and has shown excellent performance in our initial testing. Quality is consistent with previous deliveries.',
          sentiment: 'positive',
          priority: 'low',
          status: 'closed',
          keywords: ['quality', 'specifications', 'consistent', 'performance'],
          responseTime: '4h 30m'
        },
        {
          id: 4,
          customer: 'Global Health Products',
          date: '2025-05-08',
          category: 'service',
          content: 'Your technical support team was extremely helpful in resolving our questions about the validation process. Response was prompt and comprehensive.',
          sentiment: 'positive',
          priority: 'medium',
          status: 'closed',
          keywords: ['support', 'validation', 'responsive', 'helpful'],
          responseTime: '1h 10m'
        },
        {
          id: 5,
          customer: 'Pharma Innovations',
          date: '2025-05-05',
          category: 'quality',
          content: 'We identified several deviations in the latest batch that required additional testing on our end. This caused delays in our production schedule.',
          sentiment: 'negative',
          priority: 'high',
          status: 'in-progress',
          keywords: ['deviations', 'additional testing', 'delays'],
          responseTime: '5h 45m'
        }
      ];
    }
    
    return data.customerComments;
  }, [data]);
  
  // Filter and sort the comments
  const filteredComments = useMemo(() => {
    return commentData
      .filter(comment => {
        // Category filter
        if (selectedCategory !== 'all' && comment.category !== selectedCategory) {
          return false;
        }
        
        // Search term filter
        if (searchTerm && !comment.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !comment.customer.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Sentiment filter
        if (sentimentFilter !== 'all' && comment.sentiment !== sentimentFilter) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort logic
        if (sortBy === 'date') {
          return sortOrder === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'priority') {
          const priorityValues = { 'low': 1, 'medium': 2, 'high': 3 };
          return sortOrder === 'asc'
            ? priorityValues[a.priority] - priorityValues[b.priority]
            : priorityValues[b.priority] - priorityValues[a.priority];
        } else if (sortBy === 'sentiment') {
          const sentimentValues = { 'negative': 1, 'neutral': 2, 'positive': 3 };
          return sortOrder === 'asc'
            ? sentimentValues[a.sentiment] - sentimentValues[b.sentiment]
            : sentimentValues[b.sentiment] - sentimentValues[a.sentiment];
        }
        return 0;
      });
  }, [commentData, selectedCategory, searchTerm, sentimentFilter, sortBy, sortOrder]);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const total = commentData.length;
    const positive = commentData.filter(c => c.sentiment === 'positive').length;
    const negative = commentData.filter(c => c.sentiment === 'negative').length;
    const open = commentData.filter(c => c.status === 'open').length;
    const inProgress = commentData.filter(c => c.status === 'in-progress').length;
    const closed = commentData.filter(c => c.status === 'closed').length;
    const highPriority = commentData.filter(c => c.priority === 'high').length;
    
    // Calculate average response time (for comments that have response time)
    const commentsWithResponse = commentData.filter(c => c.responseTime);
    let avgResponseTime = 'N/A';
    
    if (commentsWithResponse.length > 0) {
      // Convert response times to minutes
      const responseTimes = commentsWithResponse.map(c => {
        const match = c.responseTime.match(/(\d+)h\s+(\d+)m/);
        if (match) {
          const hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          return hours * 60 + minutes;
        }
        return 0;
      });
      
      // Calculate average in minutes
      const totalMinutes = responseTimes.reduce((sum, time) => sum + time, 0);
      const avgMinutes = Math.round(totalMinutes / responseTimes.length);
      
      // Convert back to hours and minutes
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      avgResponseTime = `${hours}h ${minutes}m`;
    }
    
    return {
      total,
      positive,
      negative,
      neutral: total - positive - negative,
      positivePercentage: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativePercentage: total > 0 ? Math.round((negative / total) * 100) : 0,
      open,
      inProgress,
      closed,
      highPriority,
      avgResponseTime
    };
  }, [commentData]);
  
  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'quality', label: 'Quality' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'product', label: 'Product' },
    { id: 'service', label: 'Service' },
    { id: 'documentation', label: 'Documentation' }
  ];
  
  // Toggle comment expansion
  const toggleCommentExpansion = (commentId) => {
    setExpandedComment(expandedComment === commentId ? null : commentId);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Loading state
  if (isLoading && !data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customer comment data...</p>
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
    <div className="customer-comment-analysis">
      <div className="comment-analysis-header">
        <h1>Customer Comment Analysis</h1>
        <div className="comment-metrics-container">
          <div className="comment-metric">
            <div className="metric-value">{metrics.total}</div>
            <div className="metric-label">Total Comments</div>
          </div>
          <div className="comment-metric positive">
            <div className="metric-value">{metrics.positivePercentage}%</div>
            <div className="metric-label">Positive</div>
          </div>
          <div className="comment-metric negative">
            <div className="metric-value">{metrics.negativePercentage}%</div>
            <div className="metric-label">Negative</div>
          </div>
          <div className="comment-metric">
            <div className="metric-value">{metrics.open}</div>
            <div className="metric-label">Open</div>
          </div>
          <div className="comment-metric">
            <div className="metric-value">{metrics.avgResponseTime}</div>
            <div className="metric-label">Avg Response</div>
          </div>
        </div>
      </div>
      
      <div className="comments-filter-container">
        <div className="filter-group">
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="filter-group">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sentiment-filter">
            <select 
              value={sentimentFilter} 
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="sentiment-select"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="comments-list-container">
        <div className="comments-list-header">
          <div className="column-header date" onClick={() => handleSortChange('date')}>
            Date
            {sortBy === 'date' && (
              <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="column-header customer">Customer</div>
          <div className="column-header content">Comment</div>
          <div className="column-header priority" onClick={() => handleSortChange('priority')}>
            Priority
            {sortBy === 'priority' && (
              <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="column-header sentiment" onClick={() => handleSortChange('sentiment')}>
            Sentiment
            {sortBy === 'sentiment' && (
              <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </div>
          <div className="column-header status">Status</div>
        </div>
        
        <div className="comments-list">
          {filteredComments.length > 0 ? (
            filteredComments.map(comment => (
              <div 
                key={comment.id} 
                className={`comment-item ${expandedComment === comment.id ? 'expanded' : ''}`}
                onClick={() => toggleCommentExpansion(comment.id)}
              >
                <div className="comment-summary">
                  <div className="comment-date">
                    {new Date(comment.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </div>
                  <div className="comment-customer">{comment.customer}</div>
                  <div className="comment-content">
                    {comment.content.length > 60 
                      ? `${comment.content.substring(0, 60)}...` 
                      : comment.content}
                  </div>
                  <div className={`comment-priority ${comment.priority}`}>
                    {comment.priority.charAt(0).toUpperCase() + comment.priority.slice(1)}
                  </div>
                  <div className={`comment-sentiment ${comment.sentiment}`}>
                    {comment.sentiment === 'positive' && '👍'}
                    {comment.sentiment === 'neutral' && '😐'}
                    {comment.sentiment === 'negative' && '👎'}
                    {comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1)}
                  </div>
                  <div className={`comment-status ${comment.status}`}>
                    {comment.status.charAt(0).toUpperCase() + comment.status.slice(1).replace('-', ' ')}
                  </div>
                </div>
                
                {expandedComment === comment.id && (
                  <div className="comment-details">
                    <div className="comment-full-content">
                      <h4>Full Comment</h4>
                      <p>{comment.content}</p>
                    </div>
                    
                    <div className="comment-metadata">
                      <div className="metadata-section">
                        <h4>Response Time</h4>
                        <p>{comment.responseTime || 'Not yet responded'}</p>
                      </div>
                      
                      <div className="metadata-section">
                        <h4>Keywords</h4>
                        <div className="keywords-list">
                          {comment.keywords.map((keyword, index) => (
                            <span key={index} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="metadata-section">
                        <h4>Category</h4>
                        <p>{comment.category.charAt(0).toUpperCase() + comment.category.slice(1)}</p>
                      </div>
                    </div>
                    
                    <div className="comment-actions">
                      <button className="action-button">Mark as Resolved</button>
                      <button className="action-button">Assign</button>
                      <button className="action-button">Add Response</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-comments-message">
              No comments match your current filters. Try adjusting your search criteria.
            </div>
          )}
        </div>
      </div>
      
      {/* Add some styles to make this component look good */}
      <style jsx>{`
        .customer-comment-analysis {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .comment-analysis-header {
          margin-bottom: 2rem;
        }
        
        .comment-analysis-header h1 {
          margin-bottom: 1.5rem;
          color: #374151;
        }
        
        .comment-metrics-container {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .comment-metric {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 1rem;
          min-width: 120px;
          text-align: center;
          border-top: 4px solid #6b7280;
        }
        
        .comment-metric.positive {
          border-top-color: #10b981;
        }
        
        .comment-metric.negative {
          border-top-color: #ef4444;
        }
        
        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .metric-label {
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .comments-filter-container {
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: space-between;
        }
        
        .filter-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .category-button {
          background-color: #f3f4f6;
          border: none;
          border-radius: 20px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          color: #4b5563;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .category-button:hover {
          background-color: #e5e7eb;
        }
        
        .category-button.active {
          background-color: #3b82f6;
          color: white;
        }
        
        .search-input, .sentiment-select {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          min-width: 200px;
        }
        
        .comments-list-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .comments-list-header {
          display: flex;
          background-color: #f9fafb;
          padding: 1rem;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .column-header {
          cursor: pointer;
        }
        
        .column-header.date {
          width: 120px;
        }
        
        .column-header.customer {
          width: 180px;
        }
        
        .column-header.content {
          flex: 1;
        }
        
        .column-header.priority,
        .column-header.sentiment,
        .column-header.status {
          width: 120px;
          text-align: center;
        }
        
        .sort-indicator {
          margin-left: 0.25rem;
        }
        
        .comment-item {
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .comment-item:hover {
          background-color: #f9fafb;
        }
        
        .comment-item.expanded {
          background-color: #f3f4f6;
        }
        
        .comment-summary {
          display: flex;
          padding: 1rem;
          align-items: center;
        }
        
        .comment-date {
          width: 120px;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .comment-customer {
          width: 180px;
          font-weight: 500;
        }
        
        .comment-content {
          flex: 1;
          color: #4b5563;
        }
        
        .comment-priority,
        .comment-sentiment,
        .comment-status {
          width: 120px;
          text-align: center;
          font-size: 0.875rem;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
        }
        
        .comment-priority.high {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .comment-priority.medium {
          background-color: #fef3c7;
          color: #b45309;
        }
        
        .comment-priority.low {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .comment-sentiment.positive {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .comment-sentiment.neutral {
          background-color: #f3f4f6;
          color: #4b5563;
        }
        
        .comment-sentiment.negative {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .comment-status.open {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .comment-status.in-progress {
          background-color: #fef3c7;
          color: #b45309;
        }
        
        .comment-status.closed {
          background-color: #d1d5db;
          color: #4b5563;
        }
        
        .comment-details {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          background-color: white;
        }
        
        .comment-full-content h4 {
          margin-bottom: 0.5rem;
          color: #374151;
        }
        
        .comment-full-content p {
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .comment-metadata {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }
        
        .metadata-section h4 {
          margin-bottom: 0.5rem;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .keyword-tag {
          background-color: #e5e7eb;
          color: #4b5563;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .comment-actions {
          display: flex;
          gap: 1rem;
        }
        
        .action-button {
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        .action-button:hover {
          background-color: #2563eb;
        }
        
        .no-comments-message {
          padding: 2rem;
          text-align: center;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default CustomerCommentAnalysis; 