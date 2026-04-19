// src/types/guest.ts
// EventSnap — Guest type definitions

export interface Guest {
  id: string;
  event_id: string;
  display_name: string;
  session_token: string;
  photo_count: number;
  consented_at: string | null;
  joined_at: string;
  is_removed: boolean;
}

export interface GuestSession {
  guestId: string;
  sessionToken: string;
  displayName: string;
  eventId: string;
  expiresAt: string;
}

export type SessionState =
  | 'valid'
  | 'removed'
  | 'expired'
  | 'invalid'
  | 'no_token';

export interface GuestSummary {
  id: string;
  displayName: string;
  photoCount: number;
  joinedAt: string;
  isRemoved: boolean;
  consentedAt: string | null;
}

export interface JoinResponse {
  guestId: string;
  sessionToken: string;
  displayName: string;
  theme: import('./event').EventThemeResponse;
  expiresAt: string;
}

export interface ValidateResponse {
  state: SessionState;
  guest?: GuestSummary;
}
