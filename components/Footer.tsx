import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-10 border-t border-[#774DFF]/30 relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-[#774DFF]/20">
          
          {/* Col 1: About The Forge & Official Social Links (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group" id="footer-logo">
              <div className="w-9 h-9 rounded-[8px] bg-white/10 border border-[#774DFF]/40 flex items-center justify-center text-[#774DFF]">
                <ShieldCheck className="w-5 h-5 text-[#774DFF]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white font-display">
                  THE FORGE
                </span>
                <span className="text-[10px] uppercase tracking-[2px] text-[#774DFF] font-bold -mt-1">
                  PROPERTIES
                </span>
              </div>
            </Link>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Making verified, titled land ownership accessible to young Nigerians and diaspora buyers — affordably, transparently, and on their own terms.
            </p>

            <div className="pt-2">
              <span className="text-xs uppercase tracking-[2px] text-[#774DFF] font-bold block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center space-x-3">
                {/* Official Instagram 2024/2025 Icon */}
                <a 
                  href="https://www.instagram.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram @theforgeproperties_"
                  className="w-10 h-10 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] hover:bg-[#774DFF]/10 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Official TikTok Icon */}
                <a 
                  href="https://www.tiktok.com/@theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="TikTok @theforgeproperties_"
                  className="w-10 h-10 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] hover:bg-[#774DFF]/10 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.95-4.46V8.78a8.16 8.16 0 0 0 4.82 1.58V6.89a4.85 4.85 0 0 1-1-.2z"/>
                  </svg>
                </a>

                {/* Official Facebook Icon */}
                <a 
                  href="https://www.facebook.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook @theforgeproperties_"
                  className="w-10 h-10 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] hover:bg-[#774DFF]/10 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Official X Logo (formerly Twitter) */}
                <a 
                  href="https://x.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="X @theforgeproperties_"
                  className="w-10 h-10 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] hover:bg-[#774DFF]/10 transition-all flex items-center justify-center"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* WhatsApp Direct */}
                <a 
                  href="https://wa.me/2348106133572" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-[8px] bg-[#774DFF]/20 border border-[#774DFF]/40 text-[#774DFF] hover:bg-[#774DFF] hover:text-white transition-all flex items-center justify-center text-xs font-bold"
                >
                  WA
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/" className="hover:text-[#774DFF] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#774DFF]" /> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#774DFF] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#774DFF]" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/forge-nation" className="hover:text-[#774DFF] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#774DFF]" /> The Forge Nation
                </Link>
              </li>
              <li>
                <Link to="/join-realtors" className="hover:text-[#774DFF] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#774DFF]" /> Join Realtors (15% Commission)
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#774DFF] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#774DFF]" /> Property Blog & Guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#774DFF] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#774DFF]" /> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] mb-4">
              Contact Details
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin size={17} className="text-[#774DFF] shrink-0 mt-0.5" />
              <span>Sangotedo, Lagos State, Nigeria</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Phone size={17} className="text-[#774DFF] shrink-0" />
              <a href="tel:+2348106133572" className="hover:text-[#774DFF] transition-colors">
                +234 810 613 3572
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Mail size={17} className="text-[#774DFF] shrink-0" />
              <a href="mailto:theforgeproperties@gmail.com" className="hover:text-[#774DFF] transition-colors break-all">
                theforgeproperties@gmail.com
              </a>
            </div>
            <div className="pt-2">
              <a 
                href="https://wa.me/2348106133572" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-xs px-4 py-2.5 rounded-[8px] transition-all min-h-[44px]"
              >
                <span>Chat With Us on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} The Forge Properties. All rights reserved.
          </div>
          <div className="text-[#774DFF] font-bold text-sm font-display tracking-wide">
            Land. Legacy. Growth.
          </div>
        </div>
      </div>
    </footer>
  );
};
