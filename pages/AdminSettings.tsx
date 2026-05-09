import React, { useState, useEffect } from 'react';
/* Added Landmark to imports */
import { Save, Mail, Phone, MapPin, Upload, Loader2, Database, MessageCircle, Landmark, BadgeCheck, Trash2, Plus, X, User } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SiteSettings } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, seedDatabase } = useProperties();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
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
      console.log('Attempting to save settings:', formData);
      await updateSettings(formData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsError(false);
      setMessage('Settings updated successfully!');
      // Keep message visible longer for user to see
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      console.error('Form submission error:', err);
      const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setIsError(true);
      setMessage(`Save failed: ${errorMsg}`);
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

  const handleAddTeamMember = () => {
    setFormData({
      ...formData,
      team_members: [...(formData.team_members || []), { name: '', role: '', image: '' }]
    });
  };

  const handleRemoveTeamMember = (index: number) => {
    const newTeam = [...formData.team_members];
    newTeam.splice(index, 1);
    setFormData({ ...formData, team_members: newTeam });
  };

  const handleUpdateTeamMember = (index: number, field: string, value: string) => {
    const newTeam = [...formData.team_members];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setFormData({ ...formData, team_members: newTeam });
  };

  const handleTeamMemberImageUpload = async (index: number, file: File) => {
    setIsSaving(true);
    setMessage('');
    try {
      const base64String = await resizeImage(file, 400, 400);
      const { dataURLtoBlob } = await import('../utils/imageUtils');
      const { uploadImage } = await import('../lib/supabaseClient');
      const blob = dataURLtoBlob(base64String);
      const fileName = `team-${Date.now()}-${index}.${file.name.split('.').pop()}`;
      const publicUrl = await uploadImage('site-assets', fileName, blob);
      handleUpdateTeamMember(index, 'image', publicUrl);
    } catch (err: any) {
      console.error('Team member image upload error:', err);
      const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setMessage(`Team member image upload failed: ${errorMsg}`);
    } finally {
      setIsSaving(false);
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
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold border flex items-center gap-2 ${
            isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
          }`}>
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
                    disabled={isSaving}
                    className="bg-white border border-slate-200 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload Logo
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
                        setIsSaving(true);
                        setMessage('');
                        try {
                          const base64String = await resizeImage(file, 400, 400);
                          const { dataURLtoBlob } = await import('../utils/imageUtils');
                          const { uploadImage } = await import('../lib/supabaseClient');
                          const blob = dataURLtoBlob(base64String);
                          const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;
                          const publicUrl = await uploadImage('site-assets', fileName, blob);
                          setFormData({...formData, logo: publicUrl});
                        } catch (err: any) {
                          console.error('Logo upload error:', err);
                          const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
                          setMessage(`Logo upload failed: ${errorMsg}`);
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Meet The Team Section */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 flex justify-between items-end">
                <div>
                  <h3 className="font-serif text-xl text-forge-navy font-bold mb-1">Meet The Team</h3>
                  <p className="text-slate-500 text-sm">Manage your company's leadership and team members.</p>
                </div>
                <button 
                  type="button"
                  onClick={handleAddTeamMember}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-forge-navy text-white px-4 py-2 hover:bg-forge-dark transition-colors"
                >
                  <Plus size={14} /> Add Member
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {formData.team_members?.map((member, index) => (
                  <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                    <button 
                      type="button"
                      onClick={() => handleRemoveTeamMember(index)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all z-10"
                    >
                      <X size={14} />
                    </button>
                    
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative group/img shrink-0">
                        {member.image ? (
                          <>
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => handleUpdateTeamMember(index, 'image', '')}
                              className="absolute inset-0 bg-forge-navy/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="text-slate-300 flex flex-col items-center gap-1">
                            <User size={24} />
                            <button 
                              type="button"
                              onClick={() => document.getElementById(`team-upload-${index}`)?.click()}
                              className="text-[8px] font-bold uppercase tracking-tight text-forge-gold hover:underline"
                            >
                              Upload
                            </button>
                          </div>
                        )}
                        <input 
                          id={`team-upload-${index}`}
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleTeamMemberImageUpload(index, file);
                          }} 
                        />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                          <input 
                            type="text" 
                            value={member.name} 
                            onChange={(e) => handleUpdateTeamMember(index, 'name', e.target.value)}
                            className="w-full bg-white border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none"
                            placeholder="e.g. Daniel Paul"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Role / Position</label>
                          <input 
                            type="text" 
                            value={member.role} 
                            onChange={(e) => handleUpdateTeamMember(index, 'role', e.target.value)}
                            className="w-full bg-white border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none"
                            placeholder="e.g. Co-Founder"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {(!formData.team_members || formData.team_members.length === 0) && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm italic">No team members added yet.</p>
                </div>
              )}
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
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Mail size={14} /> Primary Contact Email</label>
                  <input type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"><Mail size={14} /> Secondary Contact Email</label>
                  <input type="email" value={formData.contact_email_2 || ''} onChange={(e) => setFormData({...formData, contact_email_2: e.target.value})} className="w-full bg-slate-50 border p-4 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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