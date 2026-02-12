import React, { useState, useEffect, useRef } from 'react';
/* Added Landmark to imports */
import { Save, Mail, Phone, MapPin, Upload, X, User, Loader2, AlertCircle, BadgeCheck, Plus, Database, Trash2, MessageCircle, Landmark } from 'lucide-react';
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
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

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
      setError('Failed to save settings.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeed = async () => {
    if (window.confirm("Initialize system defaults?")) {
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
          <h1 className="text-3xl font-serif text-forge-navy font-bold">Site Configuration</h1>
          <button 
            type="button" 
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-4 py-2 hover:bg-forge-gold hover:text-forge-navy transition-colors border border-slate-200"
          >
            {isSeeding ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
            Initialize System
          </button>
        </div>

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-bold border border-green-200 flex items-center gap-2">
            <BadgeCheck size={16} /> {message}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            {/* Agent Integration Settings */}
            <div className="space-y-6">
               <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy font-bold mb-1">Agent Network Integration</h3>
                 <p className="text-slate-500 text-sm">Configure referral parameters and community links.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><MessageCircle size={14} /> WhatsApp Group Link</label>
                  <input 
                    type="url" 
                    value={formData.whatsapp_group_link || ''} 
                    onChange={(e) => setFormData({...formData, whatsapp_group_link: e.target.value})} 
                    className="w-full bg-slate-50 border p-4 text-sm focus:border-forge-gold focus:outline-none" 
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Landmark size={14} /> Min Payout (₦)</label>
                  <input 
                    type="number" 
                    value={formData.min_payout_amount || 0} 
                    onChange={(e) => setFormData({...formData, min_payout_amount: parseFloat(e.target.value)})} 
                    className="w-full bg-slate-50 border p-4 text-sm focus:border-forge-gold focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* Standard Settings Restored and Unified... */}
            <div className="space-y-6">
               <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy font-bold mb-1">Company Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Mail size={14} /> Contact Email</label>
                  <input type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Phone size={14} /> Business Phone</label>
                  <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><MapPin size={14} /> Headquarters</label>
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