
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Image as ImageIcon, Loader2, Link as LinkIcon, 
  AlertCircle, Globe, Settings, FileText
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { BlogPost } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { RichTextEditor } from '../components/RichTextEditor';
import { resizeImage, dataURLtoBlob } from '../utils/imageUtils';
import { uploadImage } from '../lib/supabaseClient';

export const AdminPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addPost, updatePost, isLoading } = useProperties();
  const isEditing = !!id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories] = useState(['Market Insights', 'Luxury Lifestyle', 'Company News', 'Investment']);

  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author: 'The Forge Properties',
    date: new Date().toISOString(),
    category: 'Market Insights',
    status: 'Draft',
    meta_description: '',
    keyphrase: ''
  });

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
        const post = getPost(id);
        if (post) {
          setFormData(post);
          setDataLoaded(true);
        } else {
          setError("Post not found.");
        }
      } else {
        setFormData({
          id: Date.now().toString(), slug: '', title: '', excerpt: '', content: '',
          cover_image: '', author: 'The Forge Properties', date: new Date().toISOString(),
          category: 'Market Insights', status: 'Draft', meta_description: '', keyphrase: ''
        });
        setDataLoaded(true);
      }
    }
  }, [id, isEditing, getPost, isLoading]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: (!prev.slug || prev.slug === slugify(prev.title)) ? slugify(newTitle) : prev.slug
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    try {
      const resizedBase64 = await resizeImage(file, 1200, 630);
      const blob = dataURLtoBlob(resizedBase64);
      const fileName = `blog-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const publicUrl = await uploadImage('blog-images', fileName, blob);
      setFormData({ ...formData, cover_image: publicUrl });
    } catch (err: any) {
      setError(`Upload failed: ${err.message}. If permissions persist, run the RLS SQL fix.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent, statusOverride?: 'Published' | 'Draft') => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Article title is required.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    const submissionData = { 
      ...formData, 
      status: statusOverride || formData.status,
      slug: formData.slug || slugify(formData.title)
    };

    try {
      if (isEditing) await updatePost(submissionData);
      else await addPost(submissionData);
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/blog'), 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (isEditing && !dataLoaded)) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 size={32} className="animate-spin text-forge-gold mb-4" />
          <p className="font-serif italic text-slate-400">Loading Article...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-forge-navy">
            {isEditing ? 'Edit Post' : 'Add New Post'}
          </h1>
          <button onClick={() => navigate('/admin/blog')} className="text-slate-400 hover:text-forge-navy flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Blog List
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={(e) => handleSave(e)} className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area (WordPress Left Column) */}
          <div className="flex-1 space-y-6">
            <input 
              type="text" 
              value={formData.title} 
              onChange={handleTitleChange} 
              placeholder="Enter title here"
              className="w-full bg-white border border-slate-200 p-4 text-2xl font-serif font-bold focus:border-forge-gold focus:outline-none shadow-sm"
              required
            />
            
            <div className="bg-white border border-slate-200 shadow-sm">
              <RichTextEditor value={formData.content} onChange={(content) => setFormData({...formData, content})} />
            </div>

            <div className="bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-forge-navy uppercase tracking-widest mb-4">Excerpt</h3>
              <textarea 
                value={formData.excerpt} 
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})} 
                rows={4} 
                className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none"
                placeholder="Write a brief summary for the blog list page..."
              />
            </div>
          </div>

          {/* Sidebar Area (WordPress Right Column) */}
          <div className="w-full lg:w-80 space-y-6">
            
            {/* Publish Box */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Publish</span>
                <Settings size={14} className="text-slate-400" />
              </div>
              <div className="p-4 space-y-4">
                <div className="text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe size={14} /> Status: <span className="font-bold text-forge-navy">{formData.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={14} /> Visibility: <span className="font-bold text-forge-navy">Public</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={(e) => handleSave(e, 'Draft')}
                    disabled={isSubmitting || isSuccess}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Save Draft
                  </button>
                  <button 
                    type="button"
                    className="flex-1 py-2 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
                <button 
                  type="submit" 
                  onClick={(e) => handleSave(e, 'Published')}
                  disabled={isSubmitting || isSuccess}
                  className="bg-forge-navy text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-forge-dark transition-all flex items-center gap-2 shadow-md"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : (isSuccess ? <CheckCircle size={12} /> : null)}
                  {isEditing ? 'Update' : 'Publish'}
                </button>
              </div>
            </div>

            {/* SEO Settings (WP Focus Keyphrase / Meta Description) */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">SEO Settings</span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Focus Keyphrase</label>
                  <input 
                    type="text" 
                    value={formData.keyphrase || ''} 
                    onChange={(e) => setFormData({...formData, keyphrase: e.target.value})}
                    className="w-full border border-slate-200 p-2 text-sm focus:border-forge-gold focus:outline-none"
                    placeholder="Enter keyphrase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meta Description</label>
                  <textarea 
                    value={formData.meta_description || ''} 
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    rows={3}
                    className="w-full border border-slate-200 p-2 text-xs focus:border-forge-gold focus:outline-none resize-none"
                    placeholder="Enter search snippet"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Slug</label>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 p-2 border border-slate-100 rounded font-mono truncate">
                    /{formData.slug}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Box */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categories</span>
              </div>
              <div className="p-4">
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-slate-200 p-2 text-sm focus:outline-none"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* Featured Image Box */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Featured Image</span>
              </div>
              <div className="p-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center cursor-pointer hover:border-forge-gold overflow-hidden relative group"
                >
                  {formData.cover_image ? (
                    <>
                      <img src={formData.cover_image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">Change Image</div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      {isUploading ? <Loader2 size={20} className="animate-spin text-forge-gold" /> : <ImageIcon size={20} className="text-slate-300" />}
                      <span className="text-[8px] text-slate-400 font-bold uppercase mt-2">Set Featured Image</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </div>
            </div>

          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
