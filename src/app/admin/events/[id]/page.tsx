'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuestList from '@/components/admin/AdminGuestList';
import AdminLiveGallery from '@/components/admin/AdminLiveGallery';

export default function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/admin/events/${eventId}`)
      .then(r => r.json())
      .then(d => { if(d.event) setEvent(d.event); })
  }, [eventId]);

  const handleDelete = async () => {
    const confirmation = confirm(`Are you sure you want to delete "${event.name}"? This action follows a soft-delete policy: the event will be hidden and assets cleared, but records remain in the database history.`);
    if (!confirmation) return;

    const checkName = prompt(`Please type "${event.name}" to finalize deletion:`);
    if (checkName !== event.name) return alert('Name verification failed. Deletion aborted.');
    
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
        alert('Event successfully deleted.');
        router.push('/admin/events');
      } else {
        alert(`Failed to delete event: ${data.error || 'Server error'}`);
      }
    } catch {
      alert('Network error: Failed to connect to server for deletion.');
    }
  };

  const handleEndEarly = async () => {
    if (!confirm('End event immediately? Guests will lose upload access.')) return;
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { 
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ is_active: false })
      });
      const data = await res.json();
      if (res.ok) {
        setEvent({...event, is_active: false});
        alert('Event has been deactivated.');
      } else {
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch {
       alert('Operation failed due to network error.');
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/export-event-zip`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ eventId })
      });
      
      if (!res.ok) throw new Error('Export failed. Make sure the Edge Function is deployed and active.');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.name.replace(/\s+/g, '_')}_photos.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
       alert(err.message);
    } finally {
       setIsExporting(false);
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
               <Link 
                  href={`/admin/events/${eventId}/settings`}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 text-sm rounded-xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
               >
                  🎨 Design & Settings
               </Link>
               <button 
                  onClick={handleExportZip} 
                  disabled={isExporting}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 text-sm rounded-lg font-bold transition-all border border-blue-200 flex items-center justify-center gap-2"
               >
                  {isExporting ? '📦 Zipping Photostream...' : '📥 Download All Photos (ZIP)'}
               </button>
               <button onClick={handleEndEarly} disabled={!event.is_active} className="bg-neutral-800 text-white hover:bg-black px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 transition-colors">
                  End Event Early
               </button>
               <button onClick={handleDelete} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 text-sm rounded-lg font-bold transition-all border border-red-200">
                  Delete Event
               </button>
            </div>
         </div>
      </div>
      
      {/* Admin Realtime Dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <AdminGuestList eventId={eventId} />
         <AdminLiveGallery eventId={eventId} />
      </div>

    </div>
  );
}
