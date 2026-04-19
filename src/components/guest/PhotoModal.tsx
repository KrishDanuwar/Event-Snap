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

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `EventSnap_${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col pt-safe pb-safe animate-fade-in backdrop-blur-md">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:bg-white/20">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div className="text-right">
           <div className="text-white font-bold text-sm">{photo.guestName}</div>
           <div className="text-white/60 text-xs">{new Date(photo.uploadedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>

      {/* Image View */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={photo.url} alt="Gallery Photo" className="max-h-full max-w-full object-contain rounded-md" />
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-6">
         
         <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white hover:text-[var(--color-primary)] active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></div>
            <span className="text-xs font-semibold">Share</span>
         </button>

         <button onClick={handleDownload} className="flex flex-col items-center gap-1 text-white hover:text-[var(--color-primary)] active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></div>
            <span className="text-xs font-semibold">Save</span>
         </button>

         {photo.isOwn && (
           <button onClick={handleDelete} disabled={isDeleting} className="flex flex-col items-center gap-1 text-white hover:text-red-500 active:scale-95 transition-transform disabled:opacity-50">
              <div className="w-12 h-12 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
              <span className="text-xs font-semibold">Delete</span>
           </button>
         )}

      </div>

    </div>
  );
}
