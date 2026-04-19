import { NextResponse } from 'next/server';
import { ApiError, validateGuestSession, getSessionTokenOrThrow } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const token = getSessionTokenOrThrow(request);
    const guest = await validateGuestSession(token);

    // Enforce PRD Max Photos limit (25)
    if (guest.photo_count >= 25) {
       return NextResponse.json({ error: 'PHOTO_QUOTA_EXCEEDED' }, { status: 403 });
    }

    const { fileExt } = await request.json(); // e.g. "jpg"
    const photoId = crypto.randomUUID();
    const storagePath = `${guest.event_id}/${guest.id}/${photoId}.${fileExt || 'jpg'}`;

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.storage
      .from('event-photos')
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
       throw new Error(error?.message || 'Failed to generate signed upload URL');
    }

    return NextResponse.json({
       uploadUrl: data.signedUrl,
       token: data.token,
       photoId,
       storagePath
    });

  } catch (err: any) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
