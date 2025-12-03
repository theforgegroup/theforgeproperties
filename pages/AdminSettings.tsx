import React, { useState, useEffect } from 'react';
import { Save, Mail, Phone, MapPin } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SiteSettings } from '../types';
import { AdminLayout } from '../components/AdminLayout';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useProperties();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [message, setMessage] = useState('');

  // Sync if settings change externally
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setMessage('Settings updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-serif text-forge-navy mb-8">Site Configuration</h1>

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm font-bold border border-green-200">
            {message}
          </div>
        )}

        <div className="bg-white rounded shadow-xl border-t-4 border-forge-gold overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="pb-6 border-b border-slate-100">
               <h3 className="font-serif text-xl text-forge-navy mb-2">Contact Information</h3>
               <p className="text-slate-500 text-sm">These details are displayed in the website footer and contact page.</p>
            </div>

            <div className="space-y-6">
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

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                className="bg-forge-navy text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-forge-dark shadow-lg transition-all rounded-sm flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};