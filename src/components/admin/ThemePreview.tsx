import { EventTheme } from '@/types/theme';

interface ThemePreviewProps {
  name: string;
  welcomeMessage: string;
  theme: EventTheme;
  logoPreview?: string | null;
}

export default function ThemePreview({ name, welcomeMessage, theme, logoPreview }: ThemePreviewProps) {
  // We mimic the exact DOM structure and classes of JoinScreen, but using inline variables locally.
  
  return (
    <div className="w-[320px] h-[650px] border-[12px] border-neutral-900 rounded-[3rem] overflow-hidden shadow-2xl relative bg-zinc-950 flex flex-col font-sans shrink-0 mx-auto">
      
      {/* Dynamic Font Injection specifically for the iframe emulator */}
      {theme.fontFamily && (
         <style>{`
           @import url('https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap');
         `}</style>
      )}

      <div 
        className="absolute inset-0 flex flex-col transition-all duration-300"
        style={{
          fontFamily: theme.fontFamily ? `'${theme.fontFamily}', sans-serif` : 'sans-serif',
          color: theme.textColor,
          backgroundImage: theme.backgroundImagePath ? `url(${theme.backgroundImagePath})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        
        {/* Tint Overlay Matcher */}
        <div 
          className="absolute inset-0 z-0 transition-colors duration-300" 
          style={{ backgroundColor: theme.textMode === 'light' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)' }} 
        />
        
        {/* Simulated JoinScreen Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
            
            {/* Logo */}
            {logoPreview ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img 
                 src={logoPreview} 
                 alt="Logo" 
                 className="w-20 h-20 object-cover rounded-full mb-6 shadow-md border-2"
                 style={{ borderColor: theme.primaryColor }}
               />
            ) : (
               <div 
                 className="w-20 h-20 rounded-full mb-6 shadow-md border-2 flex items-center justify-center bg-black/10 backdrop-blur-sm"
                 style={{ borderColor: theme.primaryColor }}
               >
                  <span className="text-2xl">📸</span>
               </div>
            )}

            <h1 className="text-3xl font-bold tracking-tight mb-2 truncate w-full">
              {name || 'Event Title'}
            </h1>
            
            <p className="text-sm opacity-90 mb-8 max-w-xs break-words">
              {welcomeMessage || 'Welcome to the event! Enter your name to start sharing photos.'}
            </p>

            <div className="w-full space-y-3">
              <div 
                 className="h-12 w-full rounded-2xl bg-white/10 border backdrop-blur-md flex items-center px-4"
                 style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                 <span className="text-sm opacity-50">Your Name (e.g. James C.)</span>
              </div>
              
              <div 
                className="w-full h-12 rounded-2xl font-semibold shadow-lg flex items-center justify-center transition-colors shadow-black/20"
                style={{ 
                  backgroundColor: theme.buttonColor, 
                  color: theme.textMode === 'light' ? '#ffffff' : '#000000' 
                }}
              >
                Join Event
              </div>
            </div>

        </div>

      </div>
    </div>
  );
}
