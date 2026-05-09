
import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, Upload, Loader2, MapPin, Globe, Info
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { extractErrorMessage } from '../utils/errorUtils';
import { Neighborhood } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminNeighborhoods: React.FC = () => {
  const { neighborhoods, addNeighborhood, updateNeighborhood, deleteNeighborhood } = useProperties();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Neighborhood>>({
    name: '',
    image: '',
    description: '',
    slug: ''
  });

  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: slugify(name)
    }));
  };

  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setError('');
      try {
        const base64String = await resizeImage(file, 800, 600);
        const { dataURLtoBlob } = await import('../utils/imageUtils');
        const { uploadImage } = await import('../lib/supabaseClient');
        const blob = dataURLtoBlob(base64String);
        const fileName = `neighborhood-${Date.now()}.${file.name.split('.').pop()}`;
        const publicUrl = await uploadImage('neighborhood-images', fileName, blob);
        setFormData(prev => ({ ...prev, image: publicUrl }));
      } catch (err: unknown) {
        console.error('Image upload error:', err);
        setError(`Image upload failed: ${extractErrorMessage(err)}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.image) return;
    setIsSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateNeighborhood({ ...formData, id: editingId } as Neighborhood);
      } else {
        const newNeighborhood = {
          ...formData,
          id: Date.now().toString()
        } as Neighborhood;
        await addNeighborhood(newNeighborhood);
      }
      resetForm();
    } catch (err: unknown) {
      console.error('Neighborhood save error:', err);
      setError(`Failed to save neighborhood: ${extractErrorMessage(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (neighborhood: Neighborhood) => {
    setFormData(neighborhood);
    setEditingId(neighborhood.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this neighborhood?')) {
      setError('');
      try {
        await deleteNeighborhood(id);
      } catch (err: unknown) {
        console.error('Neighborhood delete error:', err);
        setError(`Failed to delete neighborhood: ${extractErrorMessage(err)}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', image: '', description: '', slug: '' });
    setEditingId(null);
    setIsAdding(false);
    setError('');
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif text-forge-navy font-bold">Neighborhood Management</h1>
            <p className="text-slate-500 text-sm">Manage the locations displayed on the homepage.</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-forge-navy text-white px-6 py-3 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-forge-dark transition-all shadow-lg"
            >
              <Plus size={14} /> Add Neighborhood
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm border border-red-200 flex items-center gap-2">
            <Info size={16} className="shrink-0" /> {error}
          </div>
        )}

        {isAdding && (
          <div className="bg-white rounded-sm shadow-xl border-t-4 border-forge-gold mb-12 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-2xl text-forge-navy font-bold">
                  {editingId ? 'Edit Neighborhood' : 'New Neighborhood'}
                </h2>
                <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Neighborhood Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none"
                      placeholder="e.g. Maitama, Abuja"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Slug (URL Path)</label>
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 p-3 rounded border border-slate-200">
                      <Globe size={14} />
                      <span>/locations/</span>
                      <input 
                        type="text" 
                        value={formData.slug} 
                        onChange={(e) => setFormData({...formData, slug: slugify(e.target.value)})}
                        className="flex-grow bg-transparent border-none p-0 focus:ring-0 text-forge-navy font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Short Description</label>
                    <textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none resize-none"
                      placeholder="Briefly describe the area..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Featured Image</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden relative group"
                    >
                      {formData.image ? (
                        <>
                          <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-forge-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload size={24} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2">
                          {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                          <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 flex items-start gap-3">
                    <Info size={16} className="text-forge-gold shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider">
                      This image will be used as the background for the neighborhood card on the homepage. High-quality landscape images work best.
                    </p>
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
                  disabled={isSaving || !formData.name || !formData.image}
                  className="px-10 py-4 bg-forge-navy text-white font-bold uppercase tracking-widest text-[10px] hover:bg-forge-dark transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingId ? 'Update Neighborhood' : 'Save Neighborhood'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {neighborhoods.map((neighborhood) => (
            <div key={neighborhood.id} className="bg-white rounded-sm shadow-lg overflow-hidden border border-slate-100 group">
              <div className="aspect-video relative overflow-hidden">
                <img src={neighborhood.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={neighborhood.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-forge-navy/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-serif text-xl font-bold">{neighborhood.name}</h3>
                  <div className="flex items-center gap-1 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    <MapPin size={10} /> {neighborhood.slug}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                  {neighborhood.description || 'No description provided.'}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => handleEdit(neighborhood)}
                    className="text-forge-navy hover:text-forge-gold transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(neighborhood.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {neighborhoods.length === 0 && !isAdding && (
            <div className="col-span-full py-20 bg-slate-50 rounded-sm border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <MapPin size={48} className="mb-4 opacity-20" />
              <p className="font-serif italic text-lg">No neighborhoods listed yet.</p>
              <button onClick={() => setIsAdding(true)} className="mt-4 text-forge-navy font-bold uppercase tracking-widest text-[10px] underline">Add your first location</button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
