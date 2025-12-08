import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Menu, X, BookOpen } from 'lucide-react';
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
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Listings', icon: LayoutDashboard },
    { path: '/admin/posts', label: 'Posts', icon: BookOpen },
    { path: '/admin/crm', label: 'CRM / Leads', icon: Users },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-forge-navy text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 text-forge-gold">
          <LayoutDashboard size={24} />
          <span className="font-bold tracking-widest text-lg uppercase">ADMIN</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-forge-gold transition-colors"
        >
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 lg:w-80 bg-forge-navy text-white flex-shrink-0 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6 lg:p-8">
          {/* Logo Area */}
          <div className="hidden lg:flex items-center gap-4 mb-16 text-forge-gold">
            <LayoutDashboard size={32} />
            <span className="font-bold tracking-widest text-2xl uppercase">ADMIN PORTAL</span>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-3 lg:space-y-4 flex-grow">
            {navItems.map((item) => {
              // Check if active
              const isActive = location.pathname === item.path || 
                               (item.path === '/admin' && location.pathname.startsWith('/admin/properties')) ||
                               (item.path === '/admin/posts' && location.pathname.startsWith('/admin/posts'));
              
              return (
                <div 
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`rounded-lg p-3 lg:p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-slate-800 text-white shadow-lg border-l-4 border-forge-gold' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className="lg:w-6 lg:h-6" />
                  <span className="font-medium text-base lg:text-lg">{item.label}</span>
                </div>
              );
            })}
          </nav>
          
          {/* Logout Button */}
          <div className="border-t border-slate-700 pt-6 lg:pt-8 mt-auto">
             <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-base uppercase tracking-wider font-bold w-full"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full bg-slate-50">
        {children}
      </div>
    </div>
  );
};