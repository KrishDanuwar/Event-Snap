import { NextResponse } from 'next/server';
import { ApiError, validateGuestSession, getSessionTokenOrThrow } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const token = getSessionTokenOrThrow(request);
    const guest = await validateGuestSession(token);

    const supabaseAdmin = createAdminClient();

    // Fetch this guest's specific active photos
    const { data: photos, error } = await supabaseAdmin
      .from('photos')
      .select('id, storage_path, uploaded_at')
      .eq('guest_id', guest.id)
      .eq('is_deleted', false)
      .order('uploaded_at', { ascending: false });

    if (error) throw new Error(error.message);

    if (!photos || photos.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    // Generate signed URLs in bulk (1-hour TTL)
    const paths = photos.map(p => p.storage_path);
    const { data: signedUrls, error: urlError } = await supabaseAdmin.storage
      .from('event-photos')
      .createSignedUrls(paths, 60 * 60);

    if (urlError) throw new Error(urlError.message);

    const mappedPhotos = photos.map((p) => {
      const urlObj = signedUrls.find(u => u.path === p.storage_path);
      return {
        id: p.id,
        storagePath: p.storage_path,
        url: urlObj?.signedUrl || null,
        uploadedAt: p.uploaded_at
      };
    }).filter(p => p.url !== null);

    return NextResponse.json({ photos: mappedPhotos });

  } catch (err: any) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
