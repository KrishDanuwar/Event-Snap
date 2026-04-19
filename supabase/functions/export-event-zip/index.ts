import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Zip, AsyncZipDeflate } from 'https://esm.sh/fflate';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Basic sanitization
function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

serve(async (req) => {
  try {
    const { eventId } = await req.json();
    if (!eventId) return new Response('Missing eventId', { status: 400 });

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Verify admin JWT manually to prevent unauthorized bandwidth spikes
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    
    // Check if the JWT is valid against the backend verify
    const { data: userAuth, error: authErr } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !userAuth.user) return new Response('Unauthorized', { status: 401 });

    // 2. Fetch event + photos + guests
    const { data: photos, error: photoErr } = await supabaseAdmin.from('photos').select('id, storage_path, guest_id').eq('event_id', eventId).eq('is_deleted', false);
    if (photoErr || !photos) throw new Error('Failed to load photos');

    const { data: guests, error: guestErr } = await supabaseAdmin.from('guests').select('id, display_name').eq('event_id', eventId);
    if (guestErr || !guests) throw new Error('Failed to load guests');

    const guestMap: Record<string, string> = {};
    guests.forEach(g => { guestMap[g.id] = g.display_name });

    // 3. Stream ZIP response
    // Uses the TransformStream standard implemented in Deno natively.
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    return new Promise<Response>((resolve) => {
       // Start passing the Response immediately as a stream download
       resolve(new Response(readable, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="event-${eventId}-photos.zip"`,
            'Access-Control-Allow-Origin': '*'
          },
       }));

       // Perform Zip construction asynchronously natively into the write stream
       const zip = new Zip((err, chunk, final) => {
          if (err) console.error('Zip Error:', err);
          writer.write(chunk);
          if (final) writer.close();
       });

       (async () => {
         for (const photo of photos) {
           const folder = sanitizeFilename(guestMap[photo.guest_id] || 'unknown');
           const fileName = `${folder}/${photo.id}.jpg`;
           
           const fileDeflate = new AsyncZipDeflate(fileName, { level: 0 }); // level 0 because JPEGs are already compressed
           zip.add(fileDeflate);

           // Download raw photo array buffer natively
           const { data: photoBlob } = await supabaseAdmin.storage.from('event-photos').download(photo.storage_path);
           if (photoBlob) {
              const arrayBuffer = await photoBlob.arrayBuffer();
              fileDeflate.push(new Uint8Array(arrayBuffer), true);
           }
         }
         zip.end();
       })();
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
