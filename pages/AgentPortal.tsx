
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { Lock, Mail, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export const AgentPortal: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { agentLogin, setAuthenticatedUser } = useAuth();
  const { addAgent, settings } = useProperties();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // In a real app, this would be an async call to your backend
    setTimeout(() => {
      const success = agentLogin(email, password);
      if (success) {
        navigate('/agent/dashboard');
      } else {
        setError('Invalid credentials or account pending approval.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const agent = await addAgent({ name, email, phone });
      setMode('success');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'success') {
    return (
      <div className="min-h-screen bg-forge-navy flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full p-10 rounded-2xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-serif text-forge-navy mb-4">Registration Successful</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Welcome to the elite circle. Your application is being reviewed by our corporate team. You can now join our community of high-performing realtors.
          </p>
          <div className="space-y-4">
            <a 
              href={settings.whatsapp_group_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-200"
            >
              Join Official Agent WhatsApp
            </a>
            <button 
              onClick={() => setMode('login')}
              className="block w-full border border-slate-200 text-slate-500 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-navy flex flex-col md:flex-row overflow-hidden">
      {/* Branding Side */}
      <div className="md:w-1/2 relative bg-forge-dark overflow-hidden flex flex-col justify-center p-12 lg:p-24">
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000" 
            className="w-full h-full object-cover opacity-20" 
            alt="Luxury Architecture"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-forge-dark via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex flex-col mb-16">
            <span className="text-3xl font-serif font-bold text-white tracking-widest">THE FORGE</span>
            <span className="text-xs uppercase tracking-[0.4em] text-forge-gold">Properties</span>
          </Link>
          <h1 className="text-4xl lg:text-6xl font-serif text-white mb-6 leading-tight">
            Accredited <br /> <span className="text-forge-gold">Agent Portal</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            The exclusive platform for Nigerias leading real estate professionals. Track sales, manage referrals, and access off-market inventory.
          </p>
        </div>
      </div>

      {/* Auth Side */}
      <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-md">
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                        placeholder="+234..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                    placeholder="agent@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-12 pr-12 py-4 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-forge-navy"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-[10px] font-bold text-forge-gold uppercase tracking-widest">Forgot Password?</button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-forge-navy text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-forge-dark transition-all shadow-xl shadow-forge-navy/20 flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : (mode === 'login' ? 'Access Portal' : 'Register Account')}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
