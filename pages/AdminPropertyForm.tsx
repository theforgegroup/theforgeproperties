
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Upload, Image as ImageIcon, Loader2, Link as LinkIcon, AlertCircle, FolderOpen
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Property, PropertyType, ListingStatus } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminPropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty, addProperty, updateProperty } = useProperties();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Property>({
    id: '',
    slug: '',
    title: '',
    description: '',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area_sq_ft: 0, // snake_case
    type: PropertyType.VILLA,
    status: ListingStatus.FOR_SALE,
    images: [],
    features: [],
    agent: {
      name: 'The Forge Properties',
      image: '',
      phone: '+234 800 FORGE 00'
    },
    featured: false
  });

  const [featuresInput, setFeaturesInput] = useState('');

  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  };

  useEffect(() => {
    if (isEditing && id) {
      const property = getProperty(id);
      if (property) {
        setFormData(property);
        setFeaturesInput(property.features.join(', '));
      }
    } else if (!isEditing) {
      setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [id, isEditing, getProperty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
      };
      if (name === 'title' && (!prev.slug || prev.slug === slugify(prev.title))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (isEditing) await updateProperty(formData);
      else await addProperty(formData);
      setTimeout(() => navigate('/admin'), 1000);
    } catch (err) {
      setError("Failed to save property. Verify database columns.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-3xl font-serif text-forge-navy">{isEditing ? 'Edit Property' : 'Add Property'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="bg-white rounded shadow-xl border-t-4 border-forge-gold overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Property Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none rounded-sm" placeholder="e.g. Luxury Villa" required />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                <LinkIcon size={14} className="text-forge-gold" />
                <span className="font-mono text-xs">/listings/</span>
                <input type="text" name="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: slugify(e.target.value)})} className="flex-grow bg-white border border-slate-200 px-2 py-1 rounded font-mono text-xs focus:border-forge-gold focus:outline-none" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Price (₦)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Beds</label>
                  <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Baths</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sq Ft</label>
                  <input type="number" name="area_sq_ft" value={formData.area_sq_ft} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100 gap-4">
              <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-forge-navy text-white font-bold uppercase tracking-widest text-xs hover:bg-forge-dark shadow-lg flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {isEditing ? 'Update Listing' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
