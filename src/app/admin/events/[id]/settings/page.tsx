'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import AssetUploader from '@/components/admin/AssetUploader';
import DesignPreview from '@/components/admin/DesignPreview';
import { EventTheme } from '@/types/theme';

const FONTS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Outfit', value: 'Outfit' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Roboto Mono', value: 'Roboto Mono' },
  { name: 'Permanent Marker', value: 'Permanent Marker' },
];

export default function AdminSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);

  // Local state for real-time preview
  const [name, setName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<EventTheme>({
    primaryColor: '#3B82F6',
    buttonColor: '#3B82F6',
    textColor: '#000000',
    fontFamily: 'Inter',
    backgroundImagePath: null,
    textMode: 'light'
  });

  useEffect(() => {
    async function loadData() {
      const res = await fetch(`/api/admin/events/${eventId}`);
      const data = await res.json();
      if (data.event) {
        setEvent(data.event);
        setName(data.event.name);
        setWelcomeMessage(data.event.welcome_message || '');
        setLogoPath(data.event.logo_path);
        setTheme({
          ...theme,
          ...data.event.theme
        });

        // Resolve logo URL for preview
        if (data.event.logo_path) {
           const { createBrowserClient } = await import('@/lib/supabase/client');
           const supabase = createBrowserClient();
           const { data: sign } = await supabase.storage.from('event-assets').createSignedUrl(data.event.logo_path, 3600);
           if (sign?.signedUrl) setLogoUrl(sign.signedUrl);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [eventId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          welcome_message: welcomeMessage,
          logo_path: logoPath,
          theme
        })
      });
      if (res.ok) {
         router.push(`/admin/events/${eventId}`);
      } else {
         alert('Failed to save changes');
      }
    } catch (err) {
       alert('Error saving settings');
    } finally {
       setSaving(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in">
       
       <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-sm font-bold text-neutral-400 hover:text-black transition-colors">
             ← Back to Dashboard
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Design Changes'}
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left: Editor */}
          <div className="space-y-10">
             
             {/* Section 1: Content */}
             <section className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
                <h3 className="text-xl font-extrabold flex items-center gap-2">📝 Event Content</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Event Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-semibold outline-blue-500"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Welcome Message</label>
                      <textarea 
                        value={welcomeMessage} 
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        rows={3}
                        className="w-full bg-neutral-50 border-neutral-100 rounded-xl p-4 font-medium outline-blue-500 text-sm"
                      />
                   </div>
                </div>
             </section>

             {/* Section 2: Visuals */}
             <section className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-8">
                <h3 className="text-xl font-extrabold flex items-center gap-2">🎨 Visual Identity</h3>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Primary Color</label>
                      <div className="flex gap-3 items-center">
                        <input type="color" value={theme.primaryColor} onChange={(e) => setTheme({...theme, primaryColor: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none" />
                        <span className="text-sm font-mono font-bold opacity-50 uppercase">{theme.primaryColor}</span>
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Button Color</label>
                      <div className="flex gap-3 items-center">
                        <input type="color" value={theme.buttonColor} onChange={(e) => setTheme({...theme, buttonColor: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none" />
                        <span className="text-sm font-mono font-bold opacity-50 uppercase">{theme.buttonColor}</span>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Typography (Google Fonts)</label>
                   <select 
                     value={theme.fontFamily} 
                     onChange={(e) => setTheme({...theme, fontFamily: e.target.value})}
                     className="w-full h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-bold outline-blue-500"
                   >
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                   </select>
                </div>

                <div className="space-y-6 pt-4 border-t border-neutral-50">
                   <AssetUploader 
                      label="Event Logo" 
                      bucket="event-assets" 
                      currentPath={logoPath}
                      onUploadComplete={(path) => setLogoPath(path)} 
                   />
                   <AssetUploader 
                      label="Background Image" 
                      bucket="event-assets" 
                      currentPath={theme.backgroundImagePath}
                      onUploadComplete={(path) => setTheme({...theme, backgroundImagePath: path})} 
                   />
                </div>
             </section>

          </div>

          {/* Right: Real-time Preview */}
          <div className="sticky top-10 h-fit">
             <DesignPreview name={name} theme={theme} logoUrl={logoUrl} />
          </div>

       </div>
    </div>
  );
}
