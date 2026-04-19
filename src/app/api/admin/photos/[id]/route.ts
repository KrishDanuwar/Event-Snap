import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseAdmin = createAdminClient();
    // Soft delete photo to trigger Realtime dispatches instantly pulling it from Guest view channels natively matching Phase 5 logic.
    const { error } = await supabaseAdmin.from('photos').update({ is_deleted: true }).eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
