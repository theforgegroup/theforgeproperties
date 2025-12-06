import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Move, CheckCircle, Calendar, MessageSquare, DollarSign, Loader2, Headset } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Lead } from '../types';

export const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProperty, addLead, settings } = useProperties();
  const [activeImage, setActiveImage] = useState(0);
  const [formMode, setFormMode] = useState<'viewing' | 'offer'>('viewing');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const property = id ? getProperty(id) : undefined;

  // Use the Global Listing Agent settings if available, otherwise fallback to property agent or defaults
  const agentName = settings.listingAgent?.name || property?.agent?.name || 'The Forge Properties';
  const agentPhone = settings.listingAgent?.phone || property?.agent?.phone || settings.contactPhone;
  const agentImage = settings.listingAgent?.image || property?.agent?.image;

  useEffect(() => {
    window.scrollTo(0,0);
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-forge-navy mb-4">Property Not Found</h2>
          <Link to="/listings" className="text-forge-gold underline">Return to listings</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    const newLead: Lead = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message || (formMode === 'offer' ? `I am interested in making an offer on ${property.title}` : `I would like to view ${property.title}`),
      propertyId: property.id,
      propertyTitle: property.title,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      type: formMode === 'offer' ? 'Offer' : 'Viewing Request'
    };
    
    try {
      await addLead(newLead);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error("Submission failed", error);
      setSubmitStatus('idle'); // In a real app we'd show an error state
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Gallery Header */}
      <div className="h-[60vh] bg-slate-900 relative">
        <img 
          src={property.images[activeImage]} 
          alt={property.title} 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent">
          {property.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-20 h-14 border-2 transition-all ${activeImage === idx ? 'border-forge-gold opacity-100' : 'border-white/50 opacity-60 hover:opacity-100'}`}
            >
              <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-forge-gold text-xs font-bold uppercase tracking-widest mb-2 block">{property.type}</span>
                <h1 className="text-3xl md:text-4xl font-serif text-forge-navy font-bold mb-2">{property.title}</h1>
                <div className="flex items-center text-slate-500">
                  <MapPin size={18} className="mr-2 text-forge-gold" />
                  {property.location}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl text-forge-navy font-light">
                  ₦{property.price.toLocaleString()}
                </div>
                <div className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 mt-2 uppercase tracking-wide font-bold rounded">
                  {property.status}
                </div>
              </div>
            </div>

            <div className="flex gap-8 border-y border-slate-200 py-6 mb-8 text-slate-600">
               <div className="flex items-center gap-2">
                 <Bed className="text-forge-gold" />
                 <span className="font-bold text-forge-navy">{property.bedrooms}</span> Bedrooms
               </div>
               <div className="flex items-center gap-2">
                 <Bath className="text-forge-gold" />
                 <span className="font-bold text-forge-navy">{property.bathrooms}</span> Bathrooms
               </div>
               <div className="flex items-center gap-2">
                 <Move className="text-forge-gold" />
                 <span className="font-bold text-forge-navy">{property.areaSqFt.toLocaleString()}</span> Sq Ft
               </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-serif text-forge-navy mb-4">Description</h3>
              <p className="text-slate-600 leading-relaxed text-lg">{property.description}</p>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-serif text-forge-navy mb-6">Key Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle size={16} className="text-forge-gold" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mb-12">
              <h3 className="text-xl font-serif text-forge-navy mb-4">Location</h3>
              <div className="bg-slate-200 h-64 w-full flex items-center justify-center text-slate-400">
                <span className="flex items-center gap-2">
                  <MapPin /> Map Integration Placeholder
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Form */}
          <div className="lg:w-1/3">
             <div className="bg-white p-8 shadow-xl border-t-4 border-forge-gold sticky top-24">
               <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                 {agentImage ? (
                   <img src={agentImage} alt={agentName} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                 ) : (
                   <div className="w-16 h-16 rounded-full bg-forge-navy flex items-center justify-center text-forge-gold shrink-0">
                     <Headset size={28} />
                   </div>
                 )}
                 <div>
                   <p className="text-slate-400 text-xs uppercase tracking-wider">Listing Agent</p>
                   <h4 className="font-serif text-lg text-forge-navy">{agentName}</h4>
                   <p className="text-forge-gold text-sm font-bold">{agentPhone}</p>
                 </div>
               </div>

               <div className="flex gap-2 mb-6">
                 <button 
                  onClick={() => setFormMode('viewing')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${formMode === 'viewing' ? 'bg-forge-navy text-white' : 'bg-slate-100 text-slate-500'}`}
                 >
                   Viewing
                 </button>
                 <button 
                  onClick={() => setFormMode('offer')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${formMode === 'offer' ? 'bg-forge-navy text-white' : 'bg-slate-100 text-slate-500'}`}
                 >
                   Make Offer
                 </button>
               </div>

               <h3 className="text-lg font-serif text-forge-navy mb-4">
                 {formMode === 'viewing' ? 'Schedule a Viewing' : 'Submit an Offer'}
               </h3>
               
               {submitStatus === 'success' ? (
                 <div className="bg-green-50 text-green-700 p-4 text-center rounded border border-green-200">
                   <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
                   <p className="font-bold">Request Sent!</p>
                   <p className="text-xs mt-1">Our agent will contact you shortly.</p>
                 </div>
               ) : (
                 <form className="space-y-4" onSubmit={handleSubmit}>
                   <div>
                     <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Name</label>
                     <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none" 
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Email</label>
                     <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none" 
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Phone</label>
                     <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none" 
                     />
                   </div>
                   <div>
                     <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Message (Optional)</label>
                     <textarea 
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none resize-none"
                     ></textarea>
                   </div>
                   
                   <button 
                     disabled={submitStatus === 'submitting'}
                     className="w-full bg-forge-navy text-white py-4 uppercase font-bold tracking-widest text-xs hover:bg-forge-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                   >
                     {submitStatus === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : (formMode === 'viewing' ? <Calendar size={14} /> : <DollarSign size={14} />)}
                     {submitStatus === 'submitting' ? 'Sending...' : (formMode === 'viewing' ? 'Request Date' : 'Submit Offer')}
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