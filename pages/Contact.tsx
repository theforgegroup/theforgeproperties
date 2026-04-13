
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
      <div className="bg-white pt-12 md:pt-24 pb-12 md:pb-20 border-b border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <span className="text-forge-gold text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Get In Touch</span>
          <h1 className="text-3xl md:text-6xl font-bold text-forge-navy leading-tight">Start Your Journey</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 shadow-2xl overflow-hidden rounded-2xl md:rounded-3xl">
          
          {/* Dark Info Side */}
          <div className="bg-forge-navy text-white p-10 md:p-20 flex flex-col justify-between relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-forge-gold opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

             <div className="relative z-10">
               <h3 className="text-2xl md:text-4xl font-bold mb-12 md:mb-16">Contact Information</h3>
               
               <div className="space-y-10 md:space-y-12">
                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-all duration-500">
                     <MapPin size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold">Headquarters</p>
                     <p className="text-base md:text-xl leading-relaxed font-medium whitespace-pre-line">{settings.address}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-all duration-500">
                     <Phone size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold">Phone</p>
                     <p className="text-base md:text-xl leading-relaxed font-medium">{settings.contact_phone}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-all duration-500">
                     <Mail size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold">Email</p>
                     <p className="text-base md:text-xl leading-relaxed font-medium break-all">{settings.contact_email}</p>
                     {settings.contact_email_2 && (
                       <p className="text-base md:text-xl leading-relaxed font-medium break-all mt-1">{settings.contact_email_2}</p>
                     )}
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-6 group">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-forge-gold group-hover:text-forge-navy transition-all duration-500">
                     <Clock size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold">Office Hours</p>
                     <p className="text-base md:text-xl leading-relaxed font-medium">Mon - Fri: 8:00 AM - 6:00 PM</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-10 md:p-20">
            <h3 className="text-2xl md:text-4xl font-bold text-forge-navy mb-10 md:mb-12">Send a Message</h3>
            
            {submitStatus === 'success' ? (
               <div className="h-full flex flex-col items-center justify-center text-center py-12">
                 <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
                   <CheckCircle className="text-green-600" size={48} />
                 </div>
                 <h3 className="text-2xl font-bold text-forge-navy mb-4">Message Received</h3>
                 <p className="text-slate-500 font-medium leading-relaxed">Thank you for contacting The Forge. Our team will respond to your inquiry within 24 hours.</p>
               </div>
            ) : (
              <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="First Name"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-xl focus:border-forge-gold focus:bg-white focus:outline-none transition-all placeholder-slate-400 text-slate-800 font-medium" 
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Last Name"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-xl focus:border-forge-gold focus:bg-white focus:outline-none transition-all placeholder-slate-400 text-slate-800 font-medium" 
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
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-xl focus:border-forge-gold focus:bg-white focus:outline-none transition-all placeholder-slate-400 text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <input 
                    type="tel" 
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-xl focus:border-forge-gold focus:bg-white focus:outline-none transition-all placeholder-slate-400 text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <textarea 
                    rows={5} 
                    placeholder="How can we assist you?"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-xl focus:border-forge-gold focus:bg-white focus:outline-none transition-all placeholder-slate-400 text-slate-800 resize-none font-medium"
                  ></textarea>
                </div>

                <button className="w-full bg-forge-navy text-white px-10 py-5 rounded-xl uppercase font-bold tracking-[0.2em] text-[10px] md:text-xs hover:bg-forge-gold hover:text-forge-navy transition-all duration-500 shadow-xl shadow-forge-navy/20">
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
