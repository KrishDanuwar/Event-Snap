'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function AdminLiveGallery({ eventId }: { eventId: string }) {
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}/photos`)
      .then(r => r.json())
      .then(d => { if (d.photos) populateUrls(d.photos) });

    const supabase = createBrowserClient();
    const sub = supabase.channel(`admin_photos:${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` },
        async (payload) => {
           // Admin also fetches Signed Url dynamically
           const proxyRes = await fetch('/api/photos/signed-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storagePath: payload.new.storage_path }) });
           const { url } = await proxyRes.json();
           if (url) {
             setPhotos(prev => [{ ...payload.new, url }, ...prev]);
           }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'photos', filter: `event_id=eq.${eventId}` },
        (payload) => {
           if (payload.new.is_deleted) setPhotos(prev => prev.filter(p => p.id !== payload.new.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [eventId]);

  const populateUrls = async (list: any[]) => {
      // In a real robust system, Admin would generate a bulk signed URL map similar to Guests Phase 5.
      // For this scale, resolving them sequentially or using admin overrides works. 
      // To mimic the Guest phase 5 speed, we could call `/api/events/[id]/gallery` but admins need explicit IDs.
      const proxyRes = await fetch(`/api/events/${eventId}/gallery`);
      const data = await proxyRes.json();
      if (data.photos) setPhotos(data.photos);
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Permanently remove this photo?')) return;
    try {
       await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' });
       setPhotos(prev => prev.filter(p => p.id !== id));
    } catch {
       alert("Failed to delete photo");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 h-[500px] flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Live Gallery Stream</h3>
          <span className="bg-neutral-100 px-3 py-1 rounded-full text-sm font-semibold">{photos.length} Captured</span>
       </div>
       
       <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-2 auto-rows-[120px]">
          {photos.length === 0 && <div className="text-neutral-400 text-sm text-center py-10 col-span-2">No photos uploaded.</div>}
          
          {photos.map(photo => (
             <div key={photo.id} className="relative overflow-hidden group bg-neutral-100 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="Admin View" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => handleDeletePhoto(photo.id)} className="bg-red-600 text-white p-2 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-lg">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
