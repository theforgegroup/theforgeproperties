
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
  const { settings } = useProperties();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [location, isOpen]);

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
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex flex-col group items-center">
          {settings.logo ? (
            <img src={settings.logo} alt="The Forge Properties" className="h-10 w-auto object-contain" />
          ) : (
            <>
              <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled || !isHome ? 'text-forge-navy' : 'text-white'}`}>
                THE FORGE
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-forge-gold font-bold">Properties</span>
            </>
          )}
        </Link>

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
        <button 
          className={`lg:hidden transition-colors focus:outline-none ${scrolled || !isHome ? 'text-forge-navy' : 'text-white'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col py-10 px-8 space-y-8 bg-white">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-forge-navy hover:text-forge-gold text-lg font-bold uppercase tracking-widest transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/listings"
            className="block text-center bg-forge-navy text-white py-5 rounded-2xl text-sm uppercase tracking-widest font-bold hover:bg-forge-gold transition-colors"
          >
            Find a Home
          </Link>
        </div>
      </div>
    </nav>
  );
};

