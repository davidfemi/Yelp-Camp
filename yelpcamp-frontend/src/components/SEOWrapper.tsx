import React from 'react';
import SEOHead from './SEOHead';

interface SEOWrapperProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  price?: number;
  location?: string;
  rating?: number;
  reviewCount?: number;
  children: React.ReactNode;
}

const SEOWrapper: React.FC<SEOWrapperProps> = ({
  children,
  ...seoProps
}) => {
  return (
    <>
      <SEOHead {...seoProps} />
      {children}
    </>
  );
};

export default SEOWrapper; 