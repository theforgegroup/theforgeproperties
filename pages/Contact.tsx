
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Lead } from '../types';

export const Contact: React.FC = () => {
  const { settings, addLead } = useProperties();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: Date.now().toString(),
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      date: new Date().toISOString(),
      status: 'New',
      type: 'General Inquiry'
    };
    
    addLead(newLead);
    setSubmitStatus('success');
    setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white py-16 border-b border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-3 block">Get In Touch</span>
          <h1 className="text-4xl md:text-5xl font-serif text-forge-navy font-bold">Start Your Journey</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 shadow-2xl overflow-hidden rounded-sm">
          
          {/* Dark Info Side */}
          <div className="bg-forge-navy text-white p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-forge-gold opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

             <div className="relative z-10">
               <h3 className="text-3xl font-serif mb-10">Contact Information</h3>
               
               <div className="space-y-10">
                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-colors">
                     <MapPin size={24} />
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Headquarters</p>
                     <p className="text-lg leading-relaxed font-light whitespace-pre-line">{settings.address}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-colors">
                     <Phone size={24} />
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Phone</p>
                     <p className="text-lg leading-relaxed font-light">{settings.contact_phone}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-colors">
                     <Mail size={24} />
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Email</p>
                     <p className="text-lg leading-relaxed font-light">{settings.contact_email}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-colors">
                     <Clock size={24} />
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Office Hours</p>
                     <p className="text-lg leading-relaxed font-light">Mon - Fri: 8:00 AM - 6:00 PM</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-12 md:p-16">
            <h3 className="text-3xl font-serif text-forge-navy mb-8">Send a Message</h3>
            
            {submitStatus === 'success' ? (
               <div className="h-full flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle className="text-green-600" size={40} />
                 </div>
                 <h3 className="text-2xl font-serif text-forge-navy mb-2">Message Received</h3>
                 <p className="text-slate-500">Thank you for contacting The Forge. Our team will respond to your inquiry within 24 hours.</p>
               </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="First Name"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-4 focus:border-forge-gold focus:outline-none transition-colors placeholder-slate-400 text-slate-800" 
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Last Name"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-4 focus:border-forge-gold focus:outline-none transition-colors placeholder-slate-400 text-slate-800" 
                    />
                  </div>
                </div>
                
                <div>
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 focus:border-forge-gold focus:outline-none transition-colors placeholder-slate-400 text-slate-800" 
                  />
                </div>

                <div>
                  <input 
                    type="tel" 
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 focus:border-forge-gold focus:outline-none transition-colors placeholder-slate-400 text-slate-800" 
                  />
                </div>

                <div>
                  <textarea 
                    rows={4} 
                    placeholder="How can we assist you?"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 focus:border-forge-gold focus:outline-none transition-colors placeholder-slate-400 text-slate-800 resize-none"
                  ></textarea>
                </div>

                <button className="w-full bg-forge-navy text-white px-10 py-5 uppercase font-bold tracking-widest text-xs hover:bg-forge-gold hover:text-forge-navy transition-all duration-300 shadow-lg">
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
