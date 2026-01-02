
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
  const defaultImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200';
  
  // URL Normalization: Force lowercase and remove trailing slashes to prevent duplicate indexing
  const getNormalizedUrl = (path?: string) => {
    const domain = 'https://theforgeproperties.com';
    let cleanPath = path || window.location.pathname;
    
    // Ensure path starts with slash
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    
    // Remove trailing slash if it's not the root
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    
    return `${domain}${cleanPath.toLowerCase()}`;
  };

  const canonicalUrl = getNormalizedUrl(url);

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

    // 4. Open Graph (Social Cards)
    updateMeta('og:title', title, 'property'); 
    updateMeta('og:description', description || defaultDesc, 'property');
    
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

    // 6. Strict Canonical Link (Critical for resolving "Duplicate without user-selected canonical")
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', canonicalUrl);
    } else {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      document.head.appendChild(link);
    }

    // 7. Structured Data (JSON-LD)
    const existingScript = document.getElementById('json-ld-schema');
    if (existingScript) existingScript.remove();

    const baseOrgSchema = {
      "@type": "Organization",
      "name": siteName,
      "url": "https://theforgeproperties.com",
      "logo": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=512",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+234 800 FORGE 00",
        "contactType": "customer service",
        "areaServed": "NG",
        "availableLanguage": "en"
      },
      "sameAs": [
        "https://www.instagram.com/theforgeproperties_",
        "https://www.tiktok.com/@theforgegroup"
      ]
    };

    const websiteSchema = {
      "@type": "WebSite",
      "name": siteName,
      "url": "https://theforgeproperties.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://theforgeproperties.com/listings?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const combinedSchemaList = [baseOrgSchema, websiteSchema];
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
