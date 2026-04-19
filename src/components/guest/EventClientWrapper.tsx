'use client';

import { useState } from 'react';
import { useGuestSession } from '@/hooks/useGuestSession';
import JoinScreen from './JoinScreen';
import ConsentScreen from './ConsentScreen';
import MainAppShell from './MainAppShell';

export default function EventClientWrapper({ eventId, eventData }: { eventId: string, eventData: any }) {
  const { sessionState, isLoading, guestDetails, joinSession, session } = useGuestSession(eventId);
  
  // Local state to gracefully handle after consent is given
  const [justConsented, setJustConsented] = useState(false);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[100dvh] pt-safe pb-safe"><span className="animate-pulse">Loading Event...</span></div>;
  }

  // 1. No Active DB Session or Token Expired
  if (sessionState === 'no_token' || sessionState === 'invalid' || sessionState === 'expired') {
    return <JoinScreen eventId={eventId} eventData={eventData} onJoin={joinSession} />;
  }

  // 2. Removed by Admin
  if (sessionState === 'removed' || guestDetails?.isRemoved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] pt-safe pb-safe px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg opacity-80">You have been removed from this event by the host.</p>
      </div>
    );
  }

  // 3. Needs Privacy Consent
  if (!justConsented && guestDetails && guestDetails.consentedAt === null) {
    return <ConsentScreen eventId={eventId} session={session} onAgreed={() => setJustConsented(true)} />;
  }

  // 4. Fully Authenticated
  return <MainAppShell eventId={eventId} eventName={eventData?.name} />;
}
