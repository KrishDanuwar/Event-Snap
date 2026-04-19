'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function AdminGuestList({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}/guests`)
      .then(r => r.json())
      .then(d => { if (d.guests) setGuests(d.guests) });

    const supabase = createBrowserClient();
    const sub = supabase.channel(`admin_guests:${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}` },
        (payload) => setGuests(prev => [payload.new, ...prev])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}` },
        (payload) => setGuests(prev => prev.map(g => g.id === payload.new.id ? payload.new : g))
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [eventId]);

  const handleRemoveGuest = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to ban ${name}? All their photos will be deleted.`)) return;
    try {
       await fetch(`/api/admin/guests/${id}`, { method: 'DELETE' });
       // Optimistic update
       setGuests(prev => prev.map(g => g.id === id ? { ...g, is_removed: true } : g));
    } catch {
       alert("Failed to ban guest");
    }
  };

  const activeGuests = guests.filter(g => !g.is_removed);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 h-[500px] flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Live Guest Roster</h3>
          <span className="bg-neutral-100 px-3 py-1 rounded-full text-sm font-semibold">{activeGuests.length} Active</span>
       </div>
       
       <div className="flex-1 overflow-y-auto space-y-3 pr-2">
         {activeGuests.length === 0 && <div className="text-neutral-400 text-sm text-center py-10">No guests have joined yet.</div>}
         
         {activeGuests.map(guest => (
            <div key={guest.id} className="flex items-center justify-between p-3 border border-neutral-100 rounded-xl hover:border-red-200 transition-colors group">
               <div>
                  <div className="font-semibold text-sm">{guest.display_name}</div>
                  <div className="text-xs text-neutral-400">Joined {new Date(guest.joined_at).toLocaleTimeString()}</div>
               </div>
               <button onClick={() => handleRemoveGuest(guest.id, guest.display_name)} className="text-xs text-red-500 font-semibold px-3 py-1 bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                  Remove
               </button>
            </div>
         ))}
       </div>
    </div>
  );
}
