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
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-slide-up pt-safe pb-safe bg-white mx-auto w-full">
      
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
         <span className="text-4xl text-primary">🛡️</span>
      </div>

      <h2 className="text-2xl font-bold mb-4">Privacy & Sharing</h2>
      
      <div className="text-left space-y-4 text-base text-neutral-600 mb-10 bg-neutral-50 p-8 rounded-[2rem] border border-neutral-100 shadow-inner">
        <p>• Your name and photos will be securely visible to guests at this specific event.</p>
        <p>• All photos and sessions are automatically permanently deleted after the event concludes.</p>
        <p>• We do not track or sell any personal data.</p>
      </div>

      <Button
        onClick={handleAgree}
        className="w-full h-16 text-lg rounded-[2rem] font-bold shadow-xl shadow-blue-100 bg-primary text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Loading...' : "I Agree, Let's Go"}
      </Button>
    </div>
  );
}
