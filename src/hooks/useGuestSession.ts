import { useState, useCallback, useEffect } from 'react';
import type { SessionState, GuestSession, JoinResponse, ValidateResponse, GuestSummary } from '@/types/guest';

const getStorageKey = (eventId: string) => `snap_session_${eventId}`;

export function useGuestSession(eventId: string) {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestSummary | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('no_token');
  const [isLoading, setIsLoading] = useState(true);

  // Mount logic: Load from local storage and validate remotely
  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      if (!eventId) return;

      const stored = localStorage.getItem(getStorageKey(eventId));
      if (!stored) {
        if (mounted) {
          setSessionState('no_token');
          setIsLoading(false);
        }
        return;
      }

      try {
        const storedSession = JSON.parse(stored) as GuestSession;
        if (mounted) setSession(storedSession);

        const res = await fetch('/api/guests/validate', {
          method: 'POST',
          headers: {
             'X-Session-Token': storedSession.sessionToken,
             'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json() as ValidateResponse;

        if (mounted) {
           setSessionState(data.state);
           if (data.state === 'valid' && data.guest) {
             setGuestDetails(data.guest);
           } else {
             // Invalid, expired, removed: Clear local state so they start over or see a message
             if (data.state !== 'expired') {
               localStorage.removeItem(getStorageKey(eventId));
               setSession(null);
             }
           }
        }
      } catch (err) {
        console.error('Failed to validate session:', err);
        if (mounted) setSessionState('invalid');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeSession();

    return () => { mounted = false; };
  }, [eventId]);

  const joinSession = useCallback(async (displayName: string) => {
    const res = await fetch('/api/guests/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, displayName })
    });

    if (!res.ok) {
       const errBody = await res.json().catch(() => ({}));
       throw new Error(errBody.error || 'Failed to join');
    }

    const data = await res.json() as JoinResponse;
    
    const newSession: GuestSession = {
      guestId: data.guestId,
      sessionToken: data.sessionToken,
      displayName: data.displayName,
      eventId: eventId,
      expiresAt: data.expiresAt
    };

    localStorage.setItem(getStorageKey(eventId), JSON.stringify(newSession));
    setSession(newSession);
    setSessionState('valid');
    
    setGuestDetails({
      id: data.guestId,
      displayName: data.displayName,
      photoCount: 0,
      joinedAt: new Date().toISOString(),
      isRemoved: false,
      consentedAt: null
    });

    return data;
  }, [eventId]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(getStorageKey(eventId));
    setSession(null);
    setSessionState('no_token');
    setGuestDetails(null);
  }, [eventId]);

  const incrementPhotoCount = useCallback(() => {
    setGuestDetails(prev => prev ? { ...prev, photoCount: prev.photoCount + 1 } : null);
  }, []);

  const decrementPhotoCount = useCallback(() => {
    setGuestDetails(prev => prev ? { ...prev, photoCount: Math.max(0, prev.photoCount - 1) } : null);
  }, []);

  return {
    session,
    guestDetails,
    sessionState,
    isLoading,
    joinSession,
    clearSession,
    incrementPhotoCount,
    decrementPhotoCount
  };
}
