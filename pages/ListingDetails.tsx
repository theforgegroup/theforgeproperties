import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Move, CheckCircle, Calendar, DollarSign, Loader2, Headset, ArrowLeft, ExternalLink, Phone } from 'lucide-react';
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

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setSubmitStatus('submitting');
    
    try {
      const newLead: Lead = {
        id: Math.random().toString(36).substring(2, 15),
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
      await addLead(newLead);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch {
      setSubmitStatus('idle');
    }
  }, [formData, formMode, property, addLead]);

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

  const mapSearchQuery = encodeURIComponent(property.location);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapSearchQuery}&output=embed`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <SEO 
        title={`${property.title} in ${property.location}`}
        description={`${property.bedrooms} Bed, ${property.bathrooms} Bath ${property.type}. ${property.description.substring(0, 150)}...`}
        image={property.images[0]} 
        type="realestate"
        url={`/listings/${property.slug || property.id}`}
      />

      <div className="container mx-auto px-4 md:px-6 py-4">
        <Link to="/listings" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-forge-navy transition-colors">
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
      </div>

      <div className="h-[45vh] md:h-[70vh] bg-slate-900 relative overflow-hidden">
        <img src={property.images[activeImage]} alt={property.title} className="w-full h-full object-cover opacity-90" />
        
        {property.images.length > 1 && (
          <div className="absolute bottom-6 left-0 w-full px-4 md:px-6 flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
            {property.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-14 md:w-24 md:h-16 flex-shrink-0 border-2 transition-all rounded-xl overflow-hidden snap-center ${activeImage === idx ? 'border-forge-gold scale-105 shadow-2xl' : 'border-white/30 opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="lg:w-2/3">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
              <div className="w-full">
                <span className="text-forge-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-3 block">{property.type}</span>
                <h1 className="text-3xl md:text-5xl font-bold text-forge-navy mb-4 leading-tight">{property.title}</h1>
                <div className="flex items-center text-slate-500 font-medium">
                  <MapPin size={18} className="mr-2 text-forge-gold shrink-0" />
                  {property.location}
                </div>
              </div>
              <div className="w-full md:w-auto text-left md:text-right bg-slate-100 md:bg-transparent p-4 md:p-0 rounded-2xl">
                <div className="text-3xl md:text-4xl text-forge-navy font-bold">₦{property.price.toLocaleString()}</div>
                {property.status === 'For Rent' && <span className="text-sm text-slate-500 font-medium">per annum</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-10 border-y border-slate-100 py-8 mb-10 text-slate-600">
               <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-forge-gold/10 flex items-center justify-center text-forge-gold mb-1 md:mb-0">
                   <Bed size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Beds</p>
                   <p className="font-bold text-forge-navy text-lg">{property.bedrooms}</p>
                 </div>
               </div>
               <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-forge-gold/10 flex items-center justify-center text-forge-gold mb-1 md:mb-0">
                   <Bath size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Baths</p>
                   <p className="font-bold text-forge-navy text-lg">{property.bathrooms}</p>
                 </div>
               </div>
               <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-forge-gold/10 flex items-center justify-center text-forge-gold mb-1 md:mb-0">
                   <Move size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Area</p>
                   <p className="font-bold text-forge-navy text-lg">{property.area_sq_ft.toLocaleString()}<span className="text-xs ml-1">ft²</span></p>
                 </div>
               </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl md:text-2xl font-bold text-forge-navy mb-6 uppercase tracking-widest">Description</h3>
              <p className="text-slate-600 leading-relaxed text-base md:text-xl font-medium">{property.description}</p>
            </div>

            <div className="mb-12">
              <h3 className="text-xl md:text-2xl font-bold text-forge-navy mb-6 uppercase tracking-widest">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.features.map(feature => (
                  <div key={feature} className="flex items-center gap-4 text-slate-600 bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                    <CheckCircle size={20} className="text-forge-gold shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-forge-navy uppercase tracking-widest">Location</h3>
                <a 
                  href={mapExternalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-[10px] font-bold text-forge-gold uppercase tracking-[0.2em] hover:text-forge-navy transition-colors bg-forge-gold/10 px-4 py-2 rounded-full"
                >
                  Open in Google Maps <ExternalLink size={14} />
                </a>
              </div>
              <div className="w-full h-72 md:h-96 bg-slate-200 rounded-3xl overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50">
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
              <p className="text-[10px] text-slate-400 mt-4 italic font-medium">Map location is approximate based on address provided.</p>
            </div>
          </div>

          <div className="lg:w-1/3">
             <div className="bg-white p-6 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 rounded-3xl lg:sticky lg:top-24">
               <div className="flex items-center gap-5 mb-8 border-b border-slate-50 pb-8">
                 {agentImage ? (
                   <img src={agentImage} alt={agentName} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-slate-50 shadow-lg" />
                 ) : (
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-forge-navy flex items-center justify-center text-forge-gold shrink-0 shadow-lg"><Headset size={32} /></div>
                 )}
                 <div>
                   <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Listing Agent</p>
                   <h4 className="text-xl font-bold text-forge-navy leading-tight mb-2">{agentName}</h4>
                   <p className="text-forge-gold text-sm font-bold tracking-widest">{agentPhone}</p>
                 </div>
               </div>

               {/* Direct Call Button - tel: protocol */}
               <a 
                 href={`tel:${agentPhone}`} 
                 className="w-full mb-8 bg-forge-gold text-forge-navy py-5 rounded-2xl uppercase font-bold tracking-[0.2em] text-[10px] hover:bg-forge-navy hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-forge-gold/20 group"
               >
                 <Phone size={18} className="group-hover:animate-bounce" /> Call Agent Now
               </a>

               <div className="flex gap-3 mb-8 p-1.5 bg-slate-50 rounded-2xl">
                 <button onClick={() => setFormMode('viewing')} className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formMode === 'viewing' ? 'bg-white text-forge-navy shadow-lg' : 'text-slate-400 hover:text-forge-navy'}`}>Viewing</button>
                 <button onClick={() => setFormMode('offer')} className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formMode === 'offer' ? 'bg-white text-forge-navy shadow-lg' : 'text-slate-400 hover:text-forge-navy'}`}>Make Offer</button>
               </div>

               <h3 className="text-lg md:text-xl font-bold text-forge-navy mb-6 uppercase tracking-widest">{formMode === 'viewing' ? 'Schedule a Viewing' : 'Submit an Offer'}</h3>
               
               {submitStatus === 'success' ? (
                 <div className="bg-green-50 text-green-700 p-6 text-center rounded-2xl border border-green-100">
                   <CheckCircle className="mx-auto mb-3 text-green-600" size={32} />
                   <p className="font-bold uppercase tracking-widest text-xs">Request Sent Successfully</p>
                 </div>
               ) : (
                 <form className="space-y-4" onSubmit={handleSubmit}>
                   <div className="space-y-4">
                     <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm focus:border-forge-gold focus:outline-none focus:bg-white transition-all font-medium" />
                     <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm focus:border-forge-gold focus:outline-none focus:bg-white transition-all font-medium" />
                     <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm focus:border-forge-gold focus:outline-none focus:bg-white transition-all font-medium" />
                   </div>
                   <button disabled={submitStatus === 'submitting'} className="w-full bg-forge-navy text-white py-5 rounded-2xl uppercase font-bold tracking-[0.2em] text-[10px] hover:bg-forge-gold hover:text-forge-navy transition-all flex items-center justify-center gap-3 shadow-xl shadow-forge-navy/20 mt-6 active:scale-95 disabled:opacity-50">
                     {submitStatus === 'submitting' ? <Loader2 size={18} className="animate-spin" /> : (formMode === 'viewing' ? <Calendar size={18} /> : <DollarSign size={18} />)}
                     {submitStatus === 'submitting' ? 'Processing...' : (formMode === 'viewing' ? 'Request Viewing' : 'Submit Offer')}
                   </button>
                 </form>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};