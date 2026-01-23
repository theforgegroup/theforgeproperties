import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, BookOpen, Phone, User, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Portfolio', path: '/listings', icon: <Search size={20} /> },
    { name: 'Journal', path: '/blog', icon: <BookOpen size={20} /> },
    { name: 'Our Team', path: '/about', icon: <User size={20} /> },
    { name: 'Contact', path: '/contact', icon: <Phone size={20} /> },
  ];

  return (
    <nav 
      className={`fixed w-full z-[100] transition-all duration-500 ${
        scrolled || !isHome || isOpen
          ? 'bg-forge-navy/95 backdrop-blur-xl text-white shadow-2xl py-3' 
          : 'bg-transparent text-white py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex flex-col group items-start">
          <span className="text-xl md:text-2xl font-serif font-bold tracking-[0.2em] text-white group-hover:text-forge-gold transition-colors duration-300">
            THE FORGE
          </span>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-forge-gold font-bold">Properties</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                location.pathname === link.path ? 'text-forge-gold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-full h-px bg-forge-gold transition-transform duration-300 origin-left ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
            </Link>
          ))}
          <Link 
            to="/listings"
            className="bg-forge-gold text-forge-navy px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 shadow-lg shadow-forge-gold/10"
          >
            Find a Home
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 top-[60px] bg-forge-dark z-[-1] transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="h-full flex flex-col justify-center items-center p-8 space-y-8">
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-4 text-2xl font-serif transition-all duration-500 delay-[${idx * 50}ms] ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              } ${location.pathname === link.path ? 'text-forge-gold italic' : 'text-white'}`}
            >
              <span className="text-forge-gold/30 font-sans text-sm font-bold tracking-widest">0{idx + 1}</span>
              {link.name}
            </Link>
          ))}
          <Link 
            to="/listings"
            className={`flex items-center gap-2 bg-forge-gold text-forge-navy px-10 py-5 font-bold uppercase tracking-widest text-xs transition-all duration-700 delay-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            View Portfolio <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </nav>
  );
};