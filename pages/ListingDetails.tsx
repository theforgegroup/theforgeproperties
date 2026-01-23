import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Fixed missing Shield import on line 5
import { MapPin, Bed, Bath, Move, CheckCircle, Calendar, DollarSign, Loader2, Headset, ArrowLeft, ExternalLink, Phone, Share2, Shield } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Lead } from '../types';
import { SEO } from '../components/SEO';

export const ListingDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPropertyBySlug, getProperty, addLead, settings, isLoading } = useProperties();
  const [activeImage, setActiveImage] = useState(0);
  const [formMode, setFormMode] = useState<'viewing' | 'offer'>('viewing');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const property = slug ? (getPropertyBySlug(slug) || getProperty(slug)) : undefined;

  useEffect(() => {
    window.scrollTo(0,0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forge-navy">
        <SEO title="Loading Portfolio..." />
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-forge-gold mx-auto mb-6" />
          <p className="font-serif italic text-forge-gold/60 tracking-widest uppercase text-[10px]">Accessing The Forge Portfolio</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <SEO title="Residence Not Found" />
        <div className="text-center p-8 bg-white shadow-xl rounded-sm max-w-md mx-4">
          <h2 className="text-2xl font-serif text-forge-navy mb-4">Residence Not Found</h2>
          <p className="text-slate-500 mb-6 text-sm">We couldn't locate the specific residence you're looking for.</p>
          <Link to="/listings" className="inline-block bg-forge-navy text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-forge-gold hover:text-forge-navy transition-all shadow-lg">
            Explore Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const agentName = settings.listing_agent?.name || property?.agent?.name || 'The Forge Properties';
  const agentPhone = settings.listing_agent?.phone || property?.agent?.phone || settings.contact_phone;
  const agentImage = settings.listing_agent?.image || property?.agent?.image;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    const newLead: Lead = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message || (formMode === 'offer' ? `I am interested in making an offer on ${property.title}` : `I would like to view ${property.title}`),
      property_id: property.id,
      property_title: property.title,
      date: new Date().toISOString(),
      status: 'New',
      type: formMode === 'offer' ? 'Offer' : 'Viewing Request'
    };
    
    try {
      await addLead(newLead);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      setSubmitStatus('idle');
    }
  };

  const mapSearchQuery = encodeURIComponent(property.location);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapSearchQuery}&output=embed`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 md:pb-0">
      <SEO 
        title={`${property.title} in ${property.location}`}
        description={`${property.bedrooms} Bed, ${property.bathrooms} Bath ${property.type}. ${property.description.substring(0, 150)}...`}
        image={property.images[0]} 
        type="realestate"
        url={`/listings/${property.slug || property.id}`}
      />

      {/* Breadcrumb / Back */}
      <div className="container mx-auto px-6 py-4">
        <Link to="/listings" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-forge-navy transition-colors">
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
      </div>

      {/* Hero Gallery */}
      <div className="h-[50vh] md:h-[70vh] bg-slate-900 relative">
        <img src={property.images[activeImage]} alt={property.title} className="w-full h-full object-cover opacity-90 transition-all duration-700" />
        
        {/* Gallery Thumbnails Overlay */}
        {property.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 px-2 no-scrollbar">
            {property.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-16 shrink-0 border-2 transition-all duration-300 ${activeImage === idx ? 'border-forge-gold scale-105 shadow-2xl' : 'border-white/30 opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
              </button>
            ))}
          </div>
        )}

        <button 
          className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-forge-gold hover:text-forge-navy transition-all"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Listing link copied!');
          }}
        >
          <Share2 size={20} />
        </button>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Main Info */}
          <div className="lg:w-2/3">
            <div className="mb-10">
              <span className="inline-block bg-forge-navy text-forge-gold text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1 mb-4 rounded-sm">
                {property.type} • {property.status}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-forge-navy font-bold mb-6 leading-tight">{property.title}</h1>
              <div className="flex items-center text-slate-500 text-lg">
                <MapPin size={24} className="mr-3 text-forge-gold shrink-0" />
                {property.location}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-slate-200 py-10 mb-12">
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Price</span>
                 <span className="text-2xl font-light text-forge-navy">₦{property.price.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Bedrooms</span>
                 <span className="text-2xl font-light text-forge-navy">{property.bedrooms} <Bed size={16} className="inline ml-1 text-forge-gold" /></span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Bathrooms</span>
                 <span className="text-2xl font-light text-forge-navy">{property.bathrooms} <Bath size={16} className="inline ml-1 text-forge-gold" /></span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Area</span>
                 <span className="text-2xl font-light text-forge-navy">{property.area_sq_ft.toLocaleString()} <span className="text-sm">sq ft</span></span>
               </div>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-serif text-forge-navy mb-6">About this Residence</h3>
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">{property.description}</p>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-serif text-forge-navy mb-8 italic">Exceptional Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {property.features.map(feature => (
                  <div key={feature} className="flex items-center gap-4 text-slate-600 p-4 bg-white border border-slate-100 rounded-sm hover:border-forge-gold/30 transition-colors">
                    <CheckCircle size={20} className="text-forge-gold shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <h3 className="text-2xl font-serif text-forge-navy">Location & Neighborhood</h3>
                <a 
                  href={mapExternalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2 text-[10px] font-bold text-forge-gold uppercase tracking-widest hover:text-forge-navy transition-all"
                >
                  View full map <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
              <div className="w-full h-[400px] bg-slate-200 rounded-sm overflow-hidden border border-slate-200 shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  title="Property Location"
                  src={mapEmbedUrl}
                ></iframe>
              </div>
            </div>
          </div>

          {/* Contact Sidebar - Fixed on Tablet/Desktop */}
          <div className="lg:w-1/3">
             <div className="bg-white p-8 md:p-10 shadow-2xl border-t-4 border-forge-gold lg:sticky lg:top-28">
               <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
                 <div className="relative">
                   {agentImage ? (
                     <img src={agentImage} alt={agentName} className="w-20 h-20 rounded-full object-cover border-2 border-slate-100" />
                   ) : (
                     <div className="w-20 h-20 rounded-full bg-forge-navy flex items-center justify-center text-forge-gold shrink-0"><Headset size={32} /></div>
                   )}
                   <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>
                 </div>
                 <div>
                   <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Exclusive Broker</p>
                   <h4 className="font-serif text-xl text-forge-navy font-bold leading-tight">{agentName}</h4>
                   <a href={`tel:${agentPhone}`} className="text-forge-gold text-sm font-bold hover:underline">{agentPhone}</a>
                 </div>
               </div>

               <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-sm">
                 <button onClick={() => setFormMode('viewing')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${formMode === 'viewing' ? 'bg-forge-navy text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>Request Viewing</button>
                 <button onClick={() => setFormMode('offer')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${formMode === 'offer' ? 'bg-forge-navy text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>Private Offer</button>
               </div>
               
               {submitStatus === 'success' ? (
                 <div className="bg-green-50 text-green-700 p-8 text-center rounded border border-green-200 animate-fade-in-up">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-green-600" size={32} />
                   </div>
                   <h4 className="text-xl font-serif font-bold mb-2">Request Transmitted</h4>
                   <p className="text-sm opacity-80">One of our senior brokers will contact you via your preferred channel within the next 2 hours.</p>
                 </div>
               ) : (
                 <form className="space-y-5" onSubmit={handleSubmit}>
                   <div>
                     <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors" />
                   </div>
                   <div>
                     <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors" />
                   </div>
                   <div>
                     <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors" />
                   </div>
                   <button 
                     disabled={submitStatus === 'submitting'} 
                     className="w-full bg-forge-navy text-white py-5 uppercase font-bold tracking-[0.2em] text-[11px] hover:bg-forge-dark transition-all flex items-center justify-center gap-3 shadow-xl group"
                   >
                     {submitStatus === 'submitting' ? <Loader2 size={18} className="animate-spin" /> : (formMode === 'viewing' ? <Calendar size={18} /> : <DollarSign size={18} />)}
                     {submitStatus === 'submitting' ? 'Processing...' : (formMode === 'viewing' ? 'Confirm Schedule' : 'Submit Private Offer')}
                   </button>
                 </form>
               )}

               <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                 <Shield size={12} /> Confidential Transmission
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA - Crucial for Mobile Conversion */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-[90] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <a 
            href={`tel:${agentPhone}`} 
            className="flex-1 bg-forge-navy text-white py-4 rounded-sm flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px]"
          >
            <Phone size={16} /> Call Now
          </a>
          <button 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="flex-1 bg-forge-gold text-forge-navy py-4 rounded-sm font-bold uppercase tracking-widest text-[10px]"
          >
            Inquire
          </button>
      </div>
    </div>
  );
};