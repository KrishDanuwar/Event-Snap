import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('id, name, expires_at, is_active, created_at, deleted_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ events });

  } catch (err: any) {
    console.error('Fetch all events error:', err);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, expires_at, welcome_message, max_guests, theme, logo_path, auto_deactivate, deactivates_at } = body;

    if (!name || !expires_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: newEvent, error } = await supabaseAdmin
      .from('events')
      .insert({
        name,
        expires_at,
        welcome_message,
        max_guests,
        theme: theme || {
           primaryColor: '#e11d48',
           buttonColor: '#000000',
           textColor: '#000000',
           textMode: 'light',
           fontFamily: 'Inter'
        },
        logo_path,
        auto_deactivate: auto_deactivate !== undefined ? auto_deactivate : true,
        deactivates_at
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, id: newEvent.id });

  } catch (err: any) {
    console.error('Create event error:', err);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
