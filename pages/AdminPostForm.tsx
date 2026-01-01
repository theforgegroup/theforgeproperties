
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
  // Track the status being submitted to show the correct loader
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
    coverImage: '',
    author: 'The Forge Properties',
    date: new Date().toISOString(),
    category: 'Market Insights',
    status: 'Draft',
    metaDescription: '',
    keyphrase: ''
  });

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  useEffect(() => {
    if (!isLoading) {
      if (isEditing && id) {
        const post = getPost(id);
        if (post) {
          setFormData(post);
          if (!categories.includes(post.category)) {
            setCategories(prev => [...prev, post.category]);
          }
          setDataLoaded(true);
        } else if (id !== 'new') {
          setError("Post not found. It may have been deleted.");
        }
      } else {
        setFormData({
          id: Date.now().toString(),
          slug: '',
          title: '',
          excerpt: '',
          content: '',
          coverImage: '',
          author: 'The Forge Properties',
          date: new Date().toISOString(),
          category: 'Market Insights',
          status: 'Draft',
          metaDescription: '',
          keyphrase: ''
        });
        setDataLoaded(true);
      }
    }
  }, [id, isEditing, getPost, isLoading, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && (!prev.slug || prev.slug === slugify(prev.title))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
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

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories(prev => [...prev, newCategoryName]);
      setFormData(prev => ({ ...prev, category: newCategoryName }));
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent, statusOverride: 'Published' | 'Draft') => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a title for the article.");
      return;
    }

    setIsSubmitting(true);
    // Fix scope issue by tracking pending status in state
    setPendingStatus(statusOverride);
    setError('');

    // Ensure slug is generated if missing
    const finalSlug = formData.slug || slugify(formData.title);
    const submissionData = { 
      ...formData, 
      slug: finalSlug,
      status: statusOverride, 
      author: 'The Forge Properties' 
    };

    try {
      if (isEditing) {
        await updatePost(submissionData);
      } else {
        await addPost(submissionData);
      }
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin/blog');
      }, 1500);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "Failed to save post to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (isEditing && !dataLoaded)) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="font-serif italic">Accessing The Forge Journal Archives...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate('/admin/blog')}
              className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Blog
            </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 flex items-center gap-2 animate-fade-in-up">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="flex flex-col lg:flex-row gap-8">
           <div className="flex-1 space-y-8">
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
                
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                  <LinkIcon size={14} className="text-forge-gold" />
                  <span className="font-mono text-[10px] md:text-xs">theforgeproperties.com/blog/</span>
                  <input 
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: slugify(e.target.value)})}
                    placeholder="post-permalink"
                    className="flex-grow bg-white border border-slate-200 px-2 py-1 rounded font-mono text-xs focus:border-forge-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <RichTextEditor value={formData.content} onChange={handleContentChange} />
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <FileText size={14} /> Short Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                  placeholder="A brief summary for the preview card..."
                />
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                 <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                   <Globe size={16} className="text-forge-gold" />
                   <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600">SEO Configuration</h3>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Focus Keyphrase</label>
                      <input 
                        type="text"
                        name="keyphrase"
                        value={formData.keyphrase || ''}
                        onChange={handleChange}
                        placeholder="e.g. Luxury Real Estate Lagos"
                        className="w-full border border-slate-200 p-3 text-sm rounded bg-slate-50 focus:border-forge-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Meta Description</label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription || ''}
                        onChange={handleChange}
                        rows={2}
                        maxLength={160}
                        placeholder="A concise summary for search engines (max 160 chars)"
                        className="w-full border border-slate-200 p-3 text-sm rounded bg-slate-50 focus:border-forge-gold focus:outline-none resize-none"
                      />
                      <p className="text-[10px] text-right text-slate-400 mt-1">
                        {(formData.metaDescription?.length || 0)} / 160 characters
                      </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm sticky top-24 z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Publishing Actions</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm text-slate-600 border-b border-slate-100 pb-2">
                    <span>Status:</span>
                    <span className="font-bold text-forge-gold">{formData.status}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'Draft')}
                      disabled={isSubmitting || isSuccess}
                      className="w-full py-4 px-2 border border-slate-300 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                       {/* Fixed loader logic to use pendingStatus instead of potentially stale formData.status */}
                       {isSubmitting && pendingStatus === 'Draft' && <Loader2 size={12} className="animate-spin" />}
                       Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'Published')}
                      disabled={isSubmitting || isSuccess}
                      className="w-full py-4 px-2 bg-forge-navy text-white font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-forge-dark transition-all shadow-md flex items-center justify-center gap-2"
                    >
                       {/* Fixed scope error by using pendingStatus state */}
                       {isSubmitting && pendingStatus === 'Published' && <Loader2 size={12} className="animate-spin" />}
                       {isEditing ? 'Update & Publish' : 'Publish Article'}
                    </button>
                  </div>
                  
                  {isSuccess && (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-600 mt-2 bg-green-50 p-2 rounded">
                        <CheckCircle size={14} /> Journal Updated
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Category</h3>
                 
                 {isAddingCategory ? (
                   <div className="space-y-2 animate-fade-in">
                     <input 
                       type="text" 
                       value={newCategoryName}
                       onChange={(e) => setNewCategoryName(e.target.value)}
                       className="w-full border border-slate-300 p-2 text-sm focus:border-forge-gold focus:outline-none"
                       placeholder="New Category Name"
                       autoFocus
                     />
                     <div className="flex gap-2">
                       <button type="button" onClick={handleAddCategory} className="flex-1 bg-forge-navy text-white text-xs font-bold py-2 rounded-sm">Add</button>
                       <button type="button" onClick={() => setIsAddingCategory(false)} className="px-2 border border-slate-300 text-slate-500 rounded-sm hover:bg-slate-100">
                         <X size={14} />
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-3">
                      <select 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border border-slate-200 p-2.5 text-sm rounded bg-slate-50 focus:border-forge-gold focus:outline-none"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setIsAddingCategory(true)} className="text-forge-gold text-xs font-bold hover:underline flex items-center gap-1">
                        <Plus size={12} /> Add New Category
                      </button>
                   </div>
                 )}
              </div>

              <div className="bg-white p-6 shadow-sm border border-slate-200 rounded-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Featured Image</h3>
                 <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-slate-100 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-forge-gold overflow-hidden relative">
                    {formData.coverImage ? <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" /> : (
                      <>
                        <ImageIcon size={24} className="text-slate-400 mb-2" />
                        <span className="text-xs text-slate-400">Click to Upload</span>
                      </>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 {formData.coverImage && (
                    <button type="button" onClick={() => setFormData(prev => ({...prev, coverImage: ''}))} className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-3 hover:underline">Remove Image</button>
                  )}
              </div>
           </div>
        </form>
      </div>
    </AdminLayout>
  );
};