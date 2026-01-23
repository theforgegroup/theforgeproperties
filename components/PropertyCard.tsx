import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Move, MapPin, Map as MapIcon, ArrowUpRight } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const listingUrl = `/listings/${property.slug || property.id}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`;
  
  return (
    <div className="group bg-white shadow-sm hover:shadow-3xl transition-all duration-700 overflow-hidden border border-slate-100 flex flex-col h-full rounded-sm">
      <div className="relative h-72 overflow-hidden">
        <Link to={listingUrl}>
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </Link>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-forge-navy/90 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-[0.2em] rounded-sm">
            {property.status}
          </span>
          <span className="bg-forge-gold text-forge-navy text-[9px] font-bold px-3 py-1.5 uppercase tracking-[0.2em] rounded-sm shadow-lg">
            {property.type}
          </span>
        </div>
        
        {/* Quick Map Action */}
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full text-forge-navy flex items-center justify-center hover:bg-forge-gold hover:text-forge-navy transition-all shadow-xl translate-y-16 group-hover:translate-y-0 transition-transform duration-500"
          title="View on Google Maps"
          onClick={(e) => e.stopPropagation()}
        >
          <MapIcon size={18} />
        </a>

        <div className="absolute inset-0 bg-forge-navy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>

      <div className="p-7 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <Link to={listingUrl}>
              <h3 className="text-xl font-serif text-forge-navy group-hover:text-forge-gold transition-colors duration-300 line-clamp-1 mb-1">
                {property.title}
              </h3>
            </Link>
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-forge-gold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={12} className="mr-1.5 text-forge-gold" />
              {property.location}
            </a>
          </div>
          <Link to={listingUrl} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-forge-gold group-hover:text-forge-gold transition-all">
            <ArrowUpRight size={16} />
          </Link>
        </div>
        
        <div className="text-2xl font-light text-forge-navy mb-6">
          <span className="text-sm font-bold align-top mt-1 inline-block mr-0.5">₦</span>
          {property.price.toLocaleString()}
          {property.status === 'For Rent' && <span className="text-xs text-slate-400 font-normal tracking-widest"> / YEAR</span>}
        </div>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 text-slate-500 text-[11px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <Bed size={16} className="text-forge-gold/60" />
            <span>{property.bedrooms} <span className="hidden sm:inline">Beds</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Bath size={16} className="text-forge-gold/60" />
            <span>{property.bathrooms} <span className="hidden sm:inline">Baths</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Move size={16} className="text-forge-gold/60" />
            <span>{property.area_sq_ft.toLocaleString()} <span className="hidden sm:inline">Sq Ft</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};