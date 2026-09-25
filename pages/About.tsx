import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileCheck2, 
  Coins, 
  ArrowRight, 
  Users, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { ScrollFade, ParallaxBackground } from '../components/AnimationUtils';

export const About: React.FC = () => {
  const { settings } = useProperties();
  const teamMembers = settings?.team_members && settings.team_members.length > 0 
    ? settings.team_members 
    : [
        { name: "Daniel Paul", role: "Co-Founder & Growth Lead", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" },
        { name: "Paul Bolaji", role: "Co-Founder & Operations Lead", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400" },
        { name: "Samuel Oshin", role: "Co-Founder & Strategy Lead", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" }
      ];

  return (
    <div className="min-h-screen bg-white text-[#0F172A] pt-20">
      {/* SECTION 1 — HERO SECTION (Dark Blue Background, Large Heading, Mission Statement) */}
      <section className="bg-[#0F172A] text-white py-20 px-4 sm:px-6 relative overflow-hidden border-b border-[#774DFF]/25">
        {settings?.about_hero_image && (
          <ParallaxBackground 
            imageUrl={settings.about_hero_image}
            alt="About The Forge Properties"
            overlayClassName="bg-[#0F172A]/85"
          />
        )}

        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#774DFF]/15 blur-3xl pointer-events-none z-0" 
          aria-hidden="true" 
        />

        <div className="container mx-auto max-w-5xl relative z-10 text-center sm:text-left">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-300 mb-6">
            <Link to="/" className="hover:text-[#774DFF] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#774DFF]" />
            <span className="text-[#774DFF]">About Us</span>
          </nav>

          <span className="inline-block text-xs font-bold uppercase tracking-[2.5px] text-[#774DFF] mb-3">
            Our Brand & Purpose
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight mb-6">
            We Are The Forge Properties
          </h1>

          {/* One paragraph mission statement */}
          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl font-normal">
            Making verified land ownership accessible to young Nigerians and diaspora buyers through transparent documentation, zero hidden fees, and flexible terms designed for our generation.
          </p>
        </div>
      </section>

      {/* SECTION 2 — STORY SECTION */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Text */}
            <ScrollFade className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block">
                The Story
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-display leading-tight">
                Built by Young Nigerians, For Young Nigerians
              </h2>

              <div className="p-6 bg-[#F3F4F6] border-l-4 border-[#774DFF] rounded-r-[10px] border border-[#E5E7EB]">
                <p className="text-base sm:text-lg font-semibold text-[#0F172A] leading-relaxed italic">
                  "The Forge Properties was founded by a team of young, ambitious Nigerians who got tired of watching their generation believe that property ownership was not for them. We built a company to change that — one verified plot at a time."
                </p>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                <p>
                  Traditional Nigerian real estate has long been plagued by opacity: unregistered surveys, surprise 'developmental' bills after purchase, and relentless agency runarounds. Young professionals, whether living in Lagos or in the diaspora (UK, US, Canada, Europe), felt alienated from genuine generational wealth.
                </p>
                <p>
                  We changed the equation. By partnering with institutional developers, inspecting and surveying every inch of land, and providing accessible entry-points like 150 SQM plots starting under ₦1,000,000 with flexible monthly spreads, we bring true ownership back to where it belongs: in your hands.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/properties"
                  className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-sm px-6 py-3.5 rounded-[8px] min-h-[44px] inline-flex items-center gap-2 shadow-md transition-all"
                >
                  <span>Explore Verified Plots</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollFade>

            {/* Right Column: Image Placeholder / Visual */}
            <ScrollFade delay={0.2} className="lg:col-span-5">
              <div className="relative rounded-[16px] overflow-hidden shadow-2xl border-4 border-[#F3F4F6] bg-slate-100 group">
                <img
                  src={settings?.about_story_image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop"}
                  alt="The Forge Verified Land"
                  className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#774DFF] block mb-1">
                    Land. Legacy. Growth.
                  </span>
                  <p className="text-sm font-semibold text-white">
                    Verified titled land mapped and allocated with precision.
                  </p>
                </div>
              </div>
            </ScrollFade>

          </div>
        </div>
      </section>

      {/* SECTION 3 — VALUES SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-[#F3F4F6] border-t border-b border-[#E5E7EB]">
        <div className="container mx-auto max-w-6xl">
          <ScrollFade className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-2">
              Our Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-display">
              The Forge Pillars
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              The non-negotiable promises behind every plot, contract, and conversation.
            </p>
          </ScrollFade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Verified */}
            <ScrollFade delay={0.1}>
              <div className="p-8 rounded-[12px] bg-white border border-[#E5E7EB] shadow-sm hover:border-[#774DFF] transition-all h-full">
                <div className="w-12 h-12 rounded-[8px] bg-[#F3F4F6] text-[#774DFF] flex items-center justify-center mb-6 border border-[#E5E7EB]">
                  <ShieldCheck size={26} />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] font-display mb-3">
                  Verified
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  All land listed on The Forge has undergone exhaustive title vetting, coordinates cross-checking at the Surveyor General's office, and partner verification. Zero family drama, zero third-party conflict.
                </p>
              </div>
            </ScrollFade>

            {/* Card 2: Transparent */}
            <ScrollFade delay={0.2}>
              <div className="p-8 rounded-[12px] bg-white border border-[#E5E7EB] shadow-sm hover:border-[#774DFF] transition-all h-full">
                <div className="w-12 h-12 rounded-[8px] bg-[#F3F4F6] text-[#774DFF] flex items-center justify-center mb-6 border border-[#E5E7EB]">
                  <FileCheck2 size={26} />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] font-display mb-3">
                  Transparent
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Clear pricing, full documentation breakdowns, and predictable payment schedules. We believe in radical openness: you receive your contract, deed, and registered survey without surprise fees.
                </p>
              </div>
            </ScrollFade>

            {/* Card 3: Accessible */}
            <ScrollFade delay={0.3}>
              <div className="p-8 rounded-[12px] bg-white border border-[#E5E7EB] shadow-sm hover:border-[#774DFF] transition-all h-full">
                <div className="w-12 h-12 rounded-[8px] bg-[#F3F4F6] text-[#774DFF] flex items-center justify-center mb-6 border border-[#E5E7EB]">
                  <Coins size={26} />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] font-display mb-3">
                  Accessible
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We lower the barriers to entry with flexible parcel subdivisions (150 SQM, 300 SQM, 500 SQM) and monthly installments that fit a modern earner's budget, giving anyone the power to own land today.
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* SECTION 4 — PARTNER SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <ScrollFade className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-2">
              Institutional Backing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-display">
              Our Verified Partners
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              We collaborate exclusively with licensed, established developers with proven track records of delivery and physical allocation.
            </p>
          </ScrollFade>

          <ScrollFade delay={0.15}>
            <div className="p-8 sm:p-10 rounded-[14px] bg-[#0F172A] text-white border border-[#774DFF]/30 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Logo / Badge */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[12px] bg-[#1E293B] border-2 border-[#774DFF] flex items-center justify-center text-[#774DFF] font-extrabold text-2xl font-display shrink-0 shadow-lg">
                  GA
                </div>

                <div className="space-y-3 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h3 className="text-2xl font-bold text-white font-display">
                      Geofort Africa
                    </h3>
                    <span className="bg-[#774DFF] text-white font-bold text-xs px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Official Development Partner
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Geofort Africa is a premier Nigerian infrastructure and real estate development institution specializing in master-planned estates, registered surveys, and titled community developments. As our anchor partner for <strong>Prasino Lush Phase 2</strong> in Kobape, Abeokuta, Geofort Africa guarantees rigorous legal compliance, estate fencing, road infrastructure, and prompt physical plot demarcation.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-[#774DFF]">
                    <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="shrink-0" /> 100% Surveyed Schemes</span>
                    <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="shrink-0" /> Prompt Physical Allocation</span>
                    <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="shrink-0" /> Verified Titles</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* SECTION 5 — TEAM SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-[#F3F4F6] border-t border-[#E5E7EB]">
        <div className="container mx-auto max-w-6xl">
          <ScrollFade className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] block mb-2">
              Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-display">
              Meet The Forge Team
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A diverse team of Nigerian professionals driven by a shared mission to empower our generation.
            </p>
          </ScrollFade>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <ScrollFade key={index} delay={index * 0.1}>
                <div 
                  className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-sm hover:border-[#774DFF] transition-all text-center p-6"
                >
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-2 border-[#774DFF]/30 bg-slate-100 flex items-center justify-center text-slate-400">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={32} className="text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] font-display">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#774DFF] font-bold uppercase tracking-[1px] mt-1">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Dedicated to making titled land acquisition transparent and stress-free for Nigerians locally and across the diaspora.
                  </p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
