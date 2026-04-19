import { NextResponse } from 'next/server';
import { ApiError, validateGuestSession, getSessionTokenOrThrow } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const token = getSessionTokenOrThrow(request);
    await validateGuestSession(token); // Validates guest is active

    const { storagePath } = await request.json();

    if (!storagePath) {
      return NextResponse.json({ error: 'Missing storagePath' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.storage
      .from('event-photos')
      .createSignedUrl(storagePath, 60 * 60); // 1-hour TTL

    if (error || !data) {
       throw new Error(error?.message || 'Failed to generate signed URL');
    }

    return NextResponse.json({
       url: data.signedUrl
    });

  } catch (err: any) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
