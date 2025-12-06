import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Upload, Image as ImageIcon, Loader2, CheckCircle, FolderOpen, AlertCircle
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Property>({
    id: '',
    title: '',
    description: '',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    areaSqFt: 0,
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
  const [newImageUrl, setNewImageUrl] = useState('');

  // Load property data if editing
  useEffect(() => {
    if (isEditing && id) {
      const property = getProperty(id);
      if (property) {
        setFormData(property);
        setFeaturesInput(property.features.join(', '));
      }
    } else if (!isEditing) {
      // Generate ID for new properties if missing
      setFormData(prev => prev.id ? prev : ({ ...prev, id: Date.now().toString() }));
    }
  }, [id, isEditing, getProperty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, featured: e.target.checked }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeaturesInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      features: e.target.value.split(',').map(f => f.trim()).filter(f => f !== '')
    }));
  };

  // Add image from URL
  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl]
      }));
      setNewImageUrl('');
    }
  };

  // Handle file upload with Compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await resizeImage(file);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64String]
        }));
      } catch (err) {
        console.error("Image processing error", err);
        setError("Failed to process image. Try a smaller file.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing) {
        await updateProperty(formData);
      } else {
        await addProperty(formData);
      }
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to save property. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-serif text-forge-navy">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 shadow-sm animate-fade-in flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded shadow-xl border-t-4 border-forge-gold overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">

            {/* Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                  placeholder="e.g. Luxury Villa in Banana Island"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Price (₦)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Property Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm appearance-none"
                  >
                    {Object.values(PropertyType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm appearance-none"
                  >
                    {Object.values(ListingStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                />
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Area (Sq Ft)</label>
                <input
                  type="number"
                  name="areaSqFt"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                />
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 text-forge-gold border-gray-300 rounded focus:ring-forge-gold"
                  />
                  <span className="text-sm font-bold text-forge-navy">Mark as Featured</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm resize-y"
                placeholder="Detailed property description..."
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Features (Comma Separated)</label>
              <textarea
                value={featuresInput}
                onChange={handleFeaturesChange}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm resize-none"
                placeholder="e.g. Swimming Pool, Cinema Room, Smart Home, Garden"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Images</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                  placeholder="Paste URL or click upload..."
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 text-slate-600 px-4 border border-slate-200 hover:bg-slate-200 transition-colors rounded-sm"
                  title="Upload from computer"
                >
                  <FolderOpen size={18} />
                </button>
                <button 
                  type="button" 
                  onClick={addImageUrl}
                  className="bg-slate-200 text-slate-600 px-6 font-bold uppercase text-xs tracking-wider hover:bg-slate-300 transition-colors rounded-sm flex items-center gap-2"
                >
                  <Upload size={16} /> Add URL
                </button>
              </div>

              {/* Image Previews */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-video bg-slate-100 rounded overflow-hidden border border-slate-200">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="col-span-2 md:col-span-4 h-32 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-forge-gold transition-all"
                  >
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs font-medium">No images added yet</span>
                    <span className="text-[10px] uppercase tracking-wider mt-1 text-forge-gold font-bold">Click to Upload</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 border-t border-slate-100 gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-8 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`px-8 py-4 font-bold uppercase tracking-widest text-xs shadow-lg transition-all rounded-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                  isSuccess 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-forge-navy text-white hover:bg-forge-dark'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle size={16} /> Saved Successfully!
                  </>
                ) : (
                  <>
                    <Save size={16} /> {isEditing ? 'Update Property' : 'Create Listing'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
};