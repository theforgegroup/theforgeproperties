
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { Lock, Mail, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const AgentPortal: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { agentLogin } = useAuth();
  const { addAgent, settings } = useProperties();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
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
      await addAgent({ name, email, phone });
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
        <div className="bg-white max-w-lg w-full p-10 rounded-3xl shadow-2xl text-center border-t-8 border-forge-gold">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-3xl font-serif text-forge-navy font-bold mb-4">Protocol Initiated</h2>
          <p className="text-slate-600 mb-10 leading-relaxed text-lg">
            Welcome to the inner circle. Your accreditation is currently being verified by our corporate office.
          </p>
          <div className="space-y-4">
            <a 
              href={settings.whatsapp_group_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-xl shadow-green-200"
            >
              Join Official Agent Community
            </a>
            <button 
              onClick={() => setMode('login')}
              className="block w-full text-slate-400 py-2 font-bold uppercase tracking-widest text-[10px] hover:text-forge-navy transition-all"
            >
              Return to Authentication
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
            className="w-full h-full object-cover opacity-10" 
            alt="Luxury Architecture"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-forge-dark via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex flex-col mb-16 group">
            <span className="text-3xl font-serif font-bold text-white tracking-widest group-hover:text-forge-gold transition-colors">THE FORGE</span>
            <span className="text-xs uppercase tracking-[0.4em] text-forge-gold">Properties</span>
          </Link>
          <h1 className="text-4xl lg:text-7xl font-serif text-white mb-8 leading-tight font-bold">
            Accredited <br /> <span className="text-forge-gold">Realtor Portal</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-md leading-relaxed font-light">
            Defining the future of luxury real estate brokerage in Nigeria. Track your legacy, one closing at a time.
          </p>
        </div>
      </div>

      {/* Auth Side */}
      <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-8 lg:p-20 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-slate-100">
            <div className="flex gap-8 mb-12">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${mode === 'login' ? 'text-forge-navy border-forge-gold' : 'text-slate-300 border-transparent hover:text-slate-500'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${mode === 'signup' ? 'text-forge-navy border-forge-gold' : 'text-slate-300 border-transparent hover:text-slate-500'}`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-xs font-bold mb-8 border border-red-100 flex items-center gap-3">
                <ShieldCheck size={16} className="rotate-180" /> {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-14 pr-5 py-5 rounded-2xl text-sm focus:border-forge-gold focus:outline-none focus:ring-4 focus:ring-forge-gold/5 transition-all"
                        placeholder="John Paul Adewale"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 pl-14 pr-5 py-5 rounded-2xl text-sm focus:border-forge-gold focus:outline-none focus:ring-4 focus:ring-forge-gold/5 transition-all"
                        placeholder="+234..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Protocol</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-14 pr-5 py-5 rounded-2xl text-sm focus:border-forge-gold focus:outline-none focus:ring-4 focus:ring-forge-gold/5 transition-all"
                    placeholder="agent@theforge.ng"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-14 pr-14 py-5 rounded-2xl text-sm focus:border-forge-gold focus:outline-none focus:ring-4 focus:ring-forge-gold/5 transition-all font-mono"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-forge-navy transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end px-1">
                  <button type="button" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-forge-gold transition-colors">Credential Recovery</button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-forge-navy text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-forge-dark transition-all shadow-2xl shadow-forge-navy/20 flex items-center justify-center gap-4 mt-6 group"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? 'Authenticate' : 'Initiate Registration')}
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
