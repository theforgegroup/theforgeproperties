import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useProperties();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'The Forge Nation', path: '/forge-nation' },
    { name: 'Join Realtors', path: '/join-realtors' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ease-in-out ${
        scrolled
          ? 'bg-[#0F172A] backdrop-blur-[12px] shadow-lg border-b border-[#774DFF]/25 py-3' 
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          
          {/* Logo Left - Wordmark in White & Purple */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group" id="nav-brand-logo">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt="The Forge Properties" 
                  className="h-10 w-auto object-contain" 
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[8px] bg-[#774DFF] flex items-center justify-center text-white shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-extrabold tracking-tight text-white font-display">
                      THE FORGE
                    </span>
                    <span className="text-[10px] uppercase tracking-[2px] text-[#774DFF] font-bold -mt-1">
                      PROPERTIES
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Menu Links Center / Right (Desktop) */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center space-x-6 xl:space-x-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || 
                (link.path === '/properties' && location.pathname === '/listings');

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[13.5px] font-semibold transition-colors duration-200 ${
                    isActive 
                      ? 'text-[#774DFF] font-bold border-b-2 border-[#774DFF] pb-0.5' 
                      : 'text-white/90 hover:text-[#774DFF]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button Right (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link 
              id="desktop-explore-cta"
              to="/properties"
              className="bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-sm px-5 py-2.5 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <span>Explore Properties</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link 
              to="/properties"
              className="sm:hidden bg-[#774DFF] text-white font-bold text-xs px-3 py-2 rounded-[8px] min-h-[40px] flex items-center"
            >
              Explore
            </Link>
            <button 
              id="mobile-menu-toggle"
              className="text-white p-2 focus:outline-none rounded-[8px] hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={26} className="text-[#774DFF]" /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-[65px] left-0 w-full h-[calc(100vh-65px)] bg-[#0F172A] text-white z-[110] flex flex-col justify-between p-6 sm:p-8 overflow-y-auto animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex flex-col space-y-4 my-auto pt-4" onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || 
                (link.path === '/properties' && location.pathname === '/listings');

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg sm:text-xl font-bold transition-all py-2 border-b border-[#774DFF]/25 flex items-center justify-between ${
                    isActive 
                      ? 'text-[#774DFF] pl-2 border-l-4 border-l-[#774DFF]' 
                      : 'text-white hover:text-[#774DFF]'
                  }`}
                >
                  <span>{link.name}</span>
                  <ArrowRight size={16} className={isActive ? 'text-[#774DFF]' : 'opacity-40'} />
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-[#774DFF]/30 space-y-3" onClick={(e) => e.stopPropagation()}>
            <Link 
              to="/properties"
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#774DFF] hover:bg-[#683de6] text-white font-bold text-base py-3.5 inline-flex items-center justify-center gap-2 rounded-[8px] shadow-lg min-h-[44px]"
            >
              <span>Explore Properties</span>
              <ArrowRight size={18} />
            </Link>
            <p className="text-center text-xs text-white/70">
              Verified, Titled Land Made Available for You
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
