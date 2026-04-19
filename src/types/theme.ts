// src/types/theme.ts
// EventSnap — Theme type definitions (re-exports + utilities)

export type { EventTheme, EventThemeResponse } from './event';

export type TextMode = 'light' | 'dark';

export const DEFAULT_THEME = {
  primaryColor: '#6366F1',
  buttonColor: '#4F46E5',
  textColor: '#FFFFFF',
  textMode: 'light' as const,
  fontFamily: 'Poppins',
  backgroundImagePath: null,
} as const;

export const CURATED_FONTS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
  'Montserrat',
  'Raleway',
  'Nunito',
  'Josefin Sans',
  'Dancing Script',
  'Great Vibes',
  'Pacifico',
  'Oswald',
  'Merriweather',
  'Poppins',
  'EB Garamond',
  'Quicksand',
] as const;

export type CuratedFont = typeof CURATED_FONTS[number];

export const EXPIRY_DURATIONS = [
  { label: '24 hours', value: '24h' },
  { label: '3 days', value: '3d' },
  { label: '7 days', value: '7d' },
] as const;

export type ExpiryDuration = typeof EXPIRY_DURATIONS[number]['value'];

export const DEFAULT_CONSENT_TEXT =
  'Your name and photos will be visible to all guests at this event. All data is automatically deleted after the event expires. By continuing you agree to these terms.';
