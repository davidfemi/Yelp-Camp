import React from 'react';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  size = 'medium',
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const containerClasses = overlay 
    ? 'fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* YelpCamp Logo */}
        <svg 
          className={`${sizeClasses[size]} mb-4 animate-pulse`}
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Circle */}
          <circle 
            cx="100" 
            cy="100" 
            r="90" 
            stroke="#4a5d23" 
            strokeWidth="6" 
            fill="#f5f3f0"
          />
          
          {/* Sun */}
          <circle cx="100" cy="60" r="12" fill="#4a5d23"/>
          
          {/* Clouds */}
          <path 
            d="M60 50 C55 45, 45 45, 45 50 C40 50, 40 55, 45 55 L60 55 C65 55, 65 50, 60 50 Z" 
            fill="#4a5d23"
          />
          <path 
            d="M155 50 C150 45, 140 45, 140 50 C135 50, 135 55, 140 55 L155 55 C160 55, 160 50, 155 50 Z" 
            fill="#4a5d23"
          />
          
          {/* Trees */}
          <g stroke="#4a5d23" strokeWidth="3">
            <path d="M40 120 L40 140 M35 125 L45 125 M37 130 L43 130 M38 135 L42 135"/>
            <path d="M160 120 L160 140 M155 125 L165 125 M157 130 L163 130 M158 135 L162 135"/>
            <path d="M170 125 L170 140 M167 128 L173 128 M168 132 L172 132"/>
          </g>
          
          {/* Tent */}
          <path 
            d="M70 100 L100 80 L130 100 L130 130 L70 130 Z" 
            fill="#4a5d23"
          />
          <path 
            d="M100 80 L100 130" 
            stroke="#f5f3f0" 
            strokeWidth="2"
          />
          <path 
            d="M85 130 L85 115 L100 115" 
            stroke="#f5f3f0" 
            strokeWidth="2"
          />
          
          {/* Campfire */}
          <circle 
            cx="140" 
            cy="125" 
            r="8" 
            fill="none" 
            stroke="#4a5d23" 
            strokeWidth="2"
          />
          <path 
            d="M135 125 C135 120, 140 118, 142 122 C144 118, 149 120, 145 125" 
            fill="#4a5d23"
          />
          
          {/* Ground line */}
          <g stroke="#4a5d23" strokeWidth="3">
            <path d="M30 140 L50 140 M60 140 L80 140 M90 140 L110 140 M120 140 L140 140 M150 140 L170 140"/>
          </g>
        </svg>
        
        {/* Spinning indicator */}
        <div 
          className={`
            border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4
            ${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-8 h-8' : 'w-10 h-10'}
          `}
        ></div>
        
        {/* Loading message */}
        <p 
          className={`
            text-gray-600 font-medium text-center
            ${size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'}
          `}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 