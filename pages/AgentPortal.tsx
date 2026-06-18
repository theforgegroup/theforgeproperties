import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { extractErrorMessage } from '../utils/errorUtils';
import { Lock, Mail, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, MapPin, Users } from 'lucide-react';

export const AgentPortal: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [referredByCode, setReferredByCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setAuthenticatedUser } = useAuth();
  const { agents, addAgent, settings } = useProperties();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      // Find Realtor in agents context
      const foundAgent = agents.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      
      if (foundAgent) {
        if (foundAgent.status === 'Pending') {
          setError("Your application is under review. You will be notified once approved.");
          setIsLoading(false);
          return;
        }
        if (foundAgent.status === 'Suspended') {
          setError("Your account has been suspended. Please contact our corporate office.");
          setIsLoading(false);
          return;
        }
        // Verify password
        if (foundAgent.password && foundAgent.password !== password) {
          setError("Invalid password. Please try again.");
          setIsLoading(false);
          return;
        }
        
        // Success
        setAuthenticatedUser({
          id: foundAgent.id,
          name: foundAgent.name,
          email: foundAgent.email,
          phone: foundAgent.phone,
          status: foundAgent.status,
          referral_code: foundAgent.referral_code,
          location: foundAgent.location || 'Lagos, Nigeria',
          total_sales: foundAgent.total_sales || 0,
          total_commission: foundAgent.total_commission || 0,
          available_balance: foundAgent.available_balance || 0,
          pending_balance: foundAgent.pending_balance || 0,
          total_clicks: foundAgent.total_clicks || 0,
          total_leads: foundAgent.total_leads || 0,
          bio: foundAgent.bio || '',
          bank_name: foundAgent.bank_name || '',
          account_number: foundAgent.account_number || '',
          account_name: foundAgent.account_name || '',
          profile_photo: foundAgent.profile_photo || ''
        }, 'Agent');
        navigate('/agent/dashboard');
      } else {
        setError('No agent found with this email, or incorrect credentials.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please retype and try again.');
      setIsLoading(false);
      return;
    }

    try {
      await addAgent({
        name,
        email,
        phone,
        location,
        password,
        referred_by_code: referredByCode,
        status: 'Pending'
      });
      setMode('success');
    } catch (err: unknown) {
      console.error('Signup error:', err);
      setError(extractErrorMessage(err, 'Signup failed. Please try again.'));
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
            Your application is under review. You will be notified once approved. You can now join our community of high-performing realtors.
          </p>
          <div className="space-y-4">
            <a 
              href={settings.whatsapp_group_link || 'https://chat.whatsapp.com/DRsRpTeucuK6bIfSu0pvje?mode=gi_t'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-200 text-center"
            >
              Join Official Agent WhatsApp
            </a>
            <button 
              onClick={() => {
                setMode('login');
                setName('');
                setPhone('');
                setEmail('');
                setLocation('');
                setPassword('');
                setConfirmPassword('');
                setReferredByCode('');
              }}
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
            <span className="text-xs uppercase tracking-[0.4em] text-forge-gold font-bold">Properties</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-serif text-white mb-6 leading-tight">
            Accredited <br /> <span className="text-forge-gold">Agent Portal</span>
          </h1>
          <p className="text-slate-400 text-base max-w-sm leading-relaxed">
            Register and access professional property listings, marketing materials, track sales commissions, and manage your deals with real-time analytics.
          </p>
        </div>
      </div>

      {/* Auth Side */}
      <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-6 lg:p-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg my-8">
          <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex gap-4 mb-8">
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'text-forge-navy border-b-2 border-forge-gold' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100 leading-relaxed">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">State / Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                        placeholder="Lagos State, Nigeria"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                    placeholder="agent@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-12 pr-12 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
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

              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 pl-12 pr-12 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Referral Code (Optional)</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      value={referredByCode}
                      onChange={(e) => setReferredByCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all"
                      placeholder="Enter code of referee"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end items-center pt-1">
                  <button type="button" onClick={() => alert("Please contact corporate admin to reset your credentials.")} className="text-[10px] font-bold text-forge-gold uppercase tracking-widest hover:underline">Forgot Password?</button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-forge-navy text-white py-4.5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-forge-dark transition-all shadow-xl shadow-forge-navy/20 flex items-center justify-center gap-3 mt-4"
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
