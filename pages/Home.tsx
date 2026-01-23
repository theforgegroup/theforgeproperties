import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Clock, Loader2, Sparkles, MapPin, Search } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';

export const Home: React.FC = () => {
  const { properties, isLoading } = useProperties();
  
  const featuredOnly = properties.filter(p => p.featured);
  const displayProperties = featuredOnly.length > 0 
    ? featuredOnly.slice(0, 4) 
    : properties.slice(0, 4);

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
        description="Explore Nigeria's most prestigious real estate portfolio. The Forge Properties offers uncompromised luxury residences in Banana Island, Ikoyi, and Maitama."
      />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105 animate-[slowZoom_20s_infinite_alternate]">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2600&auto=format&fit=crop" 
            alt="Luxury Modern Mansion" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forge-dark/80 via-forge-navy/40 to-forge-dark/90" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-3 text-forge-gold text-[10px] md:text-[12px] uppercase tracking-[0.6em] mb-6 font-bold bg-white/5 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full">
              <Sparkles size={14} className="animate-pulse" /> The Elite Standard
            </span>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif text-white font-bold leading-[1.1] mb-10">
              Luxury Living,<br /> <span className="italic font-normal">Curated</span> by The Forge.
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/listings" 
                className="group flex items-center gap-3 bg-forge-gold text-forge-navy px-10 py-5 uppercase tracking-[0.2em] font-bold text-xs hover:bg-white transition-all duration-500 w-full sm:w-auto shadow-2xl shadow-forge-gold/20"
              >
                Explore Portfolio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/contact" 
                className="px-10 py-5 border border-white/30 text-white uppercase tracking-[0.2em] font-bold text-xs hover:bg-white/10 backdrop-blur-sm transition-all duration-500 w-full sm:w-auto"
              >
                Private Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce opacity-50">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-forge-gold"></div>
        </div>
      </section>

      {/* Trust & Authority Section */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-forge-gold/10 rounded-full blur-3xl"></div>
              <h2 className="text-4xl md:text-6xl font-serif text-forge-navy mb-8 leading-tight">A Legacy of <br /><span className="text-forge-gold italic">Distinction.</span></h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-xl">
                At The Forge Properties, we do not merely sell real estate; we curate lifestyles. 
                As the exclusive real estate division of The Forge Group, we provide uncompromised 
                access to Nigeria's most coveted residential assets.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-forge-navy text-forge-gold rounded-sm"><Shield size={24} /></div>
                  <div>
                    <h4 className="font-bold text-forge-navy text-sm uppercase tracking-widest mb-1">Discretion</h4>
                    <p className="text-xs text-slate-500">Private off-market opportunities for elite clients.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-forge-navy text-forge-gold rounded-sm"><Award size={24} /></div>
                  <div>
                    <h4 className="font-bold text-forge-navy text-sm uppercase tracking-widest mb-1">Excellence</h4>
                    <p className="text-xs text-slate-500">Highest standards of architectural integrity.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?q=80&w=800" className="rounded-sm shadow-xl mt-12" alt="Interior 1" />
              <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800" className="rounded-sm shadow-xl" alt="Interior 2" />
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collection Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-forge-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-3 block">Selected Works</span>
              <h2 className="text-3xl md:text-5xl font-serif text-forge-navy">
                The Curated Collection
              </h2>
            </div>
            <Link to="/listings" className="group flex items-center gap-2 text-forge-navy font-bold uppercase tracking-[0.2em] text-xs hover:text-forge-gold transition-all duration-300">
              View All Listings <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-lg">
              <Search size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-serif text-slate-400 mb-2">Portfolio Update in Progress</h3>
              <p className="text-slate-500 text-sm">New exclusive listings are currently being vetted.</p>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};