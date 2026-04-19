// src/types/event.ts
// EventSnap — Event type definitions

export interface EventTheme {
  backgroundImagePath: string | null;
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  textMode: 'light' | 'dark';
  fontFamily: string;
}

export interface Event {
  id: string;
  name: string;
  welcome_message: string | null;
  expires_at: string; // ISO timestamp
  max_guests: number | null; // null = unlimited
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  logo_path: string | null;
  theme: EventTheme;
}

export interface EventWithCounts extends Event {
  guest_count: number;
  photo_count: number;
}

export interface EventThemeResponse {
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  textMode: 'light' | 'dark';
  fontFamily: string;
  welcomeMessage: string | null;
  eventName: string;
  logoUrl: string | null;
  backgroundUrl: string | null;
  consentText: string;
  expiryDuration: string;
}

export type EventStatus = 'active' | 'expired' | 'deleted';

export interface CreateEventPayload {
  name: string;
  welcome_message?: string;
  expiry_duration: '24h' | '3d' | '7d';
  max_guests?: number | null;
  photos_per_guest?: number;
  consent_text: string;
  theme: EventTheme;
}
