import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading">
      <div className="loading__container">
        <div className="loading__spinner">
          <div className="loading__dot"></div>
          <div className="loading__dot"></div>
          <div className="loading__dot"></div>
        </div>
        <p className="loading__text">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;