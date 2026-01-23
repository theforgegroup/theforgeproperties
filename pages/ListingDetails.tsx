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

      <div className="h-[40vh] md:h-[60vh] bg-slate-900 relative overflow-hidden">
        <img src={property.images[activeImage]} alt={property.title} className="w-full h-full object-cover opacity-90" />
        
        {property.images.length > 1 && (
          <div className="absolute bottom-6 left-4 right-4 md:left-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {property.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`w-16 h-12 flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-forge-gold scale-105 shadow-lg' : 'border-white/50 opacity-70 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="lg:w-2/3">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              <div>
                <span className="text-forge-gold text-xs font-bold uppercase tracking-widest mb-2 block">{property.type}</span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-forge-navy font-bold mb-2 leading-tight">{property.title}</h1>
                <div className="flex items-center text-slate-500">
                  <MapPin size={18} className="mr-2 text-forge-gold shrink-0" />
                  {property.location}
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-2xl md:text-3xl text-forge-navy font-light">₦{property.price.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex gap-4 md:gap-8 border-y border-slate-200 py-6 mb-8 text-slate-600 overflow-x-auto no-scrollbar">
               <div className="flex items-center gap-2 whitespace-nowrap">
                 <Bed className="text-forge-gold" size={20} />
                 <span className="font-bold text-forge-navy">{property.bedrooms}</span> Beds
               </div>
               <div className="flex items-center gap-2 whitespace-nowrap">
                 <Bath className="text-forge-gold" size={20} />
                 <span className="font-bold text-forge-navy">{property.bathrooms}</span> Baths
               </div>
               <div className="flex items-center gap-2 whitespace-nowrap">
                 <Move className="text-forge-gold" size={20} />
                 <span className="font-bold text-forge-navy">{property.area_sq_ft.toLocaleString()}</span> Sq Ft
               </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-serif text-forge-navy mb-4">Description</h3>
              <p className="text-slate-600 leading-relaxed text-base md:text-lg">{property.description}</p>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-serif text-forge-navy mb-6">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle size={16} className="text-forge-gold shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-serif text-forge-navy">Location & Neighborhood</h3>
                <a 
                  href={mapExternalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-xs font-bold text-forge-gold uppercase tracking-widest hover:text-forge-navy transition-colors"
                >
                  View on Google Maps <ExternalLink size={14} />
                </a>
              </div>
              <div className="w-full h-80 bg-slate-200 rounded overflow-hidden border border-slate-200 shadow-sm">
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
              <p className="text-xs text-slate-400 mt-3 italic">Map location is approximate based on address provided.</p>
            </div>
          </div>

          <div className="lg:w-1/3">
             <div className="bg-white p-6 md:p-8 shadow-xl border-t-4 border-forge-gold lg:sticky lg:top-24">
               <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                 {agentImage ? (
                   <img src={agentImage} alt={agentName} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                 ) : (
                   <div className="w-16 h-16 rounded-full bg-forge-navy flex items-center justify-center text-forge-gold shrink-0"><Headset size={28} /></div>
                 )}
                 <div>
                   <p className="text-slate-400 text-xs uppercase tracking-wider">Listing Agent</p>
                   <h4 className="font-serif text-lg text-forge-navy leading-tight mb-1">{agentName}</h4>
                   <p className="text-forge-gold text-sm font-bold">{agentPhone}</p>
                 </div>
               </div>

               {/* Direct Call Button - tel: protocol */}
               <a 
                 href={`tel:${agentPhone}`} 
                 className="w-full mb-6 bg-forge-gold text-forge-navy py-4 uppercase font-bold tracking-widest text-xs hover:bg-white border border-forge-gold transition-all flex items-center justify-center gap-3 shadow-lg group"
               >
                 <Phone size={16} className="group-hover:animate-bounce" /> Call Agent Now
               </a>

               <div className="flex gap-2 mb-6">
                 <button onClick={() => setFormMode('viewing')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${formMode === 'viewing' ? 'bg-forge-navy text-white' : 'bg-slate-100 text-slate-500'}`}>Viewing</button>
                 <button onClick={() => setFormMode('offer')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${formMode === 'offer' ? 'bg-forge-navy text-white' : 'bg-slate-100 text-slate-500'}`}>Make Offer</button>
               </div>

               <h3 className="text-lg font-serif text-forge-navy mb-4">{formMode === 'viewing' ? 'Schedule a Viewing' : 'Submit an Offer'}</h3>
               
               {submitStatus === 'success' ? (
                 <div className="bg-green-50 text-green-700 p-4 text-center rounded border border-green-200">
                   <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
                   <p className="font-bold">Request Sent!</p>
                 </div>
               ) : (
                 <form className="space-y-4" onSubmit={handleSubmit}>
                   <input type="text" placeholder="Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none" />
                   <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none" />
                   <input type="tel" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none" />
                   <button disabled={submitStatus === 'submitting'} className="w-full bg-forge-navy text-white py-4 uppercase font-bold tracking-widest text-xs hover:bg-forge-dark transition-all flex items-center justify-center gap-2 shadow-lg">
                     {submitStatus === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : (formMode === 'viewing' ? <Calendar size={14} /> : <DollarSign size={14} />)}
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