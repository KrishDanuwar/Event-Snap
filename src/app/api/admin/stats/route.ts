import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    // Fetch totals
    const { count: totalEvents } = await supabaseAdmin.from('events').select('*', { count: 'exact', head: true });
    const { count: totalGuests } = await supabaseAdmin.from('guests').select('*', { count: 'exact', head: true });
    const { count: totalPhotos } = await supabaseAdmin.from('photos').select('*', { count: 'exact', head: true }).eq('is_deleted', false);

    // Get Active Events explicitly vs expired
    const { count: activeEvents } = await supabaseAdmin.from('events')
       .select('*', { count: 'exact', head: true })
       .eq('is_active', true)
       .gte('expires_at', new Date().toISOString());

    return NextResponse.json({
      totalEvents: totalEvents || 0,
      activeEvents: activeEvents || 0,
      totalGuests: totalGuests || 0,
      totalPhotos: totalPhotos || 0
    });

  } catch (err: any) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
