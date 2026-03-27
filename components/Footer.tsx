
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail, Check, ArrowUp } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { settings, addSubscriber, isLoading } = useProperties();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      addSubscriber(email);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-forge-navy text-white pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-forge-gold to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 mb-16 md:mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <Link to="/" className="flex flex-col mb-6 md:mb-8 group items-center lg:items-start">
              {settings.logo ? (
                <img src={settings.logo} alt="The Forge Properties" className="h-14 md:h-20 w-auto object-contain mb-2" />
              ) : isLoading ? (
                <div className="h-14 w-32 animate-pulse bg-white/5 rounded" />
              ) : (
                <>
                  <span className="text-2xl md:text-3xl font-bold tracking-tight text-white group-hover:text-forge-gold transition-colors">THE FORGE</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-forge-gold font-bold">Properties</span>
                </>
              )}
            </Link>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-md mx-auto lg:mx-0">
              Defining excellence in Nigerian luxury real estate. We provide unparalleled services for the world's most discerning clients and investors.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4 md:space-x-6">
              <a href="https://www.tiktok.com/@theforgegroup" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-forge-gold hover:text-forge-navy transition-all"><TikTokIcon size={18} /></a>
              <a href="https://www.instagram.com/theforgeproperties_" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-forge-gold hover:text-forge-navy transition-all"><Instagram size={18} /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8 text-center lg:text-left">
            <div>
              <h3 className="text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold mb-6 md:mb-8">Explore</h3>
              <ul className="space-y-3 md:space-y-4 text-slate-400 text-sm md:text-base font-medium">
                <li><Link to="/listings" className="hover:text-forge-gold transition-colors">Exclusive Listings</Link></li>
                <li><Link to="/blog" className="hover:text-forge-gold transition-colors">Journal & Insights</Link></li>
                <li><Link to="/about" className="hover:text-forge-gold transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-forge-gold transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold mb-6 md:mb-8">Services</h3>
              <ul className="space-y-3 md:space-y-4 text-slate-400 text-sm md:text-base font-medium">
                <li><Link to="/listings?type=land" className="hover:text-forge-gold transition-colors">Land Acquisition</Link></li>
                <li><Link to="/listings?type=house" className="hover:text-forge-gold transition-colors">Luxury Homes</Link></li>
                <li><Link to="/agent/portal" className="hover:text-forge-gold transition-colors">Agent Partnership</Link></li>
                <li><Link to="/contact" className="hover:text-forge-gold transition-colors">Property Valuation</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 text-center lg:text-left">
            <h3 className="text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold mb-6 md:mb-8">Newsletter</h3>
            <p className="text-slate-400 text-sm mb-6">Subscribe to receive exclusive property alerts and market insights.</p>
            {subscribed ? (
              <div className="bg-forge-gold/10 border border-forge-gold/20 p-4 rounded-xl text-forge-gold text-sm flex items-center gap-2 justify-center lg:justify-start">
                <Check size={16} /> Subscribed Successfully
              </div>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  required 
                  placeholder="Email address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl text-sm focus:outline-none focus:border-forge-gold transition-colors text-center lg:text-left" 
                />
                <button className="bg-forge-gold text-forge-navy font-bold uppercase text-[10px] md:text-xs tracking-widest py-4 rounded-xl hover:bg-white transition-all">Subscribe</button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 md:py-12 border-y border-white/5 mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-forge-gold/10 flex items-center justify-center text-forge-gold shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Office</p>
              <p className="text-sm text-slate-300 font-medium">{settings.address}</p>
            </div>
          </div>
          <a href={`tel:${settings.contact_phone}`} className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left group">
            <div className="w-12 h-12 rounded-2xl bg-forge-gold/10 flex items-center justify-center text-forge-gold shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-all">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Call Us</p>
              <p className="text-sm text-slate-300 font-medium group-hover:text-forge-gold transition-colors">{settings.contact_phone}</p>
            </div>
          </a>
          <a href={`mailto:${settings.contact_email}`} className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left group">
            <div className="w-12 h-12 rounded-2xl bg-forge-gold/10 flex items-center justify-center text-forge-gold shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-all">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Email</p>
              <p className="text-sm text-slate-300 font-medium group-hover:text-forge-gold transition-colors">{settings.contact_email}</p>
            </div>
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <p className="text-xs md:text-sm text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} The Forge Group. All rights reserved.
          </p>
          <div className="flex items-center gap-6 md:gap-8 text-xs md:text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <button 
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-forge-navy transition-all shrink-0"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

