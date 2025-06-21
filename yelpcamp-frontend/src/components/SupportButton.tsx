import React from 'react';
import { Button } from 'react-bootstrap';
import { showIntercom } from '../services/intercomService';

interface SupportButtonProps {
  variant?: string;
  size?: 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const SupportButton: React.FC<SupportButtonProps> = ({ 
  variant = 'outline-primary', 
  size,
  className = '',
  children = '💬 Get Help'
}) => {
  const handleClick = () => {
    showIntercom();
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export default SupportButton; 