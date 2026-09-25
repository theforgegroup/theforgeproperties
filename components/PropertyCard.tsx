
import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Move, MapPin, Map as MapIcon, FileCheck2 } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const listingUrl = `/listings/${property.slug}`;
  const mapUrl = property.map_url && property.map_url.startsWith('http') 
    ? property.map_url 
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.map_url || property.location)}`;
  
  return (
    <div className="group property-card-lift bg-white overflow-hidden border border-[#E5E7EB] flex flex-col h-full rounded-2xl md:rounded-3xl shadow-sm">
      <div className="relative h-56 md:h-64 overflow-hidden bg-[#F3F4F6]">
        <Link to={listingUrl}>
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-3 left-3 md:top-4 md:left-4">
          <span className="bg-[#FE4A23] text-white text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 uppercase tracking-widest rounded-md shadow-sm">
            {property.status_badge || property.status}
          </span>
        </div>
        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex gap-2">
           <span className="bg-[#774DFF] text-white text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 uppercase tracking-widest rounded-md shadow-sm">
            {property.type}
          </span>
        </div>
        
        {/* Quick Map Action */}
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white/95 backdrop-blur-sm p-2 rounded-full text-[#774DFF] hover:bg-[#774DFF] hover:text-white transition-colors shadow-lg md:translate-y-12 md:group-hover:translate-y-0 transition-transform duration-300"
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
          className="flex items-center text-slate-500 text-[10px] md:text-xs mb-2 md:mb-3 font-bold uppercase tracking-widest hover:text-[#774DFF] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin size={12} className="mr-1 text-[#774DFF]" />
          {property.location}
        </a>
        
        <Link to={listingUrl} className="block mb-1 md:mb-2">
          <h3 className="text-lg md:text-xl font-bold text-[#0F172A] group-hover:text-[#774DFF] transition-colors line-clamp-1 leading-tight">
            {property.title}
          </h3>
        </Link>
        
        <div className="text-xl md:text-2xl font-bold text-[#774DFF] mb-3 md:mb-4">
          ₦{property.price.toLocaleString()}
          {property.status === 'For Rent' && <span className="text-xs md:text-sm text-slate-500 font-normal"> / year</span>}
        </div>

        <div className="flex items-center justify-between mb-4 border-y border-[#E5E7EB] py-3 text-[#0F172A]/70 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Bed size={14} className="text-[#774DFF]" />
            <span>{property.bedrooms} <span className="hidden sm:inline">Beds</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={14} className="text-[#774DFF]" />
            <span>{property.bathrooms} <span className="hidden sm:inline">Baths</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Move size={14} className="text-[#774DFF]" />
            <span>{property.area_sq_ft.toLocaleString()} <span className="hidden sm:inline">sq ft</span></span>
          </div>
        </div>

        {/* Documentation line (editable from admin, not hardcoded) */}
        <div className="mb-4 p-2 bg-[#F3F4F6] rounded-[6px] border border-[#E5E7EB] text-[11px] text-[#0F172A] flex items-center gap-2">
          <FileCheck2 size={13} className="text-[#774DFF] shrink-0" />
          <span className="font-semibold truncate">
            {property.documentation || 'Deed of Assignment + Registered Survey Plan'}
          </span>
        </div>

        <Link 
          to={listingUrl}
          className="mt-auto w-full bg-transparent border border-[#774DFF] text-[#774DFF] py-3 md:py-3.5 rounded-[8px] text-[11px] md:text-xs font-bold uppercase tracking-widest hover:bg-[#774DFF] hover:text-white transition-all text-center shadow-xs"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
