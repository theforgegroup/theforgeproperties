import React, { useState, useEffect, useRef } from 'react';
import { Save, Mail, Phone, MapPin, Upload, X, User, Loader2, AlertCircle } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SiteSettings, TeamMember } from '../types';
import { AdminLayout } from '../components/AdminLayout';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useProperties();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for file inputs array
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync if settings change externally (e.g. initial load from LocalStorage)
  useEffect(() => {
    // Only update if we don't have a message showing (avoid overwriting while user is working)
    if (!message && !isSaving) {
      setFormData(settings);
    }
  }, [settings, message, isSaving]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 600; // Resize to max 600px width to save space
          const MAX_HEIGHT = 600;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG at 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      updateSettings(formData);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      // Check for quota exceeded error
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setError('Storage full! The images are too large. Please remove some images or use smaller files.');
      } else {
        setError('Failed to save settings. Please try again.');
      }
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

        <div className="bg-white rounded shadow-xl border-t-4 border-forge-gold overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            {/* Contact Info Section */}
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy mb-1">Contact Information</h3>
                 <p className="text-slate-500 text-sm">Update your public contact details.</p>
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