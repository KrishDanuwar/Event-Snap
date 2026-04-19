'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuestList from '@/components/admin/AdminGuestList';
import AdminLiveGallery from '@/components/admin/AdminLiveGallery';

export default function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/admin/events/${params.id}`)
      .then(r => r.json())
      .then(d => { if(d.event) setEvent(d.event); })
  }, [params.id]);

  const handleDelete = async () => {
    const checkName = prompt(`Type "${event.name}" to confirm permanent deletion:`);
    if (checkName !== event.name) return alert('Name verification failed.');
    
    try {
      const res = await fetch(`/api/admin/events/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/admin/events');
    } catch {
      alert('Failed to delete event');
    }
  };

  const handleEndEarly = async () => {
    if (!confirm('End event immediately? Guests will lose upload access.')) return;
    try {
      const res = await fetch(`/api/admin/events/${params.id}`, { 
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ is_active: false })
      });
      if (res.ok) setEvent({...event, is_active: false});
    } catch {
       alert('Operation failed');
    }
  };

  if (!event) return <div className="p-10">Loading...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
         <div className="flex justify-between items-start">
            <div>
               <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
               <div className="text-neutral-500 font-medium">Status: {event.is_active ? '✅ Active' : '❌ Inactive / Expired'}</div>
               <div className="mt-4 p-4 bg-neutral-100 rounded-xl max-w-lg">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Guest Entry Link:</div>
                  <div className="text-sm font-mono text-neutral-800 break-all">
                     {typeof window !== 'undefined' ? `${window.location.origin}/event/${event.id}` : ''}
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col gap-3">
               <button onClick={handleEndEarly} disabled={!event.is_active} className="bg-neutral-800 text-white hover:bg-black px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 transition-colors">
                  End Event Early
               </button>
               <button onClick={handleDelete} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 text-sm rounded-lg font-medium transition-colors border border-red-200">
                  Delete Event
               </button>
            </div>
         </div>
      </div>
      
      {/* Admin Realtime Dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <AdminGuestList eventId={params.id} />
         <AdminLiveGallery eventId={params.id} />
      </div>

    </div>
  );
}
