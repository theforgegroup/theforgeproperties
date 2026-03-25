
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Home as HomeIcon, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Lock, 
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';

const stats = [
  { label: "Properties Listed", value: "100+", icon: HomeIcon },
  { label: "Happy Clients", value: "50+", icon: Users },
  { label: "Trusted Partners", value: "10+", icon: ShieldCheck },
  { label: "Fast-Growing Network", value: "Real Estate", icon: TrendingUp },
];

const steps = [
  { 
    title: "Discover Property", 
    description: "Browse our curated list of verified properties in prime locations.",
    icon: Search 
  },
  { 
    title: "Book Inspection", 
    description: "Schedule a physical or virtual tour with our expert advisors.",
    icon: Calendar 
  },
  { 
    title: "Verify Documents", 
    description: "We ensure all legal documents are authentic and transparent.",
    icon: FileText 
  },
  { 
    title: "Secure Ownership", 
    description: "Finalize your purchase and secure your high-value asset.",
    icon: Lock 
  },
];

const locations = [
  { name: "Lekki", image: "https://images.unsplash.com/photo-1590059132669-4677e447af73?q=80&w=800", count: "45 Properties" },
  { name: "Ajah", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800", count: "32 Properties" },
  { name: "Ibeju-Lekki", image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800", count: "28 Properties" },
  { name: "Lagos Mainland", image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=800", count: "15 Properties" },
];

export const Home: React.FC = () => {
  const { properties, posts, settings, neighborhoods, testimonials } = useProperties();
  const [activeTab, setActiveTab] = useState<'Land' | 'House' | 'Investment'>('House');
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const homepageTestimonials = testimonials.filter(t => t.show_on_homepage).slice(0, 6);

  const nextTestimonial = useCallback(() => {
    if (homepageTestimonials.length === 0) return;
    setTestimonialIndex((prev) => (prev + 1) % homepageTestimonials.length);
  }, [homepageTestimonials.length]);

  const prevTestimonial = useCallback(() => {
    if (homepageTestimonials.length === 0) return;
    setTestimonialIndex((prev) => (prev - 1 + homepageTestimonials.length) % homepageTestimonials.length);
  }, [homepageTestimonials.length]);

  useEffect(() => {
    if (homepageTestimonials.length > 1) {
      const timer = setInterval(nextTestimonial, 6000);
      return () => clearInterval(timer);
    }
  }, [homepageTestimonials.length, nextTestimonial]);

  // Filter properties for the featured section
  const featuredProperties = properties.filter(p => {
    // Only show if marked for homepage
    if (p.show_on_homepage === false) return false;
    
    // Filter by tab
    const typeLower = p.type.toLowerCase();
    if (activeTab === 'Land') return typeLower === 'land';
    if (activeTab === 'House') return typeLower === 'house' || typeLower === 'villa' || typeLower === 'apartment' || typeLower === 'penthouse' || typeLower === 'estate';
    if (activeTab === 'Investment') return typeLower === 'investment' || p.featured;
    
    return true;
  }).slice(0, 3);

  // Filter posts for the insights section
  const homepagePosts = posts
    .filter(post => post.status === 'Published' && (post.show_on_homepage !== false))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="bg-white">
      <SEO 
        title="The Forge Properties | Luxury Real Estate Nigeria" 
        description="Find your dream property in Nigeria. Verified land, homes, and investment opportunities in Lekki, Ajah, and beyond."
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2600&auto=format&fit=crop" 
            alt="Luxury Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forge-navy/40" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {settings.logo && (
              <img src={settings.logo} alt="The Forge Properties" className="h-16 mx-auto mb-8 object-contain brightness-0 invert" />
            )}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Find Your Dream Property
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-slate-100 font-light">
              Helping you secure verified land, homes, and investment opportunities in Nigeria.
            </p>

            {/* Search Bar */}
            <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl mb-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-white rounded-xl p-4 flex flex-col items-start text-forge-navy">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Location</span>
                  <select className="w-full bg-transparent font-medium focus:outline-none appearance-none cursor-pointer">
                    <option>All Locations</option>
                    {neighborhoods.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                  </select>
                </div>
                <div className="bg-white rounded-xl p-4 flex flex-col items-start text-forge-navy">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Property Type</span>
                  <select className="w-full bg-transparent font-medium focus:outline-none appearance-none cursor-pointer">
                    <option>All Types</option>
                    <option>Land</option>
                    <option>House</option>
                    <option>Investment</option>
                  </select>
                </div>
                <div className="bg-white rounded-xl p-4 flex flex-col items-start text-forge-navy">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Budget</span>
                  <select className="w-full bg-transparent font-medium focus:outline-none appearance-none cursor-pointer">
                    <option>Any Budget</option>
                    <option>Under ₦50M</option>
                    <option>₦50M - ₦200M</option>
                    <option>₦200M+</option>
                  </select>
                </div>
                <button className="bg-forge-gold hover:bg-forge-goldLight text-forge-navy font-bold rounded-xl flex items-center justify-center gap-2 transition-all group h-full py-4 md:py-0">
                  <Search size={20} />
                  <span>Search Properties</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/listings" 
                className="bg-white text-forge-navy px-10 py-4 rounded-xl font-bold hover:bg-forge-gold hover:text-white transition-all shadow-lg"
              >
                Explore Properties
              </Link>
              <Link 
                to="/contact" 
                className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-forge-navy transition-all"
              >
                Book Inspection
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST METRICS SECTION */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-forge-gold/10 rounded-full flex items-center justify-center text-forge-gold mb-4">
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-bold text-forge-navy mb-1">{stat.value}</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div>
              <h2 className="text-4xl font-bold text-forge-navy mb-4">Featured Properties</h2>
              <p className="text-slate-500">Hand-picked premium listings for your next big move.</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['Land', 'House', 'Investment'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-forge-navy shadow-sm' 
                      : 'text-slate-500 hover:text-forge-navy'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.length > 0 ? (
              featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-serif italic text-lg">No featured {activeTab.toLowerCase()} listings available right now.</p>
                <Link to="/listings" className="mt-4 inline-block text-forge-navy font-bold underline">Browse all listings</Link>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/listings" 
              className="inline-flex items-center gap-2 text-forge-navy font-bold hover:text-forge-gold transition-colors group"
            >
              View All Properties <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-24 bg-forge-navy text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-forge-gold/5 skew-x-12 transform translate-x-1/4" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400">Your journey to property ownership in 4 simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-white/10 z-0" />
            
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:bg-forge-gold group-hover:border-forge-gold transition-all duration-500">
                  <step.icon size={32} className="text-forge-gold group-hover:text-forge-navy transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPOSITION SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200" 
                alt="Expert Guidance" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 bg-forge-gold p-8 rounded-2xl shadow-xl hidden md:block">
                <ShieldCheck size={48} className="text-forge-navy mb-4" />
                <p className="text-forge-navy font-bold text-xl">100% Verified<br />Documentation</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-forge-navy mb-8 leading-tight">
                We Don’t Just Sell Property — We Guide You Right
              </h2>
              <div className="space-y-6 mb-12">
                {[
                  { title: "Verified Properties", desc: "Every listing undergoes rigorous verification to ensure it's free from legal encumbrances." },
                  { title: "Proper Documentation", desc: "We handle all the paperwork, ensuring you get your C of O or Governor's Consent without stress." },
                  { title: "Expert Guidance", desc: "Our advisors provide market insights to help you make informed decisions." },
                  { title: "Investment Strategy", desc: "We help you identify high-yield opportunities for long-term wealth creation." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 size={24} className="text-forge-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-forge-navy mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-3 bg-forge-navy text-white px-10 py-5 rounded-xl font-bold hover:bg-forge-gold transition-all shadow-xl"
              >
                Speak to an Advisor <MessageSquare size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-forge-navy mb-4">What Our Clients Say</h2>
            <p className="text-slate-500">Trust is the foundation of every property we sell.</p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {homepageTestimonials.length > 0 ? (
              <>
                <div className="relative h-[400px] md:h-[350px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={testimonialIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-10 h-full">
                        <div className="relative shrink-0">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-forge-gold/20 shadow-lg">
                            {homepageTestimonials[testimonialIndex].client_photo ? (
                              <img 
                                src={homepageTestimonials[testimonialIndex].client_photo} 
                                alt={homepageTestimonials[testimonialIndex].client_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-forge-navy text-3xl font-bold">
                                {homepageTestimonials[testimonialIndex].client_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-forge-gold text-forge-navy p-2 rounded-full shadow-md">
                            <Quote size={16} fill="currentColor" />
                          </div>
                        </div>

                        <div className="flex-grow text-center md:text-left">
                          <div className="flex justify-center md:justify-start gap-1 mb-6">
                            {[...Array(homepageTestimonials[testimonialIndex].rating)].map((_, i) => (
                              <Star key={i} size={18} className="fill-forge-gold text-forge-gold" />
                            ))}
                          </div>
                          <p className="text-lg md:text-xl text-slate-600 italic mb-8 leading-relaxed font-serif">
                            "{homepageTestimonials[testimonialIndex].testimonial_text}"
                          </p>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xl font-bold text-forge-navy flex items-center justify-center md:justify-start gap-2">
                                {homepageTestimonials[testimonialIndex].client_name}
                                {homepageTestimonials[testimonialIndex].is_verified && (
                                  <span className="bg-green-100 text-green-600 text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={8} /> Verified Client
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
                                {homepageTestimonials[testimonialIndex].property_type || 'Property'} Owner
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-center items-center gap-6 mt-12">
                  <button 
                    onClick={prevTestimonial}
                    className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-forge-navy hover:bg-forge-navy hover:text-white transition-all shadow-sm"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="flex gap-2">
                    {homepageTestimonials.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setTestimonialIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === testimonialIndex ? 'w-8 bg-forge-gold' : 'bg-slate-300'}`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={nextTestimonial}
                    className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-forge-navy hover:bg-forge-navy hover:text-white transition-all shadow-sm"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
                <Quote size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-slate-400 font-serif italic text-lg">No testimonials to display yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. LOCATION / NEIGHBORHOODS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-forge-navy mb-4">Explore Neighborhoods</h2>
              <p className="text-slate-500">Find the perfect location for your lifestyle and investment.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {neighborhoods.length > 0 ? (
              neighborhoods.map((loc) => (
                <Link 
                  key={loc.id} 
                  to={`/listings?location=${loc.name}`}
                  className="group relative h-80 rounded-3xl overflow-hidden shadow-lg"
                >
                  <img 
                    src={loc.image} 
                    alt={loc.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forge-navy/90 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-bold text-white mb-1">{loc.name}</h3>
                    <p className="text-forge-gold text-sm font-medium">
                      {properties.filter(p => p.location.includes(loc.name)).length} Properties
                    </p>
                  </div>
                  <div className="absolute top-8 right-8 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={20} />
                  </div>
                </Link>
              ))
            ) : (
              locations.map((loc, i) => (
                <Link 
                  key={i} 
                  to={`/listings?location=${loc.name}`}
                  className="group relative h-80 rounded-3xl overflow-hidden shadow-lg"
                >
                  <img 
                    src={loc.image} 
                    alt={loc.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forge-navy/90 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-bold text-white mb-1">{loc.name}</h3>
                    <p className="text-forge-gold text-sm font-medium">{loc.count}</p>
                  </div>
                  <div className="absolute top-8 right-8 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={20} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 8. TEAM / BRAND SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-forge-navy mb-8">Meet The Team</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Our team consists of seasoned real estate professionals, legal experts, and investment strategists dedicated to helping you build wealth through property.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-12">
                {settings.team_members.slice(0, 4).map((member, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="w-full aspect-square bg-slate-200 rounded-2xl mb-4 overflow-hidden">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Users size={48} />
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-forge-navy">{member.name}</h4>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                ))}
              </div>
              <Link to="/about" className="text-forge-navy font-bold flex items-center gap-2 hover:text-forge-gold transition-colors">
                Learn More About Us <ArrowRight size={18} />
              </Link>
            </div>
            <div className="bg-forge-navy p-12 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-forge-gold/10 rounded-full blur-3xl" />
              <h3 className="text-3xl font-bold mb-8">Our Brand Promise</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                At The Forge Properties, we believe that real estate is more than just buying and selling—it's about forging a future. We promise transparency, integrity, and excellence in every transaction.
              </p>
              <ul className="space-y-4">
                {["Elite Inventory", "Secure Payouts", "Expert Consultation", "Verified Listings"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-forge-gold" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. BLOG / INSIGHTS SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-forge-navy mb-4">Real Estate Insights</h2>
              <p className="text-slate-500">Stay informed with the latest market trends and investment tips.</p>
            </div>
            <Link to="/blog" className="bg-slate-100 text-forge-navy px-8 py-3 rounded-xl font-bold hover:bg-forge-navy hover:text-white transition-all">
              View All Articles
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homepagePosts.length > 0 ? (
              homepagePosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                  <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-6 shadow-md">
                    <img 
                      src={post.cover_image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-bold text-forge-gold uppercase tracking-widest">{post.category}</span>
                    <span className="text-xs text-slate-400">{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-forge-navy mb-3 group-hover:text-forge-gold transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                  <span className="text-forge-navy font-bold text-sm flex items-center gap-2">
                    Read More <ArrowRight size={16} />
                  </span>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-serif italic text-lg">No blog posts available right now.</p>
                <Link to="/blog" className="mt-4 inline-block text-forge-navy font-bold underline">Visit our blog</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto">
          <div className="bg-forge-navy rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000" 
                className="w-full h-full object-cover" 
                alt="Background"
              />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                Let’s Help You Own Property This Year
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Join hundreds of happy homeowners and investors who trust The Forge Properties.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  to="/listings" 
                  className="bg-forge-gold text-forge-navy px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white transition-all shadow-xl"
                >
                  Get Started
                </Link>
                <a 
                  href={`https://wa.me/${settings.contact_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                >
                  <MessageSquare size={24} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

