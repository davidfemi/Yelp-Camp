import React from 'react';
import { Helmet } from 'react-helmet-async';

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

  // Enhanced keywords for campground pages
  const enhancedKeywords = location 
    ? `${keywords}, ${location}, campground near ${location}, camping ${location}`
    : keywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={enhancedDescription} />
      <meta name="keywords" content={enhancedKeywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={enhancedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="The Campgrounds" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={enhancedDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@thecampgrounds" />

      {/* Schema.org structured data for campgrounds */}
      {location && price && (
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      )}

      {/* Additional meta tags for better SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="The Campgrounds" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
    </Helmet>
  );
};

export default SEOHead; 