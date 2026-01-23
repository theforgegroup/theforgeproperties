import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Clock, Loader2 } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';

export const Home: React.FC = () => {
  const { properties, isLoading } = useProperties();
  
  const featuredOnly = properties.filter(p => p.featured);
  const displayProperties = featuredOnly.length > 0 
    ? featuredOnly.slice(0, 4) 
    : properties.slice(0, 4);

  const homeSchema = {
    "@type": "RealEstateAgent",
    "name": "The Forge Properties",
    "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2600",
    "url": "https://theforgeproperties.com",
    "telephone": "+2348003674300",
    "priceRange": "₦₦₦",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Silverland Estate, Sangotedo, Ajah",
      "addressLocality": "Lagos",
      "addressRegion": "Lagos State",
      "postalCode": "101245",
      "addressCountry": "NG"
    }
  };

  const navigationSchema = {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Luxury Listings",
        "url": "https://theforgeproperties.com/listings"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "The Forge Journal",
        "url": "https://theforgeproperties.com/blog"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "About the Team",
        "url": "https://theforgeproperties.com/about"
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Private Consultation",
        "url": "https://theforgeproperties.com/contact"
      }
    ]
  };

  const faqSchema = {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where does The Forge Properties operate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Forge Properties specializes in high-end luxury real estate in Nigeria, primarily focusing on Lagos (Ikoyi, Banana Island, Lekki) and Abuja (Maitama, Asokoro, Guzape)."
        }
      },
      {
        "@type": "Question",
        "name": "Does The Forge Properties offer off-market listings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we maintain an exclusive collection of off-market properties for our high-net-worth clients who prioritize discretion."
        }
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <SEO title="Loading The Forge..." />
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-forge-gold mx-auto mb-4" />
          <p className="font-serif italic text-slate-400 tracking-widest uppercase text-xs">Entering The Forge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO 
        title="Luxury Real Estate Nigeria | Defined by Excellence" 
        description="Explore Nigerias most prestigious real estate portfolio. The Forge Properties offers uncompromised luxury residences in Banana Island, Ikoyi, and Maitama."
        keywords="luxury real estate lagos, mansions for sale lagos, banana island houses, real estate nigeria, the forge group"
        schema={{ "@graph": [homeSchema, navigationSchema, faqSchema] }}
      />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2600&auto=format&fit=crop" 
            alt="Luxury Modern Mansion" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <span className="text-forge-gold text-[10px] md:text-sm uppercase tracking-[0.4em] mb-4 block animate-fade-in-up font-bold">
            Defined by Excellence
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-8 drop-shadow-2xl">
            Luxury Living,<br className="hidden sm:block" /> Elevated by The Forge.
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center max-w-lg mx-auto sm:max-w-none">
            <Link 
              to="/listings" 
              className="bg-forge-gold text-forge-navy text-xs md:text-base px-8 py-4 uppercase tracking-widest font-bold hover:bg-white transition-colors duration-300 w-full sm:w-auto shadow-lg"
            >
              Explore Portfolio
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white text-xs md:text-base px-8 py-4 uppercase tracking-widest font-bold hover:bg-white hover:text-forge-navy transition-colors duration-300 w-full sm:w-auto backdrop-blur-sm"
            >
              Private Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Legacy/Mission Section */}
      <section className="py-16 md:py-24 bg-white px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-serif text-forge-navy mb-6">A Legacy of Distinction</h2>
          <div className="w-16 md:w-24 h-1 bg-forge-gold mx-auto mb-8"></div>
          <p className="text-slate-600 leading-relaxed md:leading-loose text-base md:text-lg">
            At The Forge Properties, we do not merely sell real estate; we curate lifestyles. 
            As the exclusive real estate division of The Forge Group of Companies, we offer access to 
            the most coveted properties in Nigerias most desirable locations.
          </p>
        </div>
      </section>

      {/* Curated Collection Grid */}
      <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-10 gap-4 text-center sm:text-left">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif text-forge-navy mb-2">
                Curated Collection
              </h2>
              <p className="text-slate-500 text-sm md:text-base">Exceptional residences for the discerning client.</p>
            </div>
            <Link to="/listings" className="flex items-center gap-2 text-forge-navy font-bold uppercase tracking-widest text-[10px] md:text-xs hover:text-forge-gold transition-colors">
              View All Listings <ArrowRight size={16} />
            </Link>
          </div>
          
          {displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {displayProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-sm">
              <h3 className="text-xl font-serif text-slate-400 mb-2">Portfolio Update in Progress</h3>
              <p className="text-slate-500 text-sm">New exclusive listings are currently being added.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};