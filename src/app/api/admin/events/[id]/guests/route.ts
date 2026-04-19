import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabaseAdmin = createAdminClient();
    const { data: guests, error } = await supabaseAdmin
      .from('guests')
      .select('id, display_name, photo_count, joined_at, is_removed')
      .eq('event_id', params.id)
      .order('joined_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ guests });
  } catch (err: any) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
