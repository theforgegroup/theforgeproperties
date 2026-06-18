import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ArrowLeft, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';

interface TrainingCategory {
  id: number;
  name: string;
  sort_order: number;
}

interface TrainingResource {
  id: string;
  category_id: number;
  category_name?: string;
  title: string;
  type: 'video' | 'webinar_replay' | 'pdf' | 'faq';
  description?: string;
  thumbnail_url?: string;
  file_url?: string;
  duration_minutes?: number;
  sort_order?: number;
  created_at: string;
  video_url?: string;
}

export const AdminTraining: React.FC = () => {
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [resources, setResources] = useState<TrainingResource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form modal/view toggle
  const [showForm, setShowForm] = useState(false);
  
  // New Resource Form states
  const [categoryId, setCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'webinar_replay' | 'pdf' | 'faq'>('video');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('0');
  const [sortOrder, setSortOrder] = useState('0');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  // Status handlers
  const [formUploading, setFormUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch lists
  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, resRes] = await Promise.all([
        fetch('/api/training/categories'),
        fetch('/api/training/resources')
      ]);
      if (catRes.ok && resRes.ok) {
        const catData = await catRes.json();
        const resData = await resRes.json();
        if (catData.success) setCategories(catData.data);
        if (resData.success) setResources(resData.data);
      }
    } catch (err) {
      console.error('Failed to load training portal database admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    setUploadProgress(0);

    // Basic Validation
    if (!categoryId && !newCategoryName) {
      setFormError('Please select a category or create a new category name.');
      return;
    }
    if (!title.trim()) {
      setFormError('Title string is required.');
      return;
    }

    // Advanced Type validation
    if (type === 'video' || type === 'webinar_replay') {
      if (!videoUrl && !resourceFile) {
        setFormError('For media resources, either input a streaming Video URL OR upload a video file (.mp4).');
        return;
      }
    }

    setFormUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('description', description);
    formData.append('duration_minutes', duration || '0');
    formData.append('sort_order', sortOrder || '0');
    formData.append('video_url', videoUrl);

    if (categoryId) {
      formData.append('category_id', categoryId);
    } else {
      formData.append('new_category_name', newCategoryName);
    }

    if (thumbnailFile) {
      formData.append('thumbnail_file', thumbnailFile);
    }
    if (resourceFile) {
      formData.append('resource_file', resourceFile);
    }

    // Simulate standard progress feedback metrics
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const res = await fetch('/api/training/admin', {
        method: 'POST',
        headers: {
          'X-User-Id': 'admin-chief',
          'X-User-Role': 'Admin'
        },
        body: formData
      });

      clearInterval(interval);
      setUploadProgress(100);

      const resData = await res.json();
      if (res.ok && resData.success) {
        setFormSuccess(true);
        // Clear inputs
        setTitle('');
        setDescription('');
        setDuration('0');
        setSortOrder('0');
        setVideoUrl('');
        setThumbnailFile(null);
        setResourceFile(null);
        setCategoryId('');
        setNewCategoryName('');
        // Reload Table
        loadData();
        // Hide panel shortly
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess(false);
        }, 1500);
      } else {
        setFormError(resData.message || 'Failed to assemble resource file.');
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setFormError('API timeout or connection error during file upload.');
    } finally {
      setFormUploading(false);
    }
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This operation cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/training/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': 'admin-chief',
          'X-User-Role': 'Admin'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Remove locally immediately for sweet speediness
        setResources(prev => prev.filter(r => r.id !== id));
      } else {
        alert(data.message || 'Deletion failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network failure deleting training material.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        
        {/* Portal Headers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif text-forge-navy mb-1.5 flex items-center gap-3">
              <BookOpen className="text-forge-gold" size={28} /> Training Materials Center
            </h1>
            <p className="text-slate-500 text-sm">Upload accredited directories, webinars, playbooks, guidelines and FAQs.</p>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-forge-gold text-forge-navy font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded flex items-center gap-2 hover:bg-forge-navy hover:text-white transition-all shadow-md cursor-pointer"
            >
              <Plus size={16} /> Upload New Material
            </button>
          )}
        </div>

        {formError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-2 text-xs border border-red-150 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Execution Failed:</span> {formError}
            </div>
          </div>
        )}

        {/* UPLOADER PANEL FORM */}
        {showForm && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-md animate-fadeIn space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-serif text-lg text-forge-navy font-bold">New Material Spec Sheet</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs flex items-center gap-1 uppercase tracking-wide cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Directory
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Categorization */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase text-slate-400">Accredited Category Group</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (e.target.value !== '') setNewCategoryName('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                  >
                    <option value="">-- Select Existing Group --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="py-1 text-center text-[10px] text-slate-350">— OR create new category below —</div>
                  <input
                    type="text"
                    placeholder="Enter Custom Category Name (e.g. Legal Compliance)"
                    value={newCategoryName}
                    disabled={categoryId !== ''}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                  />
                </div>

                {/* Resource Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Resource Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Closing The Deal on Commercial Plots"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Resource Type Format</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as TrainingResource['type'])}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                    >
                      <option value="video">Acredited Course Video (.mp4 / stream)</option>
                      <option value="webinar_replay">Diaspora Webinar Replay</option>
                      <option value="pdf">Playbook, PDF Directive, Brochure (.pdf)</option>
                      <option value="faq">Q&A FAQ Answer Guidelines</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Descriptions & URLs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">
                    {type === 'faq' ? 'FAQ Answers text (description)' : 'Asset Description / Executive Summary'}
                  </label>
                  <textarea
                    rows={type === 'faq' ? 5 : 3}
                    placeholder={type === 'faq' ? 'Enter the verified, professional broker response answer here...' : 'Explain what realtors will learn from completing this material...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Duration minutes (if media/lectures)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Sort order index priority</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-mono"
                    />
                  </div>

                  {(type === 'video' || type === 'webinar_replay') && (
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">YouTube / Vimeo link url (optional stream link)</label>
                      <input
                        type="url"
                        placeholder="https://youtu.be/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* FILE ATTACHMENTS (Excluding FAQ types) */}
              {type !== 'faq' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  
                  {/* Avatar/Thumbnail layout */}
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500">Video Lesson Thumbnail (JPG/PNG)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 w-full"
                    />
                    {thumbnailFile && (
                      <p className="text-[10px] text-forge-navy font-mono">
                        Selected: {thumbnailFile.name} ({formatFileSize(thumbnailFile.size)})
                      </p>
                    )}
                  </div>

                  {/* Resource Lesson File uploads */}
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      {type === 'pdf' ? 'Accredited PDF Document file' : 'Direct Lecture Video lesson File (.mp4)'}
                    </label>
                    <input
                      type="file"
                      accept={type === 'pdf' ? '.pdf' : '.mp4,video/*'}
                      onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 w-full"
                    />
                    {resourceFile && (
                      <p className="text-[10px] text-forge-navy font-mono">
                        Selected: {resourceFile.name} ({formatFileSize(resourceFile.size)})
                      </p>
                    )}
                  </div>

                </div>
              )}

              {/* Form trigger submission and progression states */}
              <div className="pt-4 flex flex-col md:flex-row items-center gap-4">
                <button
                  type="submit"
                  disabled={formUploading}
                  className="bg-forge-navy hover:bg-forge-gold hover:text-forge-navy text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl transition-all cursor-pointer w-full md:w-auto shrink-0 shadow"
                >
                  {formUploading ? `Saving Lesson Metadata... [${uploadProgress}%]` : 'Confirm lesson release'}
                </button>

                {formUploading && (
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden transition-all duration-300">
                    <div className="bg-forge-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                {!formUploading && formSuccess && (
                  <div className="text-green-600 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <CheckCircle size={16} /> Accorded training lesson disseminated to active realtors safely!
                  </div>
                )}
              </div>

            </form>
          </div>
        )}

        {/* ACTIVE MATERIALS SUMMARY TABLE / LIST */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-serif text-base text-forge-navy font-bold">Active Realtor Lesson Directory</h3>
            <p className="text-slate-400 text-xs mt-0.5">Below are all materials instantly viewable by registered agents inside their dashboards.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs italic">
              Querrying database lesson trees...
            </div>
          ) : resources.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] border-b border-slate-100 select-none">
                    <th className="p-4 pl-6">Title info</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Category Section</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Sort Order Priority</th>
                    <th className="p-4 text-right pr-6">Commands</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {resources.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-sans">
                        <p className="font-bold text-forge-navy">{res.title}</p>
                        <p className="text-[10px] text-slate-400 leading-snug line-clamp-1 truncate max-w-sm mt-0.5">{res.description || 'No summary text uploaded.'}</p>
                      </td>
                      <td className="p-4 capitalize">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.type === 'video' ? 'bg-red-50 text-red-600 border border-red-100' :
                          res.type === 'pdf' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          res.type === 'faq' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {res.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-sans font-semibold text-slate-500">{res.category_name || 'Unassigned'}</td>
                      <td className="p-4 text-slate-400 font-bold">{res.duration_minutes ? `${res.duration_minutes} mins` : 'Self-Paced'}</td>
                      <td className="p-4 text-slate-500 text-center">{res.sort_order || 0}</td>
                      <td className="p-4 text-right pr-6 shrink-0">
                        <button
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="bg-red-50 hover:bg-red-105 text-red-600 p-2.5 rounded-lg border border-red-100 transition-all cursor-pointer"
                          title="Purge Material"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 border-t border-dashed border-slate-100">
              <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-450 font-sans font-bold">No accredited resources populated in database yet.</p>
              <p className="text-slate-400 text-[10px] max-w-xs mx-auto mt-1">Accredited agents will only see empty list warnings until materials are released.</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};
