import React, { useState, useEffect, useRef } from 'react';
import { Save, Mail, Phone, MapPin, Upload, X, User, Loader2, AlertCircle, BadgeCheck } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SiteSettings, TeamMember } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useProperties();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for file inputs array
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const agentImageRef = useRef<HTMLInputElement>(null);

  // Sync if settings change externally
  useEffect(() => {
    if (!message && !isSaving && settings) {
      setFormData(settings);
    }
  }, [settings, message, isSaving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      await updateSettings(formData);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError('Failed to save settings. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const currentMembers = formData.teamMembers || [];
    const updatedMembers = [...currentMembers];
    
    if (updatedMembers[index]) {
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      setFormData({ ...formData, teamMembers: updatedMembers });
    }
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image before setting state
        const base64String = await resizeImage(file);
        handleMemberChange(index, 'image', base64String);
      } catch (err) {
        console.error("Error processing image:", err);
        setError('Failed to process image. Please try a valid image file.');
      }
    }
  };

  const handleAgentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await resizeImage(file);
        setFormData(prev => ({
          ...prev,
          listingAgent: { ...prev.listingAgent, image: base64String }
        }));
      } catch (err) {
        setError('Failed to process agent image.');
      }
    }
  };

  const removeMemberImage = (index: number) => {
    handleMemberChange(index, 'image', '');
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-serif text-forge-navy mb-8">Site Configuration</h1>

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm font-bold border border-green-200 shadow-sm animate-fade-in flex items-center gap-2">
            <User size={16} /> {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 shadow-sm animate-fade-in flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* SETTINGS FORM */}
        <div className="bg-white rounded shadow-xl border-t-4 border-forge-gold overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            {/* Global Listing Agent Profile */}
            <div className="space-y-6">
               <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy mb-1">Default Listing Agent</h3>
                 <p className="text-slate-500 text-sm">This profile will appear on ALL property listings.</p>
              </div>

              <div className="bg-slate-50 p-6 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-6">
                  {/* Agent Image */}
                  <div className="w-full md:w-32 flex-shrink-0">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Profile Photo</label>
                      <div className="relative w-32 h-32 bg-slate-200 mx-auto overflow-hidden rounded-full border-2 border-slate-300">
                        {formData.listingAgent?.image ? (
                          <>
                            <img src={formData.listingAgent.image} alt="Agent" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, listingAgent: { ...prev.listingAgent, image: '' } }))}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                              title="Remove Image"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <User size={32} />
                          </div>
                        )}
                      </div>
                      
                      <input 
                        type="file" 
                        ref={agentImageRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAgentImageUpload} 
                      />
                      
                      <button
                        type="button"
                        onClick={() => agentImageRef.current?.click()}
                        className="w-full mt-3 bg-white border border-slate-300 text-slate-600 py-2 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 hover:text-forge-gold transition-colors flex items-center justify-center gap-1"
                      >
                        <Upload size={12} /> Upload
                      </button>
                  </div>

                  {/* Agent Details */}
                  <div className="flex-grow space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Display Name</label>
                        <input
                          type="text"
                          value={formData.listingAgent?.name || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, listingAgent: { ...prev.listingAgent, name: e.target.value } }))}
                          className="w-full bg-white border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                          placeholder="e.g. The Forge Properties"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={formData.listingAgent?.phone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, listingAgent: { ...prev.listingAgent, phone: e.target.value } }))}
                          className="w-full bg-white border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                          placeholder="+234..."
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
                        <BadgeCheck size={16} />
                        Active on all listings
                      </div>
                  </div>
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy mb-1">Company Contact Information</h3>
                 <p className="text-slate-500 text-sm">Update your public footer details.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <Mail size={14} /> Official Email Address
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <Phone size={14} /> Official Phone Number
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  <MapPin size={14} /> Physical Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm resize-none"
                  required
                />
              </div>
            </div>

            {/* Leadership Team Section */}
            <div className="space-y-8">
              <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy mb-1">Leadership Team</h3>
                 <p className="text-slate-500 text-sm">Manage profiles and photos for the 'About Us' page.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {formData.teamMembers && formData.teamMembers.map((member, index) => (
                  <div key={index} className="bg-slate-50 p-6 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-6">
                    {/* Image Area */}
                    <div className="w-full md:w-32 flex-shrink-0">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Photo</label>
                       <div className="relative w-32 h-40 bg-slate-200 mx-auto overflow-hidden rounded border border-slate-300">
                          {member.image ? (
                            <>
                              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeMemberImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                title="Remove Image"
                              >
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                               <User size={32} />
                            </div>
                          )}
                       </div>
                       
                       <input 
                          type="file" 
                          ref={(el) => { fileInputRefs.current[index] = el; }}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)} 
                        />
                       
                       <button
                         type="button"
                         onClick={() => fileInputRefs.current[index]?.click()}
                         className="w-full mt-2 bg-white border border-slate-300 text-slate-600 py-2 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 hover:text-forge-gold transition-colors flex items-center justify-center gap-1"
                       >
                         <Upload size={12} /> Upload
                       </button>
                    </div>

                    {/* Details Area */}
                    <div className="flex-grow space-y-4">
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Name</label>
                         <input
                           type="text"
                           value={member.name}
                           onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                           className="w-full bg-white border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Role / Title</label>
                         <input
                           type="text"
                           value={member.role}
                           onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                           className="w-full bg-white border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                         />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className={`bg-forge-navy text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-forge-dark shadow-lg transition-all rounded-sm flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};