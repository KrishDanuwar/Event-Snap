import { NextResponse } from 'next/server';
import { ApiError, validateGuestSession, getSessionTokenOrThrow } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const token = getSessionTokenOrThrow(request);
    const guest = await validateGuestSession(token);

    const { photoId, storagePath, fileSize, width, height } = await request.json();

    if (!photoId || !storagePath) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Insert photo metadata
    const { error: photoError } = await supabaseAdmin
      .from('photos')
      .insert({
        id: photoId,
        event_id: guest.event_id,
        guest_id: guest.id,
        storage_path: storagePath,
        file_size_bytes: fileSize,
        width,
        height
      });

    if (photoError) {
       throw new Error(photoError.message);
    }

    // 2. Increment guest photo count safely. No RPC setup locally yet so doing simple logic
    await supabaseAdmin
       .from('guests')
       .update({ photo_count: guest.photo_count + 1 })
       .eq('id', guest.id);

    return NextResponse.json({ success: true, photoId });

  } catch (err: any) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
