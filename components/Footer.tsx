
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail, Check } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

// Custom TikTok Icon
const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="none"
    className={className}
  >
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

  return (
    <footer className="bg-forge-dark text-white pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-6">
        {/* Updated Grid: Switched to sm:grid-cols-2 lg:grid-cols-4 to give more space on tablets/small laptops */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex flex-col mb-6">
              <span className="text-2xl font-serif font-bold tracking-widest text-white">
                THE FORGE
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-forge-gold">Properties</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A division of The Forge Group of Companies. We provide unparalleled real estate services for the world's most discerning clients.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.tiktok.com/@theforgegroup?_r=1&_t=ZM-91yrTHnVnps" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-forge-gold transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
              <a 
                href="https://www.instagram.com/theforgeproperties_?igsh=eDN4Mnl6OWlmNzNo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-forge-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-forge-gold text-sm uppercase tracking-widest font-bold mb-6">Explore</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/listings" className="hover:text-white transition-colors">Exclusive Listings</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Journal & Insights</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">The Team</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-forge-gold text-sm uppercase tracking-widest font-bold mb-6">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-forge-gold mt-1 shrink-0" />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-forge-gold shrink-0" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-forge-gold shrink-0 mt-1" />
                <span className="break-all">{settings.contactEmail}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-forge-gold text-sm uppercase tracking-widest font-bold mb-6">Newsletter</h3>
            <p className="text-slate-400 text-sm mb-4">Subscribe for exclusive market insights and off-market opportunities.</p>
            {subscribed ? (
              <div className="bg-green-900/30 border border-green-800 p-4 rounded text-green-400 text-sm flex items-center gap-2">
                <Check size={16} /> Subscribed Successfully
              </div>
            ) : (
              <form className="flex flex-col gap-2" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  required
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-forge-gold transition-colors"
                />
                <button className="bg-forge-gold text-forge-navy font-bold uppercase text-xs tracking-widest py-3 hover:bg-white transition-colors">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} The Forge Group of Companies. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="/sitemap.xml" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};