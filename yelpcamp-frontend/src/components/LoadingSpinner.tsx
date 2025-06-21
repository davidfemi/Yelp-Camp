import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-green-200 border-t-green-600',
    secondary: 'border-gray-200 border-t-gray-600',
    white: 'border-white border-opacity-30 border-t-white'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div 
        className={`
          border-2 rounded-full animate-spin
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
      />
    </div>
  );
};

export default LoadingSpinner; 