import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import { useProperties } from '../context/PropertyContext';
import { BlogPost } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import { resizeImage } from '../utils/imageUtils';

export const AdminPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addPost, updatePost, settings } = useProperties();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    title: '',
    content: '',
    excerpt: '',
    seoKeyphrase: '',
    categories: [],
    image: '',
    status: 'Published',
    date: new Date().toISOString(),
    author: settings.listingAgent?.name || 'Admin'
  });

  const [newCategory, setNewCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'Market Trends', 'Interior Design', 'Company News', 'Investment', 'Lifestyle'
  ]);

  // Load post data
  useEffect(() => {
    if (isEditing && id) {
      const post = getPost(id);
      if (post) {
        setFormData(post);
        // Ensure existing categories are available
        const uniqueCats = Array.from(new Set([...availableCategories, ...post.categories]));
        setAvailableCategories(uniqueCats);
      }
    } else if (!isEditing) {
      setFormData(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, [id, isEditing, getPost]);

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await resizeImage(file);
        setFormData(prev => ({ ...prev, image: base64String }));
      } catch (err) {
        console.error("Image processing error", err);
      }
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => {
        const exists = prev.categories.includes(cat);
        return {
            ...prev,
            categories: exists 
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        };
    });
  };

  const handleAddCategory = () => {
    if (newCategory && !availableCategories.includes(newCategory)) {
        setAvailableCategories([...availableCategories, newCategory]);
        toggleCategory(newCategory);
        setNewCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updatePost(formData);
      } else {
        await addPost(formData);
      }
      navigate('/admin/posts');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  };

  return (
    <AdminLayout>
       <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate('/admin/posts')}
              className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl font-serif text-forge-navy">{isEditing ? 'Edit Post' : 'Add New Post'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Column */}
            <div className="lg:w-3/4 space-y-6">
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter Title Here"
                    className="w-full p-4 text-xl font-serif border border-slate-300 focus:border-forge-gold focus:outline-none shadow-sm"
                    required
                />

                <div className="bg-white border border-slate-200 shadow-sm">
                     <ReactQuill 
                        theme="snow" 
                        value={formData.content} 
                        onChange={handleContentChange}
                        modules={modules}
                        className="h-[500px] mb-12"
                     />
                </div>

                {/* SEO Meta Box */}
                <div className="bg-white border border-slate-200 shadow-sm p-6 mt-8">
                    <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">SEO & Search Appearance</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Focus Keyphrase</label>
                            <input
                                type="text"
                                value={formData.seoKeyphrase}
                                onChange={(e) => setFormData({...formData, seoKeyphrase: e.target.value})}
                                className="w-full p-3 text-sm border border-slate-300 focus:border-forge-gold focus:outline-none"
                                placeholder="e.g. Luxury Real Estate Lagos"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Meta Description / Excerpt</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                                rows={3}
                                className="w-full p-3 text-sm border border-slate-300 focus:border-forge-gold focus:outline-none resize-none"
                                placeholder="A short summary of the post for search engines..."
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Recommended length: 150-160 characters.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:w-1/4 space-y-6">
                
                {/* Publish Box */}
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 text-sm">Publish</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Status:</span>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                className="border border-slate-300 rounded px-2 py-1 text-sm font-bold"
                            >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Author:</span>
                            <span className="font-medium">{formData.author}</span>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-forge-navy text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-wider hover:bg-forge-gold hover:text-forge-navy transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            {isEditing ? 'Update' : 'Publish'}
                        </button>
                    </div>
                </div>

                {/* Categories Box */}
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 text-sm">Categories</h3>
                    </div>
                    <div className="p-4">
                        <div className="max-h-40 overflow-y-auto space-y-2 mb-4 border border-slate-100 p-2">
                            {availableCategories.map(cat => (
                                <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.categories.includes(cat)}
                                        onChange={() => toggleCategory(cat)}
                                        className="text-forge-gold focus:ring-forge-gold"
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="New Category Name"
                                className="flex-1 text-xs border border-slate-300 px-2 py-1 focus:outline-none focus:border-forge-gold"
                            />
                            <button 
                                type="button"
                                onClick={handleAddCategory}
                                className="bg-slate-100 border border-slate-300 px-2 rounded hover:bg-slate-200 text-slate-600"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Featured Image Box */}
                <div className="bg-white border border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 text-sm">Featured Image</h3>
                    </div>
                    <div className="p-4">
                        {formData.image ? (
                            <div className="relative group">
                                <img src={formData.image} alt="Featured" className="w-full h-auto object-cover border border-slate-200" />
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, image: ''})}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-8 border-2 border-dashed border-slate-300 text-slate-400 hover:border-forge-gold hover:text-forge-gold transition-colors flex flex-col items-center gap-2"
                            >
                                <ImageIcon size={24} />
                                <span className="text-xs uppercase font-bold">Set featured image</span>
                            </button>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                        />
                    </div>
                </div>

            </div>
        </form>
    </AdminLayout>
  );
};