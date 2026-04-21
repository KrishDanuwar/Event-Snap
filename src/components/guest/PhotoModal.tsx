import { useState } from 'react';
import { sharePhoto } from '@/lib/share';

interface PhotoModalProps {
  photo: { id: string, url: string, storagePath: string, guestName: string, uploadedAt: string, isOwn: boolean };
  onClose: () => void;
  onDelete: (photoId: string) => void;
}

export default function PhotoModal({ photo, onClose, onDelete }: PhotoModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShare = async () => {
    await sharePhoto(photo.url, `EventSnap_${photo.id}.jpg`);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EventSnap_${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download photo. Please try long-pressing the image to save.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    setIsDeleting(true);
    try {
      await onDelete(photo.id);
      onClose();
    } catch {
      setIsDeleting(false);
      alert('Failed to delete photo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 flex flex-col pt-safe pb-safe animate-fade-in backdrop-blur-xl">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md">
        <button onClick={onClose} className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-800 active:bg-neutral-200 transition-colors">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div className="text-right">
           <div className="text-black font-extrabold text-sm uppercase tracking-tighter">{photo.guestName}</div>
           <div className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">{new Date(photo.uploadedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>

      {/* Image View */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={photo.url} alt="Gallery Photo" className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl shadow-neutral-200" />
      </div>

      {/* Bottom Actions */}
      <div className="p-8 bg-white/50 backdrop-blur-md flex items-center justify-center gap-10">
         
         <button onClick={handleShare} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-primary group-active:scale-90 transition-transform shadow-sm group-hover:bg-blue-50">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-primary">Share</span>
         </button>

         <button onClick={handleDownload} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-primary group-active:scale-90 transition-transform shadow-sm group-hover:bg-blue-50">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-primary">Save</span>
         </button>

         {photo.isOwn && (
           <button onClick={handleDelete} disabled={isDeleting} className="flex flex-col items-center gap-2 group disabled:opacity-30">
              <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-red-500 group-hover:bg-red-50 group-active:scale-90 transition-transform shadow-sm">
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-red-500">Delete</span>
           </button>
         )}

      </div>

    </div>
  );
}
