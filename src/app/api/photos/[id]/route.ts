import { NextResponse } from 'next/server';
import { ApiError, validateGuestSession, getSessionTokenOrThrow } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    if (!photoId) return NextResponse.json({ error: 'Missing photo ID' }, { status: 400 });

    const token = getSessionTokenOrThrow(request);
    const guest = await validateGuestSession(token);

    const supabaseAdmin = createAdminClient();

    // Ensure photo belongs to THIS guest
    const { data: photoData, error: photoFetchError } = await supabaseAdmin
      .from('photos')
      .select('id, guest_id')
      .eq('id', photoId)
      .single();

    if (photoFetchError || !photoData) {
       return NextResponse.json({ error: 'PHOTO_NOT_FOUND' }, { status: 404 });
    }

    if (photoData.guest_id !== guest.id) {
       return NextResponse.json({ error: 'UNAUTHORIZED_DELETION' }, { status: 403 });
    }

    // Remove photo logic:
    // Mark as is_deleted instead of hard deleting right away (soft delete per PRD real-time updates)
    const { error: delError } = await supabaseAdmin
      .from('photos')
      .update({ is_deleted: true })
      .eq('id', photoId);

    if (delError) throw new Error(delError.message);

    // Decrement guest photo count
    await supabaseAdmin
       .from('guests')
       .update({ photo_count: Math.max(0, guest.photo_count - 1) })
       .eq('id', guest.id);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
