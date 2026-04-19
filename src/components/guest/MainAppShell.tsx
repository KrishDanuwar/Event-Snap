'use client';

import { useState } from 'react';

import CameraView from './CameraView';
import GalleryView from './GalleryView';

export default function MainAppShell({ eventId, eventName }: { eventId: string, eventName?: string }) {
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');

  return (
    <div className="flex-1 flex flex-col h-[100dvh] w-full pt-safe pb-safe">
      
      {/* Dynamic Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative z-0 pb-20">
         {activeTab === 'camera' ? <CameraView eventId={eventId} /> : <GalleryView eventId={eventId} eventName={eventName || 'EventSnap'} />}
      </main>

      {/* Native-feel Bottom Navigation (iPhone Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-neutral-100 flex flex-col items-center pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pt-4 pb-[calc(1.5rem+var(--safe-area-bottom))]">
        
        {/* Mode Switcher Line */}
        <div className="flex gap-8 mb-4 px-4 overflow-x-auto no-scrollbar pointer-events-auto">
           <button 
             onClick={() => setActiveTab('camera')}
             className={`text-xs font-bold tracking-[0.2em] uppercase transition-all ${activeTab === 'camera' ? 'text-primary' : 'text-neutral-400'}`}
           >
             Camera
           </button>
           <button 
             onClick={() => setActiveTab('gallery')}
             className={`text-xs font-bold tracking-[0.2em] uppercase transition-all ${activeTab === 'gallery' ? 'text-primary' : 'text-neutral-400'}`}
           >
             Gallery
           </button>
        </div>

        {/* The "Main Action" will be handled inside the views (e.g. Shutter in CameraView) */}
        {/* This bar just holds the switcher and maybe a small indicator */}
        <div className="w-12 h-1 bg-neutral-200 rounded-full mb-1" />
      </nav>
      
    </div>
  );
}
