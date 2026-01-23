
import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Move, MapPin, Map as MapIcon } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const listingUrl = `/listings/${property.slug || property.id}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`;
  
  return (
    <div className="group bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <Link to={listingUrl}>
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        </Link>
        <div className="absolute top-4 left-4">
          <span className="bg-forge-navy text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
            {property.status}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
           <span className="bg-forge-gold text-forge-navy text-xs font-bold px-3 py-1 uppercase tracking-widest">
            {property.type}
          </span>
        </div>
        
        {/* Quick Map Action */}
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-forge-navy hover:bg-forge-gold transition-colors shadow-lg translate-y-12 group-hover:translate-y-0 transition-transform duration-300"
          title="View on Google Maps"
          onClick={(e) => e.stopPropagation()}
        >
          <MapIcon size={18} />
        </a>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-slate-500 text-xs mb-3 font-medium uppercase tracking-wide hover:text-forge-gold transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin size={14} className="mr-1 text-forge-gold" />
          {property.location}
        </a>
        
        <Link to={listingUrl} className="block mb-2">
          <h3 className="text-xl font-serif text-slate-900 group-hover:text-forge-gold transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>
        
        <div className="text-2xl font-light text-forge-navy mb-4">
          ₦{property.price.toLocaleString()}
          {property.status === 'For Rent' && <span className="text-sm text-slate-500 font-normal"> / year</span>}
        </div>

        <div className="flex items-center justify-between mt-auto border-t border-slate-100 pt-4 text-slate-600 text-sm">
          <div className="flex items-center gap-1">
            <Bed size={16} />
            <span>{property.bedrooms} <span className="hidden sm:inline">Beds</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span>{property.bathrooms} <span className="hidden sm:inline">Baths</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Move size={16} />
            <span>{property.area_sq_ft.toLocaleString()} <span className="hidden sm:inline">sq ft</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
