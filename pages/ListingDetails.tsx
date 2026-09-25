import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Loader2, 
  ArrowLeft, 
  MessageCircle, 
  ShieldCheck, 
  FileCheck2, 
  ChevronRight,
  CheckCircle2,
  Building2,
  Footprints,
  Droplets,
  Sprout,
  Sparkles,
  Zap,
  ExternalLink,
  Map as MapIcon
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';
import { ScrollFade } from '../components/AnimationUtils';

export const ListingDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPropertyBySlug, getProperty, isLoading } = useProperties();
  const [activeImage, setActiveImage] = useState(0);

  const property = slug ? (getPropertyBySlug(slug) || getProperty(slug)) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#774DFF] mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#774DFF]">Loading Property Details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] px-4 pt-20">
        <div className="text-center p-8 bg-white shadow-xl rounded-[12px] max-w-md w-full border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-3 font-display">Property Not Found</h2>
          <p className="text-slate-600 mb-6 text-sm">We couldn't locate the property you are looking for.</p>
          <Link 
            to="/properties" 
            className="inline-flex items-center gap-2 bg-[#774DFF] hover:bg-[#683de6] text-white px-6 py-3 font-extrabold text-sm rounded-[8px] transition-all shadow-md"
          >
            <ArrowLeft size={16} />
            <span>Browse All Land</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPrasino = property.slug === 'prasino-lush-phase-2' || (property.title && property.title.toLowerCase().includes('prasino'));

  // Documentation title text (editable from admin, fallback to standard)
  const docType = property.documentation || 'Deed of Assignment + Registered Survey Plan';

  // Feature icon mapper
  const getFeatureIcon = (feature: string) => {
    const f = feature.toLowerCase();
    if (f.includes('fence') || f.includes('fencing')) return <ShieldCheck size={20} className="text-[#774DFF] shrink-0" />;
    if (f.includes('gate') || f.includes('security') || f.includes('house')) return <Building2 size={20} className="text-[#774DFF] shrink-0" />;
    if (f.includes('road') || f.includes('access') || f.includes('street')) return <Footprints size={20} className="text-[#774DFF] shrink-0" />;
    if (f.includes('drain') || f.includes('drainage') || f.includes('water')) return <Droplets size={20} className="text-[#774DFF] shrink-0" />;
    if (f.includes('recreation') || f.includes('centre') || f.includes('center') || f.includes('sports')) return <Sparkles size={20} className="text-[#774DFF] shrink-0" />;
    if (f.includes('garden') || f.includes('green') || f.includes('eco')) return <Sprout size={20} className="text-[#774DFF] shrink-0" />;
    if (f.includes('solar') || f.includes('light') || f.includes('power')) return <Zap size={20} className="text-[#774DFF] shrink-0" />;
    return <CheckCircle2 size={20} className="text-[#774DFF] shrink-0" />;
  };

  // Google Maps embed query: use Kobape, Abeokuta, Ogun State for Prasino Lush Phase 2
  const mapLocationQuery = property.map_url || (isPrasino ? 'Kobape, Abeokuta, Ogun State' : property.location);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocationQuery)}`;

  // Plot sizes and pricing table items
  const plotTiers = property.price_options && property.price_options.length > 0 ? property.price_options : [
    { size: '150 SQM', price: property.price || 900000, formattedPrice: `₦${(property.price || 900000).toLocaleString()}`, desc: 'Starter plot, ideal for young professionals & first-time buyers' },
    { size: '300 SQM', price: (property.price || 900000) * 2, formattedPrice: `₦${((property.price || 900000) * 2).toLocaleString()}`, desc: 'Standard residential build, co-buying duos & duplexes' },
    { size: '500 SQM', price: isPrasino ? 3000000 : (property.price || 900000) * 3.33, formattedPrice: isPrasino ? '₦3,000,000' : `₦${Math.round((property.price || 900000) * 3.33).toLocaleString()}`, desc: 'Estate executive full plot for luxury homes or high-yield land banking' }
  ];

  const whatsappDirectUrl = "https://wa.me/2348106133572";

  return (
    <div className="min-h-screen bg-white text-[#0F172A] pt-20">
      <SEO 
        title={`${property.title} | The Forge Properties`}
        description={property.description.substring(0, 160)}
        image={property.images[0]} 
        type="realestate"
        url={`/listings/${property.slug || property.id}`}
      />

      {/* TOP BREADCRUMB: Home > Properties > Property Title */}
      <div className="bg-[#F3F4F6] border-b border-[#E5E7EB] py-3.5 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-[#774DFF] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-[#774DFF]" />
          <Link to="/properties" className="hover:text-[#774DFF] transition-colors">Properties</Link>
          <ChevronRight size={14} className="text-[#774DFF]" />
          <span className="text-[#774DFF] font-bold truncate max-w-[240px] sm:max-w-none">{property.title}</span>
        </div>
      </div>

      {/* HERO SECTION — LARGE PROPERTY VISUAL & OVERVIEW */}
      <section className="bg-[#0F172A] text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="relative rounded-[20px] overflow-hidden bg-slate-900 aspect-[16/9] sm:aspect-[21/9] max-h-[520px] shadow-2xl border border-white/10">
            <img 
              src={property.images[activeImage] || property.images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover" 
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <span className="bg-[#FE4A23] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-[6px] shadow-md uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} />
                {property.status_badge || 'Available Now'}
              </span>
              {property.developer && (
                <span className="bg-[#0F172A]/90 text-white border border-[#774DFF]/40 font-bold text-xs px-3.5 py-1.5 rounded-[6px] backdrop-blur-md uppercase tracking-wider">
                  Partner: {property.developer}
                </span>
              )}
            </div>

            {/* Price Badge Overlay */}
            <div className="absolute bottom-4 right-4 bg-[#0F172A]/95 border border-[#774DFF]/40 px-5 py-3 rounded-[10px] text-right backdrop-blur-md shadow-2xl">
              <div className="text-[10px] uppercase font-bold text-[#774DFF] tracking-wider">Starting From</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">
                ₦{property.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Thumbnails Gallery */}
          {property.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 sm:w-24 h-14 sm:h-16 rounded-[8px] overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === idx ? 'border-[#774DFF] scale-105 shadow-md' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAIN PROPERTY DETAILS */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* LEFT CONTENT (8 cols) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Property Name & Location Prominently Displayed */}
              <ScrollFade>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#774DFF] mb-2">
                  <span>{property.type}</span>
                  <span>•</span>
                  <span>{property.status_badge || 'Available Now'}</span>
                  {property.developer && (
                    <>
                      <span>•</span>
                      <span>Partner: {property.developer}</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] font-display mb-4 leading-tight">
                  {property.title}
                </h1>

                <div className="flex items-center text-slate-600 text-sm font-semibold">
                  <MapPin size={18} className="mr-2 text-[#774DFF] shrink-0" />
                  <span>{property.location}</span>
                </div>
              </ScrollFade>

              {/* Quick Specifications Strip */}
              <ScrollFade delay={0.1}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-[12px] bg-[#F3F4F6] border border-[#E5E7EB]">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Plot Area</span>
                    <p className="text-lg font-bold text-[#774DFF]">{property.area_sq_ft ? `${property.area_sq_ft} SQM` : '150 - 500 SQM'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Title Type</span>
                    <p className="text-lg font-bold text-[#774DFF] truncate" title={docType}>{docType}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Developer</span>
                    <p className="text-lg font-bold text-[#774DFF]">{property.developer || 'The Forge'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Zoning</span>
                    <p className="text-lg font-bold text-[#774DFF]">Residential / Mixed</p>
                  </div>
                </div>
              </ScrollFade>

              {/* Full Written Description */}
              <ScrollFade delay={0.15}>
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block">
                    Property Overview
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-display">
                    About {property.title}
                  </h2>
                  <div className="text-base text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                    <p>{property.description}</p>
                  </div>
                </div>
              </ScrollFade>

              {/* Features List with Icons (perimeter fencing, gate house, roads, drainage, recreational centre, gardening spaces, etc.) */}
              <ScrollFade delay={0.2}>
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-1">
                      Infrastructure & Amenities
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-display">
                      Estate Features
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 p-4 rounded-[10px] bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#774DFF] transition-all">
                        <div className="w-10 h-10 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 shadow-xs">
                          {getFeatureIcon(feature)}
                        </div>
                        <span className="text-sm font-bold text-[#0F172A]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollFade>

              {/* Plot Sizes and Pricing Table */}
              <ScrollFade delay={0.25}>
                <div className="p-6 sm:p-8 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-1">
                      Plot Sizes & Pricing Table
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-display">
                      Available Plot Sizes & Pricing
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Select your preferred plot size. Flexible installment spreads available over 3, 6, or 12 months.
                    </p>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto bg-white rounded-[12px] border border-[#E5E7EB] shadow-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0F172A] text-white text-xs font-bold uppercase tracking-wider">
                          <th className="py-4 px-5">Plot Tier</th>
                          <th className="py-4 px-5">Plot Area</th>
                          <th className="py-4 px-5">Outright Price</th>
                          <th className="py-4 px-5 hidden sm:table-cell">Ideal For</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB] text-sm">
                        {plotTiers.map((tier, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5 font-bold text-[#0F172A]">
                              {tier.size === '150 SQM' ? 'Starter Plot' : tier.size === '300 SQM' ? 'Standard Plot' : 'Executive Full Plot'}
                            </td>
                            <td className="py-4 px-5 font-semibold text-[#774DFF]">{tier.size}</td>
                            <td className="py-4 px-5 font-extrabold text-[#0F172A] font-display text-base">
                              {tier.formattedPrice || `₦${Number(tier.price).toLocaleString()}`}
                            </td>
                            <td className="py-4 px-5 text-xs text-slate-600 hidden sm:table-cell">
                              {'desc' in tier && typeof tier.desc === 'string' ? tier.desc : 'Residential or long-term growth'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 3 Plot Cards Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {plotTiers.map((tier, idx) => (
                      <div 
                        key={idx} 
                        className={`p-5 rounded-[10px] bg-white border transition-all ${
                          tier.size === '500 SQM' ? 'border-[#774DFF] shadow-md ring-1 ring-[#774DFF]/30' : 'border-[#E5E7EB]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase text-slate-500">
                            {tier.size === '150 SQM' ? 'Starter Size' : tier.size === '300 SQM' ? 'Standard Size' : 'Full Plot'}
                          </span>
                          {tier.size === '500 SQM' && (
                            <span className="bg-[#774DFF] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Popular</span>
                          )}
                        </div>
                        <div className="text-lg font-bold text-[#0F172A]">{tier.size}</div>
                        <div className="text-2xl font-black text-[#774DFF] font-display mt-2">
                          {tier.formattedPrice || `₦${Number(tier.price).toLocaleString()}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollFade>

              {/* Documentation Section Showing Available Title Documents */}
              <ScrollFade delay={0.3}>
                <div className="p-7 sm:p-8 rounded-[16px] bg-[#0F172A] text-white border border-[#774DFF]/30 space-y-6 shadow-xl">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-1">
                      Legal Verification & Security
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      Title Documents & Guarantees
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Every transaction is conducted through formal legal channels with full document execution.
                    </p>
                  </div>

                  <div className="p-4 rounded-[10px] bg-[#1E293B] border border-[#774DFF]/40 flex items-center gap-3">
                    <FileCheck2 size={24} className="text-[#774DFF] shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold uppercase text-slate-400 block">Primary Title Document</span>
                      <span className="text-base font-bold text-white">{docType}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="p-4 rounded-[8px] bg-white/5 border border-white/10 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#774DFF] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold text-white block">Registered Survey Plan</span>
                        <p className="text-xs text-slate-300 mt-0.5">Formal coordinate beacons demarcated and lodged with government registry.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-[8px] bg-white/5 border border-white/10 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#774DFF] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold text-white block">Deed of Assignment</span>
                        <p className="text-xs text-slate-300 mt-0.5">Direct legal transfer of ownership rights from the developer to your name.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-[8px] bg-white/5 border border-white/10 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#774DFF] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold text-white block">Contract of Sale</span>
                        <p className="text-xs text-slate-300 mt-0.5">Binding commercial contract spelling out obligations and installment schedules.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-[8px] bg-white/5 border border-white/10 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#774DFF] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold text-white block">Physical Allocation Receipt</span>
                        <p className="text-xs text-slate-300 mt-0.5">Prompt on-site demarcation with zero Omo Onile harassment or surprise fees.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollFade>

              {/* Google Maps Embed Showing Property Location (Kobape, Abeokuta, Ogun State for Prasino Lush Phase 2) */}
              <ScrollFade delay={0.35}>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-1">
                        Location Map
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-display">
                        Property Location
                      </h2>
                    </div>

                    <a 
                      href={googleMapsExternalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#774DFF] hover:underline"
                    >
                      <MapIcon size={14} />
                      <span>Open in Google Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="rounded-[16px] overflow-hidden border border-[#E5E7EB] shadow-md bg-[#F3F4F6]">
                    <div className="p-3 bg-[#0F172A] text-white flex items-center justify-between px-5">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <MapPin size={15} className="text-[#774DFF]" />
                        <span>{mapLocationQuery}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Interactive Map</span>
                    </div>

                    {/* Google Maps Embed iframe */}
                    <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-100">
                      <iframe 
                        title={`Google Maps location for ${property.title}`}
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }}
                        loading="lazy" 
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapEmbedUrl}
                      />
                    </div>
                  </div>
                </div>
              </ScrollFade>

              {/* "Make an Enquiry" Button at the bottom that opens WhatsApp chat link */}
              <ScrollFade delay={0.4}>
                <div className="p-8 sm:p-10 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-center space-y-5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-display">
                    Ready to Secure Your Plot at {property.title}?
                  </h3>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto">
                    Speak directly with a licensed property advisor on WhatsApp to get the title file, survey coordinates, or schedule a free site inspection.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                      id="property-detail-whatsapp-btn"
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#774DFF] hover:bg-[#683de6] text-white font-extrabold text-base py-4 px-10 rounded-[8px] transition-all shadow-xl hover:shadow-2xl"
                    >
                      <MessageCircle size={22} className="shrink-0" />
                      <span>Make an Enquiry</span>
                    </a>

                    <Link
                      to="/properties"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-[#774DFF] text-[#774DFF] hover:bg-[#774DFF] hover:text-white font-bold text-base py-4 px-8 rounded-[8px] transition-all"
                    >
                      <ArrowLeft size={18} />
                      <span>Back to Properties</span>
                    </Link>
                  </div>
                </div>
              </ScrollFade>

            </div>

            {/* RIGHT SIDEBAR: Sticky Action Card (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                
                {/* Action Card */}
                <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-[16px] border border-[#774DFF]/30 shadow-xl space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#774DFF] block mb-1">
                      Pricing & Ownership
                    </span>
                    <div className="text-3xl font-extrabold text-white font-display">
                      ₦{property.price.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Flexible spreads available (3 to 12 months)
                    </p>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[#1E293B] border border-white/10 text-xs text-slate-300">
                    <span className="font-bold text-[#774DFF] block mb-0.5">Documentation:</span>
                    <span>{docType}</span>
                  </div>

                  <hr className="border-white/15" />

                  <div className="space-y-3">
                    {/* Make an Enquiry Button that opens WhatsApp link */}
                    <a
                      id="sidebar-make-enquiry-whatsapp-btn"
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#774DFF] hover:bg-[#683de6] text-white font-extrabold text-base py-3.5 px-4 rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
                    >
                      <MessageCircle size={20} />
                      <span>Make an Enquiry</span>
                    </a>

                    <a
                      href={`tel:+2348106133572`}
                      className="w-full bg-transparent border border-[#774DFF] hover:bg-[#774DFF] hover:text-white text-[#774DFF] font-bold text-sm py-3.5 px-4 rounded-[8px] transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <span>Call +234 810 613 3572</span>
                    </a>
                  </div>

                  <div className="pt-2 border-t border-white/15 text-center">
                    <p className="text-[11px] text-slate-400">
                      Response time: <strong className="text-white">Under 15 minutes</strong> on WhatsApp
                    </p>
                  </div>
                </div>

                {/* Co-Buying Note */}
                <div className="p-6 rounded-[12px] bg-[#F3F4F6] border border-[#E5E7EB] text-center">
                  <h4 className="text-base font-bold text-[#0F172A] font-display mb-1">
                    Want to Co-Buy This Plot?
                  </h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Partner with 2 to 4 friends or fellow The Forge Nation members to split payments transparently.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#774DFF] hover:text-[#683de6] underline"
                  >
                    <span>Ask About Co-Ownership</span>
                    <ChevronRight size={14} className="shrink-0" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
