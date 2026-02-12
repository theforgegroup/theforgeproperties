
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Clock, Loader2, Users, ShieldCheck } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

export const Home: React.FC = () => {
  const { properties, isLoading } = useProperties();
  const { isAuthenticated, userRole } = useAuth();
  
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
      },
      {
        "@type": "SiteNavigationElement",
        "position": 5,
        "name": "Agent Portal",
        "url": "https://theforgeproperties.com/agent/portal"
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forge-navy">
        <SEO title="Loading The Forge..." />
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-forge-gold mx-auto mb-6" />
          <p className="font-serif italic text-forge-gold/60 tracking-[0.3em] uppercase text-[10px]">Entering The Forge Portfolio</p>
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
        schema={{ "@graph": [homeSchema, navigationSchema] }}
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

      {/* NEW: Agent CTA Section */}
      <section className="py-24 bg-forge-navy relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Corporate Tower"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-forge-dark/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
            <div className="flex-1 text-center md:text-left">
              <span className="text-forge-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Realtor Partnership</span>
              <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mb-6">Join our elite network of <span className="text-forge-gold">high-performing</span> agents.</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Unlock exclusive inventory, track your commissions in real-time, and leverage the power of The Forge brand to close bigger deals.
              </p>
              <Link 
                to={isAuthenticated && userRole === 'Agent' ? "/agent/dashboard" : "/agent/portal"}
                className="inline-flex items-center gap-4 bg-forge-gold text-forge-navy px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl group"
              >
                Access Realtor Portal <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hidden md:flex flex-col gap-6 w-1/3">
               {[
                 { icon: ShieldCheck, title: "Secure Payouts" },
                 { icon: Users, title: "Network Support" },
                 { icon: Award, title: "Elite Inventory" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                   <div className="w-10 h-10 bg-forge-gold/10 rounded-full flex items-center justify-center text-forge-gold">
                      <item.icon size={20} />
                   </div>
                   <span className="text-white font-bold text-xs uppercase tracking-widest">{item.title}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
