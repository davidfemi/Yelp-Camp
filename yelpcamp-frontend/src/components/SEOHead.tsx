import React from 'react';
import { useSEO } from '../hooks/useSEO';

interface SEOHeadProps {
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
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "The Campgrounds - Discover Amazing Campgrounds",
  description = "Discover and share amazing campgrounds around the world. Find your perfect outdoor adventure with detailed reviews, photos, and maps.",
  keywords = "camping, campgrounds, outdoor, adventure, nature, travel, reviews",
  image = "https://thecampground.vercel.app/og-image.png",
  url = "https://thecampground.vercel.app",
  type = "website",
  price,
  location,
  rating,
  reviewCount
}) => {
  // Enhanced description for campground pages
  const enhancedDescription = location && price 
    ? `${description} Located in ${location}, starting at $${price}/night.${rating ? ` Rated ${rating}/5 stars` : ''}${reviewCount ? ` with ${reviewCount} reviews` : ''}.`
    : description;

  // Create structured data for campgrounds
  const structuredData = location && price ? {
    "@context": "https://schema.org",
    "@type": "Campground",
    "name": title,
    "description": enhancedDescription,
    "image": image,
    "url": url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location
    },
    "priceRange": `$${price}`,
    ...(rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "reviewCount": reviewCount || 1,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  } : undefined;

  // Use our custom SEO hook
  useSEO({
    title,
    description: enhancedDescription,
    image,
    url,
    type,
    price,
    location,
    rating,
    reviewCount,
    structuredData
  });

  // This component doesn't render anything visible
  return null;
};

export default SEOHead; 