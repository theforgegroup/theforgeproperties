
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
  const defaultDesc = 'The Forge Properties is the premier luxury real estate division of The Forge Group. Discover exclusive villas, penthouses, and estates in Nigeria.';
  const defaultKeywords = 'luxury real estate nigeria, lagos property, banana island homes, the forge properties, real estate investment nigeria';
  const defaultImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200';
  const canonicalUrl = url ? `https://theforgeproperties.com${url}` : window.location.href;

  useEffect(() => {
    // 1. Browser Title
    document.title = fullTitle;
    
    // 2. Head Meta Tags Helper
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Standard SEO
    updateMeta('description', description || defaultDesc);
    updateMeta('keywords', keywords || defaultKeywords);

    // 4. Open Graph (Facebook / WhatsApp / LinkedIn)
    // IMPORTANT: Social platforms prefer the RAW title for the card
    updateMeta('og:title', title, 'property'); 
    updateMeta('og:description', description || defaultDesc, 'property');
    
    // Ensure image is absolute for social scrapers
    let socialImage = image || defaultImage;
    if (socialImage.startsWith('/') && !socialImage.startsWith('//')) {
      socialImage = `https://theforgeproperties.com${socialImage}`;
    }
    updateMeta('og:image', socialImage, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:type', type === 'article' ? 'article' : 'website', 'property');
    updateMeta('og:site_name', siteName, 'property');

    // 5. Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description || defaultDesc);
    updateMeta('twitter:image', socialImage);

    // 6. Canonical Link
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    // 7. Structured Data (JSON-LD)
    const existingScript = document.getElementById('json-ld-schema');
    if (existingScript) existingScript.remove();

    if (schema) {
      const script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        ...schema
      });
      document.head.appendChild(script);
    }
  }, [fullTitle, title, description, keywords, image, canonicalUrl, type, schema]);

  return null;
};
