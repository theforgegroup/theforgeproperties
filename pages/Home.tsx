import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Clock } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../context/PropertyContext';

export const Home: React.FC = () => {
  const { properties } = useProperties();
  // Increased slice to 4 to show one more property card
  const featuredProperties = properties.filter(p => p.featured).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2600&auto=format&fit=crop" 
            alt="Luxury Modern Mansion" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <span className="text-forge-gold text-sm md:text-base uppercase tracking-[0.4em] mb-4 block animate-fade-in-up font-bold">
            Defined by Excellence
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-8 drop-shadow-2xl">
            Luxury Living,<br />Elevated by The Forge.
          </h1>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link 
              to="/listings" 
              className="bg-forge-gold text-forge-navy text-sm md:text-base px-8 py-4 uppercase tracking-widest font-bold hover:bg-white transition-colors duration-300 w-64 md:w-auto shadow-lg"
            >
              View Listings
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white text-sm md:text-base px-8 py-4 uppercase tracking-widest font-bold hover:bg-white hover:text-forge-navy transition-colors duration-300 w-64 md:w-auto backdrop-blur-sm"
            >
              Request Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif text-forge-navy mb-6">A Legacy of Distinction</h2>
          <div className="w-24 h-1 bg-forge-gold mx-auto mb-8"></div>
          <p className="text-slate-600 leading-loose text-lg">
            At The Forge Properties, we do not merely sell real estate; we curate lifestyles. 
            As the exclusive real estate division of The Forge Group of Companies, we offer access to 
            the most coveted properties in the world's most desirable locations. From urban penthouses 
            to coastal estates, our portfolio is a testament to uncompromised quality and elegance.
          </p>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-forge-navy mb-2">Featured Collection</h2>
              <p className="text-slate-500">Handpicked properties for the discerning buyer.</p>
            </div>
            <Link to="/listings" className="hidden md:flex items-center gap-2 text-forge-navy font-bold uppercase tracking-widest text-xs hover:text-forge-gold transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {/* Updated grid to support 4 columns for large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/listings" className="inline-block border-b-2 border-forge-gold pb-1 text-forge-navy font-bold uppercase tracking-widest text-xs">
              View All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-forge-navy text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 border border-slate-700/50 hover:border-forge-gold transition-all duration-500 bg-gradient-to-br from-forge-dark to-transparent hover:bg-slate-800">
              <Shield className="w-12 h-12 text-forge-gold mx-auto mb-6" />
              <h3 className="text-xl font-serif mb-4">Unwavering Integrity</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Trust is the cornerstone of our business. We operate with complete transparency and discretion for our high-profile clientele.
              </p>
            </div>
            <div className="p-8 border border-slate-700/50 hover:border-forge-gold transition-all duration-500 bg-gradient-to-br from-forge-dark to-transparent hover:bg-slate-800">
              <Award className="w-12 h-12 text-forge-gold mx-auto mb-6" />
              <h3 className="text-xl font-serif mb-4">Proven Excellence</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                With billions in sales volume, our team has established a reputation for closing the most complex and valuable deals.
              </p>
            </div>
            <div className="p-8 border border-slate-700/50 hover:border-forge-gold transition-all duration-500 bg-gradient-to-br from-forge-dark to-transparent hover:bg-slate-800">
              <Clock className="w-12 h-12 text-forge-gold mx-auto mb-6" />
              <h3 className="text-xl font-serif mb-4">24/7 Concierge</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our service doesn't end at the closing table. We offer lifestyle management and property concierge services post-purchase.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};