import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  FileCheck2, 
  ArrowRight, 
  Bell, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Property } from '../types';
import { PropertyEnquiryModal } from '../components/PropertyEnquiryModal';

export const Properties: React.FC = () => {
  const { properties } = useProperties();
  const [locationFilter, setLocationFilter] = useState('All');
  const [plotSizeFilter, setPlotSizeFilter] = useState('All');
  const [priceRangeFilter, setPriceRangeFilter] = useState('All');
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryPlotSize, setEnquiryPlotSize] = useState('150 SQM');

  // Filter listings based on dropdown values
  const filteredListings = useMemo(() => {
    return (properties || []).filter((item) => {
      // Location filter
      if (locationFilter !== 'All') {
        if (!item.location.toLowerCase().includes(locationFilter.toLowerCase())) {
          return false;
        }
      }

      // Plot size filter
      if (plotSizeFilter !== 'All') {
        const sizes = item.plot_sizes || [];
        const hasSize = sizes.some(s => s.toLowerCase().includes(plotSizeFilter.toLowerCase()));
        if (!hasSize) return false;
      }

      // Price filter
      if (priceRangeFilter !== 'All') {
        if (priceRangeFilter === 'under-1m' && item.price >= 1000000) return false;
        if (priceRangeFilter === '1m-2m' && (item.price < 1000000 || item.price > 2000000)) return false;
        if (priceRangeFilter === '2m-plus' && item.price < 2000000) return false;
      }

      return true;
    });
  }, [properties, locationFilter, plotSizeFilter, priceRangeFilter]);

  const handleOpenEnquiry = (property: Property, plotSize: string = '150 SQM') => {
    setSelectedProperty(property);
    setEnquiryPlotSize(plotSize);
    setIsEnquiryOpen(true);
  };

  const handleNotifyMe = (property: Property) => {
    handleOpenEnquiry(property, 'Coming Soon Notification');
  };

  const resetFilters = () => {
    setLocationFilter('All');
    setPlotSizeFilter('All');
    setPriceRangeFilter('All');
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] pt-20">
      {/* PAGE HEADING SECTION — Navy Background, Large White Text, Breadcrumbs */}
      <section className="bg-[#1A2847] text-white py-16 px-4 sm:px-6 relative overflow-hidden border-b-2 border-[#C9962A]/40">
        <div 
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#C9962A]/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Breadcrumb nav below heading */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-4">
            <Link to="/" className="hover:text-[#C9962A] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#C9962A]" />
            <span className="text-[#C9962A]">Properties</span>
          </nav>

          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] block mb-2">
              Verified Titled Parcels
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-3">
              Our Properties
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Explore verified titled land in Ogun and Lagos State growth corridors with transparent documentation and flexible installment plans.
            </p>
          </div>
        </div>
      </section>

      {/* FILTER BAR — Location, Plot Size, Price Range Simple Dropdowns */}
      <section className="bg-[#F2F2F0] border-b border-slate-200 py-6 px-4 sm:px-6 sticky top-[60px] sm:top-[68px] z-30 shadow-xs">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-grow max-w-3xl">
              {/* Location Filter */}
              <div>
                <label htmlFor="filter-location" className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                  Location
                </label>
                <select
                  id="filter-location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-[8px] px-3 py-2 text-sm text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C9962A] min-h-[44px]"
                >
                  <option value="All">All Locations</option>
                  <option value="Kobape">Kobape / Abeokuta</option>
                  <option value="Epe">Epe / Ijebu Corridor</option>
                  <option value="Sangotedo">Sangotedo / Lagos</option>
                </select>
              </div>

              {/* Plot Size Filter */}
              <div>
                <label htmlFor="filter-plot-size" className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                  Plot Size
                </label>
                <select
                  id="filter-plot-size"
                  value={plotSizeFilter}
                  onChange={(e) => setPlotSizeFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-[8px] px-3 py-2 text-sm text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C9962A] min-h-[44px]"
                >
                  <option value="All">All Sizes</option>
                  <option value="150 SQM">150 SQM (Starter)</option>
                  <option value="300 SQM">300 SQM (Standard)</option>
                  <option value="500 SQM">500 SQM (Full Plot)</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label htmlFor="filter-price" className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                  Price Range
                </label>
                <select
                  id="filter-price"
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-[8px] px-3 py-2 text-sm text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C9962A] min-h-[44px]"
                >
                  <option value="All">All Price Ranges</option>
                  <option value="under-1m">Under ₦1,000,000</option>
                  <option value="1m-2m">₦1,000,000 - ₦2,000,000</option>
                  <option value="2m-plus">₦2,000,000+</option>
                </select>
              </div>
            </div>

            {/* Reset Filter Button */}
            {(locationFilter !== 'All' || plotSizeFilter !== 'All' || priceRangeFilter !== 'All') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#1A2847] hover:text-[#C9962A] transition-colors py-2 px-3 border border-slate-300 rounded-[8px] bg-white min-h-[44px] shrink-0"
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PROPERTY CARDS GRID — 1 col mobile, 2 tablet, 3 desktop */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          {filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-[#F2F2F0] rounded-[12px] p-8 max-w-md mx-auto">
              <p className="text-base font-bold text-[#1A2847] mb-2">No matching properties found</p>
              <p className="text-xs text-slate-500 mb-6">Try resetting your location, plot size, or price range filters.</p>
              <button
                onClick={resetFilters}
                className="bg-[#C9962A] text-[#1A2847] font-bold text-xs px-5 py-2.5 rounded-[8px] min-h-[44px]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map((property) => {
                const isComingSoon = property.is_coming_soon;

                return (
                  <article 
                    key={property.id}
                    className={`rounded-[12px] border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                      isComingSoon
                        ? 'opacity-85 bg-slate-50/80 border-slate-200 hover:opacity-100'
                        : 'bg-white border-slate-200 hover:border-[#C9962A]/50 shadow-md hover:shadow-xl'
                    }`}
                  >
                    <div>
                      {/* Property Image & Badge */}
                      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                        <img
                          src={property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200'}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Status Badge */}
                        <div className="absolute top-3.5 left-3.5">
                          {isComingSoon ? (
                            <span className="bg-[#1A2847]/90 text-white font-bold text-[11px] px-3 py-1 rounded-[6px] uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                              <Sparkles size={13} className="text-[#C9962A]" /> Coming Soon
                            </span>
                          ) : (
                            <span className="bg-[#1A2847] text-[#C9962A] font-bold text-[11px] px-3 py-1 rounded-[6px] uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-[#C9962A]/30">
                              <ShieldCheck size={14} /> Available Now
                            </span>
                          )}
                        </div>

                        {property.developer && (
                          <div className="absolute bottom-3.5 left-3.5 bg-[#1A2847]/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-[4px]">
                            Developer: <strong className="text-[#C9962A]">{property.developer}</strong>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        {/* Location with Pin Icon */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                          <MapPin size={14} className="text-[#C9962A] shrink-0" />
                          <span>{property.location}</span>
                        </div>

                        {/* Project Name */}
                        <h2 className="text-xl font-bold text-[#1A2847] font-display mb-2">
                          {property.title}
                        </h2>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                          {property.description}
                        </p>

                        {/* Plot Size Tags */}
                        <div className="mb-4">
                          <span className="text-[11px] font-bold uppercase tracking-[1px] text-slate-400 block mb-1.5">
                            Plot Sizes:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(property.plot_sizes || ['150 SQM', '300 SQM', '500 SQM']).map((size) => (
                              <span 
                                key={size}
                                className="text-[11px] font-bold px-2.5 py-1 rounded-[6px] bg-[#F2F2F0] text-[#1A2847] border border-slate-200"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Features Preview */}
                        {property.features && property.features.length > 0 && (
                          <div className="mb-4 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 block mb-1.5">
                              Estate Amenities:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {property.features.slice(0, 3).map((feat, i) => (
                                <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded inline-flex items-center gap-1">
                                  <Check size={11} className="text-[#C9962A] shrink-0" />
                                  <span>{feat}</span>
                                </span>
                              ))}
                              {property.features.length > 3 && (
                                <span className="text-[10px] text-[#C9962A] font-semibold">
                                  +{property.features.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Area: Starting Price & Button & Documentation Line */}
                    <div className="p-6 pt-0">
                      {/* Price Section */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[1px] text-slate-400 block">
                            Starting Price
                          </span>
                          <span className="text-xl font-extrabold text-[#C9962A] font-display">
                            ₦{property.price ? property.price.toLocaleString() : '900,000'}
                          </span>
                        </div>

                        {/* CTA button */}
                        {isComingSoon ? (
                          <button
                            id={`notify-me-${property.id}`}
                            onClick={() => handleNotifyMe(property)}
                            className="bg-slate-200 hover:bg-[#1A2847] hover:text-white text-[#1A2847] font-bold text-xs px-4 py-2.5 rounded-[8px] min-h-[44px] transition-all flex items-center gap-1.5"
                          >
                            <Bell size={14} />
                            <span>Notify Me</span>
                          </button>
                        ) : (
                          <button
                            id={`view-details-${property.id}`}
                            onClick={() => handleOpenEnquiry(property)}
                            className="bg-[#1A2847] hover:bg-[#243761] text-white font-bold text-xs px-4 py-2.5 rounded-[8px] min-h-[44px] transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <span>View Details</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>

                      {/* Documentation line at bottom */}
                      <div className="p-2.5 bg-[#FDF3E3] rounded-[6px] border border-[#C9962A]/30 text-[11px] text-[#1A2847] flex items-center gap-2">
                        <FileCheck2 size={14} className="text-[#C9962A] shrink-0" />
                        <span className="font-semibold truncate">
                          {property.documentation || 'Deed of Assignment + Registered Survey Plan'}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Flagship Highlight Deep Dive for Prasino Lush Phase 2 */}
      <section className="py-16 bg-[#1A2847] text-white border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="bg-[#111B31] rounded-[16px] border border-[#C9962A]/40 p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] bg-white/10 px-3 py-1 rounded-full inline-block">
                  Flagship Development • Available Now
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                  Prasino Lush Phase 2, Kobape
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Located along the fast-appreciating Abeokuta-Sagamu interchange corridor in Kobape, Ogun State. Partnered with <strong>Geofort Africa</strong> to ensure 100% genuine titles, rapid layout construction, and instant plot allocation.
                </p>

                {/* Price Breakdown Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-white/5 rounded-[8px] border border-white/10 text-center">
                    <span className="text-xs text-slate-300 block">150 SQM</span>
                    <span className="text-lg font-bold text-[#C9962A]">₦900,000</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-[8px] border border-white/10 text-center">
                    <span className="text-xs text-slate-300 block">300 SQM</span>
                    <span className="text-lg font-bold text-[#C9962A]">₦1,800,000</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-[8px] border border-white/10 text-center">
                    <span className="text-xs text-slate-300 block">500 SQM</span>
                    <span className="text-lg font-bold text-[#C9962A]">₦3,000,000</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      const p = properties.find(x => x.slug === 'prasino-lush-phase-2') || properties[0];
                      handleOpenEnquiry(p, '150 SQM');
                    }}
                    className="bg-[#C9962A] hover:bg-[#B38322] text-[#1A2847] font-bold text-sm px-6 py-3.5 rounded-[8px] min-h-[44px] transition-all flex items-center gap-2 shadow-lg"
                  >
                    <span>Enquire About Prasino Lush Phase 2</span>
                    <ArrowRight size={16} />
                  </button>
                  <a
                    href="https://wa.me/2348106133572?text=Hello%20The%20Forge%20Properties,%20I'm%20inquiring%20about%20Prasino%20Lush%20Phase%202."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 rounded-[8px] min-h-[44px] transition-all flex items-center gap-2"
                  >
                    <span>Instant WhatsApp Chat</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3 bg-white/5 p-6 rounded-[12px] border border-white/10">
                <h4 className="text-sm font-bold uppercase tracking-[1px] text-[#C9962A]">
                  Verified Estate Features
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C9962A] shrink-0" /> Perimeter Fencing & Gate House</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C9962A] shrink-0" /> Internal Engineered Drainage</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C9962A] shrink-0" /> Paved Access Roads & Clear Demarcation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C9962A] shrink-0" /> Dedicated Recreational Centre</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C9962A] shrink-0" /> Gardening & Green Spaces</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C9962A] shrink-0" /> Deed of Assignment + Registered Survey</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Enquiry Modal */}
      <PropertyEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={selectedProperty}
        initialPlotSize={enquiryPlotSize}
      />
    </div>
  );
};
