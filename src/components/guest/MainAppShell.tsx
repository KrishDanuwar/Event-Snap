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

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+var(--safe-area-bottom))] bg-gradient-to-t from-black/80 to-transparent pointer-events-none flex justify-center">
        <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-full px-2 py-2 flex gap-2 pointer-events-auto shadow-2xl">
           
           <button 
             onClick={() => setActiveTab('camera')}
             className={`px-6 py-3 rounded-full text-sm font-semibold transition-colors ${activeTab === 'camera' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
           >
             📸 Camera
           </button>

           <button 
             onClick={() => setActiveTab('gallery')}
             className={`px-6 py-3 rounded-full text-sm font-semibold transition-colors ${activeTab === 'gallery' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
           >
             🖼️ Gallery
           </button>
           
        </div>
      </nav>
      
    </div>
  );
}
