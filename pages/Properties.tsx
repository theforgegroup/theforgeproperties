import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  FileCheck2, 
  ArrowRight, 
  RotateCcw,
  Sparkles, 
  ChevronRight,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { ScrollFade, ParallaxBackground } from '../components/AnimationUtils';

export const Properties: React.FC = () => {
  const { properties, settings } = useProperties();
  const [locationFilter, setLocationFilter] = useState('All');
  const [plotSizeFilter, setPlotSizeFilter] = useState('All');
  const [priceRangeFilter, setPriceRangeFilter] = useState('All');

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

  const resetFilters = () => {
    setLocationFilter('All');
    setPlotSizeFilter('All');
    setPriceRangeFilter('All');
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] pt-20">
      {/* SECTION 1 — HEADER & BREADCRUMB */}
      <section className="relative bg-[#0F172A] text-white py-14 overflow-hidden border-b border-[#774DFF]/30">
        {/* Parallax background banner if uploaded */}
        {settings?.properties_banner_image && (
          <ParallaxBackground 
            imageUrl={settings.properties_banner_image}
            alt="The Forge Properties Portfolio"
            overlayClassName="bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/85 to-[#0F172A]/75"
          />
        )}

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
              <Link to="/" className="hover:text-[#774DFF] transition-colors">Home</Link>
              <ChevronRight size={14} className="text-[#774DFF]" />
              <span className="text-[#774DFF]">Properties</span>
            </div>

            <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-2">
              Verified Land Portfolio
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-4">
              Explore Available Properties
            </h1>
            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Every parcel in our portfolio is vetted, titled, and developed with infrastructure in mind. No hidden agent fees, no Omo Onile disputes.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 — FILTER BAR */}
      <section className="bg-[#F3F4F6] border-b border-[#E5E7EB] py-6 sticky top-20 z-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-grow max-w-3xl">
              {/* Location dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] text-xs font-semibold rounded-[8px] px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#774DFF]"
                >
                  <option value="All">All Locations</option>
                  <option value="Kobape">Kobape, Abeokuta</option>
                  <option value="Epe">Epe-Ijebu Corridor</option>
                  <option value="Ogun">Ogun State</option>
                  <option value="Lagos">Lagos State</option>
                </select>
              </div>

              {/* Plot size dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Plot Size
                </label>
                <select
                  value={plotSizeFilter}
                  onChange={(e) => setPlotSizeFilter(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] text-xs font-semibold rounded-[8px] px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#774DFF]"
                >
                  <option value="All">All Sizes</option>
                  <option value="150">150 SQM (Entry Plot)</option>
                  <option value="300">300 SQM (Standard)</option>
                  <option value="500">500 SQM (Executive)</option>
                </select>
              </div>

              {/* Price range dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Price Range
                </label>
                <select
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] text-xs font-semibold rounded-[8px] px-3 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#774DFF]"
                >
                  <option value="All">All Prices</option>
                  <option value="under-1m">Under ₦1,000,000</option>
                  <option value="1m-2m">₦1,000,000 - ₦2,000,000</option>
                  <option value="2m-plus">₦2,000,000 and Above</option>
                </select>
              </div>
            </div>

            {/* Clear filters action */}
            {(locationFilter !== 'All' || plotSizeFilter !== 'All' || priceRangeFilter !== 'All') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#774DFF] hover:text-[#683de6] transition-colors py-2 px-3 self-end md:self-center"
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3 — PROPERTY LISTINGS GRID */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[2px] text-slate-400">
              Showing {filteredListings.length} {filteredListings.length === 1 ? 'Development' : 'Developments'}
            </h2>
            <span className="text-xs text-slate-500">
              Prices guaranteed with verified survey
            </span>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-[#F3F4F6] rounded-[16px] border border-[#E5E7EB] p-8 max-w-xl mx-auto">
              <ShieldCheck size={44} className="text-[#774DFF] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-[#0F172A] mb-2 font-display">
                No Properties Match Your Filter
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Try widening your location or budget parameters to see available estates.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-[8px] transition-all shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map((property, idx) => {
                const isComingSoon = property.is_coming_soon;

                return (
                  <ScrollFade key={property.id} delay={(idx % 3) * 0.1}>
                    <article 
                      className={`property-card-lift rounded-[12px] border overflow-hidden flex flex-col justify-between h-full ${
                        isComingSoon
                          ? 'opacity-90 bg-slate-50 border-[#E5E7EB]'
                          : 'bg-white border-[#E5E7EB] shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Property Image & Badge */}
                        <Link to={`/listings/${property.slug}`} className="block relative h-60 w-full overflow-hidden bg-[#F3F4F6]">
                          <img
                            src={property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200'}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                          />
                          
                          {/* Status Badge */}
                          <div className="absolute top-3.5 left-3.5">
                            {isComingSoon ? (
                              <span className="bg-[#774DFF] text-white font-bold text-[11px] px-3 py-1 rounded-[6px] uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                                <Sparkles size={13} className="text-white" /> {property.status_badge || 'Coming Soon'}
                              </span>
                            ) : (
                              <span className="bg-[#FE4A23] text-white font-bold text-[11px] px-3 py-1 rounded-[6px] uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                <ShieldCheck size={14} /> {property.status_badge || 'Available Now'}
                              </span>
                            )}
                          </div>

                          {property.developer && (
                            <div className="absolute bottom-3.5 left-3.5 bg-[#0F172A]/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-[4px]">
                              Developer: <strong className="text-[#774DFF]">{property.developer}</strong>
                            </div>
                          )}
                        </Link>

                        {/* Card Body */}
                        <div className="p-6">
                          {/* Location with Pin Icon */}
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                            <MapPin size={14} className="text-[#774DFF] shrink-0" />
                            <span>{property.location}</span>
                          </div>

                          {/* Project Name */}
                          <Link to={`/listings/${property.slug}`} className="block">
                            <h2 className="text-xl font-bold text-[#0F172A] font-display hover:text-[#774DFF] transition-colors mb-2">
                              {property.title}
                            </h2>
                          </Link>

                          {/* Short Description */}
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {property.description}
                          </p>

                          {/* Plot Sizes as Tags */}
                          <div className="mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 block mb-1.5">
                              Plot Sizes:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(property.plot_sizes || ['150 SQM', '300 SQM', '500 SQM']).map((size) => (
                                <span 
                                  key={size}
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-[6px] bg-[#F3F4F6] text-[#0F172A] border border-[#E5E7EB]"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Features Preview */}
                          {property.features && property.features.length > 0 && (
                            <div className="mb-4 pt-3 border-t border-[#E5E7EB]">
                              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 block mb-1.5">
                                Estate Amenities:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {property.features.slice(0, 3).map((feat, i) => (
                                  <span key={i} className="text-[10px] bg-[#F3F4F6] text-slate-700 px-2 py-0.5 rounded inline-flex items-center gap-1 border border-[#E5E7EB]">
                                    <Check size={11} className="text-[#774DFF] shrink-0" />
                                    <span>{feat}</span>
                                  </span>
                                ))}
                                {property.features.length > 3 && (
                                  <span className="text-[10px] text-[#774DFF] font-semibold">
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
                        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between mb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-[1px] text-slate-400 block">
                              Starting Price
                            </span>
                            <span className="text-xl font-extrabold text-[#774DFF] font-display">
                              ₦{property.price ? property.price.toLocaleString() : '900,000'}
                            </span>
                          </div>

                          {/* 1. Dedicated View Details Link */}
                          <Link
                            id={`view-details-${property.id}`}
                            to={`/listings/${property.slug}`}
                            className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-xs px-4 py-2.5 rounded-[8px] min-h-[44px] transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <span>View Details</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>

                        {/* Documentation line at bottom (editable from admin) */}
                        <div className="p-2.5 bg-[#F3F4F6] rounded-[6px] border border-[#E5E7EB] text-[11px] text-[#0F172A] flex items-center gap-2">
                          <FileCheck2 size={14} className="text-[#774DFF] shrink-0" />
                          <span className="font-semibold truncate">
                            {property.documentation || 'Deed of Assignment + Registered Survey Plan'}
                          </span>
                        </div>
                      </div>
                    </article>
                  </ScrollFade>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Flagship Highlight Deep Dive for Prasino Lush Phase 2 */}
      <section className="py-16 bg-[#0F172A] text-white border-t border-[#774DFF]/25">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="bg-[#1E293B] rounded-[16px] border border-[#774DFF]/30 p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] bg-white/10 px-3 py-1 rounded-full inline-block border border-[#774DFF]/30">
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
                    <span className="text-lg font-bold text-[#774DFF]">₦900,000</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-[8px] border border-white/10 text-center">
                    <span className="text-xs text-slate-300 block">300 SQM</span>
                    <span className="text-lg font-bold text-[#774DFF]">₦1,800,000</span>
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-[8px] border border-white/10 text-center">
                    <span className="text-xs text-slate-300 block">500 SQM</span>
                    <span className="text-lg font-bold text-[#774DFF]">₦3,000,000</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    to="/listings/prasino-lush-phase-2"
                    className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-sm px-6 py-3.5 rounded-[8px] min-h-[44px] transition-all flex items-center gap-2 shadow-lg"
                  >
                    <span>View Prasino Lush Phase 2 Details</span>
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="https://wa.me/2348106133572?text=Hello%20The%20Forge%20Properties,%20I'm%20inquiring%20about%20Prasino%20Lush%20Phase%202."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-transparent border border-[#774DFF] hover:bg-[#774DFF] hover:text-white text-[#774DFF] font-bold text-sm px-6 py-3.5 rounded-[8px] min-h-[44px] transition-all flex items-center gap-2"
                  >
                    <span>Instant WhatsApp Chat</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3 bg-white/5 p-6 rounded-[12px] border border-white/10">
                <h4 className="text-sm font-bold uppercase tracking-[1px] text-[#774DFF]">
                  Verified Estate Features
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#774DFF] shrink-0" /> Perimeter Fencing & Gate House</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#774DFF] shrink-0" /> Internal Engineered Drainage</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#774DFF] shrink-0" /> Paved Access Roads & Clear Demarcation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#774DFF] shrink-0" /> Dedicated Recreational Centre</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#774DFF] shrink-0" /> Gardening & Green Spaces</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#774DFF] shrink-0" /> Deed of Assignment + Registered Survey</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
