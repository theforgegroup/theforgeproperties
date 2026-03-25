
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
  const { settings, addSubscriber } = useProperties();
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
    <footer className="bg-forge-navy text-white pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-forge-gold to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex flex-col mb-8 group">
              {settings.logo ? (
                <img src={settings.logo} alt="The Forge Properties" className="h-12 w-auto object-contain mb-2" />
              ) : (
                <>
                  <span className="text-3xl font-bold tracking-tight text-white group-hover:text-forge-gold transition-colors">THE FORGE</span>
                  <span className="text-xs uppercase tracking-[0.4em] text-forge-gold font-bold">Properties</span>
                </>
              )}
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
              Defining excellence in Nigerian luxury real estate. We provide unparalleled services for the world's most discerning clients and investors.
            </p>
            <div className="flex space-x-6">
              <a href="https://www.tiktok.com/@theforgegroup" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-forge-gold hover:text-forge-navy transition-all"><TikTokIcon size={20} /></a>
              <a href="https://www.instagram.com/theforgeproperties_" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-forge-gold hover:text-forge-navy transition-all"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-white text-sm uppercase tracking-[0.2em] font-bold mb-8">Explore</h3>
              <ul className="space-y-4 text-slate-400">
                <li><Link to="/listings" className="hover:text-forge-gold transition-colors">Exclusive Listings</Link></li>
                <li><Link to="/blog" className="hover:text-forge-gold transition-colors">Journal & Insights</Link></li>
                <li><Link to="/about" className="hover:text-forge-gold transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-forge-gold transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-sm uppercase tracking-[0.2em] font-bold mb-8">Services</h3>
              <ul className="space-y-4 text-slate-400">
                <li><Link to="/listings?type=land" className="hover:text-forge-gold transition-colors">Land Acquisition</Link></li>
                <li><Link to="/listings?type=house" className="hover:text-forge-gold transition-colors">Luxury Homes</Link></li>
                <li><Link to="/agent/portal" className="hover:text-forge-gold transition-colors">Agent Partnership</Link></li>
                <li><Link to="/contact" className="hover:text-forge-gold transition-colors">Property Valuation</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-sm uppercase tracking-[0.2em] font-bold mb-8">Newsletter</h3>
            <p className="text-slate-400 text-sm mb-6">Subscribe to receive exclusive property alerts and market insights.</p>
            {subscribed ? (
              <div className="bg-forge-gold/10 border border-forge-gold/20 p-4 rounded-xl text-forge-gold text-sm flex items-center gap-2">
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
                  className="bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl text-sm focus:outline-none focus:border-forge-gold transition-colors" 
                />
                <button className="bg-forge-gold text-forge-navy font-bold uppercase text-xs tracking-widest py-4 rounded-xl hover:bg-white transition-all">Subscribe</button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-white/5 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forge-gold/10 flex items-center justify-center text-forge-gold">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Office</p>
              <p className="text-sm text-slate-300">{settings.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forge-gold/10 flex items-center justify-center text-forge-gold">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Call Us</p>
              <p className="text-sm text-slate-300">{settings.contact_phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forge-gold/10 flex items-center justify-center text-forge-gold">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Email</p>
              <p className="text-sm text-slate-300">{settings.contact_email}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} The Forge Group. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <button 
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-forge-navy transition-all"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

