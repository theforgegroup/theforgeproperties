import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, X, Upload
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { BlogPost } from '../types';
import { AdminLayout } from '../components/AdminLayout';
import ReactQuill from 'react-quill';
import { resizeImage } from '../utils/imageUtils';

export const AdminPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, addPost, updatePost } = useProperties();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    title: '',
    content: '',
    excerpt: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    author: 'The Forge'
  });

  // Load post data if editing
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await resizeImage(file);
        setFormData(prev => ({ ...prev, image: base64String }));
      } catch (err) {
        setError("Failed to process image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Generate excerpt if empty
    if (!formData.excerpt) {
        // Strip HTML tags for excerpt
        const plainText = formData.content.replace(/<[^>]+>/g, '');
        formData.excerpt = plainText.substring(0, 150) + '...';
    }

    try {
      if (isEditing) {
        await updatePost(formData);
      } else {
        await addPost(formData);
      }
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin/posts');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('relation "posts" does not exist')) {
        setError("Database Error: The 'posts' table is missing. Please run the SQL script in Supabase.");
      } else {
        setError("Failed to save post. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quill Toolbar Modules
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
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/admin/posts')}
              className="text-slate-400 hover:text-forge-navy transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Posts
            </button>
            <h1 className="text-3xl font-serif text-forge-navy">{isEditing ? 'Edit Article' : 'New Article'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6 text-sm font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="bg-white rounded shadow-xl border-t-4 border-forge-gold overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Title */}
            <div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 p-4 text-2xl font-serif font-bold text-forge-navy focus:border-forge-gold focus:outline-none transition-colors rounded-sm placeholder-slate-300"
                  placeholder="Enter Article Title Here"
                  required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Content</label>
                        <div className="bg-white">
                            <ReactQuill 
                                theme="snow"
                                value={formData.content}
                                onChange={handleEditorChange}
                                modules={modules}
                                className="h-96 mb-12"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-12">Excerpt (Optional)</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 p-3 text-sm focus:border-forge-gold focus:outline-none transition-colors rounded-sm resize-none"
                            placeholder="Short summary for the blog listing page..."
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    {/* Featured Image */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Featured Image</label>
                        <div className="aspect-video bg-slate-200 rounded overflow-hidden relative mb-3 border border-slate-300">
                            {formData.image ? (
                                <>
                                    <img src={formData.image} alt="Featured" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon size={24} className="mb-2" />
                                    <span className="text-xs">No Image</span>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                        />
                         <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-white border border-slate-300 text-slate-600 py-2 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 hover:text-forge-gold transition-colors flex items-center justify-center gap-1"
                        >
                            <Upload size={12} /> Upload Image
                        </button>
                    </div>

                    {/* Metadata */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Author</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 p-2 text-sm focus:border-forge-gold focus:outline-none rounded-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Publish Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 p-2 text-sm focus:border-forge-gold focus:outline-none rounded-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className={`w-full py-4 font-bold uppercase tracking-widest text-xs shadow-lg transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                        isSuccess 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-forge-navy text-white hover:bg-forge-dark'
                        }`}
                    >
                        {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                        ) : isSuccess ? (
                        <>
                            <CheckCircle size={16} /> Published!
                        </>
                        ) : (
                        <>
                            <Save size={16} /> Publish Post
                        </>
                        )}
                    </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};