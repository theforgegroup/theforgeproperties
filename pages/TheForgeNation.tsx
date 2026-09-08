import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Globe2, 
  Flame,
  ChevronRight
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const TheForgeNation: React.FC = () => {
  const { addLead, settings } = useProperties();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locationType, setLocationType] = useState('Nigeria');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !email) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead({
        id: 'forge-nation-' + Date.now(),
        name,
        email,
        phone,
        message: `Joined The Forge Nation Community. Location: ${locationType}`,
        property_id: 'community',
        property_title: 'The Forge Nation',
        date: new Date().toISOString(),
        status: 'New',
        type: 'Community Signup'
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FORGE_NATION_WHATSAPP_LINK = "https://chat.whatsapp.com/J3sjwKDILjWHoAv09cyCiY?s=cl&p=i&mlu=4&ilr=4";

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pt-20">
      {/* HERO SECTION */}
      <section className="bg-[#0057FF] text-white py-20 px-4 sm:px-6 relative overflow-hidden border-b-2 border-[#C8FF00]/30">
        {settings?.forge_nation_hero_image && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={settings.forge_nation_hero_image} 
              alt="The Forge Nation Community" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0057FF]/85" />
          </div>
        )}

        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C8FF00]/20 blur-3xl pointer-events-none z-0" 
          aria-hidden="true" 
        />

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-100 mb-6">
            <Link to="/" className="hover:text-[#C8FF00] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#C8FF00]" />
            <span className="text-[#C8FF00]">The Forge Nation</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0047d4] border border-[#C8FF00]/30 mb-4">
            <Flame className="w-4 h-4 text-[#C8FF00]" />
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00]">
              Nigeria's #1 Youth Land Community
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-6 leading-tight">
            Welcome to <span className="text-[#C8FF00]">The Forge Nation</span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Nigeria's most vibrant community of young land owners, future investors, and wealth builders.
          </p>

          {/* Social Proof Badge */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-sm">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0057FF]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="member" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0057FF]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="member" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0057FF]" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" alt="member" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              <strong className="text-[#C8FF00]">500+ members</strong> and counting across Nigeria & Diaspora
            </span>
          </div>
        </div>
      </section>

      {/* WHAT MEMBERS GET — 4 FEATURE CARDS */}
      <section className="py-20 px-4 sm:px-6 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#0057FF] block mb-2">
              Community Privileges
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
              What Members Get
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              When you join The Forge Nation, you step into an ecosystem designed to accelerate your land ownership journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Card 1: Free Property Education */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                  1. Free Property Education
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Interactive webinars, downloadable title guides, land law explainers, and growth corridor analyses. Learn how to read a survey plan, decode government gazettes, and calculate appreciation before committing your money.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-[#0057FF] uppercase tracking-wider">
                Monthly Masterclasses & Guides
              </div>
            </div>

            {/* Card 2: Early Access to Deals */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                  2. Early Access to Deals
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  See upcoming verified estate phases 7 to 14 days before public release. Secure inaugural introductory prices, pick corner-piece plots, and reserve allocations ahead of general market increases.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-[#0057FF] uppercase tracking-wider">
                Member-First Allocation Windows
              </div>
            </div>

            {/* Card 3: Games & Giveaways */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                  <Trophy size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                  3. Games & Giveaways
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fun property trivia nights, title scavenger hunts, legal fee subsidies, and periodic community giveaways. Building wealth shouldn't be boring or intimidating.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-[#0057FF] uppercase tracking-wider">
                Quarterly Prizes & Competitions
              </div>
            </div>

            {/* Card 4: Networking */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                  4. High-Value Networking
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Connect with fellow young founders, tech professionals, diaspora returnees, and smart accumulators. Form co-buying syndicates to split 500sqm plots cleanly with shared legal security.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-[#0057FF] uppercase tracking-wider">
                Co-Buying Groups & Synergy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN SECTION — Form with Name, Phone, Email, Location + Button in Accent */}
      <section id="join-form-section" className="py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-[#0057FF] text-white rounded-[16px] p-8 sm:p-12 border-2 border-[#C8FF00]/30 shadow-2xl relative">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00] block mb-2">
                Join Today
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Become a Member of The Forge Nation
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-2">
                100% Free. No fees, no obligations. Instant access to community updates.
              </p>
            </div>

            {isSuccess ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-[#0047d4] text-[#C8FF00] rounded-full mx-auto flex items-center justify-center border-2 border-[#C8FF00]/40 shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00]">Registration Confirmed</span>
                  <h3 className="text-2xl font-extrabold text-white font-display">Welcome to The Forge Nation{name ? `, ${name}` : ''}!</h3>
                </div>
                <p className="text-sm text-blue-100 leading-relaxed max-w-md mx-auto">
                  You are now an official member of Nigeria's premier youth land-building movement. Click below to enter the official WhatsApp community group:
                </p>

                <div className="pt-2 flex flex-col items-center gap-3 justify-center">
                  <a
                    id="forge-nation-whatsapp-community-btn"
                    href={FORGE_NATION_WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-base px-8 py-4 rounded-[8px] inline-flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] min-h-[48px]"
                  >
                    <MessageCircle size={22} className="shrink-0" />
                    <span>Join The Forge Nation WhatsApp Group</span>
                  </a>

                  <div className="w-full max-w-md bg-white/10 rounded-[8px] p-3 text-left border border-white/20">
                    <p className="text-[11px] font-semibold text-blue-200 mb-1">Direct Invite Link:</p>
                    <a
                      href={FORGE_NATION_WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#C8FF00] hover:underline font-mono break-all inline-block"
                    >
                      {FORGE_NATION_WHATSAPP_LINK}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setName('');
                      setPhone('');
                      setEmail('');
                    }}
                    className="text-xs text-blue-200 hover:text-white underline mt-2 py-2"
                  >
                    Register another member
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-[8px] text-xs">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="nation-name" className="block text-xs font-bold uppercase tracking-[1px] text-blue-100 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="nation-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tunde Johnson"
                    className="w-full px-4 py-3 text-sm bg-white text-[#0A0A0A] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C8FF00] min-h-[44px]"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label htmlFor="nation-phone" className="block text-xs font-bold uppercase tracking-[1px] text-blue-100 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="nation-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 810 000 0000"
                    className="w-full px-4 py-3 text-sm bg-white text-[#0A0A0A] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C8FF00] min-h-[44px]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="nation-email" className="block text-xs font-bold uppercase tracking-[1px] text-blue-100 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="nation-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. tunde@gmail.com"
                    className="w-full px-4 py-3 text-sm bg-white text-[#0A0A0A] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C8FF00] min-h-[44px]"
                  />
                </div>

                {/* Location (Nigeria / Diaspora) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-blue-100 mb-2">
                    Current Location
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocationType('Nigeria')}
                      className={`py-3 px-4 text-xs font-bold rounded-[8px] border transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                        locationType === 'Nigeria'
                          ? 'bg-[#C8FF00] text-[#0A0A0A] border-[#C8FF00]'
                          : 'bg-[#0047d4] text-white border-white/20 hover:border-[#C8FF00]'
                      }`}
                    >
                      <span>Based in Nigeria</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('Diaspora')}
                      className={`py-3 px-4 text-xs font-bold rounded-[8px] border transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                        locationType === 'Diaspora'
                          ? 'bg-[#C8FF00] text-[#0A0A0A] border-[#C8FF00]'
                          : 'bg-[#0047d4] text-white border-white/20 hover:border-[#C8FF00]'
                      }`}
                    >
                      <Globe2 size={15} />
                      <span>Diaspora (UK, US, CA, etc.)</span>
                    </button>
                  </div>
                </div>

                {/* Submit button in Accent */}
                <div className="pt-4">
                  <button
                    id="join-the-forge-nation-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-base py-4 rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl min-h-[44px] disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Processing...' : 'Join The Forge Nation'}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>

                <p className="text-[11px] text-center text-blue-200 pt-2">
                  By joining, you agree to receive curated updates, invite links, and educational materials. Zero spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
