
import React, { useState, useMemo } from 'react';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../context/PropertyContext';
import { FilterCriteria, PropertyType, Property } from '../types';
import { FilterX, Filter } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Listings: React.FC = () => {
  const { properties } = useProperties();
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = Object.keys(filters).length > 0 || searchTerm.length > 0;

  const filteredProperties = useMemo(() => {
    return properties.filter((property: Property) => {
      if (searchTerm && !property.title.toLowerCase().includes(searchTerm.toLowerCase()) && !property.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.minBeds && property.bedrooms < filters.minBeds) return false;
      if (filters.type && property.type !== filters.type) return false;
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      return true;
    });
  }, [filters, searchTerm, properties]);

  const handleManualFilterChange = (key: keyof FilterCriteria, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <SEO 
        title="Exclusive Luxury Listings" 
        description="Discover our collection of premium villas, apartments, and estates in Lagos and Abuja. Exceptional homes for discerning clients."
        keywords="lagos houses for sale, ikoyi apartments, banana island mansions"
        url="/listings"
      />

      <div className="bg-forge-navy text-white py-12 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
           <span className="text-forge-gold text-[10px] md:text-xs uppercase tracking-[0.4em] mb-3 md:mb-4 block font-bold">Our Portfolio</span>
          <h1 className="text-3xl md:text-6xl font-bold text-white leading-tight">Curated Collections</h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm md:text-lg font-medium">Discover exceptional properties in Nigeria's most prestigious neighborhoods.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          <div className="lg:w-1/4">
            <div className="lg:hidden mb-6">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full py-4 bg-white border border-slate-200 flex items-center justify-center gap-3 text-forge-navy font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200/50 rounded-2xl transition-all active:scale-95"
              >
                <Filter size={16} className="text-forge-gold" /> {showFilters ? 'Hide Filters' : 'Filter & Search'}
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white p-6 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-24 transition-all duration-500 rounded-3xl`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg md:text-xl font-bold text-forge-navy uppercase tracking-widest">Refine</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 uppercase tracking-widest">
                    <FilterX size={14} /> Clear
                  </button>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Location / Keyword</label>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search area..."
                    className="w-full border border-slate-100 bg-slate-50 px-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Property Type</label>
                  <select 
                    className="w-full border border-slate-100 bg-slate-50 px-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none focus:bg-white transition-all font-medium appearance-none"
                    value={filters.type || ''}
                    onChange={(e) => handleManualFilterChange('type', e.target.value || undefined)}
                  >
                    <option value="">All Types</option>
                    {Object.values(PropertyType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Max Price (₦)</label>
                   <input 
                    type="number"
                    min="0"
                    step="1000000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleManualFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full border border-slate-100 bg-slate-50 px-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none focus:bg-white transition-all font-medium"
                    placeholder="Unlimited"
                   />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
             <div className="mb-8 flex justify-between items-center text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                <span>Showing {filteredProperties.length} distinguished properties</span>
             </div>

             {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  {filteredProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
             ) : (
               <div className="text-center py-24 md:py-32 bg-white border border-dashed border-slate-200 rounded-3xl">
                 <p className="text-slate-400 font-medium mb-4">No properties matched your criteria.</p>
                 <button onClick={clearFilters} className="text-forge-gold font-bold text-xs uppercase tracking-widest underline underline-offset-8">Clear All Filters</button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
