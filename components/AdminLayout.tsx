import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Menu, X, BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin', label: 'Portfolio', icon: LayoutDashboard },
    { path: '/admin/crm', label: 'CRM Leads', icon: Users },
    { path: '/admin/blog', label: 'Journal', icon: BookOpen },
    { path: '/admin/analytics', label: 'Performance', icon: BarChart3 },
    { path: '/admin/settings', label: 'Configuration', icon: Settings },
  ];

  // Simple Breadcrumb logic
  const pathParts = location.pathname.split('/').filter(p => p !== '');
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-forge-navy text-white p-5 flex justify-between items-center sticky top-0 z-[110] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-forge-gold p-1.5 rounded-sm">
            <LayoutDashboard size={18} className="text-forge-navy" />
          </div>
          <span className="font-bold tracking-[0.2em] text-sm uppercase">THE FORGE ADMIN</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-forge-dark/80 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 left-0 z-[105] w-80 bg-forge-navy text-white flex-shrink-0 
        transform transition-transform duration-500 ease-[cubic-bezier(0.22, 1, 0.36, 1)] lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          {/* Logo Area */}
          <div className="hidden lg:flex items-center gap-4 mb-16">
             <div className="bg-forge-gold p-2 rounded-sm shadow-lg shadow-forge-gold/20">
              <LayoutDashboard size={28} className="text-forge-navy" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-[0.2em] text-lg uppercase">ADMIN PORTAL</span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-forge-gold font-bold">The Forge Properties</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-4 flex-grow">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                               (item.path === '/admin' && location.pathname === '/admin') ||
                               (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              const isExactRoot = item.path === '/admin' && (location.pathname === '/admin' || location.pathname.startsWith('/admin/properties'));
              const isOther = item.path !== '/admin' && location.pathname.startsWith(item.path);

              const activeClass = (isExactRoot || isOther) 
                ? 'bg-white/5 text-forge-gold border-r-4 border-forge-gold translate-x-1 shadow-inner' 
                : 'text-slate-400 hover:text-white hover:bg-white/5';
              
              return (
                <div 
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`group rounded-sm p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 ${activeClass}`}
                >
                  <item.icon size={20} className={`${(isExactRoot || isOther) ? 'text-forge-gold' : 'text-slate-500 group-hover:text-white'}`} />
                  <span className="font-bold text-xs uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              );
            })}
          </nav>
          
          {/* Profile / Logout Section */}
          <div className="border-t border-slate-800 pt-8 mt-auto">
             <div className="flex items-center gap-4 mb-8 p-2">
                <div className="w-10 h-10 rounded-full bg-forge-gold/10 border border-forge-gold/30 flex items-center justify-center text-forge-gold font-bold italic">A</div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest">Administrator</span>
                  <span className="text-[10px] text-slate-500">Active Session</span>
                </div>
             </div>
             <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors text-[10px] uppercase tracking-[0.3em] font-bold w-full p-2"
            >
              <LogOut size={16} /> Logout System
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col w-full overflow-x-hidden">
        {/* Breadcrumb Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 hidden lg:block sticky top-0 z-[90]">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
             <span className="cursor-pointer hover:text-forge-navy transition-colors" onClick={() => navigate('/admin')}>System</span>
             {pathParts.map((part, i) => (
               <React.Fragment key={part}>
                 <ChevronRight size={12} className="text-slate-200" />
                 <span className={i === pathParts.length - 1 ? 'text-forge-navy' : 'cursor-pointer hover:text-forge-navy transition-colors'} onClick={() => navigate(`/${pathParts.slice(0, i + 1).join('/')}`)}>
                   {part.replace(/-/g, ' ')}
                 </span>
               </React.Fragment>
             ))}
           </div>
        </header>

        <main className="p-6 md:p-10 lg:p-12 animate-fade-in-up flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};