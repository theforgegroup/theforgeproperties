import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Percent, 
  GraduationCap, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  MessageCircle,
  Quote,
  ChevronRight
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const JoinRealtors: React.FC = () => {
  const { addLead, settings } = useProperties();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('Beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !email || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead({
        id: 'realtor-app-' + Date.now(),
        name,
        email,
        phone,
        message: `Realtor Application. Experience Level: ${experience}. Location: ${location}`,
        property_id: 'realtor-program',
        property_title: 'Realtor 15% Commission Program',
        date: new Date().toISOString(),
        status: 'New',
        type: 'Realtor Application'
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pt-20">
      {/* HERO SECTION */}
      <section className="bg-[#0057FF] text-white py-20 px-4 sm:px-6 relative overflow-hidden border-b-2 border-[#C8FF00]/30">
        {settings?.join_realtors_hero_image && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={settings.join_realtors_hero_image} 
              alt="Join The Forge Realtors" 
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
            <span className="text-[#C8FF00]">Join Realtors</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0047d4] border border-[#C8FF00]/30 mb-4">
            <DollarSign className="w-4 h-4 text-[#C8FF00]" />
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00]">
              15% Industry-Leading Commission
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-6 leading-tight">
            Turn Your Network Into <span className="text-[#C8FF00]">Income</span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Earn up to 15% commission selling verified land with The Forge Properties.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#realtor-form-section"
              className="bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-base px-8 py-3.5 rounded-[8px] min-h-[44px] inline-flex items-center gap-2 shadow-lg transition-all"
            >
              <span>Apply to Join Now</span>
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* WHY JOIN THE FORGE REALTORS — 4 KEY PILLARS */}
      <section className="py-20 px-4 sm:px-6 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#0057FF] block mb-2">
              Partner With Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
              Why Join The Forge Realtors
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              We empower young consultants, content creators, and professionals to build reliable six- and seven-figure monthly revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* 1. 15% Commission */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all">
              <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                <Percent size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                1. 15% Direct Commission
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Highest in the industry for entry-level realtors. On a standard ₦3,000,000 plot sale, you pocket ₦450,000 in clean commission paid out promptly within 48 hours of client clearing.
              </p>
            </div>

            {/* 2. Training Provided */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all">
              <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                2. Full Training Provided
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Never sold real estate before? No problem. Free weekly sales, digital marketing, negotiation, and title objection-handling sessions led by top-producing brokers.
              </p>
            </div>

            {/* 3. Verified Products */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all">
              <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                3. 100% Verified Products
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sell with complete confidence and protect your personal reputation. Every property is titled, surveyed, and developed in formal partnership with institutions like Geofort Africa.
              </p>
            </div>

            {/* 4. Marketing Materials */}
            <div className="p-8 rounded-[12px] bg-white border border-[#E0E4FF] shadow-sm hover:border-[#0057FF] transition-all">
              <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] text-[#0057FF] flex items-center justify-center mb-5 border border-[#E0E4FF]">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0057FF] font-display mb-2">
                4. Turnkey Marketing Materials
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instant access to branded social media flyers, drone videos, site walkthrough clips, WhatsApp pitch templates, and email copy personalized with your agent name.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMMISSION STRUCTURE EXPLAINED SIMPLY */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#0057FF] block mb-2">
              Transparent Payouts
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0057FF] font-display">
              Simple Commission Structure
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              No complicated tier matrix or withheld balances. Your earnings match your results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF] text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Starter Plot (150 SQM)
              </span>
              <div className="text-2xl font-extrabold text-[#0057FF] font-display mb-2">
                ₦900,000
              </div>
              <div className="p-3 bg-white rounded-[8px] border border-[#E0E4FF]">
                <span className="text-xs text-slate-600 block">Your 15% Commission:</span>
                <span className="text-xl font-extrabold text-[#0057FF]">₦135,000</span>
              </div>
            </div>

            <div className="p-6 rounded-[12px] bg-[#0057FF] text-white border-2 border-[#C8FF00] text-center shadow-lg relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8FF00] text-[#0A0A0A] text-[10px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full">
                Most Popular
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100 block mb-1">
                Standard Plot (300 SQM)
              </span>
              <div className="text-2xl font-extrabold text-white font-display mb-2">
                ₦1,800,000
              </div>
              <div className="p-3 bg-[#0047d4] rounded-[8px] border border-white/20">
                <span className="text-xs text-blue-100 block">Your 15% Commission:</span>
                <span className="text-xl font-extrabold text-[#C8FF00]">₦270,000</span>
              </div>
            </div>

            <div className="p-6 rounded-[12px] bg-[#F5F5F5] border border-[#E0E4FF] text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Full Plot (500 SQM)
              </span>
              <div className="text-2xl font-extrabold text-[#0057FF] font-display mb-2">
                ₦3,000,000
              </div>
              <div className="p-3 bg-white rounded-[8px] border border-[#E0E4FF]">
                <span className="text-xs text-slate-600 block">Your 15% Commission:</span>
                <span className="text-xl font-extrabold text-[#0057FF]">₦450,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL QUOTE FROM AN EXISTING REALTOR */}
      <section className="py-16 px-4 sm:px-6 bg-[#0057FF] text-white border-t border-b border-[#C8FF00]/30">
        <div className="container mx-auto max-w-4xl">
          <div className="relative p-8 sm:p-12 rounded-[16px] bg-[#0047d4] border border-[#C8FF00]/30 shadow-xl text-center">
            <Quote className="w-12 h-12 text-[#C8FF00]/30 mx-auto mb-4" />
            <blockquote className="text-lg sm:text-2xl font-medium text-blue-100 leading-relaxed italic mb-6">
              "Joining The Forge changed everything for me. In my very first month, I closed two plots in Prasino Lush Phase 2 for colleagues at work. The documentation was so clean they didn't hesitate, and my 15% commission was paid right on time!"
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C8FF00]">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Tola A., Forge Realtor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white font-display">Tola Adeyemi</div>
                <div className="text-xs text-[#C8FF00] font-semibold">Forge Realtor • Lagos, Nigeria</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIGN-UP FORM — Name, Phone, Email, Location, Experience Level + "Apply to Join" Button in Accent */}
      <section id="realtor-form-section" className="py-20 px-4 sm:px-6 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-[16px] p-8 sm:p-12 border border-[#E0E4FF] shadow-xl">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-[2px] text-[#0057FF] block mb-2">
                Get Started
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0057FF] font-display">
                Apply to Become a Forge Realtor
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Fill out the application below. Our onboarding team will activate your profile and send your sales starter kit within 24 hours.
              </p>
            </div>

            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-[#F5F5F5] text-[#0057FF] rounded-full mx-auto flex items-center justify-center border border-[#E0E4FF]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#0057FF] font-display">Application Received!</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  Thank you, <strong>{name}</strong>. Our Head of Realtor Partnerships will review your details and reach out on WhatsApp ({phone}) with your training invite and property flyers.
                </p>
                <div className="pt-2 flex justify-center">
                  <a
                    href={`https://wa.me/2348106133572?text=${encodeURIComponent(
                      `Hello The Forge Properties, I just submitted my realtor application. Name: ${name}, Location: ${location}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3.5 rounded-[8px] inline-flex items-center gap-2 min-h-[44px]"
                  >
                    <MessageCircle size={18} />
                    <span>Connect on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-[8px] text-xs border border-red-200">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="realtor-name" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                    Full Name *
                  </label>
                  <input
                    id="realtor-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. David Okon"
                    className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="realtor-phone" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="realtor-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 810 000 0000"
                    className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="realtor-email" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                    Email Address *
                  </label>
                  <input
                    id="realtor-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. david@gmail.com"
                    className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="realtor-location" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                    Your Location (City / State / Country) *
                  </label>
                  <input
                    id="realtor-location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lekki, Lagos or London, UK"
                    className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-2">
                    Real Estate Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Pro'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperience(lvl)}
                        className={`py-2.5 px-3 text-xs font-bold rounded-[8px] border transition-all text-center min-h-[44px] ${
                          experience === lvl
                            ? 'bg-[#0057FF] text-white border-[#0057FF]'
                            : 'bg-white text-slate-700 border-[#E0E4FF] hover:border-[#0057FF]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply to Join Button in Accent */}
                <div className="pt-4">
                  <button
                    id="apply-to-join-realtors-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-base py-4 rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl min-h-[44px] disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Submitting Application...' : 'Apply to Join'}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
