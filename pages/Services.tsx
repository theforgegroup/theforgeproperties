import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Services: React.FC = () => {
  const services = [
    {
      title: "Luxury Property Sales",
      desc: "We specialize in the marketing and sale of high-end residential properties. Our tailored approach ensures your property reaches a global audience of qualified buyers. From professional staging to cinematic video tours, we present your asset in its finest light.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Exclusive Leasing",
      desc: "For those seeking flexibility without compromising on luxury, our leasing division curates a portfolio of the finest rental properties. We handle everything from tenant vetting to lease negotiation, ensuring a seamless experience for both landlords and tenants.",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Investment Advisory",
      desc: "Real estate remains one of the safest vehicles for wealth preservation. Our data-driven insights help investors identify high-yield opportunities in emerging markets. We provide comprehensive ROI analysis and market forecasting.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1600&auto=format&fit=crop"
    },
    {
      title: "Property Management",
      desc: "Enjoy the benefits of ownership without the hassle. Our white-glove management service covers maintenance, security, and tenant relations. We treat your property with the same care and attention to detail as if it were our own.",
      image: "https://images.unsplash.com/photo-1556912172-45b7abe8d7e1?q=80&w=1600&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative pt-40 pb-32 bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Architecture"
        />
        <div className="relative z-10 container mx-auto px-6 text-center">
           <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block animate-fade-in-up">What We Do</span>
           <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">The Art of Service</h1>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg">Comprehensive real estate solutions tailored to your unique needs.</p>
        </div>
      </div>

      <div className="bg-white">
        {services.map((service, index) => (
          <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            {/* Image Side */}
            <div className="md:w-1/2 h-80 md:h-auto overflow-hidden group">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            
            {/* Content Side */}
            <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center bg-white">
              <span className="text-forge-gold text-6xl font-serif opacity-20 mb-4 -ml-4">0{index + 1}</span>
              <h3 className="text-3xl font-serif text-forge-navy mb-6">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed text-lg mb-8">{service.desc}</p>
              <button className="flex items-center gap-2 text-forge-navy font-bold uppercase tracking-widest text-xs hover:text-forge-gold transition-colors self-start group">
                Learn More <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};