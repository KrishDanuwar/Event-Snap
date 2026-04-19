import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { eventId, displayName } = await request.json();

    if (!eventId || !displayName) {
      return NextResponse.json({ error: 'Missing eventId or displayName' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Validate Event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('is_active, expires_at, max_guests, theme')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'EVENT_NOT_FOUND' }, { status: 404 });
    }

    if (!event.is_active) {
      return NextResponse.json({ error: 'EVENT_INACTIVE' }, { status: 403 });
    }

    if (new Date() > new Date(event.expires_at)) {
      return NextResponse.json({ error: 'EVENT_EXPIRED' }, { status: 403 });
    }

    // Check Max Guests (if constrained)
    if (event.max_guests !== null) {
      const { count } = await supabaseAdmin
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (count !== null && count >= event.max_guests) {
        return NextResponse.json({ error: 'EVENT_FULL' }, { status: 403 });
      }
    }

    // Deduplicate Name Logic (e.g. James -> James 2)
    let finalName = displayName.trim();
    let numSuffix = 1;
    let nameTaken = true;

    while (nameTaken) {
      const { data: existingGuest } = await supabaseAdmin
        .from('guests')
        .select('id')
        .eq('event_id', eventId)
        .eq('display_name', finalName)
        .maybeSingle();

      if (existingGuest) {
        numSuffix++;
        finalName = `${displayName.trim()} ${numSuffix}`;
      } else {
        nameTaken = false;
      }
    }

    // Generate Session Token natively using Web Crypto API
    const sessionToken = crypto.randomUUID();

    // Insert Guest
    const { data: newGuest, error: insertError } = await supabaseAdmin
      .from('guests')
      .insert({
        event_id: eventId,
        display_name: finalName,
        session_token: sessionToken,
      })
      .select('id')
      .single();

    if (insertError || !newGuest) {
      throw new Error(insertError?.message || 'Failed to create guest');
    }

    // Return strictly what the PRD JoinResponse demands
    return NextResponse.json({
      guestId: newGuest.id,
      sessionToken,
      displayName: finalName,
      theme: event.theme,
      expiresAt: event.expires_at,
    });

  } catch (err: any) {
    console.error('Join error:', err);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
