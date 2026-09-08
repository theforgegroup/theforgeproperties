import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Users, 
  Coins, 
  FileCheck2, 
  Layers, 
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { PropertyEnquiryModal } from '../components/PropertyEnquiryModal';
import { Property } from '../types';

// Subtle Intersection Observer fade-in helper
const FadeIn: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ 
  children, 
  className = "",
  id
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    const current = domRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      id={id}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Home: React.FC = () => {
  const { properties, settings, addSubscriber } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Filter 1 to 2 featured cards: prioritize featured or show_on_homepage
  const featuredProperties = React.useMemo(() => {
    if (!properties || properties.length === 0) return [];
    const flagged = properties.filter(p => p.show_on_homepage || p.featured);
    if (flagged.length > 0) return flagged.slice(0, 2);
    return properties.slice(0, 2);
  }, [properties]);

  const handleOpenEnquiry = (property: Property) => {
    setSelectedProperty(property);
    setIsEnquiryOpen(true);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterLoading(true);
    try {
      await addSubscriber(newsletterEmail);
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
      setNewsletterSuccess(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white text-[#0A0A0A]">
      {/* SECTION 2 — HERO SECTION */}
      <section 
        id="hero"
        className="relative w-full min-h-[90vh] bg-[#0057FF] text-white flex items-center pt-24 pb-16 overflow-hidden"
      >
        {/* Cinematic Hero Background Image */}
        {settings?.hero_image && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={settings.hero_image} 
              alt="The Forge Properties Hero" 
              className="w-full h-full object-cover object-center"
            />
            {/* Rich Blue Overlays to keep typography crisp and legible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0057FF]/95 via-[#0057FF]/85 to-[#0057FF]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0057FF] via-transparent to-[#0057FF]/40" />
          </div>
        )}

        {/* Subtle Accent Gradient Orb Effect top right */}
        <div 
          className="absolute -top-32 -right-32 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full bg-gradient-to-br from-[#C8FF00]/25 via-[#C8FF00]/10 to-transparent blur-3xl pointer-events-none z-0"
          aria-hidden="true"
        />
        <div 
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#0047d4]/60 blur-2xl pointer-events-none z-0"
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C8FF00]/40 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#C8FF00] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00]">
                {settings?.hero_badge_text || "The Forge Properties • Land. Legacy. Growth."}
              </span>
            </div>

            {/* Large Bold Headline in white */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-white leading-[1.08] mb-6">
              {settings?.hero_headline ? (
                settings.hero_headline
              ) : (
                <>
                  Own Land.<br />
                  Own Your Future.<br />
                  <span className="text-[#C8FF00]">Start Today.</span>
                </>
              )}
            </h1>

            {/* Subtext in muted white below */}
            <p className="text-base sm:text-xl text-blue-100 font-normal leading-relaxed max-w-2xl mb-8">
              {settings?.hero_subheadline || "We help young Nigerians own verified, titled land — affordably, transparently, and on their terms."}
            </p>

            {/* Two CTA buttons side by side */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
              <Link
                id="hero-explore-btn"
                to="/properties"
                className="bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-base px-8 py-4 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 shadow-lg shadow-[#C8FF00]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Properties</span>
                <ArrowRight size={18} />
              </Link>
              
              <button
                id="hero-how-it-works-btn"
                onClick={() => scrollToSection('ways-to-own')}
                className="border-2 border-[#C8FF00] hover:bg-[#C8FF00] hover:text-[#0A0A0A] text-[#C8FF00] font-bold text-base px-7 py-4 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 transition-all"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Below buttons: Three trust badges in a row */}
            <div className="pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span>Verified Partner: <strong className="text-white font-bold">{settings?.hero_partner_name || "Geofort Africa"}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] shrink-0">
                  <FileCheck2 size={16} />
                </div>
                <span>Titled Land Only (100% Surveyed)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] shrink-0">
                  <Calendar size={16} />
                </div>
                <span>Flexible Monthly Payment Plans</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thin Accent Divider line at the bottom of hero */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C8FF00] to-transparent opacity-80" />
      </section>

      {/* SECTION 3 — STATS BAR */}
      <section 
        id="stats-bar"
        className="w-full bg-[#F5F5F5] border-t-2 border-b-2 border-[#E0E4FF] py-8"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#E0E4FF]">
            <div className="pt-2 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
                {settings?.stat_active_realtors || "50+"}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0A0A0A] mt-1">
                Active Realtors
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
                {settings?.stat_plots_available || "27"}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0A0A0A] mt-1">
                Plots Available
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
                {settings?.stat_verified_partners || "2"}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0A0A0A] mt-1">
                Verified Partners
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
                {settings?.stat_titled_land || "100%"}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0A0A0A] mt-1">
                Titled Land
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURED PROPERTIES */}
      <section id="featured-properties" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#0057FF] block mb-2">
              Featured Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
              Verified Properties Available Now
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Every listing is verified, titled, and backed by a licensed partner.
            </p>
          </FadeIn>

          {/* Show 1 to 2 featured property cards only */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredProperties.map((prop) => (
              <FadeIn key={prop.id} className="h-full">
                <div className="bg-white rounded-[12px] border border-[#E0E4FF] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                  {/* Property Image & Badge */}
                  <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5F5F5]">
                    <img
                      src={prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200'}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#0057FF] text-[#C8FF00] font-bold text-xs px-3 py-1.5 rounded-[6px] shadow-sm uppercase tracking-wider flex items-center gap-1.5 border border-[#C8FF00]/30">
                        <ShieldCheck size={14} /> Available Now
                      </span>
                    </div>
                    {prop.developer && (
                      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-[#0057FF] text-[11px] font-bold px-2.5 py-1 rounded-[4px] shadow-sm">
                        Partner: {prop.developer}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between bg-white">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                        <MapPin size={14} className="text-[#0057FF] shrink-0" />
                        <span>{prop.location}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-[#0A0A0A] font-display group-hover:text-[#0057FF] transition-colors mb-2">
                        {prop.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {prop.description}
                      </p>

                      {/* Plot Sizes as Tags */}
                      <div className="mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400 block mb-2">
                          Plot Sizes Available:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(prop.plot_sizes || ['150 SQM', '300 SQM', '500 SQM']).map((size) => (
                            <span 
                              key={size}
                              className="text-xs font-bold px-2.5 py-1 rounded-[6px] bg-[#F5F5F5] text-[#0A0A0A] border border-[#E0E4FF]"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Documentation */}
                      <div className="p-3 bg-[#F5F5F5] rounded-[8px] border border-[#E0E4FF] text-xs text-[#0A0A0A] mb-6 flex items-center gap-2">
                        <FileCheck2 size={16} className="text-[#0057FF] shrink-0" />
                        <span className="font-semibold">
                          {prop.documentation || 'Deed of Assignment + Registered Survey Plan'}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-[#E0E4FF] flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-[1px] text-slate-400 block">
                          Starting Price
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-[#0057FF] font-display">
                          ₦{prop.price ? prop.price.toLocaleString() : '900,000'}
                        </span>
                      </div>

                      <button
                        id={`view-details-${prop.id}`}
                        onClick={() => handleOpenEnquiry(prop)}
                        className="bg-[#0057FF] hover:bg-[#0047d4] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-[8px] min-h-[44px] transition-all flex items-center gap-2 shadow-sm hover:shadow"
                      >
                        <span>View Details</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Below cards: View All Properties link */}
          <div className="text-center mt-12">
            <Link
              id="view-all-properties-link"
              to="/properties"
              className="inline-flex items-center gap-2 text-base font-bold text-[#0057FF] hover:text-[#0047d4] transition-colors group"
            >
              <span>View All Properties</span>
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5 — 4 WAYS TO OWN LAND */}
      <section id="ways-to-own" className="py-24 bg-[#0057FF] text-white relative overflow-hidden">
        {/* Decorative background glow */}
        <div 
          className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#C8FF00]/10 blur-3xl pointer-events-none" 
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00] block mb-2">
              Accessible Ownership
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display leading-tight">
              4 Ways Young Nigerians Can Own Land Without Breaking the Bank
            </h2>
            <p className="text-base text-blue-100 mt-4">
              We eliminate traditional real estate gatekeeping with structures tailored for your current cash flow.
            </p>
          </FadeIn>

          {/* 4 cards in a 2x2 grid on mobile and desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <FadeIn>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#0047d4] border border-[#C8FF00]/30 hover:border-[#C8FF00] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between">
                {/* Large Watermark Number 01 */}
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#C8FF00]/10 font-display select-none pointer-events-none group-hover:text-[#C8FF00]/20 transition-colors"
                  aria-hidden="true"
                >
                  01
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] mb-5">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Flexible Payment Plan
                  </h3>
                  <p className="text-sm text-blue-100 leading-relaxed mb-6">
                    Spread land payments across 3 to 12 months with low initial commitments and zero exploitative interest.
                  </p>
                </div>

                <Link 
                  to="/properties" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8FF00] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>

            {/* Card 2 */}
            <FadeIn>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#0047d4] border border-[#C8FF00]/30 hover:border-[#C8FF00] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between">
                {/* Large Watermark Number 02 */}
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#C8FF00]/10 font-display select-none pointer-events-none group-hover:text-[#C8FF00]/20 transition-colors"
                  aria-hidden="true"
                >
                  02
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] mb-5">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Co-Buy With a Friend
                  </h3>
                  <p className="text-sm text-blue-100 leading-relaxed mb-6">
                    Split a 300sqm or 500sqm plot cleanly with dual-agreement legal documentation and individual title allocations.
                  </p>
                </div>

                <Link 
                  to="/properties" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8FF00] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>

            {/* Card 3 */}
            <FadeIn>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#0047d4] border border-[#C8FF00]/30 hover:border-[#C8FF00] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between">
                {/* Large Watermark Number 03 */}
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#C8FF00]/10 font-display select-none pointer-events-none group-hover:text-[#C8FF00]/20 transition-colors"
                  aria-hidden="true"
                >
                  03
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] mb-5">
                    <Layers size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Group Buying
                  </h3>
                  <p className="text-sm text-blue-100 leading-relaxed mb-6">
                    Pool purchasing power with your alumni, tech circle, or family club to unlock exclusive bulk price discounts.
                  </p>
                </div>

                <Link 
                  to="/forge-nation" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8FF00] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>

            {/* Card 4 */}
            <FadeIn>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#0047d4] border border-[#C8FF00]/30 hover:border-[#C8FF00] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between">
                {/* Large Watermark Number 04 */}
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#C8FF00]/10 font-display select-none pointer-events-none group-hover:text-[#C8FF00]/20 transition-colors"
                  aria-hidden="true"
                >
                  04
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] mb-5">
                    <Coins size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Start Small
                  </h3>
                  <p className="text-sm text-blue-100 leading-relaxed mb-6">
                    Begin your real estate empire with an entry-level 150sqm parcel starting at just ₦900,000 in prime Kobape.
                  </p>
                </div>

                <Link 
                  to="/properties" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8FF00] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 6 — WHY THE FORGE */}
      <section id="why-the-forge" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <FadeIn className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#0057FF] block mb-2">
              Our Core Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
              Why The Forge Properties
            </h2>
            <p className="text-base text-slate-600 mt-3">
              We built the platform we wished existed when we started investing: trustworthy, simple, and transparent.
            </p>
          </FadeIn>

          {/* Optional uploaded story image banner if provided by admin */}
          {settings?.home_story_image && (
            <FadeIn className="mb-14">
              <div className="relative rounded-[16px] overflow-hidden border border-[#E0E4FF] shadow-md max-h-[420px] group">
                <img 
                  src={settings.home_story_image} 
                  alt="Why The Forge Story" 
                  className="w-full h-full object-cover max-h-[420px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0057FF]/70 via-[#0057FF]/20 to-transparent flex items-end p-6 sm:p-10">
                  <div className="text-white max-w-xl">
                    <span className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#C8FF00] block mb-1">
                      Our Promise
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                      Built by Young Nigerians, For Young Nigerians
                    </h3>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Three columns on desktop, stacked on mobile: Verified, Transparent, Accessible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Verified */}
            <FadeIn>
              <div className="p-8 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF] hover:border-[#0057FF] transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-[8px] bg-white text-[#0057FF] flex items-center justify-center mb-6 border border-[#E0E4FF] shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#0057FF] font-display mb-3">
                  Verified
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every estate is inspected, vetted, and backed by licensed institutional developers like Geofort Africa. No Omo Onile disputes, zero overlapping surveys, 100% legitimate titled documentation.
                </p>
              </div>
            </FadeIn>

            {/* Column 2: Transparent */}
            <FadeIn>
              <div className="p-8 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF] hover:border-[#0057FF] transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-[8px] bg-white text-[#0057FF] flex items-center justify-center mb-6 border border-[#E0E4FF] shadow-sm">
                  <FileCheck2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#0057FF] font-display mb-3">
                  Transparent
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  No surprise agency fees, undisclosed developmental levies, or misleading coordinates. What you see is what you pay, complete with clear allocation timelines and verifiable survey files.
                </p>
              </div>
            </FadeIn>

            {/* Column 3: Accessible */}
            <FadeIn>
              <div className="p-8 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF] hover:border-[#0057FF] transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-[8px] bg-white text-[#0057FF] flex items-center justify-center mb-6 border border-[#E0E4FF] shadow-sm">
                  <Coins size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#0057FF] font-display mb-3">
                  Accessible
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Engineered specifically for young Nigerian earners and diaspora professionals. Enjoy entry sizes from 150sqm, simple digital KYC, and flexible payment plans that fit your lifestyle.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 7 — THE FORGE NATION BANNER */}
      <section 
        id="forge-nation-banner" 
        className="relative bg-[#0057FF] py-14 px-4 sm:px-6 border-t border-b border-[#C8FF00]/30 overflow-hidden"
      >
        {/* Background photo if uploaded by admin */}
        {settings?.home_cta_image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={settings.home_cta_image} 
              alt="Forge Nation Community" 
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-[#0057FF]/85 backdrop-blur-[1px]" />
          </div>
        )}

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#C8FF00]">
                Exclusive Community
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Join The Forge Nation — Nigeria's most exciting property community
              </h3>
              <p className="text-sm text-blue-100 font-semibold">
                Education. Community. Deals. Games. Giveaways.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                id="forge-nation-join-free-btn"
                to="/forge-nation"
                className="bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-sm sm:text-base px-8 py-4 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Join for Free</span>
                <ArrowRight size={18} className="text-[#0A0A0A]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — REALTOR STRIP */}
      <section id="realtor-strip" className="bg-[#0047d4] py-6 px-4 sm:px-6 border-t border-b border-[#C8FF00]/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="text-sm sm:text-base font-semibold text-white">
              Turn your network into income. <span className="text-[#C8FF00] font-bold">Join The Forge Realtors</span> and earn 15% commission.
            </div>

            <Link
              id="become-a-realtor-btn"
              to="/join-realtors"
              className="bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <span>Become a Realtor</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9 — NEWSLETTER SIGNUP */}
      <section id="newsletter-section" className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <FadeIn>
            <div className="w-12 h-12 rounded-full bg-white text-[#0057FF] mx-auto flex items-center justify-center mb-4 border border-[#E0E4FF] shadow-sm">
              <Mail size={22} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0057FF] font-display mb-3">
              Stay in the loop — get property tips and opportunities straight to your inbox
            </h2>
            <p className="text-sm text-slate-600 mb-8 max-w-lg mx-auto">
              Get weekly market updates, price alerts for Ogun and Lagos corridors, and first-dibs on upcoming releases.
            </p>

            {newsletterSuccess ? (
              <div className="p-5 bg-white rounded-[8px] border border-[#E0E4FF] text-[#0057FF] text-sm font-semibold max-w-md mx-auto flex items-center justify-center gap-2.5 shadow-sm">
                <CheckCircle2 size={20} className="text-[#0057FF] shrink-0" />
                <span>Thank you for subscribing! Check your inbox soon for your free investor welcome pack.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="home-newsletter-input"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-grow px-4 py-3 text-sm bg-white border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                  />
                  <button
                    id="home-newsletter-submit"
                    type="submit"
                    disabled={newsletterLoading}
                    className="bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-bold text-sm px-6 py-3 rounded-[8px] transition-all min-h-[44px] shrink-0 disabled:opacity-50"
                  >
                    {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  No spam. Just value. Unsubscribe anytime.
                </p>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Global Property Enquiry Modal */}
      <PropertyEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={selectedProperty}
      />
    </div>
  );
};
