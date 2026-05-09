import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, Upload, Loader2, Star, Quote, CheckCircle2, Database
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Testimonial } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminTestimonials: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial, seedDatabase } = useProperties();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSeed = async () => {
    if (window.confirm('This will add demo testimonials to your database. Continue?')) {
      setIsSeeding(true);
      try {
        await seedDatabase();
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const [formData, setFormData] = useState<Partial<Testimonial>>({
    client_name: '',
    client_photo: '',
    testimonial_text: '',
    rating: 5,
    property_type: 'House',
    show_on_homepage: true,
    is_verified: true
  });

  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setError('');
      try {
        const base64String = await resizeImage(file, 400, 400);
        const { dataURLtoBlob } = await import('../utils/imageUtils');
        const { uploadImage } = await import('../lib/supabaseClient');
        const blob = dataURLtoBlob(base64String);
        const fileName = `client-${Date.now()}.${file.name.split('.').pop()}`;
        const publicUrl = await uploadImage('testimonials', fileName, blob);
        setFormData(prev => ({ ...prev, client_photo: publicUrl }));
      } catch (err: any) {
        console.error('Image upload error:', err);
        const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        setError(`Image upload failed: ${errorMsg}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.client_name || !formData.testimonial_text) return;
    setIsSaving(true);
    setError('');
    try {
      const testimonialData = {
        ...formData,
        id: editingId || Date.now().toString(),
        date: formData.date || new Date().toISOString()
      } as Testimonial;

      if (editingId) {
        await updateTestimonial(testimonialData);
      } else {
        await addTestimonial(testimonialData);
      }
      resetForm();
    } catch (err: any) {
      console.error('Testimonial save error:', err);
      const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setError(`Failed to save testimonial: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData(testimonial);
    setEditingId(testimonial.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setError('');
      try {
        await deleteTestimonial(id);
      } catch (err: any) {
        console.error('Testimonial delete error:', err);
        const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        setError(`Failed to delete testimonial: ${errorMsg}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_photo: '',
      testimonial_text: '',
      rating: 5,
      property_type: 'House',
      show_on_homepage: true,
      is_verified: true
    });
    setEditingId(null);
    setIsAdding(false);
    setError('');
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif text-forge-navy font-bold">Testimonials</h1>
            <p className="text-slate-500 text-sm">Manage client reviews and testimonials.</p>
          </div>
          <div className="flex gap-3">
            {!isAdding && (
              <>
                <button 
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="bg-white text-forge-gold border border-forge-gold px-6 py-3 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-forge-gold hover:text-white transition-all shadow-md"
                >
                  {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} Seed Demo
                </button>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-forge-navy text-white px-6 py-3 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-forge-dark transition-all shadow-lg"
                >
                  <Plus size={14} /> Add Testimonial
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm border border-red-200 flex items-center gap-2">
            <Quote size={16} className="shrink-0" /> {error}
          </div>
        )}

        {isAdding && (
          <div className="bg-white rounded-sm shadow-xl border-t-4 border-forge-gold mb-12 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-2xl text-forge-navy font-bold">
                  {editingId ? 'Edit Testimonial' : 'New Testimonial'}
                </h2>
                <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Client Name</label>
                    <input 
                      type="text" 
                      value={formData.client_name} 
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Rating (1-5)</label>
                      <select 
                        value={formData.rating} 
                        onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none"
                      >
                        {[5, 4, 3, 2, 1].map(num => (
                          <option key={num} value={num}>{num} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Property Type</label>
                      <select 
                        value={formData.property_type} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, property_type: e.target.value as Testimonial['property_type']})}
                        className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none"
                      >
                        <option value="Land">Land</option>
                        <option value="House">House</option>
                        <option value="Investment">Investment</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Testimonial Text</label>
                    <textarea 
                      value={formData.testimonial_text} 
                      onChange={(e) => setFormData({...formData, testimonial_text: e.target.value})}
                      rows={6}
                      className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none resize-none"
                      placeholder="What did the client say?"
                    />
                  </div>
                  <div className="flex gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${formData.show_on_homepage ? 'bg-forge-navy border-forge-navy' : 'border-slate-300 group-hover:border-forge-gold'}`}>
                        {formData.show_on_homepage && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.show_on_homepage} 
                        onChange={(e) => setFormData({...formData, show_on_homepage: e.target.checked})}
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Show on Homepage</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${formData.is_verified ? 'bg-forge-navy border-forge-navy' : 'border-slate-300 group-hover:border-forge-gold'}`}>
                        {formData.is_verified && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.is_verified} 
                        onChange={(e) => setFormData({...formData, is_verified: e.target.checked})}
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Client</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Client Photo (Optional)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square w-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden relative group mx-auto"
                    >
                      {formData.client_photo ? (
                        <>
                          <img src={formData.client_photo} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-forge-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload size={24} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                          {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                          <span className="text-[10px] font-bold uppercase tracking-widest">Upload Photo</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  <div className="bg-slate-50 p-6 rounded-sm border border-slate-200">
                    <h4 className="text-[10px] font-bold text-forge-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Quote size={14} className="text-forge-gold" /> Preview
                    </h4>
                    <div className="bg-white p-6 shadow-sm border border-slate-100 rounded-sm">
                      <div className="flex items-center gap-1 text-forge-gold mb-3">
                        {[...Array(formData.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                      <p className="text-slate-600 text-sm italic mb-4">"{formData.testimonial_text || 'Testimonial text will appear here...'}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                          {formData.client_photo ? <img src={formData.client_photo} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{formData.client_name?.charAt(0) || '?'}</div>}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-forge-navy">{formData.client_name || 'Client Name'}</h5>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{formData.property_type} Buyer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
                <button 
                  onClick={resetForm}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !formData.client_name || !formData.testimonial_text}
                  className="px-10 py-4 bg-forge-navy text-white font-bold uppercase tracking-widest text-[10px] hover:bg-forge-dark transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingId ? 'Update Testimonial' : 'Save Testimonial'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-sm shadow-lg p-8 border border-slate-100 relative group">
              {testimonial.show_on_homepage && (
                <div className="absolute top-4 right-4 bg-forge-gold/10 text-forge-gold text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  Homepage
                </div>
              )}
              <div className="flex items-center gap-1 text-forge-gold mb-4">
                {[...Array(testimonial.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 text-sm italic mb-8 line-clamp-4">"{testimonial.testimonial_text}"</p>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-50">
                  {testimonial.client_photo ? (
                    <img src={testimonial.client_photo} className="w-full h-full object-cover" alt={testimonial.client_name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                      {testimonial.client_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-forge-navy flex items-center gap-2">
                    {testimonial.client_name}
                    {testimonial.is_verified && <CheckCircle2 size={12} className="text-green-500" />}
                  </h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{testimonial.property_type} Client</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <button 
                  onClick={() => handleEdit(testimonial)}
                  className="text-forge-navy hover:text-forge-gold transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(testimonial.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && !isAdding && (
            <div className="col-span-full py-20 bg-slate-50 rounded-sm border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Quote size={48} className="mb-4 opacity-20" />
              <p className="font-serif italic text-lg">No testimonials yet.</p>
              <button onClick={() => setIsAdding(true)} className="mt-4 text-forge-navy font-bold uppercase tracking-widest text-[10px] underline">Add your first testimonial</button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
