import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';

export const Services: React.FC = () => {
  const { settings } = useProperties();

  const services = [
    {
      title: "Verified Land Acquisition",
      desc: "We curate exclusively titled, dispute-free plots across high-growth corridors in Ogun and Lagos. From 150sqm starter plots to full commercial acres, each asset comes with verified survey credentials and straightforward documentation.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Flexible Milestone Spread",
      desc: "Invest without breaking your cash flow. We offer customized 3-to-12 month payment structures designed specifically for young Nigerian earners and diaspora professionals, backed by transparent allocation milestones.",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Strategic Land Advisory",
      desc: "Land in the path of infrastructural growth yields unmatched generational returns. Our research team monitors upcoming arterial routes, rail corridors, and industrial zones to guide your portfolio expansion with data-driven confidence.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Realtor Partner Network",
      desc: "We empower young Nigerian agents with verified inventory, 15% prompt commission payouts, professional marketing kits, and continuous deal-closing support through The Forge Realtors program.",
      image: "https://images.unsplash.com/photo-1556912172-45b7abe8d7e1?q=80&w=1600&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pt-20">
      {/* Hero */}
      <section className="bg-[#0057FF] text-white py-20 px-4 sm:px-6 relative overflow-hidden border-b-2 border-[#C8FF00]/30">
        {settings?.services_hero_image ? (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={settings.services_hero_image} 
              alt="The Forge Services" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0057FF]/85" />
          </div>
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            alt="Architecture"
          />
        )}

        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C8FF00]/15 blur-3xl pointer-events-none z-0" 
          aria-hidden="true" 
        />

        <div className="container mx-auto max-w-5xl relative z-10 text-center sm:text-left">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-blue-100 mb-6">
            <Link to="/" className="hover:text-[#C8FF00] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#C8FF00]" />
            <span className="text-[#C8FF00]">Services</span>
          </nav>

          <span className="text-[#C8FF00] text-xs uppercase tracking-[2px] font-bold mb-3 block">
            What We Do
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight font-display">
            Services & Investment Advisory
          </h1>
          <p className="text-blue-100 max-w-2xl text-base sm:text-xl font-normal leading-relaxed">
            Transparent, institutional-grade real estate solutions designed specifically for young Nigerian earners and diaspora investors.
          </p>
        </div>
      </section>

      {/* Services List */}
      <div className="bg-white divide-y divide-[#E0E4FF]">
        {services.map((service, index) => (
          <div key={index} className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse bg-[#F5F5F5]' : 'bg-white'}`}>
            {/* Image Side */}
            <div className="lg:w-1/2 h-72 sm:h-96 lg:h-auto overflow-hidden group relative min-h-[320px]">
              <div className="absolute inset-0 bg-[#0057FF]/10 z-10" />
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Content Side */}
            <div className="lg:w-1/2 p-8 sm:p-14 lg:p-20 flex flex-col justify-center">
              <span className="text-[#0057FF] text-5xl sm:text-7xl font-extrabold opacity-20 mb-4 select-none font-display">
                0{index + 1}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0057FF] mb-4 leading-tight font-display">
                {service.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-8">
                {service.desc}
              </p>
              <Link 
                to="/properties"
                className="inline-flex items-center gap-2 bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold uppercase tracking-wider text-xs px-6 py-3.5 rounded-[8px] min-h-[44px] transition-all self-start shadow-sm"
              >
                <span>Explore Opportunities</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};