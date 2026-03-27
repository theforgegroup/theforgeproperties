
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();
  const { settings, isLoading } = useProperties();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(false);
    }, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: 'Blog', path: '/blog' },
    { name: 'Agent Portal', path: isAuthenticated && userRole === 'Agent' ? '/agent/dashboard' : '/agent/portal' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav 
      className={`fixed w-full z-[100] transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-white/80 backdrop-blur-xl text-forge-navy shadow-sm py-4' 
          : 'bg-transparent text-white py-6'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-3 items-center lg:flex lg:justify-between">
          {/* Mobile Left Spacer */}
          <div className="lg:hidden w-10"></div>

          {/* Logo - Centered on mobile, left-aligned on desktop */}
          <div className="flex justify-center lg:justify-start">
            <Link to="/" className="flex flex-col group items-center lg:items-start">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt="The Forge Properties" 
                  className="h-20 md:h-28 w-auto object-contain" 
                  fetchpriority="high" 
                />
              ) : isLoading ? (
                <div className="h-20 w-32 animate-pulse bg-white/10 rounded" />
              ) : (
                <>
                  <span className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors ${scrolled || !isHome ? 'text-forge-navy' : 'text-white'}`}>
                    THE FORGE
                  </span>
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-forge-gold font-bold">Properties</span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-10 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs font-bold uppercase tracking-widest hover:text-forge-gold transition-all relative group ${
                  location.pathname === link.path 
                    ? 'text-forge-gold' 
                    : scrolled || !isHome ? 'text-forge-navy' : 'text-slate-200'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-forge-gold transition-all group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`} />
              </Link>
            ))}
            <Link 
              to="/contact"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs uppercase font-bold tracking-widest transition-all duration-300 ${
                scrolled || !isHome
                  ? 'bg-forge-navy text-white hover:bg-forge-gold'
                  : 'bg-white text-forge-navy hover:bg-forge-gold hover:text-white'
              }`}
            >
              <MessageSquare size={16} />
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex justify-end lg:hidden">
            <button 
              className={`transition-colors focus:outline-none ${scrolled || !isHome ? 'text-forge-navy' : 'text-white'}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden fixed inset-0 top-[72px] w-full bg-white/95 backdrop-blur-2xl z-[90] transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="flex flex-col h-full py-12 px-8 space-y-8 overflow-y-auto">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-forge-navy hover:text-forge-gold text-2xl font-bold uppercase tracking-[0.2em] transition-all duration-300 transform ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className={`pt-8 border-t border-slate-100 space-y-4 transform transition-all duration-500 delay-500 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Link 
              to="/listings"
              className="block w-full text-center bg-forge-navy text-white py-5 rounded-2xl text-sm uppercase tracking-widest font-bold hover:bg-forge-gold transition-all shadow-xl shadow-forge-navy/10"
              onClick={() => setIsOpen(false)}
            >
              Find a Home
            </Link>
            <div className="flex justify-center gap-6 pt-8">
              {/* Social placeholders or contact info */}
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">The Forge Properties</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

