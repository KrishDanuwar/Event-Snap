'use client';

import { EventTheme } from '@/types/theme';

export default function DesignPreview({ 
  name, 
  theme, 
  logoUrl
}: { 
  name: string, 
  theme: EventTheme,
  logoUrl: string | null
}) {
  return (
    <div className="w-full flex-col flex items-center justify-center">
      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Guest Join Screen Preview</div>
      
      {/* Mini Mock Browser / Phone Frame */}
      <div className="w-full max-w-[320px] aspect-[9/16] bg-white rounded-[2.5rem] border-[8px] border-neutral-900 shadow-2xl overflow-hidden relative flex flex-col font-sans">
        
        {/* Background Image Layer */}
        {theme.backgroundImagePath && (
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-white/40 z-10" />
             {/* Note: we can't easily preview the BG image here without the signed URL, but we show a placeholder */}
             <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-200">BACKGROUND IMAGE ACTIVE</span>
             </div>
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: theme.fontFamily || 'inherit', color: theme.textColor }}>
           
           {logoUrl ? (
             <img src={logoUrl} className="w-16 h-16 rounded-full mb-4 shadow-md object-cover border-2" style={{ borderColor: theme.primaryColor }} />
           ) : (
             <div className="w-16 h-16 rounded-full bg-neutral-100 mb-4 flex items-center justify-center text-xl">📷</div>
           )}

           <h1 className="text-2xl font-bold mb-2 tracking-tight">{name || 'Your Event'}</h1>
           <p className="text-xs opacity-70 mb-6">Welcome to the event! Enter your name to start sharing photos.</p>

           <div className="w-full space-y-3">
              <div className="h-10 rounded-2xl bg-neutral-50 border border-neutral-100 w-full" />
              <div 
                className="h-10 rounded-2xl w-full flex items-center justify-center text-xs font-bold shadow-lg"
                style={{ backgroundColor: theme.buttonColor || '#3B82F6', color: '#fff' }}
              >
                Join Event
              </div>
           </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-neutral-800 rounded-full" />
      </div>
    </div>
  );
}
