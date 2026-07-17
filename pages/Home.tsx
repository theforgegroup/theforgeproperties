
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare,
  Instagram,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  Send,
  Plane,
  Heart,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';


export const Home: React.FC = () => {
  const { properties, settings, testimonials, addLead } = useProperties();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanPhone = settings.contact_phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hello! I saw your website and want to ask about your available land listings.")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    setIsSubmitting(true);
    try {
      await addLead({
        id: Math.random().toString(36).substring(2, 9),
        name: formData.name,
        email: formData.email || 'no-email@theforge.com',
        phone: formData.phone,
        message: formData.message || 'Interested in owning land / property.',
        date: new Date().toISOString(),
        status: 'New',
        type: 'General Inquiry'
      });
      setFormSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden text-slate-900">
      <SEO 
        title="The Forge Properties | Making Land Ownership Real" 
        description="We make land and property ownership simple, affordable, and real for young Nigerians at home and abroad. Start with a ₦200,000 deposit."
      />

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-24 md:pt-0 bg-forge-navy overflow-hidden">
        {/* Modern grid & visual backdrops */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.8),rgba(2,6,23,0.95))] z-10" />
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2600" 
            alt="Modern Lagos Architecture" 
            className="w-full h-full object-cover scale-105 animate-pulse duration-[10s]"
            loading="eager"
          />
        </div>

        {/* Brand visual decoration */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-forge-gold/10 rounded-full blur-3xl z-10" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-forge-gold/10 rounded-full blur-3xl z-10" />

        <div className="relative z-20 container mx-auto px-6 py-16 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forge-gold/15 text-forge-gold text-xs font-bold uppercase tracking-[0.25em] mb-8 border border-forge-gold/35">
              <Sparkles size={14} /> Land Ownership Redefined
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black mb-6 tracking-tight leading-[1.1]">
              Your Land. <br />
              <span className="text-forge-gold">Your Name.</span> <br />
              Your Future.
            </h1>

            <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              We make land and property ownership simple, affordable, and real — for young Nigerians at home and abroad.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="#listings" 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-forge-gold text-forge-navy font-bold text-base hover:bg-white hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-forge-gold/10 text-center"
              >
                Start With ₦200K
              </a>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/25 hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-3 text-center"
              >
                <MessageSquare size={20} className="text-forge-gold" />
                Let's Talk
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="py-24 md:py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Who We Are</span>
            
            {/* Short Version Intro */}
            <div className="mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-extrabold text-forge-navy mb-8 leading-tight">
                About The Forge Properties
              </h2>
              <div className="bg-slate-50 border-l-4 border-forge-gold p-8 rounded-r-3xl">
                <p className="text-lg md:text-2xl text-slate-700 font-medium leading-relaxed italic">
                  "We're The Forge Properties — a real estate company built by young Nigerians, for young Nigerians. Whether you're based in Lagos or living abroad, we make land and property ownership simple, affordable, and stress-free. No jargon. No gatekeeping. Just your name on your land."
                </p>
              </div>
            </div>

            {/* Side-by-Side Story Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl md:text-3xl font-extrabold text-forge-navy tracking-tight">
                  Our Brand Story
                </h3>
                <div className="space-y-6 text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                  <p>
                    The Forge Properties was built by young Nigerians who got tired of watching land ownership feel like something only for the wealthy or the well-connected.
                  </p>
                  <p>
                    We started this because we believe the next generation deserves a seat at the table — or better yet, ground beneath their feet.
                  </p>
                  <p>
                    Whether you're grinding in Lagos, hustling in London, or saving up in Atlanta — we exist to make sure that owning land in Nigeria is something you can actually do, not just something you dream about.
                  </p>
                  <p className="text-forge-navy font-bold">
                    No intimidation. No confusion. Just your land, your name, your future. <br />
                    Welcome to The Forge.
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-6 relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 border-t-4 border-l-4 border-forge-gold rounded-tl-3xl hidden md:block" />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-4 border-r-4 border-forge-gold rounded-br-3xl hidden md:block" />
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200" 
                  alt="Verified Land Plots" 
                  className="rounded-3xl shadow-2xl relative z-10 w-full object-cover aspect-[4/3]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO WE SERVE SECTION */}
      <section id="who-we-serve" className="py-24 md:py-32 bg-slate-50 relative border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Tailored For You</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-forge-navy leading-tight">Who We Serve</h2>
            <p className="text-base md:text-lg text-slate-500 mt-4 font-medium">
              We design our entire property acquisition process around your lifestyle, needs, and dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1: Young Nigerians at Home */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-forge-navy/5 rounded-2xl flex items-center justify-center text-forge-navy mb-8">
                  <Smartphone size={28} className="text-forge-gold" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-forge-navy mb-4">Young Nigerians at Home</h3>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                  Whether you're in Lagos, Abuja, or anywhere in between — if you're ready to stop renting and start owning, we're here for it.
                </p>
              </div>
              <div className="pt-8 border-t border-slate-50 mt-8">
                <span className="text-xs uppercase tracking-wider font-bold text-forge-gold flex items-center gap-2">
                  Own land locally <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* Card 2: Nigerians in the Diaspora */}
            <div className="bg-forge-navy p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 border border-white/5 flex flex-col justify-between text-white">
              <div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-8">
                  <Plane size={28} className="text-forge-gold" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-4">Nigerians in the Diaspora</h3>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                  You don't have to be in Nigeria to own land in Nigeria. We handle the process, show you everything virtually, and make sure your investment is protected.
                </p>
              </div>
              <div className="pt-8 border-t border-white/5 mt-8">
                <span className="text-xs uppercase tracking-wider font-bold text-forge-gold flex items-center gap-2">
                  Invest from anywhere <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* Card 3: First-Time Buyers */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-forge-navy/5 rounded-2xl flex items-center justify-center text-forge-navy mb-8">
                  <Heart size={28} className="text-forge-gold" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-forge-navy mb-4">First-Time Buyers</h3>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                  Never bought land before? Perfect. We'll walk you through every step — documents, location, payment — in plain language, no pressure.
                </p>
              </div>
              <div className="pt-8 border-t border-slate-50 mt-8">
                <span className="text-xs uppercase tracking-wider font-bold text-forge-gold flex items-center gap-2">
                  Zero jargon guidance <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Zero Friction</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-forge-navy leading-tight">How It Works</h2>
            <p className="text-base md:text-lg text-slate-500 mt-4 font-medium">
              Four simple steps to get your name on your land deed. No corporate runaround.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Step 1 */}
            <div className="relative p-6">
              <span className="text-6xl md:text-8xl font-black text-slate-100 absolute top-2 left-2 z-0">01</span>
              <div className="relative z-10 pt-12">
                <h3 className="text-xl font-bold text-forge-navy mb-3">Reach Out</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  DM or WhatsApp us. No complex forms, no initial stress. Just real talk.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6">
              <span className="text-6xl md:text-8xl font-black text-slate-100 absolute top-2 left-2 z-0">02</span>
              <div className="relative z-10 pt-12">
                <h3 className="text-xl font-bold text-forge-navy mb-3">Pick Your Plot</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  We show you verified options that fit your exact budget and location preference.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6">
              <span className="text-6xl md:text-8xl font-black text-slate-100 absolute top-2 left-2 z-0">03</span>
              <div className="relative z-10 pt-12">
                <h3 className="text-xl font-bold text-forge-navy mb-3">Lock It In</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  Make your flexible first payment and immediately secure your allocated land.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative p-6">
              <span className="text-6xl md:text-8xl font-black text-slate-100 absolute top-2 left-2 z-0">04</span>
              <div className="relative z-10 pt-12">
                <h3 className="text-xl font-bold text-forge-navy mb-3">Get Your Documents</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  Registered Survey + Deed of Assignment. 100% legal, clean, and entirely yours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY THE FORGE SECTION */}
      <section id="why-the-forge" className="py-24 md:py-32 bg-forge-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-5">
              <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">The Forge Difference</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                Why Choose <br className="hidden lg:block" />The Forge?
              </h2>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                We remove the hurdles so that owning land becomes a straightforward, empowering milestone in your life.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Point 1 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <FileText className="text-forge-gold mb-4" size={28} />
                <h3 className="text-lg font-bold text-white mb-2">Verified Documentation</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Every plot comes with full legal backing, including Registered Survey and Deed.
                </p>
              </div>

              {/* Point 2 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <Clock className="text-forge-gold mb-4" size={28} />
                <h3 className="text-lg font-bold text-white mb-2">Flexible Payment Plans</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Start with a starting deposit as low as ₦200,000 and spread the rest easily.
                </p>
              </div>

              {/* Point 3 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <Plane className="text-forge-gold mb-4" size={28} />
                <h3 className="text-lg font-bold text-white mb-2">Built for Diaspora</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Virtual tours, reliable verification, and highly secure payment portals.
                </p>
              </div>

              {/* Point 4 */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <ShieldCheck className="text-forge-gold mb-4" size={28} />
                <h3 className="text-lg font-bold text-white mb-2">100% Transparency</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Strictly no hidden fees, development dues surprises, or agency runarounds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LISTINGS / PROPERTIES SECTION */}
      <section id="listings" className="py-24 md:py-32 bg-slate-50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Available Now</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-forge-navy leading-tight">Featured Land & Properties</h2>
            <p className="text-base md:text-lg text-slate-500 mt-4 font-medium">
              Highly secure, high-growth investment land and luxury plots. Find the layout that fits your vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {properties && properties.length > 0 ? (
              properties.slice(0, 6).map((property) => {
                const cleanPhone = settings.contact_phone.replace(/\D/g, '');
                const propWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello! I want to enquire about the "${property.title}" listing in ${property.location} featured on your website. I want to ask about starting with a flexible deposit.`)}`;
                
                // Smart deposit calculation (approx 10% or default to ₦200k)
                const depositValue = Math.max(200000, Math.round(property.price * 0.1));
                const displayDeposit = depositValue >= 1000000 
                  ? `₦${(depositValue / 1000000).toFixed(1)}M`
                  : `₦${depositValue.toLocaleString()}`;

                return (
                  <div key={property.id} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full">
                    {/* Image Area */}
                    <div className="relative h-56 md:h-64 overflow-hidden bg-slate-100">
                      <img 
                        src={property.images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"} 
                        alt={property.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-forge-navy text-white text-[10px] md:text-xs font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg shadow-sm">
                          {property.status}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-forge-gold text-forge-navy text-[10px] md:text-xs font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg shadow-sm">
                          {property.type}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                      <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                        <MapPin size={14} className="mr-1 text-forge-gold shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-black text-forge-navy mb-4 leading-snug truncate group-hover:text-forge-gold transition-colors">
                        {property.title}
                      </h3>

                      {/* Prominent Affordability Framework */}
                      <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Starting Deposit</p>
                          <p className="text-lg md:text-xl font-black text-forge-gold">{displayDeposit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Full Outright Price</p>
                          <p className="text-sm md:text-base font-bold text-forge-navy">₦{(property.price / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div className="mb-6 pt-2 border-t border-slate-50 text-slate-500 text-xs md:text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span>Docs: Survey + Deed of Assignment included</span>
                      </div>

                      {/* CTA Actions */}
                      <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <a 
                          href={propWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-forge-gold text-forge-navy text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-forge-navy hover:text-white transition-colors text-center shadow-md shadow-forge-gold/5"
                        >
                          Enquire Now
                        </a>
                        <Link 
                          to={`/listings/${property.slug}`}
                          className="bg-slate-50 text-forge-navy border border-slate-200 text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-slate-100 transition-colors text-center"
                        >
                          Get Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Default beautiful static fallbacks if db properties haven't loaded
              <>
                {/* Fallback 1 */}
                <div className="group bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
                  <div className="relative h-56 md:h-64 overflow-hidden bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800" 
                      alt="Lekki Corridor Plots" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-forge-navy text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg">
                        For Sale
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-forge-gold text-forge-navy text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg">
                        Land
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                      <MapPin size={14} className="mr-1 text-forge-gold" />
                      <span>Epe, Lagos Corridor</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-forge-navy mb-4 leading-snug">
                      The Forge Estate Phase 1
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Starting Deposit</p>
                        <p className="text-lg md:text-xl font-black text-forge-gold">₦200,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Full Outright Price</p>
                        <p className="text-sm md:text-base font-bold text-forge-navy">₦4,500,000</p>
                      </div>
                    </div>
                    <div className="mb-6 pt-2 border-t border-slate-50 text-slate-500 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      <span>Docs: Registered Survey + Deed included</span>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                      <a 
                        href={`https://wa.me/${cleanPhone}?text=Hi!%20Interested%20in%20The%20Forge%20Estate%20Phase%201%20Epe.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-forge-gold text-forge-navy text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-forge-navy hover:text-white transition-colors text-center"
                      >
                        Enquire Now
                      </a>
                      <Link 
                        to="/listings"
                        className="bg-slate-50 text-forge-navy border border-slate-200 text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-slate-100 transition-colors text-center"
                      >
                        Get Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Fallback 2 */}
                <div className="group bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
                  <div className="relative h-56 md:h-64 overflow-hidden bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800" 
                      alt="Ibeju Lekki Plots" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-forge-navy text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg">
                        For Sale
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-forge-gold text-forge-navy text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg">
                        Land
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                      <MapPin size={14} className="mr-1 text-forge-gold" />
                      <span>Ibeju-Lekki, Lagos</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-forge-navy mb-4 leading-snug">
                      Apex Gardens Verified Land
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Starting Deposit</p>
                        <p className="text-lg md:text-xl font-black text-forge-gold">₦500,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Full Outright Price</p>
                        <p className="text-sm md:text-base font-bold text-forge-navy">₦8,200,000</p>
                      </div>
                    </div>
                    <div className="mb-6 pt-2 border-t border-slate-50 text-slate-500 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      <span>Docs: Excision + Registered Survey</span>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                      <a 
                        href={`https://wa.me/${cleanPhone}?text=Hi!%20Interested%20in%20Apex%20Gardens%20Ibeju-Lekki.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-forge-gold text-forge-navy text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-forge-navy hover:text-white transition-colors text-center"
                      >
                        Enquire Now
                      </a>
                      <Link 
                        to="/listings"
                        className="bg-slate-50 text-forge-navy border border-slate-200 text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-slate-100 transition-colors text-center"
                      >
                        Get Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Fallback 3 */}
                <div className="group bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
                  <div className="relative h-56 md:h-64 overflow-hidden bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800" 
                      alt="Premium Plots Epe" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-forge-navy text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg">
                        For Sale
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-forge-gold text-forge-navy text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-lg">
                        Land
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                      <MapPin size={14} className="mr-1 text-forge-gold" />
                      <span>Sangotedo, Lekki</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-forge-navy mb-4 leading-snug">
                      Prime Gateway Estates
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Starting Deposit</p>
                        <p className="text-lg md:text-xl font-black text-forge-gold">₦1,000,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Full Outright Price</p>
                        <p className="text-sm md:text-base font-bold text-forge-navy">₦15,000,000</p>
                      </div>
                    </div>
                    <div className="mb-6 pt-2 border-t border-slate-50 text-slate-500 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      <span>Docs: Gazette + C of O (In Progress)</span>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                      <a 
                        href={`https://wa.me/${cleanPhone}?text=Hi!%20Interested%20in%20Prime%20Gateway%20Estates%20Sangotedo.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-forge-gold text-forge-navy text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-forge-navy hover:text-white transition-colors text-center"
                      >
                        Enquire Now
                      </a>
                      <Link 
                        to="/listings"
                        className="bg-slate-50 text-forge-navy border border-slate-200 text-xs uppercase font-bold tracking-wider py-4 rounded-xl hover:bg-slate-100 transition-colors text-center"
                      >
                        Get Details
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. DIASPORA SECTION */}
      <section id="diaspora" className="py-24 md:py-32 bg-forge-dark text-white relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forge-gold/5 rounded-full blur-3xl z-0" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Global Connectivity</span>
            
            <h2 className="text-3xl md:text-6xl font-extrabold text-white leading-tight mb-8">
              You Don't Have to Be in Nigeria <br className="hidden md:block" />
              to Own Land in Nigeria
            </h2>

            <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              We offer virtual inspections, secure payment options, and full documentation — so you can invest from anywhere in the world with complete confidence.
            </p>

            {/* Diaspora Value Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16 text-left">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <p className="text-xs text-forge-gold uppercase font-bold tracking-wider mb-2">01. Inspection</p>
                <p className="text-sm text-slate-300 font-medium">Live HD video tours & exact coordinates via Google Maps.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <p className="text-xs text-forge-gold uppercase font-bold tracking-wider mb-2">02. Payments</p>
                <p className="text-sm text-slate-300 font-medium">Direct USD domiciliary transfer & absolute transaction security.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl col-span-2 sm:col-span-1">
                <p className="text-xs text-forge-gold uppercase font-bold tracking-wider mb-2">03. Verification</p>
                <p className="text-sm text-slate-300 font-medium">Remote document search and lawyer validation support.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-forge-gold text-forge-navy font-bold rounded-2xl hover:bg-white transition-all text-center"
              >
                Let’s Discuss Diaspora Packages
              </a>
              <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                Accepted: Bank Transfer, USD Domiciliary, Cards
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS / SOCIAL PROOF SECTION */}
      <section id="testimonials" className="py-24 md:py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Our Community</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-forge-navy leading-tight">Word On The Street</h2>
            <p className="text-base md:text-lg text-slate-500 mt-4 font-medium">
              Meet young Nigerians who took the leap and locked in their properties with The Forge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials && testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-6 text-forge-gold">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-600 text-base leading-relaxed mb-8 italic font-medium">
                      "{item.testimonial_text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.client_photo ? (
                      <img src={item.client_photo} alt={item.client_name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-forge-navy text-white flex items-center justify-center font-bold font-sans">
                        {item.client_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-forge-navy font-bold text-sm md:text-base leading-tight">{item.client_name}</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{item.property_type || 'Property Owner'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Beautiful Fallback Testimonials
              <>
                {/* Fallback 1 */}
                <div className="bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-6 text-forge-gold">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-600 text-base leading-relaxed mb-8 italic font-medium">
                      "I was skeptical about buying land while in London, but the guys at The Forge made it seamless. They sent live location tracking, physical site video tours, and walked me through all the documentation. Highly recommended!"
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-forge-navy text-white flex items-center justify-center font-bold">
                      C
                    </div>
                    <div>
                      <p className="text-forge-navy font-bold text-sm leading-tight">Chidi O.</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Software Engineer, London</p>
                    </div>
                  </div>
                </div>

                {/* Fallback 2 */}
                <div className="bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-6 text-forge-gold">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-600 text-base leading-relaxed mb-8 italic font-medium">
                      "I started with just a ₦200,000 initial layout deposit plan. Knowing exactly how much I had to spread across the remaining months gave me absolute confidence to budget and lock in my Epe plot without pressure."
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-forge-navy text-white flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <p className="text-forge-navy font-bold text-sm leading-tight">Amina Y.</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Creative Director, Lagos</p>
                    </div>
                  </div>
                </div>

                {/* Fallback 3 */}
                <div className="bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-6 text-forge-gold">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-600 text-base leading-relaxed mb-8 italic font-medium">
                      "Clean legal checks, transparent pricing, and absolute professionalism. It’s hard to find real estate teams in Nigeria that explain layout boundaries without dropping corporate jargon. The Forge is different."
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-forge-navy text-white flex items-center justify-center font-bold">
                      T
                    </div>
                    <div>
                      <p className="text-forge-navy font-bold text-sm leading-tight">Tunde A.</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Tech Founder, Atlanta</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. CONTACT / CTA SECTION */}
      <section id="contact" className="py-24 md:py-32 bg-slate-50 relative border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 border border-slate-100">
            {/* Left Block */}
            <div className="lg:col-span-5 bg-forge-navy p-10 md:p-12 text-white flex flex-col justify-between relative">
              <div className="absolute inset-0 bg-gradient-to-br from-forge-navy to-forge-dark opacity-90 z-0" />
              <div className="relative z-10">
                <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Get In Touch</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
                  Ready to Own <br />Your Land?
                </h2>
                <p className="text-slate-300 text-base leading-relaxed font-medium mb-10">
                  No pressure. Just real talk. Reach out and let's figure out what works for you.
                </p>

                <div className="space-y-6">
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">WhatsApp</p>
                      <p className="text-sm font-bold text-white">Direct Message Us</p>
                    </div>
                  </a>

                  <a 
                    href="https://www.instagram.com/theforgeproperties_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                      <Instagram size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Instagram</p>
                      <p className="text-sm font-bold text-white">@theforgeproperties_</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="relative z-10 pt-12 border-t border-white/5 text-slate-400 text-xs">
                &copy; {new Date().getFullYear()} The Forge Properties. Lagos-Ogun Corridor, Nigeria.
              </div>
            </div>

            {/* Right Form Block */}
            <div className="lg:col-span-7 p-10 md:p-12">
              <h3 className="text-2xl font-bold text-forge-navy mb-8">Send Us a Quick Message</h3>
              
              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-3xl text-center">
                  <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                  <h4 className="text-xl font-bold mb-2">Message Sent Successfully!</h4>
                  <p className="text-sm text-green-700">We've received your inquiry and our team will get back to you via WhatsApp or Email within a few hours.</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Tunde"
                        className="w-full border border-slate-200 px-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Your Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. +234..."
                        className="w-full border border-slate-200 px-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Your Email (Optional)</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. tunde@gmail.com"
                      className="w-full border border-slate-200 px-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Message</label>
                    <textarea 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us what you're looking for or your flexible budget..."
                      className="w-full border border-slate-200 px-4 py-3.5 rounded-xl text-sm focus:border-forge-gold focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-forge-navy text-white text-xs uppercase font-bold tracking-widest rounded-xl hover:bg-forge-gold hover:text-forge-navy transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
