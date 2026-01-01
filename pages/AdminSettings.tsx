
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
  
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const agentImageRef = useRef<HTMLInputElement>(null);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to save settings. Please verify database columns.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...(formData.team_members || [])];
    if (updatedMembers[index]) {
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      setFormData({ ...formData, team_members: updatedMembers });
    }
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await resizeImage(file);
        handleMemberChange(index, 'image', base64String);
      } catch (err) {
        setError('Failed to process image.');
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
          listing_agent: { ...prev.listing_agent, image: base64String }
        }));
      } catch (err) {
        setError('Failed to process agent image.');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-serif text-forge-navy mb-8">Site Configuration</h1>

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm font-bold border border-green-200 flex items-center gap-2">
            <BadgeCheck size={16} /> {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="bg-white rounded shadow-xl border-t-4 border-forge-gold overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            <div className="space-y-6">
               <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy mb-1">Default Listing Agent</h3>
                 <p className="text-slate-500 text-sm">Global profile for property pages.</p>
              </div>

              <div className="bg-slate-50 p-6 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 flex-shrink-0">
                      <div className="relative w-32 h-32 bg-slate-200 mx-auto overflow-hidden rounded-full border-2 border-slate-300">
                        {formData.listing_agent?.image ? (
                          <img src={formData.listing_agent.image} alt="Agent" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={32} /></div>
                        )}
                      </div>
                      <input type="file" ref={agentImageRef} className="hidden" accept="image/*" onChange={handleAgentImageUpload} />
                      <button type="button" onClick={() => agentImageRef.current?.click()} className="w-full mt-3 bg-white border border-slate-300 text-slate-600 py-2 text-[10px] font-bold uppercase">Upload Photo</button>
                  </div>

                  <div className="flex-grow space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Name</label>
                        <input type="text" value={formData.listing_agent?.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, listing_agent: { ...prev.listing_agent, name: e.target.value } }))} className="w-full border p-3 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</label>
                        <input type="text" value={formData.listing_agent?.phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, listing_agent: { ...prev.listing_agent, phone: e.target.value } }))} className="w-full border p-3 text-sm focus:outline-none" />
                      </div>
                  </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100"><h3 className="font-serif text-xl text-forge-navy">Company Info</h3></div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Mail size={14} /> Email</label>
                <input type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Phone size={14} /> Phone</label>
                <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><MapPin size={14} /> Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={3} className="w-full bg-slate-50 border p-4 text-sm resize-none" />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button type="submit" disabled={isSaving} className="bg-forge-navy text-white px-8 py-4 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
