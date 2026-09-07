import React, { useState, useRef } from 'react';
import { Upload, Trash2, Loader2, Image as ImageIcon, Link2, Check } from 'lucide-react';
import { resizeImage, dataURLtoBlob } from '../utils/imageUtils';
import { uploadImage } from '../lib/supabaseClient';
import { extractErrorMessage } from '../utils/errorUtils';

interface AdminImageUploaderProps {
  id: string;
  label: string;
  description?: string;
  value?: string;
  onChange: (url: string) => void;
  recommendedSize?: string;
  bucket?: string;
  aspectRatio?: 'video' | 'square' | 'banner' | 'auto';
}

export const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({
  id,
  label,
  description,
  value,
  onChange,
  recommendedSize = '1200 × 800px (JPG/PNG/WEBP)',
  bucket = 'site-assets',
  aspectRatio = 'video'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      // Resize to safe high-res dimensions
      const base64 = await resizeImage(file, 1600, 1200);
      const blob = dataURLtoBlob(base64);
      const ext = file.name.split('.').pop() || 'png';
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${id}-${Date.now()}-${cleanName}.${ext}`;

      const publicUrl = await uploadImage(bucket, fileName, blob);
      onChange(publicUrl);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      setError(extractErrorMessage(err, 'Failed to upload image. Please try again or paste a direct image URL below.'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
    }
  };

  const aspectClass = aspectRatio === 'banner' 
    ? 'h-40 sm:h-48' 
    : aspectRatio === 'square' 
      ? 'h-48 w-48' 
      : 'h-48 sm:h-56';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-forge-navy flex items-center gap-1.5">
            <ImageIcon size={15} className="text-forge-gold" />
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
          Rec: {recommendedSize}
        </span>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Image Preview / Upload Area */}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
          <div className={`w-full ${aspectClass} overflow-hidden`}>
            <img 
              src={value} 
              alt={label} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white hover:bg-slate-100 text-forge-navy text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Replace Image
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>

          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-white font-mono truncate max-w-[80%]">
            {value}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`w-full ${aspectClass} border-2 border-dashed border-slate-300 hover:border-forge-gold bg-white hover:bg-slate-50/70 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-forge-gold" />
              <span className="text-xs font-bold text-forge-navy">Uploading & Optimizing...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Upload size={20} className="text-forge-gold" />
              </div>
              <p className="text-xs font-bold text-forge-navy">Click to browse or drag & drop</p>
              <p className="text-[11px] text-slate-400 mt-1">High-resolution JPG, PNG, or WebP</p>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        id={`file-input-${id}`}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Alternative: Direct URL Input */}
      <div className="pt-1">
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-[11px] font-semibold text-slate-500 hover:text-forge-gold flex items-center gap-1 transition-colors"
          >
            <Link2 size={12} /> Or paste a direct image URL
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input 
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-forge-navy focus:outline-none focus:border-forge-gold"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="bg-forge-navy hover:bg-forge-dark text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
            >
              <Check size={14} /> Apply
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setUrlDraft(''); }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
