import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-10 border-t border-[#774DFF]/30 relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-[#774DFF]/20">
          
          {/* Col 1: About The Forge (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
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
              <span className="text-xs uppercase tracking-[2px] text-[#774DFF] font-bold block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center space-x-2.5">
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] transition-all flex items-center justify-center text-xs font-bold"
                >
                  IG
                </a>
                {/* TikTok */}
                <a 
                  href="https://www.tiktok.com/@theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] transition-all flex items-center justify-center text-xs font-bold"
                >
                  TK
                </a>
                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] transition-all flex items-center justify-center text-xs font-bold"
                >
                  FB
                </a>
                {/* X */}
                <a 
                  href="https://x.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="X"
                  className="w-9 h-9 rounded-[8px] bg-white/10 border border-white/20 hover:border-[#774DFF] text-white hover:text-[#774DFF] transition-all flex items-center justify-center text-xs font-bold"
                >
                  X
                </a>
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/2348106133572" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-[8px] bg-[#774DFF]/20 border border-[#774DFF]/40 text-[#774DFF] hover:bg-[#774DFF] hover:text-white transition-all flex items-center justify-center text-xs font-bold"
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
                <Link to="/properties" className="hover:text-[#774DFF] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#774DFF]" /> Verified Properties
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

          {/* Col 3: Properties (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#774DFF] mb-4">
              Properties
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/properties" className="hover:text-[#774DFF] transition-colors">
                  Prasino Lush Phase 2
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs block">Kobape, Abeokuta</span>
              </li>
              <li className="pt-2">
                <span className="text-[#774DFF] font-semibold text-xs uppercase tracking-wider block">
                  Plot Sizes
                </span>
                <span className="text-slate-300 text-xs">150 SQM • 300 SQM • 500 SQM</span>
              </li>
              <li className="pt-2">
                <span className="text-xs text-slate-400">Partner: Geofort Africa</span>
              </li>
              <li>
                <span className="inline-block bg-white/10 text-[#774DFF] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-[#774DFF]/30">
                  Titled Land Only
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Details (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
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
