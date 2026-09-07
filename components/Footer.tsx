import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A2847] text-white pt-16 pb-10 border-t-2 border-[#C9962A]/50 relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Col 1: About The Forge (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group" id="footer-logo">
              <div className="w-9 h-9 rounded-[8px] bg-[#111B31] border border-[#C9962A]/40 flex items-center justify-center text-[#C9962A]">
                <ShieldCheck className="w-5 h-5 text-[#C9962A]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white font-display">
                  THE FORGE
                </span>
                <span className="text-[10px] uppercase tracking-[2px] text-[#C9962A] font-bold -mt-1">
                  PROPERTIES
                </span>
              </div>
            </Link>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Making verified, titled land ownership accessible to young Nigerians and diaspora buyers — affordably, transparently, and on their own terms.
            </p>

            <div className="pt-2">
              <span className="text-xs uppercase tracking-[2px] text-[#C9962A] font-bold block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center space-x-2.5">
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-[8px] bg-[#111B31] border border-white/10 hover:border-[#C9962A] text-slate-300 hover:text-[#C9962A] transition-all flex items-center justify-center text-xs font-bold"
                >
                  IG
                </a>
                {/* TikTok */}
                <a 
                  href="https://www.tiktok.com/@theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-[8px] bg-[#111B31] border border-white/10 hover:border-[#C9962A] text-slate-300 hover:text-[#C9962A] transition-all flex items-center justify-center text-xs font-bold"
                >
                  TK
                </a>
                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-[8px] bg-[#111B31] border border-white/10 hover:border-[#C9962A] text-slate-300 hover:text-[#C9962A] transition-all flex items-center justify-center text-xs font-bold"
                >
                  FB
                </a>
                {/* X */}
                <a 
                  href="https://x.com/theforgeproperties_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="X"
                  className="w-9 h-9 rounded-[8px] bg-[#111B31] border border-white/10 hover:border-[#C9962A] text-slate-300 hover:text-[#C9962A] transition-all flex items-center justify-center text-xs font-bold"
                >
                  X
                </a>
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/2348106133572" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-[8px] bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center text-xs font-bold"
                >
                  WA
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/" className="hover:text-[#C9962A] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#C9962A]" /> Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-[#C9962A] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#C9962A]" /> Verified Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C9962A] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#C9962A]" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/forge-nation" className="hover:text-[#C9962A] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#C9962A]" /> The Forge Nation
                </Link>
              </li>
              <li>
                <Link to="/join-realtors" className="hover:text-[#C9962A] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#C9962A]" /> Join Realtors (15% Commission)
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#C9962A] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#C9962A]" /> Property Blog & Guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C9962A] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-[#C9962A]" /> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Properties (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] mb-4">
              Properties
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/properties" className="hover:text-[#C9962A] transition-colors">
                  Prasino Lush Phase 2
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs block">Kobape, Abeokuta</span>
              </li>
              <li className="pt-2">
                <span className="text-[#C9962A] font-semibold text-xs uppercase tracking-wider block">
                  Plot Sizes
                </span>
                <span className="text-slate-300 text-xs">150 SQM • 300 SQM • 500 SQM</span>
              </li>
              <li className="pt-2">
                <span className="text-xs text-slate-400">Partner: Geofort Africa</span>
              </li>
              <li>
                <span className="inline-block bg-[#111B31] text-[#C9962A] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-[#C9962A]/30">
                  Titled Land Only
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Details (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] mb-4">
              Contact Details
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin size={17} className="text-[#C9962A] shrink-0 mt-0.5" />
              <span>Sangotedo, Lagos State, Nigeria</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Phone size={17} className="text-[#C9962A] shrink-0" />
              <a href="tel:+2348106133572" className="hover:text-[#C9962A] transition-colors">
                +234 810 613 3572
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Mail size={17} className="text-[#C9962A] shrink-0" />
              <a href="mailto:theforgeproperties@gmail.com" className="hover:text-[#C9962A] transition-colors break-all">
                theforgeproperties@gmail.com
              </a>
            </div>
            <div className="pt-2">
              <a 
                href="https://wa.me/2348106133572"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-4 py-2.5 rounded-[8px] transition-colors min-h-[44px]"
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
          <div className="text-[#C9962A] font-bold text-sm font-display tracking-wide">
            Land. Legacy. Growth.
          </div>
        </div>
      </div>
    </footer>
  );
};
