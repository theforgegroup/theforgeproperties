import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const Footer: React.FC = () => {
  const { settings } = useProperties();

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
              <a href="#" className="text-slate-400 hover:text-forge-gold transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-forge-gold transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-forge-gold transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-forge-gold text-sm uppercase tracking-widest font-bold mb-6">Explore</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/listings" className="hover:text-white transition-colors">Exclusive Listings</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">The Team</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Agent Portal</Link></li>
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
                {/* Added break-all to ensure long emails wrap correctly */}
                <span className="break-all">{settings.contactEmail}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-forge-gold text-sm uppercase tracking-widest font-bold mb-6">Newsletter</h3>
            <p className="text-slate-400 text-sm mb-4">Subscribe for exclusive market insights and off-market opportunities.</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-forge-gold transition-colors"
              />
              <button className="bg-forge-gold text-forge-navy font-bold uppercase text-xs tracking-widest py-3 hover:bg-white transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} The Forge Group of Companies. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};