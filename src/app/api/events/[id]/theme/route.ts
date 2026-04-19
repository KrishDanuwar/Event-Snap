import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    if (!eventId) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('id, name, welcome_message, logo_path, theme, is_active, expires_at')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!event.is_active || new Date() > new Date(event.expires_at)) {
       return NextResponse.json({ 
         id: event.id,
         is_active: false,
         theme: event.theme
       });
    }

    // Need to resolve signed URLs for background and logo if they exist
    // Background is inside theme JSON, Logo is separate
    let backgroundUrl = null;
    let logoUrl = null;

    if (event.theme?.backgroundImagePath) {
       const { data: bgData } = await supabaseAdmin.storage
         .from('event-assets')
         .createSignedUrl(event.theme.backgroundImagePath, 60 * 60 * 24); // 24h
       backgroundUrl = bgData?.signedUrl || null;
    }

    if (event.logo_path) {
       const { data: logoData } = await supabaseAdmin.storage
         .from('event-assets')
         .createSignedUrl(event.logo_path, 60 * 60 * 24); // 24h
       logoUrl = logoData?.signedUrl || null;
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      welcome_message: event.welcome_message,
      logo_url: logoUrl,
      theme: {
        ...event.theme,
        backgroundUrl
      },
      is_active: true
    });

  } catch (err) {
    console.error('Fetch theme error:', err);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
