
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Upload, Image as ImageIcon, Loader2, Link as LinkIcon, AlertCircle, CheckCircle, Plus
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Property, PropertyType, ListingStatus } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminPropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty, addProperty, updateProperty, settings, isLoading } = useProperties();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const agentFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Property>({
    id: '',
    slug: '',
    title: '',
    description: '',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area_sq_ft: 0,
    type: PropertyType.VILLA,
    status: ListingStatus.FOR_SALE,
    images: [],
    features: [],
    agent: {
      name: settings?.listing_agent?.name || 'The Forge Properties',
      image: settings?.listing_agent?.image || '',
      phone: settings?.listing_agent?.phone || '+234 800 FORGE 00'
    },
    featured: false
  });

  const [featuresInput, setFeaturesInput] = useState('');

  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w-]+/g, '')       // Remove all non-word chars
      .replace(/--+/g, '-')          // Replace multiple - with single -
      .replace(/^-+/, '')            // Trim - from start of text
      .replace(/-+$/, '');           // Trim - from end of text
  };

  useEffect(() => {
    if (!isLoading) {
      if (isEditing && id) {
        const property = getProperty(id);
        if (property) {
          setFormData(property);
          setFeaturesInput(property.features.join(', '));
        } else {
          setError("Property not found.");
        }
      } else if (!isEditing) {
        setFormData(prev => ({ 
          ...prev, 
          id: Date.now().toString(),
          agent: {
            name: settings?.listing_agent?.name || 'The Forge Properties',
            image: settings?.listing_agent?.image || '',
            phone: settings?.listing_agent?.phone || '+234 800 FORGE 00'
          }
        }));
      }
    }
  }, [id, isEditing, getProperty, isLoading, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      // Auto-update slug if it hasn't been manually tampered with or is currently matching the slugified old title
      if (name === 'title' && (!prev.slug || prev.slug === slugify(prev.title))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [...formData.images];
      for (let i = 0; i < files.length; i++) {
        try {
          const base64 = await resizeImage(files[i]);
          newImages.push(base64);
        } catch (err) {
          console.error("Image resize error", err);
        }
      }
      setFormData({ ...formData, images: newImages });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleAgentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await resizeImage(file, 200, 200);
        setFormData({ ...formData, agent: { ...formData.agent, image: base64 } });
      } catch (err) {
        console.error("Agent image error", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const finalFeatures = featuresInput.split(',').map(f => f.trim()).filter(f => f !== '');
    const submissionData = { ...formData, features: finalFeatures };

    try {
      if (isEditing) {
        await updateProperty(submissionData);
      } else {
        await addProperty(submissionData);
      }
      setIsSuccess(true);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save property. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="font-serif italic">Loading Listing Archives...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-serif text-forge-navy font-bold">{isEditing ? 'Modify Residence' : 'Forge New Listing'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Details Section */}
          <div className="bg-white rounded-sm shadow-xl border-t-4 border-forge-gold overflow-hidden">
            <div className="p-8 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Property Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors" placeholder="e.g. Diplomatic Zone Mansion" required />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Permalinks Slug</label>
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 p-3 rounded-sm border border-slate-200">
                      <LinkIcon size={14} className="text-forge-gold" />
                      <span className="font-mono text-xs">/listings/</span>
                      <input type="text" name="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: slugify(e.target.value)})} className="flex-grow bg-white border border-slate-200 px-2 py-1 rounded font-mono text-xs focus:border-forge-gold focus:outline-none" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Price (₦)</label>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Property Type</label>
                      <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none appearance-none">
                        {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Location / Address</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none" placeholder="e.g. Maitama, Abuja" required />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none resize-none" placeholder="Detailed description of the residence..." required></textarea>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bedrooms</label>
                      <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bathrooms</label>
                      <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Area (Sq Ft)</label>
                      <input type="number" name="area_sq_ft" value={formData.area_sq_ft} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${formData.featured ? 'bg-forge-gold' : 'bg-slate-200'}`}>
                        <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${formData.featured ? 'translate-x-5' : 'translate-x-1'}`}></div>
                      </div>
                      <input type="checkbox" name="featured" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="hidden" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-forge-navy transition-colors">Featured Listing</span>
                    </label>

                    <div className="flex-grow">
                      <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-bold uppercase tracking-widest focus:border-forge-gold focus:outline-none">
                        {Object.values(ListingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Features (Comma-separated)</label>
                <input type="text" value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none" placeholder="e.g. Cinema, Swimming Pool, Penthouse Suite, Smart Home Tech" />
              </div>
            </div>
          </div>

          {/* Gallery Management */}
          <div className="bg-white rounded-sm shadow-xl p-8 md:p-12 border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-xl text-forge-navy mb-1">Property Gallery</h3>
                <p className="text-slate-400 text-xs">Upload high-quality images of the residence.</p>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-forge-navy hover:text-white transition-all">
                <Upload size={14} /> Add Images
              </button>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="aspect-square relative group rounded-sm overflow-hidden border border-slate-200">
                  <img src={img} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-forge-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeImage(idx)} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg">
                      <X size={16} />
                    </button>
                  </div>
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 bg-forge-gold text-forge-navy text-[8px] font-bold px-2 py-0.5 uppercase tracking-tighter">Cover</div>
                  )}
                </div>
              ))}
              {formData.images.length === 0 && (
                <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-forge-gold hover:text-forge-gold transition-all rounded-sm">
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Upload Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Specific Agent override for this property */}
          <div className="bg-white rounded-sm shadow-xl p-8 md:p-12 border-t border-slate-100">
            <h3 className="font-serif text-xl text-forge-navy mb-6">Listing Agent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-100 mb-4 group relative">
                  {formData.agent.image ? (
                    <img src={formData.agent.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">NA</div>
                  )}
                  <div onClick={() => agentFileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[8px] font-bold uppercase">Change</div>
                </div>
                <input type="file" ref={agentFileInputRef} className="hidden" accept="image/*" onChange={handleAgentImageUpload} />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Agent Name</label>
                  <input type="text" name="agent_name" value={formData.agent.name} onChange={(e) => setFormData({...formData, agent: {...formData.agent, name: e.target.value}})} className="w-full border p-3 text-sm focus:outline-none focus:border-forge-gold" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Agent Phone</label>
                  <input type="text" name="agent_phone" value={formData.agent.phone} onChange={(e) => setFormData({...formData, agent: {...formData.agent, phone: e.target.value}})} className="w-full border p-3 text-sm focus:outline-none focus:border-forge-gold" />
                </div>
              </div>
            </div>
          </div>

          {/* Submission Area */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8">
            <div className="text-slate-400 text-xs italic">
              All listings are reviewed by the corporate compliance team before being forged into the live database.
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button type="button" onClick={() => navigate('/admin')} className="flex-1 md:flex-none px-10 py-5 bg-white border border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-forge-navy transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || isSuccess} className="flex-1 md:flex-none px-12 py-5 bg-forge-navy text-white font-bold uppercase tracking-widest text-xs hover:bg-forge-dark shadow-2xl transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isSuccess ? <CheckCircle size={16} /> : <Save size={16} />)}
                {isSubmitting ? 'Processing...' : (isSuccess ? 'Listing Saved' : (isEditing ? 'Update Residence' : 'Publish to Portfolio'))}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
