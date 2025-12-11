
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { BlogPost } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { RichTextEditor } from '../components/RichTextEditor';
import { resizeImage } from '../utils/imageUtils';

export const AdminPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addPost, updatePost, settings } = useProperties();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    author: settings.teamMembers[0]?.name || 'Admin',
    date: new Date().toISOString(),
    category: 'Market Insights',
    status: 'Draft'
  });

  useEffect(() => {
    if (isEditing && id) {
      const post = getPost(id);
      if (post) {
        setFormData(post);
      }
    } else if (!isEditing) {
      setFormData(prev => prev.id ? prev : ({ ...prev, id: Date.now().toString() }));
    }
  }, [id, isEditing, getPost]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await resizeImage(file);
        setFormData(prev => ({ ...prev, coverImage: base64String }));
      } catch (err) {
        setError("Failed to process image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing) {
        await updatePost(formData);
      } else {
        await addPost(formData);
      }
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin/blog');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Failed to save post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate('/admin/blog')}
              className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Blog
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
           {/* Main Content Area */}
           <div className="flex-1 space-y-6">
              <div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b-2 border-slate-200 py-4 text-3xl md:text-4xl font-serif font-bold text-forge-navy focus:border-forge-gold focus:outline-none placeholder-slate-300 transition-colors"
                  placeholder="Enter Title Here"
                  required
                />
              </div>

              <div>
                <RichTextEditor value={formData.content} onChange={handleContentChange} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Short Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                  placeholder="A brief summary for the preview card..."
                />
              </div>
           </div>

           {/* Sidebar Options */}
           <div className="w-full lg:w-80 space-y-6">
              {/* Status & Publish */}
              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Publish</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-2 text-sm rounded bg-slate-50"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-2 text-sm rounded bg-slate-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className={`w-full py-3 font-bold uppercase tracking-widest text-xs transition-all rounded-sm flex items-center justify-center gap-2 mt-4 ${
                      isSuccess 
                        ? 'bg-green-600 text-white' 
                        : 'bg-forge-navy text-white hover:bg-forge-dark'
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isSuccess ? (
                      <CheckCircle size={16} />
                    ) : (
                      <>
                        <Save size={16} /> {isEditing ? 'Update' : 'Publish'}
                      </>
                    )}
                  </button>
                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Featured Image</h3>
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video bg-slate-100 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-forge-gold overflow-hidden relative"
                 >
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-slate-400 mb-2" />
                        <span className="text-xs text-slate-400">Click to Upload</span>
                      </>
                    )}
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload} 
                  />
                  {formData.coverImage && (
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, coverImage: ''}))}
                      className="text-red-500 text-xs mt-2 underline"
                    >
                      Remove Image
                    </button>
                  )}
              </div>

              {/* Category */}
              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Category</h3>
                 <div className="space-y-2">
                    {['Market Insights', 'Luxury Lifestyle', 'Company News', 'Investment'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="category"
                          value={cat}
                          checked={formData.category === cat}
                          onChange={handleChange}
                          className="text-forge-gold focus:ring-forge-gold"
                        />
                        <span className="text-sm text-slate-700">{cat}</span>
                      </label>
                    ))}
                 </div>
              </div>

           </div>
        </form>
      </div>
    </AdminLayout>
  );
};
