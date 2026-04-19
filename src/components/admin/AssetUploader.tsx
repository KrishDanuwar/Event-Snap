'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface AssetUploaderProps {
  label: string;
  bucket: string;
  onUploadComplete: (path: string) => void;
  currentPath?: string | null;
}

export default function AssetUploader({ label, bucket, onUploadComplete, currentPath }: AssetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large (Max 5MB)');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const supabase = createBrowserClient();
      const ext = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
      const filePath = `assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      onUploadComplete(filePath);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-4">
        <label className={`
          cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed 
          transition-all hover:bg-blue-50 hover:border-blue-200
          ${isUploading ? 'opacity-50 pointer-events-none' : 'border-neutral-200'}
        `}>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
          <span className="text-sm font-semibold">{isUploading ? 'Uploading...' : 'Choose Image'}</span>
          {!isUploading && <span>📁</span>}
        </label>
        
        {currentPath && !isUploading && (
          <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
             ✅ Uploaded
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}
