import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find events that should be closed
    // Criteria:
    // 1. Currently active
    // 2. Not manually deleted
    // 3. auto_deactivate preference is ON
    // 4. deactivates_at OR expires_at has passed
    const now = new Date().toISOString();
    
    const { data: eventsToClose, error } = await supabaseAdmin
      .from('events')
      .select('id, name')
      .eq('is_active', true)
      .eq('auto_deactivate', true)
      .is('deleted_at', null)
      .or(`deactivates_at.lt.${now},expires_at.lt.${now}`);

    if (error) throw error;

    if (!eventsToClose || eventsToClose.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No events matching deactivation criteria found.' 
      }), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Perform bulk deactivation
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ is_active: false })
      .in('id', eventsToClose.map(e => e.id));

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true, 
      deactivatedCount: eventsToClose.length,
      events: eventsToClose.map(e => e.name)
    }), { 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err: any) {
    console.error('Auto-deactivation failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});
