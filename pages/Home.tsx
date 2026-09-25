import React, { useState } from 'react';
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
import { ScrollFade, CountUp, AnimatedDivider, ParallaxBackground } from '../components/AnimationUtils';

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

  // 2. Hero headline animated word by word with 0.15s stagger
  const renderHeroHeadline = () => {
    if (settings?.hero_headline) {
      const words = settings.hero_headline.split(' ');
      return (
        <span className="inline-block">
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block mr-[0.28em] animate-hero-word opacity-0"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationFillMode: 'forwards'
              }}
            >
              {word}
            </span>
          ))}
        </span>
      );
    }

    const words = [
      { text: 'Own', line: 1 },
      { text: 'Land.', line: 1 },
      { text: 'Own', line: 2 },
      { text: 'Your', line: 2 },
      { text: 'Future.', line: 2 },
      { text: 'Start', line: 3, accent: true },
      { text: 'Today.', line: 3, accent: true },
    ];

    return (
      <>
        <span className="block">
          {words.filter(w => w.line === 1).map((w, i) => (
            <span
              key={i}
              className="inline-block mr-[0.28em] animate-hero-word opacity-0"
              style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'forwards' }}
            >
              {w.text}
            </span>
          ))}
        </span>
        <span className="block">
          {words.filter(w => w.line === 2).map((w, i) => (
            <span
              key={i}
              className="inline-block mr-[0.28em] animate-hero-word opacity-0"
              style={{ animationDelay: `${(2 + i) * 0.15}s`, animationFillMode: 'forwards' }}
            >
              {w.text}
            </span>
          ))}
        </span>
        <span className="block text-[#774DFF]">
          {words.filter(w => w.line === 3).map((w, i) => (
            <span
              key={i}
              className="inline-block mr-[0.28em] animate-hero-word opacity-0"
              style={{ animationDelay: `${(5 + i) * 0.15}s`, animationFillMode: 'forwards' }}
            >
              {w.text}
            </span>
          ))}
        </span>
      </>
    );
  };

  return (
    <div className="w-full bg-white text-[#0F172A]">
      {/* SECTION 2 — HERO SECTION */}
      <section 
        id="hero"
        className="relative w-full min-h-[92vh] bg-[#0F172A] text-white flex items-center pt-28 pb-16 overflow-hidden"
      >
        {/* 9. Cinematic Hero Background Image with Parallax effect */}
        {settings?.hero_image && (
          <ParallaxBackground 
            imageUrl={settings.hero_image}
            alt="The Forge Properties Hero"
            overlayClassName="bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/85 to-[#0F172A]/70"
          />
        )}

        {/* Subtle Purple Accent Glow Orb Effect */}
        <div 
          className="absolute -top-32 -right-32 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full bg-gradient-to-br from-[#774DFF]/20 via-[#774DFF]/5 to-transparent blur-3xl pointer-events-none z-0"
          aria-hidden="true"
        />
        <div 
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#1E293B]/60 blur-2xl pointer-events-none z-0"
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#774DFF]/40 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#774DFF] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF]">
                {settings?.hero_badge_text || "The Forge Properties • Land. Legacy. Growth."}
              </span>
            </div>

            {/* 2. Hero animated headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-white leading-[1.08] mb-6">
              {renderHeroHeadline()}
            </h1>

            {/* Subtext in white/slate below */}
            <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mb-8">
              {settings?.hero_subheadline || "We help young Nigerians own verified, titled land — affordably, transparently, and on their terms."}
            </p>

            {/* Two CTA buttons side by side */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
              <Link
                id="hero-explore-btn"
                to="/properties"
                className="bg-[#774DFF] hover:bg-[#683de6] text-white font-extrabold text-base px-8 py-4 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 shadow-lg shadow-[#774DFF]/25 transition-all transform hover:scale-[1.03]"
              >
                <span>Explore Properties</span>
                <ArrowRight size={18} />
              </Link>
              
              <button
                id="hero-how-it-works-btn"
                onClick={() => scrollToSection('ways-to-own')}
                className="bg-transparent border-2 border-[#774DFF] hover:bg-[#774DFF] hover:text-white text-[#774DFF] font-bold text-base px-7 py-4 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 transition-all transform hover:scale-[1.03]"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Below buttons: Three trust badges in a row */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#774DFF]/20 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span>Verified Partner: <strong className="text-white font-bold">{settings?.hero_partner_name || "Geofort Africa"}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#774DFF]/20 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF] shrink-0">
                  <FileCheck2 size={16} />
                </div>
                <span>Titled Land Only (100% Surveyed)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#774DFF]/20 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF] shrink-0">
                  <Calendar size={16} />
                </div>
                <span>Flexible Monthly Payment Plans</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Section divider — animated purple line */}
        <div className="absolute bottom-0 left-0 w-full">
          <AnimatedDivider />
        </div>
      </section>

      {/* SECTION 3 — STATS BAR with 3. Number count-up animation */}
      <section 
        id="stats-bar"
        className="w-full bg-[#F3F4F6] border-t border-b border-[#E5E7EB] py-8"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB]">
            <div className="pt-2 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#774DFF] font-display">
                <CountUp value={settings?.stat_active_realtors || "50+"} />
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0F172A] mt-1">
                Active Realtors
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#774DFF] font-display">
                <CountUp value={settings?.stat_plots_available || "27"} />
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0F172A] mt-1">
                Plots Available
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#774DFF] font-display">
                <CountUp value={settings?.stat_verified_partners || "2"} />
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0F172A] mt-1">
                Verified Partners
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#774DFF] font-display">
                <CountUp value={settings?.stat_titled_land || "100%"} />
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[1px] text-[#0F172A] mt-1">
                Titled Land
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURED PROPERTIES */}
      <section id="featured-properties" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <ScrollFade className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-2">
              Featured Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-display">
              Verified Properties Available Now
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Every listing is verified, titled, and backed by a licensed partner.
            </p>
          </ScrollFade>

          {/* Show 1 to 2 featured property cards with 4. Property card hover lift effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredProperties.map((prop, idx) => (
              <ScrollFade key={prop.id} delay={idx * 0.1} className="h-full">
                <div className="property-card-lift bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-sm flex flex-col h-full group">
                  {/* Property Image & Urgency / Available Badge */}
                  <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F3F4F6]">
                    <img
                      src={prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200'}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      {/* Urgency element: Red-Orange #FE4A23 */}
                      <span className="bg-[#FE4A23] text-white font-bold text-xs px-3 py-1.5 rounded-[6px] shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={14} /> Available Now
                      </span>
                    </div>
                    {prop.developer && (
                      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-[#774DFF] text-[11px] font-bold px-2.5 py-1 rounded-[4px] shadow-sm">
                        Partner: {prop.developer}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between bg-white">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
                        <MapPin size={14} className="text-[#774DFF] shrink-0" />
                        <span>{prop.location}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-[#0F172A] font-display group-hover:text-[#774DFF] transition-colors mb-2">
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
                              className="text-xs font-bold px-2.5 py-1 rounded-[6px] bg-[#F3F4F6] text-[#0F172A] border border-[#E5E7EB]"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Documentation */}
                      <div className="p-3 bg-[#F3F4F6] rounded-[8px] border border-[#E5E7EB] text-xs text-[#0F172A] mb-6 flex items-center gap-2">
                        <FileCheck2 size={16} className="text-[#774DFF] shrink-0" />
                        <span className="font-semibold">
                          {prop.documentation || 'Deed of Assignment + Registered Survey Plan'}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-[1px] text-slate-400 block">
                          Starting Price
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-[#774DFF] font-display">
                          ₦{prop.price ? prop.price.toLocaleString() : '900,000'}
                        </span>
                      </div>

                      <button
                        id={`view-details-${prop.id}`}
                        onClick={() => handleOpenEnquiry(prop)}
                        className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-[8px] min-h-[44px] transition-all flex items-center gap-2 shadow-sm hover:shadow"
                      >
                        <span>View Details</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>

          {/* Below cards: View All Properties link */}
          <div className="text-center mt-12">
            <Link
              id="view-all-properties-link"
              to="/properties"
              className="inline-flex items-center gap-2 text-base font-bold text-[#774DFF] hover:text-[#683de6] transition-colors group"
            >
              <span>View All Properties</span>
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5 — 4 WAYS TO OWN LAND (Dark Section: #0F172A) */}
      <section id="ways-to-own" className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
        {/* Decorative background glow */}
        <div 
          className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#774DFF]/10 blur-3xl pointer-events-none" 
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <ScrollFade className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-2">
              Accessible Ownership
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display leading-tight">
              4 Ways Young Nigerians Can Own Land Without Breaking the Bank
            </h2>
            <p className="text-base text-slate-300 mt-4">
              We eliminate traditional real estate gatekeeping with structures tailored for your current cash flow.
            </p>
          </ScrollFade>

          {/* 4 cards in a 2x2 grid with stagger delays */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <ScrollFade delay={0.1}>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#1E293B] border border-[#774DFF]/30 hover:border-[#774DFF] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between shadow-md">
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#774DFF]/15 font-display select-none pointer-events-none group-hover:text-[#774DFF]/25 transition-colors"
                  aria-hidden="true"
                >
                  01
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#774DFF]/20 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF] mb-5">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Flexible Payment Plan
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Spread land payments across 3 to 12 months with low initial commitments and zero exploitative interest.
                  </p>
                </div>

                <Link 
                  to="/properties" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#774DFF] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollFade>

            {/* Card 2 */}
            <ScrollFade delay={0.2}>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#1E293B] border border-[#774DFF]/30 hover:border-[#774DFF] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between shadow-md">
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#774DFF]/15 font-display select-none pointer-events-none group-hover:text-[#774DFF]/25 transition-colors"
                  aria-hidden="true"
                >
                  02
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#774DFF]/20 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF] mb-5">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Co-Buy With a Friend
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Split a 300sqm or 500sqm plot cleanly with dual-agreement legal documentation and individual title allocations.
                  </p>
                </div>

                <Link 
                  to="/properties" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#774DFF] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollFade>

            {/* Card 3 */}
            <ScrollFade delay={0.3}>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#1E293B] border border-[#774DFF]/30 hover:border-[#774DFF] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between shadow-md">
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#774DFF]/15 font-display select-none pointer-events-none group-hover:text-[#774DFF]/25 transition-colors"
                  aria-hidden="true"
                >
                  03
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#774DFF]/20 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF] mb-5">
                    <Layers size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Group Buying
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Pool purchasing power with your alumni, tech circle, or family club to unlock exclusive bulk price discounts.
                  </p>
                </div>

                <Link 
                  to="/forge-nation" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#774DFF] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollFade>

            {/* Card 4 */}
            <ScrollFade delay={0.4}>
              <div className="relative p-7 sm:p-8 rounded-[12px] bg-[#1E293B] border border-[#774DFF]/30 hover:border-[#774DFF] transition-all duration-300 overflow-hidden group h-full flex flex-col justify-between shadow-md">
                <div 
                  className="absolute -top-4 -right-2 text-7xl sm:text-8xl font-extrabold text-[#774DFF]/15 font-display select-none pointer-events-none group-hover:text-[#774DFF]/25 transition-colors"
                  aria-hidden="true"
                >
                  04
                </div>

                <div>
                  <div className="w-12 h-12 rounded-[8px] bg-[#774DFF]/20 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF] mb-5">
                    <Coins size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Start Small
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Begin your real estate empire with an entry-level 150sqm parcel starting at just ₦900,000 in prime Kobape.
                  </p>
                </div>

                <Link 
                  to="/properties" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#774DFF] hover:text-white transition-colors uppercase tracking-[1.5px]"
                >
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* SECTION 6 — WHY THE FORGE */}
      <section id="why-the-forge" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <ScrollFade className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-2">
              Our Core Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-display">
              Why The Forge Properties
            </h2>
            <p className="text-base text-slate-600 mt-3">
              We built the platform we wished existed when we started investing: trustworthy, simple, and transparent.
            </p>
          </ScrollFade>

          {/* Optional uploaded story image banner with parallax */}
          {settings?.home_story_image && (
            <ScrollFade className="mb-14">
              <div className="relative rounded-[16px] overflow-hidden border border-[#E5E7EB] shadow-md max-h-[420px] group">
                <img 
                  src={settings.home_story_image} 
                  alt="Why The Forge Story" 
                  className="w-full h-full object-cover max-h-[420px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/30 to-transparent flex items-end p-6 sm:p-10">
                  <div className="text-white max-w-xl">
                    <span className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#774DFF] block mb-1">
                      Our Promise
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                      Built by Young Nigerians, For Young Nigerians
                    </h3>
                  </div>
                </div>
              </div>
            </ScrollFade>
          )}

          {/* Three columns: Verified, Transparent, Accessible with stagger */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Verified */}
            <ScrollFade delay={0.1}>
              <div className="p-8 rounded-[12px] bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#774DFF] transition-all duration-300 h-full shadow-xs">
                <div className="w-12 h-12 rounded-[8px] bg-white text-[#774DFF] flex items-center justify-center mb-6 border border-[#E5E7EB] shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] font-display mb-3">
                  Verified
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every estate is inspected, vetted, and backed by licensed institutional developers like Geofort Africa. No Omo Onile disputes, zero overlapping surveys, 100% legitimate titled documentation.
                </p>
              </div>
            </ScrollFade>

            {/* Column 2: Transparent */}
            <ScrollFade delay={0.2}>
              <div className="p-8 rounded-[12px] bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#774DFF] transition-all duration-300 h-full shadow-xs">
                <div className="w-12 h-12 rounded-[8px] bg-white text-[#774DFF] flex items-center justify-center mb-6 border border-[#E5E7EB] shadow-sm">
                  <FileCheck2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] font-display mb-3">
                  Transparent
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  No surprise agency fees, undisclosed developmental levies, or misleading coordinates. What you see is what you pay, complete with clear allocation timelines and verifiable survey files.
                </p>
              </div>
            </ScrollFade>

            {/* Column 3: Accessible */}
            <ScrollFade delay={0.3}>
              <div className="p-8 rounded-[12px] bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#774DFF] transition-all duration-300 h-full shadow-xs">
                <div className="w-12 h-12 rounded-[8px] bg-white text-[#774DFF] flex items-center justify-center mb-6 border border-[#E5E7EB] shadow-sm">
                  <Coins size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] font-display mb-3">
                  Accessible
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Engineered specifically for young Nigerian earners and diaspora professionals. Enjoy entry sizes from 150sqm, simple digital KYC, and flexible payment plans that fit your lifestyle.
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* SECTION 7 — THE FORGE NATION BANNER (8. Subtle shimmer sweep animation) */}
      <section 
        id="forge-nation-banner" 
        className="relative bg-[#0F172A] py-14 px-4 sm:px-6 border-t border-b border-[#774DFF]/30 overflow-hidden"
      >
        {/* Background photo if uploaded by admin */}
        {settings?.home_cta_image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={settings.home_cta_image} 
              alt="Forge Nation Community" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-[#0F172A]/85 backdrop-blur-[1px]" />
          </div>
        )}

        {/* 8. Subtle shimmer/sweep energy animation */}
        <div className="banner-shimmer-sweep" aria-hidden="true" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#774DFF]">
                Exclusive Community
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Join The Forge Nation — Nigeria's most exciting property community
              </h3>
              <p className="text-sm text-slate-300 font-semibold">
                Education. Community. Deals. Games. Giveaways.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                id="forge-nation-join-free-btn"
                to="/forge-nation"
                className="bg-[#774DFF] hover:bg-[#683de6] text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Join for Free</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — REALTOR STRIP */}
      <section id="realtor-strip" className="bg-[#1E293B] py-6 px-4 sm:px-6 border-t border-b border-[#774DFF]/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="text-sm sm:text-base font-semibold text-white">
              Turn your network into income. <span className="text-[#774DFF] font-bold">Join The Forge Realtors</span> and earn 15% commission.
            </div>

            <Link
              id="become-a-realtor-btn"
              to="/join-realtors"
              className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <span>Become a Realtor</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9 — NEWSLETTER SIGNUP */}
      <section id="newsletter-section" className="py-20 bg-[#F3F4F6]">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <ScrollFade>
            <div className="w-12 h-12 rounded-full bg-white text-[#774DFF] mx-auto flex items-center justify-center mb-4 border border-[#E5E7EB] shadow-sm">
              <Mail size={22} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-display mb-3">
              Stay in the loop — get property tips and opportunities straight to your inbox
            </h2>
            <p className="text-sm text-slate-600 mb-8 max-w-lg mx-auto">
              Get weekly market updates, price alerts for Ogun and Lagos corridors, and first-dibs on upcoming releases.
            </p>

            {newsletterSuccess ? (
              <div className="p-5 bg-white rounded-[8px] border border-[#E5E7EB] text-[#774DFF] text-sm font-semibold max-w-md mx-auto flex items-center justify-center gap-2.5 shadow-sm">
                <CheckCircle2 size={20} className="text-[#774DFF] shrink-0" />
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
                    className="flex-grow px-4 py-3 text-sm bg-white border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#774DFF] focus:ring-1 focus:ring-[#774DFF] min-h-[44px]"
                  />
                  <button
                    id="home-newsletter-submit"
                    type="submit"
                    disabled={newsletterLoading}
                    className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-sm px-6 py-3 rounded-[8px] transition-all min-h-[44px] shrink-0 disabled:opacity-50"
                  >
                    {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  No spam. Just value. Unsubscribe anytime.
                </p>
              </form>
            )}
          </ScrollFade>
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
