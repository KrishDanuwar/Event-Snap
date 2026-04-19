import { createAdminClient } from '@/lib/supabase/server';
import ThemeProvider from '@/components/shared/ThemeProvider';
import EventClientWrapper from '@/components/guest/EventClientWrapper';

// Disable SSR statically, we must fetch fresh event data every time
export const dynamic = 'force-dynamic';

export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const supabaseAdmin = createAdminClient();

  const { data: event, error } = await supabaseAdmin
    .from('events')
    .select('id, name, welcome_message, logo_path, theme, is_active, expires_at')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    return <ErrorState message="Event not found." subtext="The QR code might be invalid or the event was permanently deleted." />;
  }

  if (!event.is_active || new Date() > new Date(event.expires_at)) {
    return <ErrorState message="This event has ended." subtext="Event galleries only remain active for the duration intended by the host." />;
  }

  // Generate signed URLs serverside for ThemeProvider
  let backgroundUrl = null;
  let logoUrl = null;

  if (event.theme?.backgroundImagePath) {
    const { data } = await supabaseAdmin.storage
      .from('event-assets')
      .createSignedUrl(event.theme.backgroundImagePath, 60 * 60 * 24); 
    backgroundUrl = data?.signedUrl || null;
  }

  if (event.logo_path) {
    const { data } = await supabaseAdmin.storage
      .from('event-assets')
      .createSignedUrl(event.logo_path, 60 * 60 * 24); 
    logoUrl = data?.signedUrl || null;
  }

  const eventData = {
    ...event,
    logo_url: logoUrl
  };

  return (
    <ThemeProvider theme={event.theme} backgroundUrl={backgroundUrl}>
       <EventClientWrapper eventId={event.id} eventData={eventData} />
    </ThemeProvider>
  );
}

function ErrorState({ message, subtext }: { message: string, subtext: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-zinc-950 text-white px-6 text-center font-sans tracking-tight">
      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
         <span className="text-2xl opacity-50">📷</span>
      </div>
      <h1 className="text-3xl md:text-5xl font-bold mb-4">{message}</h1>
      <p className="opacity-60 max-w-sm text-lg md:text-xl">{subtext}</p>
    </div>
  );
}
