import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Đang tải...', color = 'primary-500', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-8 w-8 border-4',
    large: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-${color} transition-all duration-300 ease-in-out`}
      ></div>
      {text && <p className="mt-4 text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;