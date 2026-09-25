import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Upload, Loader2, Link as LinkIcon, AlertCircle, CheckCircle, Info, MapPin, FileCheck2, Layers
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { extractErrorMessage } from '../utils/errorUtils';
import { Property, PropertyType, ListingStatus } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage, dataURLtoBlob } from '../utils/imageUtils';
import { uploadImage } from '../lib/supabaseClient';

export const AdminPropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty, addProperty, updateProperty, settings, isLoading } = useProperties();
  const isEditing = !!id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Property>({
    id: '',
    slug: '',
    title: '',
    description: '',
    price: 900000,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area_sq_ft: 150,
    type: PropertyType.LAND,
    status: ListingStatus.FOR_SALE,
    images: [],
    features: [],
    agent: {
      name: settings?.listing_agent?.name || 'The Forge Properties',
      image: settings?.listing_agent?.image || '',
      phone: settings?.listing_agent?.phone || '+234 810 613 3572'
    },
    featured: false,
    show_on_homepage: false,
    developer: 'Geofort Africa',
    plot_sizes: ['150 SQM', '300 SQM', '500 SQM'],
    documentation: 'Deed of Assignment + Registered Survey Plan',
    status_badge: 'Available Now',
    map_url: 'Kobape, Abeokuta, Ogun State',
    price_options: [
      { size: '150 SQM', price: 900000, formattedPrice: '₦900,000' },
      { size: '300 SQM', price: 1800000, formattedPrice: '₦1,800,000' },
      { size: '500 SQM', price: 3000000, formattedPrice: '₦3,000,000' }
    ]
  });

  const [featuresInput, setFeaturesInput] = useState('Perimeter Fencing, Secure Gate House, Paved Access Roads, Engineered Drainage, Recreational Centre, Gardening Spaces');
  const [plotSizesInput, setPlotSizesInput] = useState('150 SQM, 300 SQM, 500 SQM');
  const [price150, setPrice150] = useState<number>(900000);
  const [price300, setPrice300] = useState<number>(1800000);
  const [price500, setPrice500] = useState<number>(3000000);

  const slugify = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  useEffect(() => {
    if (!isLoading) {
      if (isEditing && id) {
        const property = getProperty(id);
        if (property) {
          setFormData(property);
          setFeaturesInput(property.features ? property.features.join(', ') : '');
          setPlotSizesInput(property.plot_sizes ? property.plot_sizes.join(', ') : '150 SQM, 300 SQM, 500 SQM');
          
          if (property.price_options && property.price_options.length > 0) {
            const opt150 = property.price_options.find(p => p.size.includes('150'));
            const opt300 = property.price_options.find(p => p.size.includes('300'));
            const opt500 = property.price_options.find(p => p.size.includes('500'));
            if (opt150) setPrice150(opt150.price);
            if (opt300) setPrice300(opt300.price);
            if (opt500) setPrice500(opt500.price);
          } else if (property.price) {
            setPrice150(property.price);
            setPrice300(property.price * 2);
            setPrice500(property.price * 3.33);
          }
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
            phone: settings?.listing_agent?.phone || '+234 810 613 3572'
          }
        }));
      }
    }
  }, [id, isEditing, getProperty, isLoading, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      if (name === 'title' && (!prev.slug || prev.slug === slugify(prev.title))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    const newImageUrls: string[] = [...formData.images];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const resizedBase64 = await resizeImage(files[i]);
        const blob = dataURLtoBlob(resizedBase64);
        const fileName = `${Date.now()}-${files[i].name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        const publicUrl = await uploadImage('property-images', fileName, blob);
        newImageUrls.push(publicUrl);
      }
      setFormData({ ...formData, images: newImageUrls });
    } catch (err: unknown) {
      console.error('Image upload error:', err);
      const errorMsg = extractErrorMessage(err);
      if (errorMsg.includes('Bucket not found')) {
        setError("Storage Error: 'property-images' bucket not found. Please create it in Supabase Storage and set it to PUBLIC.");
      } else {
        setError(`Upload failed: ${errorMsg}`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setIsSubmitting(true);
    setError('');

    const finalFeatures = featuresInput.split(',').map(f => f.trim()).filter(f => f !== '');
    const finalPlotSizes = plotSizesInput.split(',').map(s => s.trim()).filter(s => s !== '');
    
    const calculatedPriceOptions = [
      { size: '150 SQM', price: Number(price150) || 900000, formattedPrice: `₦${Number(price150 || 900000).toLocaleString()}` },
      { size: '300 SQM', price: Number(price300) || 1800000, formattedPrice: `₦${Number(price300 || 1800000).toLocaleString()}` },
      { size: '500 SQM', price: Number(price500) || 3000000, formattedPrice: `₦${Number(price500 || 3000000).toLocaleString()}` }
    ];

    const submissionData: Property = { 
      ...formData, 
      price: Number(formData.price) || Number(price150) || 900000,
      features: finalFeatures.length > 0 ? finalFeatures : [
        'Perimeter Fencing', 
        'Secure Gate House', 
        'Paved Access Roads', 
        'Engineered Drainage', 
        'Recreational Centre', 
        'Gardening Spaces'
      ],
      plot_sizes: finalPlotSizes.length > 0 ? finalPlotSizes : ['150 SQM', '300 SQM', '500 SQM'],
      price_options: calculatedPriceOptions,
      documentation: formData.documentation?.trim() || 'Deed of Assignment + Registered Survey Plan',
      status_badge: formData.status_badge || 'Available Now',
      map_url: formData.map_url?.trim() || 'Kobape, Abeokuta, Ogun State'
    };

    try {
      if (isEditing) await updateProperty(submissionData);
      else await addProperty(submissionData);
      setIsSuccess(true);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err: unknown) {
      console.error('Property save error:', err);
      setError(extractErrorMessage(err, 'Failed to save property.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button 
            onClick={() => navigate('/admin')} 
            className="text-slate-500 hover:text-[#0F172A] transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-[#0F172A] font-display">
            {isEditing ? 'Edit Property Listing' : 'Create New Property Listing'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 text-[#FE4A23] p-6 rounded-[8px] mb-6 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-1">Action Required</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-[12px] shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 md:p-10 space-y-8">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Column 1 */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Property Name / Title *
                    </label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] focus:outline-none text-[#0F172A]" 
                      placeholder="e.g. Prasino Lush Phase 2" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Slug (URL Permalinks) *
                    </label>
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-[#F3F4F6] p-2.5 rounded-[8px] border border-[#E5E7EB]">
                      <LinkIcon size={14} className="text-[#774DFF] shrink-0" />
                      <span className="font-mono text-xs text-slate-400">/listings/</span>
                      <input 
                        type="text" 
                        name="slug" 
                        value={formData.slug} 
                        onChange={(e) => setFormData({...formData, slug: slugify(e.target.value)})} 
                        className="flex-grow bg-white border border-[#E5E7EB] px-2.5 py-1.5 rounded-[6px] font-mono text-xs focus:border-[#774DFF] text-[#0F172A]" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Starting Price (₦) *
                      </label>
                      <input 
                        type="number" 
                        name="price" 
                        value={formData.price || ''} 
                        onChange={handleChange} 
                        className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                        placeholder="900000"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                        Property Status Badge *
                      </label>
                      <select 
                        name="status_badge" 
                        value={formData.status_badge || 'Available Now'} 
                        onChange={handleChange} 
                        className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] font-bold text-[#0F172A]"
                      >
                        <option value="Available Now">Available Now</option>
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Property Location *
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-4 text-[#774DFF]" />
                      <input 
                        type="text" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        className="w-full bg-[#F3F4F6] border border-[#E5E7EB] pl-10 pr-3.5 py-3.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                        placeholder="e.g. Kobape, Abeokuta, Ogun State" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Developer / Partner Name
                    </label>
                    <input 
                      type="text" 
                      name="developer" 
                      value={formData.developer || ''} 
                      onChange={handleChange} 
                      className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                      placeholder="e.g. Geofort Africa" 
                    />
                  </div>

                  {/* 2. Google Maps Location Link or Coordinates */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Google Maps Location Link or Coordinates</span>
                      <span className="text-[11px] text-[#774DFF] font-semibold lowercase">embed & map url</span>
                    </label>
                    <input 
                      type="text" 
                      name="map_url" 
                      value={formData.map_url || ''} 
                      onChange={handleChange} 
                      className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                      placeholder="e.g. Kobape, Abeokuta, Ogun State OR https://maps.google.com/?q=..." 
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Enter coordinates, place name, or a Google Maps share link. For Prasino Lush Phase 2, defaults to Kobape, Abeokuta, Ogun State.
                    </p>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  {/* 2. Property Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Full Property Description *
                    </label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows={6} 
                      className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A] resize-y" 
                      placeholder="Comprehensive property overview detailing location, accessibility, title security, and development features..." 
                      required
                    />
                  </div>

                  {/* 2. Documentation Type or Types */}
                  <div className="p-4 rounded-[10px] bg-[#F3F4F6] border border-[#774DFF]/30 space-y-2">
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                      <FileCheck2 size={16} className="text-[#774DFF]" />
                      <span>Documentation Type or Types (Admin Editable) *</span>
                    </label>
                    <input 
                      type="text" 
                      name="documentation" 
                      value={formData.documentation || ''} 
                      onChange={handleChange} 
                      className="w-full bg-white border border-[#E5E7EB] p-3 text-sm rounded-[8px] focus:border-[#774DFF] font-semibold text-[#0F172A]" 
                      placeholder="e.g. Deed of Assignment + Registered Survey Plan" 
                      required
                    />
                    <p className="text-[11px] text-slate-600">
                      Displayed on all property cards, featured blocks, and details pages. Customize per listing (e.g. "Deed of Assignment + Registered Survey Plan", "Governor's Consent", "Certificate of Occupancy (C of O)").
                    </p>
                  </div>

                  {/* 2. Features List */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Features List (comma-separated tags) *
                    </label>
                    <textarea 
                      value={featuresInput} 
                      onChange={(e) => setFeaturesInput(e.target.value)} 
                      rows={3}
                      className="w-full bg-[#F3F4F6] border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                      placeholder="Perimeter Fencing, Gate House, Paved Roads, Drainage, Recreational Centre, Gardening Spaces" 
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Separate items with commas. Icons automatically map to: fencing, gate house, roads, drainage, recreational centre, gardening, etc.
                    </p>
                  </div>

                  {/* Listing Type & Homepage Toggles */}
                  <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#E5E7EB]">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${formData.featured ? 'bg-[#774DFF]' : 'bg-slate-200'}`}>
                        <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${formData.featured ? 'translate-x-5' : 'translate-x-1'}`}></div>
                      </div>
                      <input type="checkbox" name="featured" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="hidden" />
                      <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Featured</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${formData.show_on_homepage ? 'bg-[#774DFF]' : 'bg-slate-200'}`}>
                        <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${formData.show_on_homepage ? 'translate-x-5' : 'translate-x-1'}`}></div>
                      </div>
                      <input type="checkbox" name="show_on_homepage" checked={formData.show_on_homepage} onChange={(e) => setFormData({...formData, show_on_homepage: e.target.checked})} className="hidden" />
                      <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Show on Homepage</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* 2. Plot Sizes & Prices Section */}
              <div className="p-6 rounded-[12px] bg-[#F3F4F6] border border-[#E5E7EB] space-y-6">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-[#774DFF]" />
                  <h3 className="text-lg font-bold text-[#0F172A] font-display">
                    Plot Sizes & Pricing Breakdown
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                      Available Plot Sizes (comma-separated tags)
                    </label>
                    <input 
                      type="text" 
                      value={plotSizesInput} 
                      onChange={(e) => setPlotSizesInput(e.target.value)} 
                      className="w-full bg-white border border-[#E5E7EB] p-3.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                      placeholder="150 SQM, 300 SQM, 500 SQM" 
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Rendered as badges on property cards and tables.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] uppercase mb-1">
                        150 SQM (₦)
                      </label>
                      <input 
                        type="number" 
                        value={price150} 
                        onChange={(e) => setPrice150(Number(e.target.value))} 
                        className="w-full bg-white border border-[#E5E7EB] p-2.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                        placeholder="900000"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] uppercase mb-1">
                        300 SQM (₦)
                      </label>
                      <input 
                        type="number" 
                        value={price300} 
                        onChange={(e) => setPrice300(Number(e.target.value))} 
                        className="w-full bg-white border border-[#E5E7EB] p-2.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                        placeholder="1800000"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] uppercase mb-1">
                        500 SQM (₦)
                      </label>
                      <input 
                        type="number" 
                        value={price500} 
                        onChange={(e) => setPrice500(Number(e.target.value))} 
                        className="w-full bg-white border border-[#E5E7EB] p-2.5 text-sm rounded-[8px] focus:border-[#774DFF] text-[#0F172A]" 
                        placeholder="3000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Property Image Gallery */}
          <div className="bg-white rounded-[12px] shadow-sm p-6 md:p-10 border border-[#E5E7EB]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-[#0F172A] mb-1">Property Gallery</h3>
                <p className="text-slate-500 text-xs">High-resolution images for hero display and thumbnails.</p>
              </div>
              <button 
                type="button" 
                disabled={isUploading} 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 bg-[#774DFF] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-[8px] hover:bg-[#683de6] transition-all disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Add Images
              </button>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="aspect-square relative group rounded-[8px] overflow-hidden border border-[#E5E7EB]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#0F172A]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)} 
                      className="bg-white text-[#FE4A23] p-2 rounded-full hover:bg-[#FE4A23] hover:text-white transition-all shadow-md"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
            <div className="text-slate-500 text-xs italic flex items-center gap-1.5">
              <Info size={14} className="text-[#774DFF]" /> All changes sync instantly with live property cards and details pages.
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                type="button" 
                onClick={() => navigate('/admin')} 
                className="flex-1 md:flex-none px-8 py-3.5 bg-transparent border border-[#774DFF] text-[#774DFF] hover:bg-[#774DFF] hover:text-white rounded-[8px] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || isUploading || isSuccess} 
                className="flex-1 md:flex-none px-10 py-3.5 bg-[#774DFF] hover:bg-[#683de6] text-white rounded-[8px] font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isSuccess ? <CheckCircle size={16} /> : <Save size={16} />)}
                {isSubmitting ? 'Saving...' : (isSuccess ? 'Saved Successfully' : 'Publish Property')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
