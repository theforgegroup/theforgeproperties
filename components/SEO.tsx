
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
  const defaultDesc = 'Discover Nigerias most exclusive luxury real estate portfolio with The Forge Properties. Exceptional residences, penthouses, and estates defined by excellence.';
  const defaultKeywords = 'luxury real estate nigeria, lagos property, banana island homes, the forge properties, real estate investment nigeria, maitama houses';
  
  // High-res default image for the brand
  const defaultImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200';
  
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
    document.title = fullTitle;
    
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const finalDescription = description || defaultDesc;
    updateMeta('description', finalDescription);
    updateMeta('keywords', keywords || defaultKeywords);

    // Open Graph
    updateMeta('og:title', title, 'property'); 
    updateMeta('og:description', finalDescription, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:type', type === 'article' ? 'article' : 'website', 'property');
    updateMeta('og:site_name', siteName, 'property');
    
    // Image Handling for Social Media
    let socialImage = image || defaultImage;
    if (socialImage.startsWith('/') && !socialImage.startsWith('//')) {
      socialImage = `https://theforgeproperties.com${socialImage}`;
    }
    
    updateMeta('og:image', socialImage, 'property');
    updateMeta('og:image:secure_url', socialImage, 'property');
    updateMeta('og:image:alt', title, 'property');
    
    // Help crawlers know the image size immediately
    updateMeta('og:image:width', '1200', 'property');
    updateMeta('og:image:height', '630', 'property');
    
    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image'); // Large image format
    updateMeta('twitter:site', '@theforgegroup');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', finalDescription);
    updateMeta('twitter:image', socialImage);

    // Canonical
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
      "logo": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=512"
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
