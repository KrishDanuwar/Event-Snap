import { NextResponse } from 'next/server';
import { ApiError, validateGuestSession, getSessionTokenOrThrow } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const token = getSessionTokenOrThrow(request);
    
    // Attempt validation
    const sessionData = await validateGuestSession(token);

    // If we reach here, session is 'valid'
    return NextResponse.json({
      state: 'valid',
      guest: {
        id: sessionData.id,
        displayName: sessionData.display_name,
        photoCount: sessionData.photo_count,
        joinedAt: sessionData.joined_at,
        isRemoved: sessionData.is_removed,
        consentedAt: sessionData.consented_at
      }
    });

  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.message === 'GUEST_REMOVED') {
        return NextResponse.json({ state: 'removed' });
      }
      if (err.message === 'EVENT_EXPIRED' || err.message === 'EVENT_INACTIVE') {
        return NextResponse.json({ state: 'expired' });
      }
      if (err.message === 'INVALID_SESSION') {
        return NextResponse.json({ state: 'invalid' });
      }
      if (err.message.includes('Missing')) {
         return NextResponse.json({ state: 'no_token' });
      }
    }
    
    // General fallback
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
