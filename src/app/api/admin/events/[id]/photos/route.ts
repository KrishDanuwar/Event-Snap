import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseAdmin = createAdminClient();
    
    // Admins get everything, including deleted flags if they want to audit, but typically filter out
    const { data: photos, error } = await supabaseAdmin
      .from('photos')
      .select('id, guest_id, storage_path, uploaded_at, is_deleted, width, height')
      .eq('event_id', id)
      .eq('is_deleted', false)
      .order('uploaded_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ photos });
  } catch (err: any) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
