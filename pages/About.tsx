
import React from 'react';
import { User, Sparkles, CheckCircle2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';

export const About: React.FC = () => {
  const { settings } = useProperties();
  const teamMembers = settings.team_members || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <SEO 
        title="About Us | The Forge Properties" 
        description="Learn about our mission to make land and property ownership simple, affordable, and stress-free for young Nigerians at home and in the diaspora."
      />

      {/* Hero Banner */}
      <div className="relative pt-32 md:pt-40 pb-16 md:pb-24 bg-forge-navy text-white overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-forge-gold opacity-5 skew-x-12 transform translate-x-20"></div>
         <div className="container mx-auto px-6 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-forge-gold/15 text-forge-gold text-[10px] md:text-xs uppercase tracking-[0.25em] mb-4 border border-forge-gold/25 font-bold">
              <Sparkles size={12} /> The New Standard
            </span>
            <h1 className="text-3xl md:text-7xl font-extrabold mb-6 leading-tight">Our Brand & Story</h1>
            <p className="text-sm md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              We make land and property ownership simple, affordable, and real — for young Nigerians.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-24">
        <div className="max-w-5xl mx-auto space-y-20 md:space-y-32">
          
          {/* INTRO / SHORT VERSION */}
          <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-xl">
            <span className="text-forge-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">About The Forge</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-forge-navy mb-6">Who We Are</h2>
            <div className="border-l-4 border-forge-gold pl-6 md:pl-8 py-2">
              <p className="text-lg md:text-2xl text-slate-700 font-medium leading-relaxed italic">
                "We're The Forge Properties — a real estate company built by young Nigerians, for young Nigerians. Whether you're based in Lagos or living abroad, we make land and property ownership simple, affordable, and stress-free. No jargon. No gatekeeping. Just your name on your land."
              </p>
            </div>
          </div>

          {/* FULL STORY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-forge-gold text-xs uppercase tracking-[0.3em] font-bold block">From The Founders</span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-forge-navy leading-tight">The Brand Story</h2>
              
              <div className="space-y-6 text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                <p>
                  The Forge Properties was built by young Nigerians who got tired of watching land ownership feel like something only for the wealthy or the well-connected.
                </p>
                <p>
                  We started this because we believe the next generation deserves a seat at the table — or better yet, ground beneath their feet.
                </p>
                <p>
                  Whether you're grinding in Lagos, hustling in London, or saving up in Atlanta — we exist to make sure that owning land in Nigeria is something you can actually do, not just something you dream about.
                </p>
                <p>
                  No intimidation. No confusion. Just your land, your name, your future.
                </p>
                <p className="text-forge-navy font-bold text-xl border-t border-slate-100 pt-6">
                  Welcome to The Forge.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 md:w-24 md:h-24 border-t-4 border-l-4 border-forge-gold hidden sm:block rounded-tl-2xl"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 md:w-24 md:h-24 border-b-4 border-r-4 border-forge-gold hidden sm:block rounded-br-2xl"></div>
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600" alt="Office Collaboration" className="w-full h-auto shadow-2xl relative z-10 rounded-2xl md:rounded-3xl" loading="lazy" />
            </div>
          </div>

          {/* OUR VALUES */}
          <div className="bg-forge-navy text-white p-8 md:p-16 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-8 text-center">Our Core Standards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <CheckCircle2 className="text-forge-gold shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Plain Language First</h4>
                    <p className="text-slate-400 text-sm md:text-base">We throw out real estate jargon and keep things completely direct, transparent, and easy to understand.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-forge-gold shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Empowered Affordability</h4>
                    <p className="text-slate-400 text-sm md:text-base">We frame real estate so you can start with a low deposit of ₦200,000, making land ownership attainable.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-forge-gold shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Absolute Security</h4>
                    <p className="text-slate-400 text-sm md:text-base">Every plot is fully verified with clean Registered Survey and Deed of Assignment documents included.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-forge-gold shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Active Diaspora Protection</h4>
                    <p className="text-slate-400 text-sm md:text-base">We provide full virtual inspections, maps, coordinates, and secure payment setups for our diaspora community.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LEADERSHIP */}
          <div className="text-center">
            <span className="text-forge-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Our People</span>
            <h2 className="text-2xl md:text-5xl font-extrabold text-forge-navy mb-12 md:mb-20">The Leadership Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 max-w-6xl mx-auto">
              {teamMembers.map((member, i) => (
                <div key={i} className="group text-center">
                  <div className="relative w-full aspect-[4/5] mb-6 overflow-hidden bg-slate-100 flex items-center justify-center shadow-lg rounded-2xl md:rounded-3xl">
                     {member.image ? (
                       <img src={member.image} alt={member.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                     ) : (
                       <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                         <User size={64} strokeWidth={1} className="text-forge-gold/50 mb-4" />
                         <span className="text-[10px] uppercase tracking-[0.2em] font-bold">The Forge Leadership</span>
                       </div>
                     )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-forge-navy group-hover:text-forge-gold transition-colors">{member.name}</h3>
                  <p className="text-slate-400 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mt-2">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
