'use client';

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useGuestSession } from '@/hooks/useGuestSession';
import PhotoModal from './PhotoModal';
import { downloadGuestZip } from '@/lib/zip-guest';

interface GalleryPhoto {
  id: string;
  storagePath: string;
  url: string | null;
  guestName?: string;
  uploadedAt: string;
}

export default function GalleryView({ eventId, eventName }: { eventId: string, eventName: string }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filterGuestName, setFilterGuestName] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  
  const { session, guestDetails, decrementPhotoCount } = useGuestSession(eventId);
  
  // 1. Initial Load
  useEffect(() => {
    async function loadGallery() {
      if (!session) return;
      try {
        const res = await fetch(`/api/events/${eventId}/gallery`, {
           headers: { 'X-Session-Token': session.sessionToken }
        });
        const data = await res.json();
        if (data.photos) setPhotos(data.photos);
      } catch (err) {
        console.error('Failed to load gallery', err);
      }
    }
    loadGallery();
  }, [eventId, session]);

  // 2. Realtime Subscriptions
  useEffect(() => {
    if (!session) return;
    const supabase = createBrowserClient();

    const channel = supabase
      .channel(`gallery:${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'photos',
        filter: `event_id=eq.${eventId}`
      }, async (payload) => {
        // Fetch signed URL for new photo via proxy API
        try {
          const proxyRes = await fetch('/api/photos/signed-url', {
             method: 'POST',
             headers: { 'X-Session-Token': session.sessionToken, 'Content-Type': 'application/json' },
             body: JSON.stringify({ storagePath: payload.new.storage_path })
          });
          const proxyData = await proxyRes.json();
          
          if (proxyData.url) {
            setPhotos(prev => [{
               id: payload.new.id,
               storagePath: payload.new.storage_path,
               url: proxyData.url,
               guestName: 'Someone', // Realtime join isn't native without complex setup, so fallback for immediate update
               uploadedAt: payload.new.uploaded_at
            }, ...prev]);
          }
        } catch (e) {
          console.error('Realtime fetch signed error', e);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'photos',
        filter: `event_id=eq.${eventId}`
      }, (payload) => {
        if (payload.new.is_deleted) {
          setPhotos(prev => prev.filter(p => p.id !== payload.new.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, session]);

  // Filtering + Guest List Derivation
  const uniqueGuests = useMemo(() => {
     const names = new Set<string>();
     photos.forEach(p => { if (p.guestName && p.guestName !== 'Someone') names.add(p.guestName); });
     return Array.from(names).sort();
  }, [photos]);

  const displayedPhotos = useMemo(() => {
     if (filterGuestName === 'all') return photos.filter(p => p.url);
     return photos.filter(p => p.guestName === filterGuestName && p.url);
  }, [photos, filterGuestName]);

  const handleOwnDownload = async () => {
    if (!session) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      const res = await fetch(`/api/photos/my-photos`, {
         headers: { 'X-Session-Token': session.sessionToken }
      });
      const data = await res.json();
      if (!data.photos || data.photos.length === 0) {
        alert('You haven\'t taken any photos to download yet.');
        setIsZipping(false);
        return;
      }
      
      const resZip = await downloadGuestZip(data.photos, eventName, (pct) => setZipProgress(pct));
      if (!resZip.success) alert(resZip.error);
    } catch (err: any) {
      alert('Failed to generate ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  const handleDeleteSelf = async (id: string) => {
    if (!session) return;
    const res = await fetch(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: { 'X-Session-Token': session.sessionToken }
    });
    if (res.ok) {
       setPhotos(prev => prev.filter(p => p.id !== id));
       decrementPhotoCount();
    } else {
       throw new Error('Failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-white overflow-hidden relative">
      
      {/* Premium Light Header */}
      <div className="px-6 py-4 flex items-center justify-between gap-3 bg-white border-b border-neutral-100 z-10 sticky top-0">
         
         <div className="flex flex-col">
            <h2 className="text-xl font-extrabold tracking-tight text-black flex items-center gap-2">
               {eventName}
            </h2>
            <select 
              value={filterGuestName}
              onChange={(e) => setFilterGuestName(e.target.value)}
              className="mt-1 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest outline-none bg-transparent"
            >
              <option value="all">All Photos ({photos.length})</option>
              {uniqueGuests.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
         </div>

         {guestDetails && guestDetails.photoCount > 0 && (
            <button 
              onClick={handleOwnDownload}
              disabled={isZipping}
              className="bg-primary text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 transition-transform active:scale-95"
            >
               {isZipping ? `Saving...` : `Download (${guestDetails.photoCount})`}
            </button>
         )}
      </div>

      {/* Empty State */}
      {displayedPhotos.length === 0 && (
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-70">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4"><span className="text-3xl text-[var(--color-primary)]">📸</span></div>
            <h2 className="text-2xl font-bold mb-2">No photos yet</h2>
            <p>Be the first to capture a memory!</p>
         </div>
      )}

      {/* Refined Grid */}
      <div className="flex-1 overflow-y-auto w-full p-2 pb-40">
         <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 auto-rows-[120px] md:auto-rows-[180px]">
           {displayedPhotos.map(photo => (
             <div 
               key={photo.id} 
               onClick={() => {
                  if (window.navigator.vibrate) window.navigator.vibrate(20);
                  setSelectedPhoto(photo);
               }}
               className="relative overflow-hidden cursor-pointer group rounded-xl bg-neutral-50 shadow-sm active:scale-95 transition-transform"
             >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url!} alt="Photo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                   <div className="text-white text-[10px] font-bold truncate opacity-80 uppercase tracking-tighter">{photo.guestName}</div>
                </div>
             </div>
           ))}
         </div>
      </div>

      {selectedPhoto && (
         <PhotoModal 
            photo={{
               ...selectedPhoto,
               url: selectedPhoto.url!,
               guestName: selectedPhoto.guestName || 'Someone',
               isOwn: guestDetails?.displayName === selectedPhoto.guestName || selectedPhoto.guestName === 'Someone' // Fallback for immediate realtime logic
            }}
            onClose={() => setSelectedPhoto(null)}
            onDelete={handleDeleteSelf}
         />
      )}

    </div>
  );
}
