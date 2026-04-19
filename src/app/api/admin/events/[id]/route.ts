import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseAdmin = createAdminClient();
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabaseAdmin = createAdminClient();
    
    // Only allow specific updates to avoid hijacking
    const allowedUpdates = ['name', 'expires_at', 'welcome_message', 'max_guests', 'theme', 'logo_path', 'is_active'];
    const updatePayload: any = {};
    
    allowedUpdates.forEach(key => {
       if (body[key] !== undefined) updatePayload[key] = body[key];
    });

    const { error } = await supabaseAdmin
      .from('events')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Soft Delete execution exactly mirroring the PRD definition
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from('events')
      .update({
         is_active: false,
         deleted_at: new Date().toISOString(),
         logo_path: null,
         theme: {}
      })
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
