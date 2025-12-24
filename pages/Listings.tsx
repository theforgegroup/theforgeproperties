
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

  const handleManualFilterChange = (key: keyof FilterCriteria, value: any) => {
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

      <div className="bg-forge-navy text-white py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 md:px-6 text-center">
           <span className="text-forge-gold text-xs uppercase tracking-[0.3em] mb-2 block">Our Portfolio</span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white">Curated Collections</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="lg:hidden mb-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full py-3 bg-white border border-slate-300 flex items-center justify-center gap-2 text-forge-navy font-bold uppercase tracking-wider text-xs shadow-sm"
              >
                <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Filter & Search'}
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white p-6 shadow-sm border border-slate-200 sticky top-24 transition-all duration-300`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg text-forge-navy">Refine Search</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <FilterX size={12} /> Clear
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Location / Keyword</label>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search area..."
                    className="w-full border border-slate-300 px-3 py-2 text-sm focus:border-forge-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Property Type</label>
                  <select 
                    className="w-full border border-slate-300 px-3 py-2 text-sm focus:border-forge-gold focus:outline-none"
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
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Price (₦)</label>
                   <input 
                    type="number"
                    min="0"
                    step="1000000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleManualFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full border border-slate-300 px-3 py-2 text-sm focus:border-forge-gold focus:outline-none"
                    placeholder="Unlimited"
                   />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
             <div className="mb-6 flex justify-between items-center text-slate-500 text-sm">
                <span>Showing {filteredProperties.length} distinguished properties</span>
             </div>

             {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
             ) : (
               <div className="text-center py-24 bg-white border border-dashed border-slate-300">
                 <p className="text-slate-400 font-serif mb-2">No properties matched your criteria.</p>
                 <button onClick={clearFilters} className="text-forge-gold font-bold text-xs uppercase underline">Clear All Filters</button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
