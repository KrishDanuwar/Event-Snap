import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // PRD states:
    // guests.is_removed = true
    // photos.is_deleted = true (all this guest's photos)
    
    const { data: guest } = await supabaseAdmin.from('guests').select('event_id').eq('id', params.id).single();
    if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });

    await supabaseAdmin.from('guests').update({ is_removed: true }).eq('id', params.id);
    await supabaseAdmin.from('photos').update({ is_deleted: true }).eq('guest_id', params.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
