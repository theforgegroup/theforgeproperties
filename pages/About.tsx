import React from 'react';
import { User } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const About: React.FC = () => {
  const { settings } = useProperties();

  // Fallback if settings haven't loaded yet or are empty, though context ensures default
  const teamMembers = settings.teamMembers || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 bg-forge-navy text-white overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-forge-gold opacity-5 skew-x-12 transform translate-x-20"></div>
         <div className="container mx-auto px-6 text-center relative z-10">
            <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">About Us</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Building Legacy</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We don't just facilitate transactions; we forge lasting relationships built on trust, excellence, and results.
            </p>
         </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-24">
          <div className="lg:w-1/2 relative">
             <div className="absolute -top-4 -left-4 w-16 h-16 md:w-24 md:h-24 border-t-4 border-l-4 border-forge-gold"></div>
             <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-24 md:h-24 border-b-4 border-r-4 border-forge-gold"></div>
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop" 
              alt="Corporate Office" 
              className="w-full h-auto shadow-2xl relative z-10" 
            />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-serif text-forge-navy mb-8 text-center lg:text-left">The Forge Standard</h2>
            <div className="space-y-6 text-slate-600 leading-loose text-lg">
              <p>
                Founded on the principles of integrity, discretion, and excellence, <strong className="text-forge-navy">The Forge Properties</strong> has redefined the luxury real estate experience. As a subsidiary of The Forge Group of Companies, we leverage a vast global network to connect distinguished buyers with exceptional properties.
              </p>
              <p>
                Our mission is simple: to provide an elevated level of service that matches the quality of the assets we represent. We believe that a home is not just a structure, but the foundation of a lifestyle.
              </p>
            </div>
            
            {/* Stats - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 border-t border-slate-200 pt-8 text-center sm:text-left">
               <div>
                 <span className="block text-3xl font-bold text-forge-navy">15+</span>
                 <span className="text-xs uppercase tracking-widest text-slate-500">Years Experience</span>
               </div>
               <div>
                 <span className="block text-3xl font-bold text-forge-navy">200+</span>
                 <span className="text-xs uppercase tracking-widest text-slate-500">Properties Sold</span>
               </div>
               <div>
                 <span className="block text-3xl font-bold text-forge-navy">₦50B+</span>
                 <span className="text-xs uppercase tracking-widest text-slate-500">Sales Volume</span>
               </div>
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div className="text-center">
          <span className="text-forge-gold text-xs uppercase tracking-[0.3em] font-bold mb-3 block">Our People</span>
          <h2 className="text-3xl md:text-4xl font-serif text-forge-navy mb-16">The Leadership Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {teamMembers.map((member, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative w-full aspect-[3/4] mb-6 overflow-hidden bg-slate-100 flex items-center justify-center shadow-md border border-slate-100">
                   {member.image ? (
                     <>
                       <div className="absolute inset-0 bg-forge-navy/0 group-hover:bg-forge-navy/20 transition-all duration-500 z-10"></div>
                       <img 
                         src={member.image} 
                         alt={member.name} 
                         className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                       />
                     </>
                   ) : (
                     <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                       <User size={64} strokeWidth={1} className="text-forge-gold mb-2" />
                       <span className="text-[10px] uppercase tracking-widest">Image Coming Soon</span>
                     </div>
                   )}
                </div>
                <h3 className="text-2xl font-serif text-forge-navy group-hover:text-forge-gold transition-colors">{member.name}</h3>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};