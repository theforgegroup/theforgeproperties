
import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'realestate';
  schema?: object;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  schema 
}) => {
  const siteName = 'The Forge Properties';
  const fullTitle = `${title} | ${siteName}`;
  const defaultDesc = 'Discover Nigeria\'s most exclusive luxury real estate portfolio. Exceptional residences, penthouses, and estates defined by excellence.';
  const defaultKeywords = 'luxury real estate nigeria, lagos property, banana island homes, the forge properties, real estate investment nigeria';
  
  // High-res default image for the brand (1200x630 is optimal for OG/Twitter)
  const defaultImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&h=630&fit=crop';
  
  const getNormalizedUrl = (path?: string) => {
    const domain = 'https://theforgeproperties.com';
    let cleanPath = path || window.location.pathname;
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    return `${domain}${cleanPath.toLowerCase()}`;
  };

  const canonicalUrl = getNormalizedUrl(url);

  useEffect(() => {
    // Set Document Title
    document.title = fullTitle;
    
    // Meta Tag Update Helper
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      // Find and remove any existing tags with this specific attribute/name combo
      const existingTags = document.querySelectorAll(`meta[${attr}="${name}"]`);
      existingTags.forEach(tag => tag.remove());

      if (content) {
        const element = document.createElement('meta');
        element.setAttribute(attr, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    const finalDescription = description || defaultDesc;
    updateMeta('description', finalDescription);
    updateMeta('keywords', keywords || defaultKeywords);

    // Image URL Logic: Ensure it is an absolute HTTPS URL
    let socialImage = image || defaultImage;
    if (socialImage.startsWith('/') && !socialImage.startsWith('//')) {
      socialImage = `https://theforgeproperties.com${socialImage}`;
    }
    // Force https if it's missing (common in some dynamic URL scenarios)
    if (socialImage.startsWith('http:')) {
      socialImage = socialImage.replace('http:', 'https:');
    }

    // Open Graph Tags - Essential for WhatsApp/FB/LinkedIn
    updateMeta('og:title', title, 'property'); 
    updateMeta('og:description', finalDescription, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:type', type === 'article' ? 'article' : 'website', 'property');
    updateMeta('og:site_name', siteName, 'property');
    updateMeta('og:image', socialImage, 'property');
    updateMeta('og:image:secure_url', socialImage, 'property');
    updateMeta('og:image:alt', title, 'property');
    updateMeta('og:image:width', '1200', 'property');
    updateMeta('og:image:height', '630', 'property');
    
    // Twitter Card Tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', '@theforgegroup');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', finalDescription);
    updateMeta('twitter:image', socialImage);

    // Canonical Link
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', canonicalUrl);
    } else {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      document.head.appendChild(link);
    }

    // JSON-LD Schema
    const existingScript = document.getElementById('json-ld-schema');
    if (existingScript) existingScript.remove();

    const baseOrgSchema = {
      "@type": "Organization",
      "name": siteName,
      "url": "https://theforgeproperties.com",
      "logo": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=512",
      "image": socialImage 
    };

    const combinedSchemaList = [baseOrgSchema];
    if (schema) {
      if ((schema as any)["@graph"]) {
        combinedSchemaList.push(...(schema as any)["@graph"]);
      } else {
        combinedSchemaList.push(schema);
      }
    }

    const script = document.createElement('script');
    script.id = 'json-ld-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": combinedSchemaList
    });
    document.head.appendChild(script);

  }, [fullTitle, title, description, keywords, image, canonicalUrl, type, schema]);

  return null;
};
