'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemePreview from '@/components/admin/ThemePreview';
import type { EventTheme } from '@/types/theme';

const FONTS = [
  "Playfair Display", "Cormorant Garamond", "Lora", "Montserrat", "Raleway", 
  "Nunito", "Josefin Sans", "Dancing Script", "Great Vibes", "Pacifico", 
  "Oswald", "Merriweather", "Poppins", "EB Garamond", "Quicksand"
];

export default function NewEventPage() {
  const router = useRouter();
  
  // Base Form State
  const [name, setName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(3);
  
  // Theme State
  const [theme, setTheme] = useState<EventTheme>({
    primaryColor: '#e11d48',
    buttonColor: '#000000',
    textColor: '#ffffff',
    textMode: 'light',
    fontFamily: 'Inter',
    backgroundImagePath: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert days to ISO expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiresInDays);

    try {
      const res = await fetch('/api/admin/events', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            name,
            welcome_message: welcomeMessage,
            expires_at: expiryDate.toISOString(),
            theme
         })
      });

      if (!res.ok) throw new Error('Failed to create route');
      const data = await res.json();
      router.push(`/admin/events/${data.id}`);
    } catch (err) {
      alert('Failed to generate event. Ensure you have network connectivity.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Create New Event</h1>
        <p className="text-neutral-500 text-lg">Define exactly what your guests will see natively.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
         
         {/* Form Controls */}
         <form onSubmit={handleSubmit} className="flex-1 w-full bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 lg:sticky lg:top-8">
            
            <div className="space-y-6">
               <section>
                  <h3 className="text-xl font-bold mb-4 border-b pb-2">Core Settings</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-semibold mb-1">Event Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 ring-red-500 outline-none" placeholder="E.g., Sarah's Wedding" />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1">Welcome Message</label>
                        <input type="text" value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} className="w-full border rounded-lg p-3 text-sm focus:ring-2 ring-red-500 outline-none" placeholder="Drop a photo to share the love!" />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1">Retention Duration</label>
                        <select value={expiresInDays} onChange={e => setExpiresInDays(Number(e.target.value))} className="w-full border rounded-lg p-3 text-sm focus:ring-2 ring-red-500 outline-none">
                           <option value={1}>24 Hours</option>
                           <option value={3}>3 Days</option>
                           <option value={7}>7 Days</option>
                        </select>
                        <p className="text-xs text-neutral-400 mt-1">All JPEGs completely delete immediately after this duration concludes.</p>
                     </div>
                  </div>
               </section>

               <section>
                  <h3 className="text-xl font-bold mb-4 border-b pb-2">Branding & Theme</h3>
                  <div className="space-y-4">
                     
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <label className="block text-sm font-semibold mb-1">Primary Color</label>
                           <div className="flex items-center gap-2">
                             <input type="color" value={theme.primaryColor} onChange={e => setTheme({...theme, primaryColor: e.target.value})} className="w-10 h-10 border-0 p-0 rounded cursor-pointer" />
                             <span className="text-xs font-mono">{theme.primaryColor}</span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold mb-1">Button Color</label>
                           <div className="flex items-center gap-2">
                             <input type="color" value={theme.buttonColor} onChange={e => setTheme({...theme, buttonColor: e.target.value})} className="w-10 h-10 border-0 p-0 rounded cursor-pointer" />
                             <span className="text-xs font-mono">{theme.buttonColor}</span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold mb-1">Text Color</label>
                           <div className="flex items-center gap-2">
                             <input type="color" value={theme.textColor} onChange={e => setTheme({...theme, textColor: e.target.value})} className="w-10 h-10 border-0 p-0 rounded cursor-pointer" />
                             <span className="text-xs font-mono">{theme.textColor}</span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-semibold mb-1">Typography Set</label>
                           <select value={theme.fontFamily} onChange={e => setTheme({...theme, fontFamily: e.target.value})} className="w-full border rounded-lg p-3 text-sm focus:ring-2 ring-red-500 outline-none">
                              <option value="Inter">System Default (Inter)</option>
                              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold mb-1">Overlay Mode</label>
                           <select value={theme.textMode} onChange={e => setTheme({...theme, textMode: e.target.value as 'light'|'dark'})} className="w-full border rounded-lg p-3 text-sm focus:ring-2 ring-red-500 outline-none">
                              <option value="light">Light Text (Dark Overlay)</option>
                              <option value="dark">Dark Text (Light Overlay)</option>
                           </select>
                        </div>
                     </div>

                  </div>
               </section>

               <button disabled={isSubmitting || !name} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Generating Event...' : '🚀 Launch Gallery'}
               </button>
            </div>
            
         </form>

         {/* Sticky Preview Viewer */}
         <div className="w-full lg:w-[320px] flex flex-col items-center justify-center py-6 lg:py-0">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Live URL Preview</h3>
            <ThemePreview 
               name={name}
               welcomeMessage={welcomeMessage}
               theme={theme}
            />
         </div>

      </div>
    </div>
  );
}
