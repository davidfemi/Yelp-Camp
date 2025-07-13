import { useEffect } from 'react';

interface SEOConfig {
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
  structuredData?: object;
}

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData
}: SEOConfig) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Function to set or update meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set canonical URL
    const setCanonicalUrl = (href: string) => {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', href);
    };

    // Set structured data
    const setStructuredData = (data: object) => {
      // Remove existing structured data
      const existing = document.querySelector('script[type="application/ld+json"]');
      if (existing) {
        existing.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    // Update basic meta tags
    if (description) {
      setMetaTag('description', description);
    }

    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    if (title) {
      setMetaTag('og:title', title, true);
    }

    if (description) {
      setMetaTag('og:description', description, true);
    }

    if (image) {
      setMetaTag('og:image', image, true);
    }

    if (url) {
      setMetaTag('og:url', url, true);
      setCanonicalUrl(url);
    }

    if (type) {
      setMetaTag('og:type', type, true);
    }

    // Update Twitter Card tags
    if (title) {
      setMetaTag('twitter:title', title, true);
    }

    if (description) {
      setMetaTag('twitter:description', description, true);
    }

    if (image) {
      setMetaTag('twitter:image', image, true);
    }

    setMetaTag('twitter:card', 'summary_large_image', true);

    // Add structured data if provided
    if (structuredData) {
      setStructuredData(structuredData);
    }

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      // Reset to default title if needed
      if (title && document.title === title) {
        document.title = "The Campgrounds - Discover Amazing Campgrounds";
      }
    };
  }, [title, description, keywords, image, url, type, structuredData]);
};
