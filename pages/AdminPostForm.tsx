import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Loader2, CheckCircle, X, AlertCircle, Plus, FileText } from 'lucide-react';
import ReactQuill from 'react-quill';
import { useProperties } from '../context/PropertyContext';
import { BlogPost } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

// Note: ReactQuill styles are loaded in index.html

export const AdminPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addPost, updatePost, availableCategories, addCategory } = useProperties();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    title: '',
    excerpt: '', // Used as Meta Description
    content: '',
    image: '',
    author: 'The Forge Team',
    date: new Date().toISOString(),
    status: 'Draft',
    categories: [],
    seoKeyphrase: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const post = getPost(id);
      if (post) {
        setFormData({
            ...post,
            categories: post.categories || [], // ensure array
            seoKeyphrase: post.seoKeyphrase || ''
        });
      }
    } else if (!isEditing) {
      setFormData(prev => prev.id ? prev : ({ ...prev, id: Date.now().toString() }));
    }
  }, [id, isEditing, getPost]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await resizeImage(file);
        setFormData(prev => ({ ...prev, image: base64String }));
      } catch (err) {
        setError("Failed to process image.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
        const currentCats = prev.categories || [];
        if (currentCats.includes(category)) {
            return { ...prev, categories: currentCats.filter(c => c !== category) };
        } else {
            return { ...prev, categories: [...currentCats, category] };
        }
    });
  };

  const handleAddCategory = () => {
      if(newCategory.trim()) {
          addCategory(newCategory.trim());
          handleCategoryToggle(newCategory.trim()); // auto select
          setNewCategory('');
          setIsAddingCategory(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent, forceStatus?: 'Published' | 'Draft') => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const statusToSave = forceStatus || formData.status;
    const dataToSave = { ...formData, status: statusToSave };

    try {
      if (isEditing) {
        await updatePost(dataToSave);
      } else {
        await addPost(dataToSave);
      }
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin/posts');
      }, 1000);
    } catch (err) {
      setError("Failed to save post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quill Modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/admin/posts')}
            className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Posts
          </button>
          
          <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    formData.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                 Current: {formData.status}
              </span>
          </div>
        </div>

        <h1 className="text-3xl font-serif text-forge-navy mb-8">{isEditing ? 'Edit Article' : 'New Article'}</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 shadow-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor Column */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-transparent border-0 border-b border-slate-300 px-0 py-4 text-3xl font-serif font-bold text-forge-navy placeholder-slate-300 focus:border-forge-gold focus:ring-0 transition-colors"
                        placeholder="Enter article title here..."
                        required
                    />
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                    <ReactQuill 
                        theme="snow"
                        value={formData.content}
                        onChange={handleEditorChange}
                        modules={modules}
                        formats={formats}
                        className="h-96 mb-12"
                    />
                </div>

                {/* SEO Section */}
                <div className="bg-white p-6 rounded shadow-sm border border-slate-200 mt-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">SEO Configuration</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Focus Keyphrase</label>
                            <input
                                type="text"
                                name="seoKeyphrase"
                                value={formData.seoKeyphrase}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                                placeholder="e.g. Luxury Real Estate Lagos"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">The main phrase you want this post to rank for.</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Meta Description (Excerpt)</label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm resize-none"
                                placeholder="A concise summary of the article for search engines (approx 160 characters)..."
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-[10px] text-slate-400">Appears in search results and post previews.</p>
                                <span className={`text-[10px] font-bold ${formData.excerpt.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {formData.excerpt.length} / 160
                                </span>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
                 {/* Publish Action */}
                 <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Publish</h3>
                    <div className="space-y-4 mb-6">
                        <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Author</label>
                             <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                             />
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Publish Date</label>
                             <input
                                type="date"
                                name="date"
                                value={formData.date.split('T')[0]}
                                onChange={(e) => setFormData(prev => ({...prev, date: new Date(e.target.value).toISOString()}))}
                                className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm"
                             />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'Draft')}
                            disabled={isSubmitting || isSuccess}
                            className="w-full py-3 bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors rounded-sm flex items-center justify-center gap-2"
                        >
                            <FileText size={14} /> Save as Draft
                        </button>

                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'Published')}
                            disabled={isSubmitting || isSuccess}
                            className={`w-full py-3 font-bold uppercase tracking-widest text-xs shadow-lg transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                            isSuccess 
                                ? 'bg-green-600 text-white' 
                                : 'bg-forge-navy text-white hover:bg-forge-dark'
                            }`}
                        >
                            {isSubmitting ? (
                            <Loader2 size={16} className="animate-spin" />
                            ) : isSuccess ? (
                            <>
                                <CheckCircle size={16} /> Saved!
                            </>
                            ) : (
                            <>
                                <Save size={16} /> Publish
                            </>
                            )}
                        </button>
                    </div>
                 </div>

                 {/* Categories */}
                 <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h3>
                     
                     <div className="max-h-40 overflow-y-auto mb-4 space-y-2 border border-slate-100 p-3 rounded-sm bg-slate-50">
                         {availableCategories.map(cat => (
                             <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                 <input 
                                    type="checkbox" 
                                    checked={formData.categories?.includes(cat)}
                                    onChange={() => handleCategoryToggle(cat)}
                                    className="accent-forge-gold w-4 h-4"
                                 />
                                 <span className="text-sm text-slate-600 group-hover:text-forge-navy">{cat}</span>
                             </label>
                         ))}
                     </div>

                     {isAddingCategory ? (
                         <div className="flex gap-2">
                             <input 
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="flex-1 border border-slate-300 px-2 py-1 text-xs focus:border-forge-gold outline-none"
                                placeholder="New Category Name"
                                autoFocus
                             />
                             <button 
                                type="button"
                                onClick={handleAddCategory}
                                className="bg-forge-navy text-white px-2 py-1 text-xs rounded-sm hover:bg-forge-gold hover:text-forge-navy"
                             >
                                 Add
                             </button>
                         </div>
                     ) : (
                        <button 
                            type="button" 
                            onClick={() => setIsAddingCategory(true)}
                            className="text-xs text-forge-gold font-bold uppercase tracking-wider hover:text-forge-navy flex items-center gap-1"
                        >
                            <Plus size={12} /> Add New Category
                        </button>
                     )}
                 </div>

                 {/* Featured Image */}
                 <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Featured Image</h3>
                     
                     <div className="relative aspect-video bg-slate-100 rounded border border-slate-200 overflow-hidden mb-4">
                        {formData.image ? (
                            <>
                                <img src={formData.image} alt="Featured" className="w-full h-full object-cover" />
                                <button
                                type="button"
                                onClick={() => setFormData(prev => ({...prev, image: ''}))}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-md"
                                >
                                <X size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <ImageIcon size={32} className="mb-2" />
                                <span className="text-[10px] uppercase font-bold">No Image Set</span>
                            </div>
                        )}
                     </div>

                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload} 
                     />
                     
                     <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-600 py-3 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 hover:text-forge-gold transition-colors flex items-center justify-center gap-2"
                     >
                        <Upload size={14} /> Upload Image
                     </button>
                 </div>
            </div>
        </form>
      </div>
    </AdminLayout>
  );
};