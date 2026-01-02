
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Image as ImageIcon, Loader2, Link as LinkIcon, AlertCircle, Eye
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
  const [pendingStatus, setPendingStatus] = useState<'Published' | 'Draft' | null>(null);
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
        } else if (id !== 'new') {
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
      setError(`Cover upload failed: ${err.message}. Ensure 'blog-images' bucket is public.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent, statusOverride: 'Published' | 'Draft') => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (isUploading) return;

    setIsSubmitting(true);
    setPendingStatus(statusOverride);
    setError('');

    const finalSlug = formData.slug || slugify(formData.title);
    const submissionData = { 
      ...formData, 
      slug: finalSlug,
      status: statusOverride
    };

    try {
      if (isEditing) await updatePost(submissionData);
      else await addPost(submissionData);
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/blog'), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save post.");
    } finally {
      setIsSubmitting(false);
      setPendingStatus(null);
    }
  };

  if (isLoading || (isEditing && !dataLoaded)) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="font-serif italic">Accessing Archives...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/admin/blog')} className="text-slate-400 hover:text-forge-navy flex items-center gap-2 text-sm font-medium">
              <ArrowLeft size={16} /> Back to Journal
            </button>
            <span className={`text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full ${formData.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              Status: {formData.status}
            </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="flex flex-col lg:flex-row gap-8">
           <div className="flex-1 space-y-8">
              <div className="bg-white p-8 shadow-sm border border-slate-200 rounded-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Article Title</label>
                <input type="text" value={formData.title} onChange={handleTitleChange} className="w-full bg-transparent border-0 border-b-2 border-slate-100 py-4 text-3xl font-serif font-bold text-forge-navy focus:border-forge-gold focus:outline-none" placeholder="The Future of Waterfront Estates..." required />
              </div>

              <RichTextEditor value={formData.content} onChange={(content) => setFormData({...formData, content})} />

              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Excerpt</label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none" placeholder="Brief overview for social media..." />
              </div>
           </div>

           <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm sticky top-24">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Publishing Actions</h3>
                <div className="space-y-3">
                  <button type="button" onClick={(e) => handleSubmit(e, 'Draft')} disabled={isSubmitting || isUploading || isSuccess} className="w-full py-4 border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50">
                     {isSubmitting && pendingStatus === 'Draft' && <Loader2 size={12} className="animate-spin" />} Save as Draft
                  </button>
                  <button type="button" onClick={(e) => handleSubmit(e, 'Published')} disabled={isSubmitting || isUploading || isSuccess} className="w-full py-4 bg-forge-navy text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-forge-dark">
                     {isSubmitting && pendingStatus === 'Published' && <Loader2 size={12} className="animate-spin" />} {isEditing ? 'Update & Sync' : 'Publish Article'}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Cover Image (Public URL)</h3>
                 <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center cursor-pointer hover:border-forge-gold overflow-hidden relative group">
                    {formData.cover_image ? (
                      <>
                        <img src={formData.cover_image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">Change</div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        {isUploading ? <Loader2 size={24} className="animate-spin text-forge-gold" /> : <ImageIcon size={24} className="text-slate-300" />}
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-2">Upload Cover</span>
                      </div>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                 <p className="text-[8px] text-slate-400 mt-2 uppercase tracking-tight">Best for social: 1200x630px</p>
              </div>
           </div>
        </form>
      </div>
    </AdminLayout>
  );
};
