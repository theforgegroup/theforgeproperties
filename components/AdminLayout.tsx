import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Listings', icon: LayoutDashboard },
    { path: '/admin/crm', label: 'CRM / Leads', icon: Users },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar - Increased width and typography size */}
        <div className="w-80 bg-forge-navy text-white hidden lg:block flex-shrink-0 relative">
          <div className="p-8">
            {/* Logo Area */}
            <div className="flex items-center gap-4 mb-16 text-forge-gold">
              <LayoutDashboard size={32} />
              <span className="font-bold tracking-widest text-2xl uppercase">ADMIN PORTAL</span>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-4">
              {navItems.map((item) => {
                // Check if active. Special handling for Listings to include sub-routes like edit/add
                const isActive = location.pathname === item.path || 
                                 (item.path === '/admin' && location.pathname.startsWith('/admin/properties'));
                
                return (
                  <div 
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-slate-800 text-white shadow-lg border-l-4 border-forge-gold' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={24} />
                    <span className="font-medium text-lg">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="absolute bottom-10 left-8 right-8 border-t border-slate-700 pt-8">
             <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-base uppercase tracking-wider font-bold w-full"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
};