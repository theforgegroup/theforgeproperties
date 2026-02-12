
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Menu, X, BookOpen, Wallet, ShieldCheck, Landmark } from 'lucide-react';
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
    { path: '/admin', label: 'Listings', icon: LayoutDashboard },
    { path: '/admin/crm', label: 'Leads', icon: Users },
    { path: '/admin/agents', label: 'Agents', icon: ShieldCheck },
    { path: '/admin/sales', label: 'Sales & Deals', icon: Landmark },
    { path: '/admin/payouts', label: 'Payouts', icon: Wallet },
    { path: '/admin/blog', label: 'Blog', icon: BookOpen },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row max-w-full overflow-x-hidden">
      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 lg:w-80 bg-forge-navy text-white flex-shrink-0 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6 lg:p-8">
          <div className="hidden lg:flex items-center gap-4 mb-16 text-forge-gold">
            <LayoutDashboard size={32} />
            <span className="font-bold tracking-widest text-2xl uppercase">ADMIN PORTAL</span>
          </div>
          
          <nav className="space-y-3 lg:space-y-4 flex-grow overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin');
              return (
                <div 
                  key={item.path}
                  onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                  className={`rounded-lg p-3 lg:p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 ${
                    isActive ? 'bg-slate-800 text-white shadow-lg border-l-4 border-forge-gold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className="lg:w-6 lg:h-6" />
                  <span className="font-medium text-base lg:text-lg">{item.label}</span>
                </div>
              );
            })}
          </nav>
          
          <div className="border-t border-slate-700 pt-6 lg:pt-8 mt-auto">
             <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-base uppercase tracking-wider font-bold w-full p-2"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full bg-slate-50 min-w-0">
        {children}
      </div>
    </div>
  );
};
