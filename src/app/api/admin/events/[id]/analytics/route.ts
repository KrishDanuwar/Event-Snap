import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const supabaseAdmin = createAdminClient();

    // 1. Core KPIs
    const [photosCount, guestsCount] = await Promise.all([
      supabaseAdmin.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', eventId),
      supabaseAdmin.from('guests').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
    ]);

    // 2. Timeline Data (Photos per hour)
    const { data: timelineData, error: timelineError } = await supabaseAdmin
      .from('photos')
      .select('created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (timelineError) throw timelineError;

    // Process timeline data into hourly buckets
    const hourlyStats: Record<string, number> = {};
    timelineData.forEach(p => {
       const date = new Date(p.created_at);
       const bucket = date.toISOString().slice(0, 13) + ':00'; // YYYY-MM-DDTHH:00
       hourlyStats[bucket] = (hourlyStats[bucket] || 0) + 1;
    });

    const timeline = Object.entries(hourlyStats).map(([time, count]) => ({ time, count }));

    // 3. Storage Estimation (assuming avg 1.5MB per photo since we optimized it)
    const totalPhotos = photosCount.count || 0;
    const estimatedStorageMB = (totalPhotos * 1.5).toFixed(1);

    return NextResponse.json({
      summary: {
        totalPhotos,
        totalGuests: guestsCount.count || 0,
        estimatedStorageMB
      },
      timeline
    });

  } catch (err: any) {
    console.error('Analytics Error:', err);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
