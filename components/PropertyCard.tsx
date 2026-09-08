
import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Move, MapPin, Map as MapIcon } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const listingUrl = `/listings/${property.slug}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`;
  
  return (
    <div className="group bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-[#E0E4FF] flex flex-col h-full rounded-2xl md:rounded-3xl">
      <div className="relative h-56 md:h-64 overflow-hidden">
        <Link to={listingUrl}>
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-3 left-3 md:top-4 md:left-4">
          <span className="bg-[#0057FF] text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 uppercase tracking-widest rounded-md">
            {property.status}
          </span>
        </div>
        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex gap-2">
           <span className="bg-[#C8FF00] text-[#0A0A0A] text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 uppercase tracking-widest rounded-md">
            {property.type}
          </span>
        </div>
        
        {/* Quick Map Action */}
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-[#0057FF] hover:bg-[#C8FF00] hover:text-[#0A0A0A] transition-colors shadow-lg md:translate-y-12 md:group-hover:translate-y-0 transition-transform duration-300"
          title="View on Google Maps"
          onClick={(e) => e.stopPropagation()}
        >
          <MapIcon size={18} />
        </a>
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-slate-500 text-[10px] md:text-xs mb-2 md:mb-3 font-bold uppercase tracking-widest hover:text-[#0057FF] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin size={12} className="mr-1 text-[#0057FF]" />
          {property.location}
        </a>
        
        <Link to={listingUrl} className="block mb-1 md:mb-2">
          <h3 className="text-lg md:text-xl font-bold text-[#0A0A0A] group-hover:text-[#0057FF] transition-colors line-clamp-1 leading-tight">
            {property.title}
          </h3>
        </Link>
        
        <div className="text-xl md:text-2xl font-bold text-[#0057FF] mb-3 md:mb-4">
          ₦{property.price.toLocaleString()}
          {property.status === 'For Rent' && <span className="text-xs md:text-sm text-slate-500 font-normal"> / year</span>}
        </div>

        <div className="flex items-center justify-between mb-4 md:mb-6 border-y border-[#E0E4FF] py-3 text-[#0A0A0A]/70 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Bed size={14} className="text-[#0057FF]" />
            <span>{property.bedrooms} <span className="hidden sm:inline">Beds</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={14} className="text-[#0057FF]" />
            <span>{property.bathrooms} <span className="hidden sm:inline">Baths</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Move size={14} className="text-[#0057FF]" />
            <span>{property.area_sq_ft.toLocaleString()} <span className="hidden sm:inline">sq ft</span></span>
          </div>
        </div>

        <Link 
          to={listingUrl}
          className="mt-auto w-full bg-white border border-[#0057FF] text-[#0057FF] py-3 md:py-4 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#0057FF] hover:text-white transition-all text-center shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
