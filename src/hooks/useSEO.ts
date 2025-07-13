import { useEffect } from 'react';

interface SEOParams {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  price?: number;
  location?: string;
  rating?: number;
  reviewCount?: number;
  structuredData?: Record<string, any>;
}

export const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  price,
  location,
  rating,
  reviewCount,
  structuredData
}: SEOParams) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMetaTag = (property: string, content: string, isProperty = false) => {
      if (!content) return;
      
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

    const setLinkTag = (rel: string, href: string) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    const setStructuredData = (data: Record<string, any>) => {
      if (!data) return;
      
      const existing = document.querySelector('script[type="application/ld+json"]');
      if (existing) {
        existing.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    setMetaTag('description', description || '');
    setMetaTag('viewport', 'width=device-width, initial-scale=1');
    setMetaTag('robots', 'index, follow');
    setMetaTag('author', 'The Campgrounds');

    setMetaTag('og:title', title || '', true);
    setMetaTag('og:description', description || '', true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', url || '', true);
    setMetaTag('og:image', image || '', true);
    setMetaTag('og:site_name', 'The Campgrounds', true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title || '');
    setMetaTag('twitter:description', description || '');
    setMetaTag('twitter:image', image || '');
    setMetaTag('twitter:site', '@thecampgrounds');

    if (price) {
      setMetaTag('product:price:amount', price.toString());
      setMetaTag('product:price:currency', 'USD');
    }

    if (location) {
      setMetaTag('geo.placename', location);
    }

    if (url) {
      setLinkTag('canonical', url);
    }

    if (structuredData) {
      setStructuredData(structuredData);
    } else if (type === 'campground' && title && description) {
      const campgroundSchema = {
        "@context": "https://schema.org",
        "@type": "Campground",
        "name": title,
        "description": description,
        ...(image && { "image": image }),
        ...(location && {
          "address": {
            "@type": "PostalAddress",
            "addressLocality": location
          }
        }),
        ...(price && { "priceRange": `$${price}` }),
        ...(rating && reviewCount && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": reviewCount
          }
        })
      };
      setStructuredData(campgroundSchema);
    }

    return () => {
      // Cleanup on unmount
    };
  }, [title, description, image, url, type, price, location, rating, reviewCount, structuredData]);
};

export default useSEO; 