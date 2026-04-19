import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Find all events that are active, not deleted, and expired
    const { data: expiredEvents, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('id')
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true)
      .is('deleted_at', null);

    if (fetchError) throw fetchError;
    if (!expiredEvents || expiredEvents.length === 0) {
      return new Response(JSON.stringify({ message: 'No events to expire' }), { headers: { 'Content-Type': 'application/json' } });
    }

    let processed = 0;

    for (const event of expiredEvents) {
      const eventId = event.id;

      // 1. Delete Photos from Storage
      const { data: photosData } = await supabaseAdmin.storage.from('event-photos').list(`${eventId}`);
      if (photosData && photosData.length > 0) {
        const folders = photosData.map(d => `${eventId}/${d.name}`);
        // recursively remove each guest's subfolder files
        for (const f of folders) {
           const { data: subFiles } = await supabaseAdmin.storage.from('event-photos').list(f);
           if (subFiles && subFiles.length > 0) {
               const paths = subFiles.map(sf => `${f}/${sf.name}`);
               await supabaseAdmin.storage.from('event-photos').remove(paths);
           }
        }
      }

      // 2. Delete Assets from Storage (Logos/Backgrounds)
      const { data: assetsData } = await supabaseAdmin.storage.from('event-assets').list(`${eventId}`);
      if (assetsData && assetsData.length > 0) {
         const assetPaths = assetsData.map(a => `${eventId}/${a.name}`);
         await supabaseAdmin.storage.from('event-assets').remove(assetPaths);
      }

      // 3. Delete Photo Records
      await supabaseAdmin.from('photos').delete().eq('event_id', eventId);

      // 4. Delete Guest Records
      await supabaseAdmin.from('guests').delete().eq('event_id', eventId);

      // 5. Update Event Record (set is_active false, LEAVE deleted_at as NULL to flag it was expired automatically, not manual)
      await supabaseAdmin.from('events').update({ is_active: false }).eq('id', eventId);
      
      processed++;
    }

    return new Response(JSON.stringify({ success: true, processedEvents: processed }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Auto-expire failed:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
