
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, BookOpen, Phone, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Listings', path: '/listings', icon: <Search size={18} /> },
    { name: 'Blog', path: '/blog', icon: <BookOpen size={18} /> },
    { name: 'About', path: '/about', icon: <User size={18} /> },
    { name: 'Contact', path: '/contact', icon: <Phone size={18} /> },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-forge-navy/95 backdrop-blur-md text-white shadow-lg py-3' 
          : 'bg-transparent text-white py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex flex-col group items-center">
          <span className="text-2xl font-serif font-bold tracking-widest text-white group-hover:text-forge-gold transition-colors">
            THE FORGE
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-forge-gold">Properties</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium uppercase tracking-wider hover:text-forge-gold transition-colors flex items-center gap-2 ${
                location.pathname === link.path ? 'text-forge-gold' : 'text-slate-200'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/listings"
            className="border border-forge-gold text-forge-gold px-5 py-2 text-sm uppercase tracking-widest hover:bg-forge-gold hover:text-forge-navy transition-all duration-300"
          >
            Find a Home
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white hover:text-forge-gold transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-forge-navy border-t border-slate-800 shadow-xl">
          <div className="flex flex-col py-4 px-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center gap-3 text-slate-300 hover:text-forge-gold py-2 text-lg"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
