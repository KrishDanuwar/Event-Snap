'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/events')
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const activeEvents = events.filter(e => e.is_active && new Date(e.expires_at) > new Date() && !e.deleted_at);
  const expiredEvents = events.filter(e => (!e.is_active || new Date(e.expires_at) <= new Date()) && !e.deleted_at);
  const deletedEvents = events.filter(e => e.deleted_at);

  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'deleted'>('active');

  const getFilteredEvents = () => {
    if (activeTab === 'active') return activeEvents;
    if (activeTab === 'expired') return expiredEvents;
    return deletedEvents;
  };

  const createNewEventWithPrompt = async () => {
     const name = prompt('Enter a name for your new event:', 'My Awesome Event');
     if (!name) return;

     try {
       setIsLoading(true);
       const res = await fetch('/api/admin/events', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           name,
           expires_at: new Date(Date.now() + (86400000 * 7)).toISOString(), // Default: 7 days
           welcome_message: `Welcome to ${name}!`
         })
       });
       const data = await res.json();
       if (data.id) {
         router.push(`/admin/events/${data.id}`);
       } else {
         alert('Failed to create event: ' + (data.error || 'Unknown error'));
         setIsLoading(false);
       }
     } catch (err) {
       console.error("Failed to create event", err);
       alert('Failed to connect to the server.');
       setIsLoading(false);
     }
  };

  if (isLoading) return <div className="p-10 animate-pulse">Loading events...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Events Management</h1>
          <p className="text-neutral-500 text-lg">Manage galleries, oversee guests, and configure settings.</p>
        </div>
        <button 
          onClick={createNewEventWithPrompt}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          ➕ Create New Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-200 pb-2">
         <button onClick={() => setActiveTab('active')} className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'active' ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
            Active ({activeEvents.length})
         </button>
         <button onClick={() => setActiveTab('expired')} className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'expired' ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
            Expired ({expiredEvents.length})
         </button>
         <button onClick={() => setActiveTab('deleted')} className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'deleted' ? 'border-red-600 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
            Deleted
         </button>
      </div>

      {/* Event List */}
      <div className="space-y-4">
         {getFilteredEvents().length === 0 ? (
           <div className="bg-white border text-center p-10 rounded-2xl text-neutral-400">
              No events found in this category.
           </div>
         ) : (
           getFilteredEvents().map(event => (
             <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between group hover:border-red-300 transition-colors">
                <div>
                   <h3 className="font-bold text-lg">{event.name}</h3>
                   <div className="text-sm text-neutral-500 mt-1">
                      {event.deleted_at ? `Deleted: ${new Date(event.deleted_at).toLocaleDateString()}` : `Expires: ${new Date(event.expires_at).toLocaleDateString()}`}
                   </div>
                </div>
                {!event.deleted_at && (
                  <Link href={`/admin/events/${event.id}`} className="bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 font-medium px-4 py-2 rounded-lg transition-colors">
                     Manage Event →
                  </Link>
                )}
             </div>
           ))
         )}
      </div>

    </div>
  );
}
