
import React from 'react';
import { User } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const About: React.FC = () => {
  const { settings } = useProperties();
  const teamMembers = settings.team_members || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative pt-32 md:pt-40 pb-16 md:pb-24 bg-forge-navy text-white overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-forge-gold opacity-5 skew-x-12 transform translate-x-20"></div>
         <div className="container mx-auto px-6 text-center relative z-10">
            <span className="text-forge-gold text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold mb-4 block">About Us</span>
            <h1 className="text-3xl md:text-7xl font-bold mb-6 leading-tight">Building Legacy</h1>
            <p className="text-sm md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              We don't just facilitate transactions; we forge lasting relationships built on trust, excellence, and results.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 mb-20 md:mb-32">
          <div className="lg:w-1/2 relative w-full">
             <div className="absolute -top-4 -left-4 w-12 h-12 md:w-24 md:h-24 border-t-4 border-l-4 border-forge-gold hidden sm:block"></div>
             <div className="absolute -bottom-4 -right-4 w-12 h-12 md:w-24 md:h-24 border-b-4 border-r-4 border-forge-gold hidden sm:block"></div>
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600" alt="Office" className="w-full h-auto shadow-2xl relative z-10 rounded-2xl md:rounded-3xl" loading="lazy" />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-2xl md:text-4xl font-bold text-forge-navy mb-6 md:mb-8 leading-tight">The Forge Standard</h2>
            <div className="space-y-4 md:space-y-6 text-slate-500 leading-relaxed text-sm md:text-lg font-medium">
              <p>Founded on the principles of integrity, discretion, and excellence, <strong className="text-forge-navy">The Forge Properties</strong> has redefined the luxury real estate experience.</p>
              <p>Our mission is simple: to provide an elevated level of service that matches the quality of the assets we represent.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10 mt-10 md:mt-16 border-t border-slate-100 pt-10">
               <div><span className="block text-2xl md:text-4xl font-bold text-forge-navy">15+</span><span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Years</span></div>
               <div><span className="block text-2xl md:text-4xl font-bold text-forge-navy">200+</span><span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Sales</span></div>
               <div className="col-span-2 sm:col-span-1"><span className="block text-2xl md:text-4xl font-bold text-forge-navy">₦50B+</span><span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Volume</span></div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className="text-forge-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">Our People</span>
          <h2 className="text-2xl md:text-5xl font-bold text-forge-navy mb-12 md:mb-20">The Leadership Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 max-w-6xl mx-auto">
            {teamMembers.map((member, i) => (
              <div key={i} className="group text-center">
                <div className="relative w-full aspect-[4/5] mb-6 overflow-hidden bg-slate-50 flex items-center justify-center shadow-xl shadow-slate-200/50 rounded-2xl md:rounded-3xl">
                   {member.image ? (
                     <img src={member.image} alt={member.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                   ) : (
                     <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                       <User size={64} strokeWidth={1} className="text-forge-gold/50 mb-4" />
                       <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Image Coming Soon</span>
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
  );
};
