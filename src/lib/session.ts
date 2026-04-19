import { createAdminClient } from '@/lib/supabase/server';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validates a guest session token against the database.
 * Throws ApiError if invalid, removed, event is inactive, or expired.
 */
export async function validateGuestSession(token: string | null) {
  if (!token) throw new ApiError(401, 'MISSING_SESSION_TOKEN');

  const supabaseAdmin = createAdminClient();

  const { data: guest, error } = await supabaseAdmin
    .from('guests')
    .select(`
      id,
      event_id,
      photo_count,
      is_removed,
      display_name,
      joined_at,
      events!inner (
        is_active,
        expires_at
      )
    `)
    .eq('session_token', token)
    .single();

  if (error || !guest) throw new ApiError(401, 'INVALID_SESSION');
  if (guest.is_removed) throw new ApiError(403, 'GUEST_REMOVED');
  
  const event = Array.isArray(guest.events) ? guest.events[0] : guest.events;
  if (!event || !event.is_active) throw new ApiError(403, 'EVENT_INACTIVE');
  if (new Date() > new Date(event.expires_at)) throw new ApiError(403, 'EVENT_EXPIRED');

  return {
    ...guest,
    event
  };
}

/**
 * Helper to extract session token from HTTP headers
 */
export function getSessionTokenOrThrow(request: Request): string {
  const token = request.headers.get('X-Session-Token');
  if (!token) {
    throw new ApiError(401, 'Missing X-Session-Token header');
  }
  return token;
}
