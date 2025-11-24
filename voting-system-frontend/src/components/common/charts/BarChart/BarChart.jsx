import React, { useState, useEffect } from 'react';
import './BarChart.scss';

const BarChart = ({ data, animated = true, height = 300, className = '' }) => {
  const [animatedData, setAnimatedData] = useState([]);
  const maxValue = Math.max(...data.map(item => item.value || 0));
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  useEffect(() => {
    if (animated) {
      // Reset animation
      setAnimatedData(data.map(item => ({ ...item, animatedValue: 0 })));
      
      // Animate to actual values
      const timer = setTimeout(() => {
        setAnimatedData(data.map(item => ({ ...item, animatedValue: item.value })));
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setAnimatedData(data.map(item => ({ ...item, animatedValue: item.value })));
    }
  }, [data, animated]);

  const chartClass = [
    'bar-chart',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={chartClass} style={{ height }}>
      <div className="bar-chart__container">
        {animatedData.map((item, index) => {
          const percentage = maxValue > 0 ? (item.animatedValue / maxValue) * 100 : 0;
          const votePercentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          
          return (
            <div key={item.id || index} className="bar-chart__item">
              <div className="bar-chart__bar-container">
                <div 
                  className="bar-chart__bar"
                  style={{ 
                    height: `${percentage}%`,
                    backgroundColor: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                  }}
                >
                  <div className="bar-chart__value">
                    {item.animatedValue}
                  </div>
                </div>
              </div>
              
              <div className="bar-chart__label">
                <div className="bar-chart__label-text">{item.label}</div>
                <div className="bar-chart__percentage">{votePercentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="bar-chart__legend">
        {data.map((item, index) => (
          <div key={item.id || index} className="bar-chart__legend-item">
            <div 
              className="bar-chart__legend-color"
              style={{ 
                backgroundColor: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
              }}
            />
            <span className="bar-chart__legend-text">{item.label}</span>
            <span className="bar-chart__legend-value">{item.value} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;