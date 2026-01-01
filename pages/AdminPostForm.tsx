
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Image as ImageIcon, Loader2, Globe, FileText, X, Plus, Link as LinkIcon, AlertCircle
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { BlogPost } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { RichTextEditor } from '../components/RichTextEditor';
import { resizeImage } from '../utils/imageUtils';

export const AdminPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addPost, updatePost, isLoading } = useProperties();
  const isEditing = !!id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'Published' | 'Draft' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState(['Market Insights', 'Luxury Lifestyle', 'Company News', 'Investment']);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  };

  useEffect(() => {
    if (!isLoading) {
      if (isEditing && id) {
        const post = getPost(id);
        if (post) {
          setFormData(post);
          if (!categories.includes(post.category)) setCategories(prev => [...prev, post.category]);
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

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent, statusOverride: 'Published' | 'Draft') => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a title.");
      return;
    }

    setIsSubmitting(true);
    setPendingStatus(statusOverride);
    setError('');

    const finalSlug = formData.slug || slugify(formData.title);
    const submissionData = { 
      ...formData, 
      slug: finalSlug,
      status: statusOverride, 
      author: 'The Forge Properties' 
    };

    try {
      if (isEditing) await updatePost(submissionData);
      else await addPost(submissionData);
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/blog'), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save post. Verify DB schema.");
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
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/admin/blog')} className="text-slate-400 hover:text-forge-navy flex items-center gap-2 text-sm font-medium">
              <ArrowLeft size={16} /> Back to Journal
            </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="flex flex-col lg:flex-row gap-8">
           <div className="flex-1 space-y-8">
              <div>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value, slug: formData.slug || slugify(e.target.value)})} className="w-full bg-transparent border-0 border-b-2 border-slate-200 py-4 text-3xl font-serif font-bold text-forge-navy focus:border-forge-gold focus:outline-none placeholder-slate-300" placeholder="Title" required />
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                  <LinkIcon size={14} className="text-forge-gold" />
                  <span className="font-mono text-xs">blog/</span>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: slugify(e.target.value)})} placeholder="permalink" className="flex-grow bg-white border border-slate-200 px-2 py-1 rounded font-mono text-xs focus:border-forge-gold focus:outline-none" />
                </div>
              </div>

              <RichTextEditor value={formData.content} onChange={(content) => setFormData({...formData, content})} />

              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <FileText size={14} /> Excerpt
                </label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none" placeholder="Short summary..." />
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                 <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                   <Globe size={16} className="text-forge-gold" />
                   <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600">SEO</h3>
                 </div>
                 <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Keyphrase</label>
                      <input type="text" value={formData.keyphrase || ''} onChange={(e) => setFormData({...formData, keyphrase: e.target.value})} className="w-full border border-slate-200 p-3 text-sm rounded bg-slate-50 focus:border-forge-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Meta Description</label>
                      <textarea value={formData.meta_description || ''} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} rows={2} className="w-full border border-slate-200 p-3 text-sm rounded bg-slate-50 focus:border-forge-gold" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm sticky top-24">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Publishing</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span>Status:</span>
                    <span className="font-bold text-forge-gold">{formData.status}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button type="button" onClick={(e) => handleSubmit(e, 'Draft')} disabled={isSubmitting || isSuccess} className="w-full py-4 px-2 border border-slate-300 text-slate-600 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                       {isSubmitting && pendingStatus === 'Draft' && <Loader2 size={12} className="animate-spin" />} Save Draft
                    </button>
                    <button type="button" onClick={(e) => handleSubmit(e, 'Published')} disabled={isSubmitting || isSuccess} className="w-full py-4 px-2 bg-forge-navy text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                       {isSubmitting && pendingStatus === 'Published' && <Loader2 size={12} className="animate-spin" />} {isEditing ? 'Update & Publish' : 'Publish'}
                    </button>
                  </div>
                  {isSuccess && <div className="text-xs font-bold text-green-600 mt-2 bg-green-50 p-2 text-center">Journal Updated</div>}
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Category</h3>
                 <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border p-2.5 text-sm rounded bg-slate-50">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                 </select>
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Cover Image</h3>
                 <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-slate-100 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-forge-gold overflow-hidden">
                    {formData.cover_image ? <img src={formData.cover_image} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-400" />}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData({...formData, cover_image: await resizeImage(file)});
                 }} />
              </div>
           </div>
        </form>
      </div>
    </AdminLayout>
  );
};
