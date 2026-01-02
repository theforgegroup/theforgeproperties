
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Image as ImageIcon, Loader2, Link as LinkIcon, 
  AlertCircle, Globe, Settings, FileText, ChevronDown, Calendar, Plus
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
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  
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
          // If the post has a category not in the default list, add it
          if (post.category && !categories.includes(post.category)) {
            setCategories(prev => [...prev, post.category]);
          }
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
      setError(`Upload failed: ${err.message}. Ensure you have run the SQL RLS fix in Supabase.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      if (!categories.includes(trimmed)) {
        setCategories([...categories, trimmed]);
      }
      setFormData({ ...formData, category: trimmed });
      setNewCategoryName('');
      setIsAddingCategory(false);
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
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-sans font-normal text-slate-800">
            {isEditing ? 'Edit Post' : 'Add New Post'}
          </h1>
          <button onClick={() => navigate('/admin/blog/new')} className="px-2 py-1 border border-slate-300 rounded bg-white text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors">
            Add New
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={(e) => handleSave(e)} className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Column (Left) */}
          <div className="flex-1 space-y-4">
            {/* 1. Title */}
            <input 
              type="text" 
              value={formData.title} 
              onChange={handleTitleChange} 
              placeholder="Enter title here"
              className="w-full bg-white border border-slate-300 p-2 text-xl focus:border-blue-400 focus:outline-none"
              required
            />
            
            {/* 2. Permalink (URL Slug) */}
            <div className="text-sm flex items-center gap-1 text-slate-600">
              <span className="font-bold">Permalink:</span>
              <span>https://theforgeproperties.com/blog/</span>
              {isEditingSlug ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: slugify(e.target.value)})}
                    className="border border-slate-300 px-1 text-xs"
                  />
                  <button type="button" onClick={() => setIsEditingSlug(false)} className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-[10px] rounded">OK</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-50 px-1">{formData.slug || '(slug)'}</span>
                  <button type="button" onClick={() => setIsEditingSlug(true)} className="px-2 py-0.5 bg-white border border-slate-300 text-[10px] rounded hover:bg-slate-50">Edit</button>
                </div>
              )}
            </div>

            {/* 3. Content Editor */}
            <div className="bg-white border border-slate-300">
              <RichTextEditor value={formData.content} onChange={(content) => setFormData({...formData, content})} />
            </div>

            {/* 4. Excerpt Box */}
            <div className="bg-white border border-slate-300 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 flex justify-between items-center cursor-default">
                <span className="text-sm font-bold text-slate-700">Excerpt</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <div className="p-4">
                <textarea 
                  value={formData.excerpt} 
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})} 
                  rows={3} 
                  className="w-full border border-slate-300 p-2 text-sm focus:outline-none focus:border-blue-300"
                  placeholder="Excerpts are optional hand-crafted summaries of your content..."
                />
              </div>
            </div>

            {/* 5. SEO Focus Keyphrase */}
            <div className="bg-white border border-slate-300 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Focus Keyphrase</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <div className="p-4">
                <input 
                  type="text" 
                  value={formData.keyphrase || ''} 
                  onChange={(e) => setFormData({...formData, keyphrase: e.target.value})}
                  className="w-full border border-slate-300 p-2 text-sm focus:outline-none focus:border-blue-300"
                  placeholder="Enter the main search term for this post"
                />
              </div>
            </div>

            {/* 6. Meta Description */}
            <div className="bg-white border border-slate-300 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Meta Description</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <div className="p-4">
                <textarea 
                  value={formData.meta_description || ''} 
                  onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                  rows={3}
                  className="w-full border border-slate-300 p-2 text-sm focus:outline-none focus:border-blue-300 resize-none"
                  placeholder="The snippet that appears in Google search results"
                />
              </div>
            </div>

          </div>

          {/* Sidebar Column (Right) */}
          <div className="w-full lg:w-72 space-y-6">
            
            {/* 1. Publish Box */}
            <div className="bg-white border border-slate-300 shadow-sm">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 font-bold text-sm text-slate-700">
                Publish
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status: <span className="text-slate-800 font-bold">{formData.status}</span></span>
                  <button type="button" className="text-blue-600 underline">Edit</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Visibility: <span className="text-slate-800 font-bold">Public</span></span>
                  <button type="button" className="text-blue-600 underline">Edit</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1"><Calendar size={12} /> Publish <b>immediately</b></span>
                  <button type="button" className="text-blue-600 underline">Edit</button>
                </div>
              </div>
              <div className="bg-slate-50 p-3 border-t border-slate-300 flex justify-between items-center">
                <button type="button" onClick={() => navigate('/admin/blog')} className="text-red-600 text-xs underline">Move to Trash</button>
                <button 
                  type="submit" 
                  onClick={(e) => handleSave(e, 'Published')}
                  disabled={isSubmitting || isSuccess}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  {isEditing ? 'Update' : 'Publish'}
                </button>
              </div>
            </div>

            {/* 2. Featured Image Box (Right under Publish) */}
            <div className="bg-white border border-slate-300 shadow-sm">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 font-bold text-sm text-slate-700 flex justify-between items-center">
                Featured Image
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <div className="p-4">
                {formData.cover_image ? (
                  <div className="space-y-3">
                    <img src={formData.cover_image} className="w-full aspect-video object-cover border border-slate-200" alt="Preview" />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 text-xs underline block"
                    >
                      Click the image to edit or update
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, cover_image: ''})}
                      className="text-red-600 text-xs underline"
                    >
                      Remove featured image
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 text-xs underline"
                  >
                    Set featured image
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </div>
            </div>

            {/* 3. Categories Box (Followed by Featured Image) */}
            <div className="bg-white border border-slate-300 shadow-sm">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 font-bold text-sm text-slate-700 flex justify-between items-center">
                Categories
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <div className="p-4">
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.category === cat} 
                        onChange={() => setFormData({...formData, category: cat})}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
                
                {isAddingCategory ? (
                  <div className="mt-4 space-y-2">
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New Category"
                      className="w-full border border-slate-300 p-2 text-xs focus:outline-none focus:border-blue-400"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={handleAddCategory}
                        className="bg-blue-600 text-white px-3 py-1 text-[10px] font-bold rounded"
                      >
                        Add
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                        className="bg-slate-200 text-slate-600 px-3 py-1 text-[10px] font-bold rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCategory(true)}
                    className="text-blue-600 text-xs underline mt-4 block"
                  >
                    + Add New Category
                  </button>
                )}
              </div>
            </div>

          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
