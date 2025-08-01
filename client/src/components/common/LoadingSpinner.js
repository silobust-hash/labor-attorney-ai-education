import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '로딩 중...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className={`animate-spin rounded-full border-4 border-secondary-200 border-t-primary-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-secondary-600 text-sm">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 