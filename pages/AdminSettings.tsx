
import React, { useState, useEffect, useRef } from 'react';
import { Save, Mail, Phone, MapPin, Upload, X, User, Loader2, AlertCircle, BadgeCheck, Plus, Database, Trash2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SiteSettings, TeamMember } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, seedDatabase } = useProperties();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const teamFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
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

  const handleSeed = async () => {
    if (window.confirm("This will restore the original high-end mock listings. Continue?")) {
      setIsSeeding(true);
      await seedDatabase();
      setIsSeeding(false);
    }
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...(formData.team_members || [])];
    if (updatedMembers[index]) {
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      setFormData({ ...formData, team_members: updatedMembers });
    }
  };

  const addMember = () => {
    setFormData({
      ...formData,
      team_members: [...(formData.team_members || []), { name: '', role: '', image: '' }]
    });
  };

  const removeMember = (index: number) => {
    const updatedMembers = [...(formData.team_members || [])];
    updatedMembers.splice(index, 1);
    setFormData({ ...formData, team_members: updatedMembers });
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-forge-navy">Site Configuration</h1>
          <button 
            type="button" 
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-4 py-2 hover:bg-forge-gold hover:text-forge-navy transition-colors border border-slate-200"
          >
            {isSeeding ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
            Seed Original Listings
          </button>
        </div>

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
            
            {/* Agent Profile & Site Icon Section */}
            <div className="space-y-6">
               <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy mb-1">Default Listing Agent & Site Icon</h3>
                 <p className="text-slate-500 text-sm">This image serves as your site favicon and agent profile.</p>
              </div>

              <div className="bg-slate-50 p-6 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 flex-shrink-0 text-center">
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
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Agency Name</label>
                        <input type="text" value={formData.listing_agent?.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, listing_agent: { ...prev.listing_agent, name: e.target.value } }))} className="w-full border p-3 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Global Phone</label>
                        <input type="text" value={formData.listing_agent?.phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, listing_agent: { ...prev.listing_agent, phone: e.target.value } }))} className="w-full border p-3 text-sm focus:outline-none" />
                      </div>
                  </div>
              </div>
            </div>

            {/* Restored Team Members Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-end pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-xl text-forge-navy">Team Leadership</h3>
                  <p className="text-slate-500 text-sm">Manage the founders and executives shown on the About page.</p>
                </div>
                <button type="button" onClick={addMember} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-forge-gold hover:text-forge-navy transition-colors">
                  <Plus size={14} /> Add Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(formData.team_members || []).map((member, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 border border-slate-200 rounded relative group">
                    <button type="button" onClick={() => removeMember(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                         <div className="w-20 h-20 bg-slate-200 overflow-hidden rounded-lg border border-slate-300">
                           {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={20} className="text-slate-400" /></div>}
                         </div>
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(idx, e)} ref={el => teamFileInputRefs.current[idx] = el} />
                         <button type="button" onClick={() => teamFileInputRefs.current[idx]?.click()} className="w-full mt-2 text-[8px] font-bold uppercase text-slate-500 hover:text-forge-gold">Update</button>
                      </div>
                      <div className="flex-grow space-y-3">
                        <input type="text" placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(idx, 'name', e.target.value)} className="w-full border p-2 text-sm bg-white" />
                        <input type="text" placeholder="Role" value={member.role} onChange={(e) => handleMemberChange(idx, 'role', e.target.value)} className="w-full border p-2 text-sm bg-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100"><h3 className="font-serif text-xl text-forge-navy">Company Details</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Mail size={14} /> Email</label>
                  <input type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Phone size={14} /> Phone</label>
                  <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><MapPin size={14} /> Business Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={3} className="w-full bg-slate-50 border p-4 text-sm resize-none" />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button type="submit" disabled={isSaving} className="bg-forge-navy text-white px-10 py-5 font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl hover:bg-forge-dark transition-all">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
