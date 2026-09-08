import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  CheckCircle, 
  Loader2, 
  ArrowLeft, 
  MessageCircle, 
  ShieldCheck, 
  FileCheck, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';
import { PropertyEnquiryModal } from '../components/PropertyEnquiryModal';

export const ListingDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPropertyBySlug, getProperty, isLoading } = useProperties();
  const [activeImage, setActiveImage] = useState(0);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  
  const property = slug ? (getPropertyBySlug(slug) || getProperty(slug)) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#0057FF] mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#0057FF]">Loading Property Details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4 pt-20">
        <div className="text-center p-8 bg-white shadow-xl rounded-[12px] max-w-md w-full border border-[#E0E4FF]">
          <h2 className="text-2xl font-bold text-[#0057FF] mb-3 font-display">Property Not Found</h2>
          <p className="text-slate-600 mb-6 text-sm">We couldn't locate the property you are looking for.</p>
          <Link 
            to="/properties" 
            className="inline-flex items-center gap-2 bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] px-6 py-3 font-extrabold text-sm rounded-[8px] transition-all shadow-md"
          >
            <ArrowLeft size={16} />
            <span>Browse All Land</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPrasino = property.slug === 'prasino-lush-phase-2' || (property.title && property.title.includes('Prasino'));

  const whatsappMessage = encodeURIComponent(
    `Hello The Forge Properties, I am interested in ${property.title} in ${property.location} (₦${property.price.toLocaleString()}). Please send me full documentation and payment plan details.`
  );
  const directWhatsAppUrl = `https://wa.me/2348106133572?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pt-20">
      <SEO 
        title={`${property.title} | The Forge Properties`}
        description={property.description.substring(0, 160)}
        image={property.images[0]} 
        type="realestate"
        url={`/listings/${property.slug || property.id}`}
      />

      {/* TOP BREADCRUMB */}
      <div className="bg-[#F5F5F5] border-b border-[#E0E4FF] py-3 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-[#0057FF] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-[#0057FF]" />
          <Link to="/properties" className="hover:text-[#0057FF] transition-colors">Properties</Link>
          <ChevronRight size={14} className="text-[#0057FF]" />
          <span className="text-[#0057FF] font-bold truncate max-w-[220px] sm:max-w-none">{property.title}</span>
        </div>
      </div>

      {/* IMAGE GALLERY */}
      <section className="bg-[#0057FF] text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="relative rounded-[16px] overflow-hidden bg-slate-900 aspect-[16/9] sm:aspect-[21/9] max-h-[500px]">
            <img 
              src={property.images[activeImage] || property.images[0]} 
              alt={property.title} 
              className="w-full h-full object-cover" 
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-[#C8FF00] text-[#0A0A0A] font-extrabold text-xs px-3 py-1.5 rounded-[6px] shadow-md uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Verified Title
              </span>
              {isPrasino && (
                <span className="bg-[#0047d4]/90 text-white border border-[#C8FF00]/40 font-bold text-xs px-3 py-1.5 rounded-[6px] backdrop-blur-sm uppercase tracking-wider">
                  Partner: Geofort Africa
                </span>
              )}
            </div>

            {/* Price Badge Overlay */}
            <div className="absolute bottom-4 right-4 bg-[#0047d4]/95 border border-[#C8FF00]/40 px-4 py-2.5 rounded-[8px] text-right backdrop-blur-md">
              <div className="text-[10px] uppercase font-bold text-[#C8FF00] tracking-wider">Starting From</div>
              <div className="text-xl sm:text-2xl font-black text-white font-display">
                ₦{property.price.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {property.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 sm:w-24 h-14 sm:h-16 rounded-[8px] overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === idx ? 'border-[#C8FF00] scale-105 shadow-md' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAIN CONTENT & SIDEBAR */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* LEFT CONTENT (8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Header Details */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0057FF] mb-2">
                  <span>{property.type}</span>
                  <span>•</span>
                  <span>{property.location}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0057FF] font-display mb-4 leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center text-slate-600 text-sm font-medium">
                  <MapPin size={18} className="mr-2 text-[#0057FF] shrink-0" />
                  <span>{property.location}</span>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF]">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Plot Area</span>
                  <p className="text-lg font-bold text-[#0057FF]">{property.area_sq_ft ? `${property.area_sq_ft} SQM` : '150 - 500 SQM'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Title Type</span>
                  <p className="text-lg font-bold text-[#0057FF]">Registered Survey</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Developer</span>
                  <p className="text-lg font-bold text-[#0057FF]">{isPrasino ? 'Geofort Africa' : 'The Forge'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Zoning</span>
                  <p className="text-lg font-bold text-[#0057FF]">Residential / Mixed</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0057FF] font-display mb-4">
                  Property Overview
                </h2>
                <p className="text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Prasino Lush Plot Sizes & Tier Breakdown */}
              {isPrasino && (
                <div className="p-6 sm:p-8 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0057FF] block mb-2">
                    Available Plot Sizes & Pricing
                  </span>
                  <h3 className="text-2xl font-bold text-[#0057FF] font-display mb-4">
                    Choose Your Plot Size at Prasino Lush Phase 2
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-[8px] border border-[#E0E4FF] shadow-sm">
                      <div className="text-xs font-bold uppercase text-slate-500">Starter Size</div>
                      <div className="text-xl font-bold text-[#0057FF] mt-1">150 SQM</div>
                      <div className="text-2xl font-extrabold text-[#0057FF] mt-2 font-display">₦900,000</div>
                      <p className="text-xs text-slate-600 mt-2">Ideal for young professionals starting their land portfolio.</p>
                    </div>

                    <div className="bg-white p-5 rounded-[8px] border border-[#E0E4FF] shadow-sm">
                      <div className="text-xs font-bold uppercase text-slate-500">Standard Size</div>
                      <div className="text-xl font-bold text-[#0057FF] mt-1">300 SQM</div>
                      <div className="text-2xl font-extrabold text-[#0057FF] mt-2 font-display">₦1,800,000</div>
                      <p className="text-xs text-slate-600 mt-2">Perfect for standard residential builds or co-buying duos.</p>
                    </div>

                    <div className="bg-white p-5 rounded-[8px] border-2 border-[#0057FF] shadow-md relative">
                      <span className="absolute -top-3 right-4 bg-[#0057FF] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Full Plot</span>
                      <div className="text-xs font-bold uppercase text-slate-500">Estate Executive</div>
                      <div className="text-xl font-bold text-[#0057FF] mt-1">500 SQM</div>
                      <div className="text-2xl font-extrabold text-[#0057FF] mt-2 font-display">₦3,000,000</div>
                      <p className="text-xs text-slate-600 mt-2">Full plot for luxury duplexes, rental units, or long-term banking.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Features / Amenities */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0057FF] font-display mb-4">
                  Estate Features & Infrastructure
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-[8px] bg-[#F5F5F5] border border-[#E0E4FF]">
                      <CheckCircle size={18} className="text-[#0057FF] shrink-0" />
                      <span className="text-sm font-semibold text-[#0A0A0A]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Documentation Verification Guarantee */}
              <div className="p-6 rounded-[12px] bg-[#0057FF] text-white border border-[#C8FF00]/30 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-[#0047d4] border border-[#C8FF00] text-[#C8FF00] flex items-center justify-center shrink-0">
                  <FileCheck size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display mb-1">
                    The Forge 100% Title Guarantee
                  </h3>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Every transaction is accompanied by a Registered Survey Plan, a Deed of Assignment, and a formal Contract of Sale. Zero hidden government encumbrances, zero Omo Onile interference.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR: Action & Contact (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                
                {/* Action Card */}
                <div className="bg-[#0057FF] text-white p-6 sm:p-8 rounded-[16px] border border-[#C8FF00]/30 shadow-xl space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C8FF00] block mb-1">
                      Pricing & Ownership
                    </span>
                    <div className="text-3xl font-extrabold text-white font-display">
                      ₦{property.price.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-100 mt-1">
                      Flexible spreads available (3 to 12 months)
                    </p>
                  </div>

                  <hr className="border-white/15" />

                  <div className="space-y-3">
                    <button
                      id="property-detail-enquire-btn"
                      onClick={() => setIsEnquiryOpen(true)}
                      className="w-full bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-base py-3.5 px-4 rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
                    >
                      <span>Enquire Now</span>
                    </button>

                    <a
                      id="property-detail-whatsapp-btn"
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm py-3.5 px-4 rounded-[8px] transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <MessageCircle size={18} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>

                  <div className="pt-2 border-t border-white/15 text-center">
                    <p className="text-[11px] text-blue-100">
                      Call us directly: <a href="tel:+2348106133572" className="text-white hover:text-[#C8FF00] font-bold">+234 810 613 3572</a>
                    </p>
                  </div>
                </div>

                {/* Co-Buying Note */}
                <div className="p-6 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF] text-center">
                  <h4 className="text-base font-bold text-[#0057FF] font-display mb-1">
                    Want to Co-Buy This Plot?
                  </h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Partner with 2 to 4 friends or fellow The Forge Nation members to split payments transparently.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0057FF] hover:text-[#0047d4] underline"
                  >
                    <span>Ask About Co-Ownership</span>
                    <ArrowRight size={13} className="shrink-0" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ENQUIRY MODAL */}
      <PropertyEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={property}
      />
    </div>
  );
};
