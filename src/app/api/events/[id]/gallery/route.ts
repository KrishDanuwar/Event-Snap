import { NextResponse } from 'next/server';
import { ApiError, validateGuestSession, getSessionTokenOrThrow } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!id) return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });

    const token = getSessionTokenOrThrow(request);
    await validateGuestSession(token); // Validates guest is active and allowed

    const supabaseAdmin = createAdminClient();

    // Fetch all active photos for this event, newest first
    const { data: photos, error } = await supabaseAdmin
      .from('photos')
      .select('id, storage_path, width, height, uploaded_at, guests(display_name)')
      .eq('event_id', id)
      .eq('is_deleted', false)
      .order('uploaded_at', { ascending: false });

    if (error) throw new Error(error.message);

    if (!photos || photos.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    // Generate signed URLs in bulk (1-hour TTL per PRD)
    const paths = photos.map(p => p.storage_path);
    const { data: signedUrls, error: urlError } = await supabaseAdmin.storage
      .from('event-photos')
      .createSignedUrls(paths, 60 * 60);

    if (urlError) throw new Error(urlError.message);

    // Map together
    const mappedPhotos = photos.map((p: any) => {
      const urlObj = signedUrls.find(u => u.path === p.storage_path);
      return {
        id: p.id,
        storagePath: p.storage_path,
        url: urlObj?.signedUrl || null,
        guestName: Array.isArray(p.guests) ? p.guests[0]?.display_name : p.guests?.display_name,
        uploadedAt: p.uploaded_at
      };
    });

    return NextResponse.json({ photos: mappedPhotos });

  } catch (err: any) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
