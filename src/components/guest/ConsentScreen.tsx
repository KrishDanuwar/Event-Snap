import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGuestSession } from '@/hooks/useGuestSession';

export default function ConsentScreen({ 
  eventId, 
  session,
  onAgreed 
}: { 
  eventId: string, 
  session: any,
  onAgreed: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAgree = async () => {
    if (!session) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/guests/consent', {
        method: 'POST',
        headers: {
          'X-Session-Token': session.sessionToken,
          'Content-Type': 'application/json'
        }
      });
      onAgreed();
    } catch (err) {
      console.error(err);
      // Even if it fails we push them through for UX in this V1
      onAgreed();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-slide-up pt-safe pb-safe max-w-md mx-auto">
      
      <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] bg-opacity-20 flex items-center justify-center mb-6">
         <span className="text-3xl text-[var(--color-primary)]">🛡️</span>
      </div>

      <h2 className="text-2xl font-bold mb-4">Privacy & Sharing</h2>
      
      <div className="text-left space-y-4 text-sm opacity-90 mb-8 bg-black/10 dark:bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
        <p>• Your name and photos will be securely visible to all other guests at this specific event.</p>
        <p>• All photos, data, and sessions are automatically permanently deleted after the event concludes.</p>
        <p>• We do not track, sell, or retain any personal identifiers outside of this session.</p>
      </div>

      <Button
        onClick={handleAgree}
        className="w-full h-14 text-lg rounded-2xl font-semibold shadow-lg"
        style={{ backgroundColor: 'var(--color-button)' }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Loading...' : "I Agree, Let's Go"}
      </Button>
    </div>
  );
}
