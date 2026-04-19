import { useState } from 'react';
import { useGuestSession } from '@/hooks/useGuestSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JoinScreen({ 
  eventId, 
  eventData, 
  onJoin 
}: { 
  eventId: string, 
  eventData: any,
  onJoin: (name: string) => Promise<any>
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await onJoin(name);
    } catch (err: any) {
      setError(err.message || 'Failed to join. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-slide-up pt-safe pb-safe bg-white">
      
      {eventData.logo_url && (
         <img 
           src={eventData.logo_url} 
           alt="Event Logo" 
           className="w-24 h-24 object-cover rounded-full mb-6 shadow-lg border-2 border-[var(--color-primary)]" 
         />
      )}

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
        {eventData.name}
      </h1>
      
      <p className="text-lg opacity-90 mb-10 max-w-sm">
        {eventData.welcome_message || 'Welcome to the event! Enter your name to start sharing photos.'}
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          type="text"
          placeholder="Your Name (e.g. James C.)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          className="h-16 text-lg rounded-[2rem] bg-neutral-50 border-neutral-100 placeholder:text-neutral-400 text-black focus-visible:ring-primary shadow-inner"
          required
        />
        
        {error && <p className="text-red-500 font-medium text-sm text-left px-2">{error}</p>}
        
        <Button
          type="submit"
          className="w-full h-16 text-lg rounded-[2rem] font-bold shadow-xl shadow-blue-100 transition-transform active:scale-95 bg-primary text-white"
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting ? 'Entering...' : 'Join Event'}
        </Button>
      </form>
      
    </div>
  );
}
