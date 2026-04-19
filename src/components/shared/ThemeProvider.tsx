'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { EventTheme } from '@/types/theme';

interface ThemeContextType {
  theme: EventTheme | null;
  backgroundUrl: string | null;
}

const ThemeContext = createContext<ThemeContextType>({ theme: null, backgroundUrl: null });

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({
  theme,
  backgroundUrl,
  children
}: {
  theme: EventTheme;
  backgroundUrl: string | null;
  children: React.ReactNode;
}) {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // 1. Load Google Font
    if (theme.fontFamily) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      link.onload = () => setFontLoaded(true);
    } else {
      setFontLoaded(true);
    }

    // 2. Inject CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-button', theme.buttonColor);
    root.style.setProperty('--color-text', theme.textColor);
    
    if (theme.fontFamily) {
      root.style.setProperty('--font-family', `'${theme.fontFamily}', sans-serif`);
    }

    if (backgroundUrl) {
      root.style.setProperty('--event-bg-image', `url(${backgroundUrl})`);
    } else {
      root.style.setProperty('--event-bg-image', 'none');
    }

    // Cleanup
    return () => {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-button');
      root.style.removeProperty('--color-text');
      root.style.removeProperty('--font-family');
      root.style.removeProperty('--event-bg-image');
    };
  }, [theme, backgroundUrl]);

  // Prevent flash of unstyled text
  if (!fontLoaded && theme.fontFamily) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <ThemeContext.Provider value={{ theme, backgroundUrl }}>
      <div 
        className={`event-bg relative min-h-[100dvh] w-full text-[var(--color-text)] flex flex-col font-[var(--font-family)]`}
      >
        <div 
          className={`absolute inset-0 z-0 ${theme.textMode === 'light' ? 'event-overlay-light' : 'event-overlay-dark'}`}
        />
        <div className="relative z-10 flex-col flex min-h-[100dvh]">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
