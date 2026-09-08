
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://amoqzkmzoclsyhuigazo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb3F6a216b2Nsc3lodWlnYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxNjUsImV4cCI6MjA4MDYzMjE2NX0.OMocRVGkcm8V0yslfSXUIvx9mMIQ3KLN6_1SGANB3E8';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a blob to server uploads (or Supabase bucket) and returns the public URL.
 */
export const uploadImage = async (bucket: string, path: string, blob: Blob): Promise<string> => {
  // First attempt uploading directly to the application server
  try {
    const formData = new FormData();
    const fileName = path.includes('/') ? path.split('/').pop() || path : path;
    formData.append('file', blob, fileName);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (serverErr) {
    console.warn('Local /api/upload error, attempting Supabase storage:', serverErr);
  }

  // Fallback to Supabase Storage if available
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};
