import React, { useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdvancedChart = ({
  title,
  data = [],
  type = 'bar',
  xDataKey,
  yDataKey,
  categories = [],
  comparisonValue = null,
  comparisonLabel = 'Target',
  percentage = false,
  height = 300,
  allowDownload = false,
  onDrillDown = null,
  description = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);

  // For bar and line charts, ensure yDataKey is an array
  const yDataKeys = Array.isArray(yDataKey) ? yDataKey : [yDataKey];
  
  // Handle pie/donut chart segment click for drill down
  const handlePieClick = useCallback((entry, index) => {
    if (onDrillDown) {
      const result = onDrillDown(entry, index);
      if (result) {
        setDrillDownData(result);
      }
    }
    setActiveIndex(index);
  }, [onDrillDown]);

  // Back from drill down
  const handleBackClick = () => {
    setDrillDownData(null);
    setActiveIndex(null);
  };

  // Format value for tooltip
  const formatValue = (value) => {
    if (typeof value !== 'number') return value;
    return percentage ? `${value.toFixed(1)}%` : value.toLocaleString();
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p 
            key={index} 
            className="tooltip-value"
            style={{ color: entry.color }}
          >
            {entry.name}: {formatValue(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  // Handle chart download (as PNG)
  const handleDownload = () => {
    const svgElement = document.querySelector(`.chart-container-${title.replace(/\s+/g, '-').toLowerCase()} svg`);
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-chart.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  // Render the appropriate chart type
  const renderChart = () => {
    if (drillDownData) {
      // Render drill down chart (always a bar chart for simplicity)
      return (
        <div className="drill-down-chart">
          <div className="drill-down-header">
            <button className="back-button" onClick={handleBackClick}>
              &larr; Back
            </button>
            <h3>{drillDownData.title}</h3>
          </div>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={drillDownData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xDataKey} />
              <YAxis 
                domain={[0, 'auto']} 
                tickFormatter={value => percentage ? `${value}%` : value} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {comparisonValue && (
                <ReferenceLine
                  y={comparisonValue}
                  stroke="#ff6b6b"
                  strokeDasharray="3 3"
                  label={comparisonLabel}
                />
              )}
              {yDataKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={COLORS[index % COLORS.length]} 
                  name={categories[index] || key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xDataKey} />
              <YAxis 
                domain={[0, 'auto']} 
                tickFormatter={value => percentage ? `${value}%` : value} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {comparisonValue && (
                <ReferenceLine
                  y={comparisonValue}
                  stroke="#ff6b6b"
                  strokeDasharray="3 3"
                  label={comparisonLabel}
                />
              )}
              {yDataKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  name={categories[index] || key}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yDataKey}
                nameKey={xDataKey}
                label={({ name, percent }) => 
                  percentage
                    ? `${name}: ${(percent * 100).toFixed(1)}%`
                    : `${name}: ${formatValue(data.find(item => item[xDataKey] === name)[yDataKey])}`
                }
                onClick={onDrillDown ? handlePieClick : undefined}
                activeIndex={activeIndex}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yDataKey}
                nameKey={xDataKey}
                label={({ name, percent }) => 
                  percentage
                    ? `${name}: ${(percent * 100).toFixed(1)}%`
                    : `${name}: ${formatValue(data.find(item => item[xDataKey] === name)[yDataKey])}`
                }
                onClick={onDrillDown ? handlePieClick : undefined}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className={`chart-container chart-container-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="chart-header">
        <div className="chart-title">
          <h3>{drillDownData ? drillDownData.title : title}</h3>
          {description && <p className="chart-description">{description}</p>}
        </div>
        {allowDownload && (
          <button className="download-button" onClick={handleDownload}>
            Download
          </button>
        )}
      </div>
      {renderChart()}
    </div>
  );
};

export default AdvancedChart; 