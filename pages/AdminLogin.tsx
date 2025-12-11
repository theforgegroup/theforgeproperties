
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(email, password);
    
    if (!success) {
      setError('Invalid credentials. Access denied.');
    }
    // No need to navigate; state update will trigger App to switch to Admin Dashboard view automatically.
  };

  return (
    <div className="min-h-screen bg-forge-navy flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-forge-gold opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="mb-8 text-center relative z-10">
         <span className="text-3xl font-serif font-bold text-white tracking-widest">THE FORGE</span>
         <span className="block text-[10px] uppercase tracking-[0.3em] text-forge-gold mt-1">Properties</span>
      </div>

      <div className="bg-white w-full max-w-md p-10 rounded-sm shadow-2xl border-t-4 border-forge-gold relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-4 rounded-full border border-slate-200">
            <Lock className="text-forge-navy" size={24} />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif text-center text-forge-navy mb-2">Admin Portal</h2>
        <p className="text-center text-slate-500 text-xs mb-8 uppercase tracking-widest font-bold">Authorized Access Only</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 mb-6 text-center rounded flex items-center justify-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors text-slate-700"
              placeholder="admin@theforgeproperties.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors text-slate-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-forge-navy transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-forge-navy text-white py-4 uppercase font-bold tracking-widest text-xs hover:bg-forge-dark hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            Secure Login
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-slate-500 text-[10px] uppercase tracking-wider">
        Protected by 256-bit encryption
      </p>
    </div>
  );
};
