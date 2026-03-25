import React, { useState, useEffect } from 'react';
/* Added Landmark to imports */
import { Save, Mail, Phone, MapPin, Upload, Loader2, Database, MessageCircle, Landmark, BadgeCheck, Trash2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SiteSettings } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, seedDatabase } = useProperties();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await updateSettings(formData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
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
            
            {/* Logo Upload Section */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="font-serif text-xl text-forge-navy font-bold mb-1">Brand Identity</h3>
                <p className="text-slate-500 text-sm">Upload your company logo. Fallback is text-based logo.</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                  {formData.logo ? (
                    <>
                      <img src={formData.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, logo: ''})}
                        className="absolute inset-0 bg-forge-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center gap-2">
                      <Upload size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Logo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="bg-white border border-slate-200 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Upload size={14} /> Upload Logo
                  </button>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Recommended: PNG or SVG with transparent background.</p>
                  <input 
                    id="logo-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64String = await resizeImage(file, 400, 400);
                          setFormData({...formData, logo: base64String});
                        } catch {
                          // Silent error
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

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

            <div className="flex justify-between items-center pt-6 border-t">
              <button 
                type="button"
                onClick={handleSeed}
                disabled={isSeeding}
                className="text-forge-gold border border-forge-gold px-6 py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-forge-gold hover:text-white transition-all flex items-center gap-2"
              >
                {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} Initialize Demo Data
              </button>
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