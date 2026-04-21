'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Timer as TimerIcon, RefreshCw, ZapOff } from 'lucide-react';
import { initializeCamera, captureFrame } from '@/lib/camera';
import { uploadPhoto } from '@/lib/upload';
import { useGuestSession } from '@/hooks/useGuestSession';

type TimerSeconds = 0 | 3 | 5 | 10;
type FilterType = 'none' | 'grayscale(1)' | 'sepia(1)' | 'saturate(2)';
type CameraMode = 'PHOTO' | 'SQUARE' | 'PORTRAIT';
type ZoomLevel = 1 | 2 | 4;

export default function CameraView({ eventId }: { eventId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flash, setFlash] = useState(false);
  const [timer, setTimer] = useState<TimerSeconds>(0);
  const [filter, setFilter] = useState<FilterType>('none');
  const [mode, setMode] = useState<CameraMode>('PHOTO');
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [lastPhotoUrl, setLastPhotoUrl] = useState<string | null>(null);
  
  const { session, guestDetails, incrementPhotoCount } = useGuestSession(eventId);

  // Setup/Switch Camera
  useEffect(() => {
    let isMounted = true;
    
    async function setupCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        await new Promise(r => setTimeout(r, 100));
        const mediaStream = await initializeCamera(facingMode);
        if (!isMounted) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setFlash(false);
        setZoom(1); // Reset zoom on camera switch
      } catch (err: any) {
        console.error(err);
        setError('Camera access failed. Please ensure permissions are granted.');
      }
    }
    setupCamera();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    if (videoRef.current && stream && !previewCanvas) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, previewCanvas]);

  const handleCapture = () => {
    if (!videoRef.current || countdown !== null) return;
    
    const snap = () => {
       const canvas = captureFrame(videoRef.current!, mode === 'SQUARE', zoom);
       setPreviewCanvas(canvas);
       setCountdown(null);
    };

    if (timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            snap();
            return null;
          }
          if (window.navigator.vibrate) window.navigator.vibrate(20);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      snap();
    }
  };

  const handleFlip = () => {
     setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
    if (!stream || facingMode === 'user') return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        const newFlash = !flash;
        await track.applyConstraints({ advanced: [{ torch: newFlash }] } as any);
        setFlash(newFlash);
      } else {
        alert('Flash not supported on this device.');
      }
    } catch (err) {
      console.error('Flash toggle failed:', err);
    }
  };

  const cycleZoom = async () => {
    const nextZoom = zoom === 1 ? 2 : zoom === 2 ? 4 : 1;
    setZoom(nextZoom);
    
    if (stream && facingMode === 'environment') {
       const track = stream.getVideoTracks()[0];
       try {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.zoom) {
             await track.applyConstraints({
                advanced: [{ zoom: nextZoom }]
             } as any);
          }
       } catch (e) {
          console.warn('Hardware zoom not supported, using digital fallback');
       }
    }
  };

  const cycleTimer = () => {
    const sequence: TimerSeconds[] = [0, 3, 5, 10];
    const currentIndex = sequence.indexOf(timer);
    const nextIndex = (currentIndex + 1) % sequence.length;
    setTimer(sequence[nextIndex] as TimerSeconds);
  };

  const cycleFilter = () => {
    const filters: FilterType[] = ['none', 'grayscale(1)', 'sepia(1)', 'saturate(2)'];
    const currentIndex = filters.indexOf(filter);
    const nextIndex = (currentIndex + 1) % filters.length;
    setFilter(filters[nextIndex] as FilterType);
  };

  const handleRetake = () => {
    setPreviewCanvas(null);
    setError('');
  };

  const handleKeep = async () => {
    if (!previewCanvas || !session) return;
    if (guestDetails && guestDetails.photoCount >= 25) {
      setError('Limit Reached (25/25).');
      return;
    }
    setIsUploading(true);
    setError('');
    const { success, error: uploadErr } = await uploadPhoto(previewCanvas, session.sessionToken, (pct) => {
      setUploadProgress(pct);
    });
    if (success) {
      incrementPhotoCount();
      setLastPhotoUrl(previewCanvas.toDataURL('image/jpeg', 0.2));
      setPreviewCanvas(null);
      setUploadProgress(0);
    } else {
      setError(uploadErr || 'Upload failed.');
    }
    setIsUploading(false);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-black overflow-hidden select-none touch-none">
       {/* Camera Viewport */}
       <div className="flex-1 relative w-full h-full flex items-center justify-center">
          {!previewCanvas ? (
             <>
               <video 
                 ref={videoRef}
                 autoPlay 
                 playsInline 
                 muted 
                 style={{ 
                   transform: `${facingMode === 'user' ? 'scaleX(-1)' : ''} scale(${zoom})`,
                   filter: filter,
                   transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                 }}
                 className="object-cover w-full h-full"
               />
               
               {/* Square Mode Mask */}
               {mode === 'SQUARE' && (
                 <div className="absolute inset-0 z-20 pointer-events-none flex flex-col">
                    <div className="flex-1 bg-black/60" />
                    <div className="aspect-square w-full border-y border-white/20" />
                    <div className="flex-1 bg-black/60" />
                 </div>
               )}

               {countdown !== null && (
                 <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <span className="text-white text-8xl font-black drop-shadow-2xl animate-ping">
                      {countdown}
                    </span>
                 </div>
               )}

               <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div />
               </div>
             </>
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-black">
                <img 
                  src={previewCanvas.toDataURL('image/jpeg', 0.8)} 
                  alt="Preview" 
                  style={{ filter: filter }}
                  className={`object-cover ${mode === 'SQUARE' ? 'aspect-square w-full' : 'w-full h-full'}`}
                />
             </div>
          )}

          {error && !isUploading && (
            <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-xl shadow-2xl text-red-600 p-6 rounded-3xl text-center font-bold animate-fade-in border border-white/20">
              {error}
              <button onClick={() => setError('')} className="mt-4 block w-full bg-neutral-100 py-3 rounded-2xl text-neutral-800">Dismiss</button>
            </div>
          )}
       </div>

       {/* Top Utility Bar */}
       <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent flex items-center justify-between px-6 pt-4 text-white z-40">
          <button 
            onClick={toggleFlash}
            disabled={facingMode === 'user'}
            className={`transition-colors ${flash ? 'text-[#FFD60A]' : 'text-white'} disabled:opacity-30`}
          >
            {flash ? <Zap size={22} fill="currentColor" /> : <ZapOff size={22} />}
          </button>
          
          <button onClick={cycleTimer} className={`flex items-center gap-1 transition-colors ${timer > 0 ? 'text-[#FFD60A]' : 'text-white'}`}>
             <TimerIcon size={22} />
             {timer > 0 && <span className="text-[10px] font-black">{timer}s</span>}
          </button>

          <button onClick={cycleFilter} className="flex -space-x-1 opacity-90 p-2">
             <div className={`w-3 h-3 rounded-full border border-white/60 ${filter !== 'none' ? 'bg-[#FFD60A]' : 'bg-white/10'}`} />
             <div className={`w-3 h-3 rounded-full border border-white/60 ${filter !== 'none' ? 'bg-[#FFD60A]/80' : 'bg-white/20'}`} />
             <div className={`w-3 h-3 rounded-full border border-white/60 ${filter !== 'none' ? 'bg-[#FFD60A]/60' : 'bg-white/30'}`} />
          </button>
       </div>

       {/* Zoom Indicator */}
       {!previewCanvas && (
         <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-40">
            <button 
               onClick={cycleZoom}
               className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] font-bold text-white active:scale-90 transition-transform"
            >
               {zoom}x
            </button>
         </div>
       )}

       {/* Mode Selector */}
       <div className="absolute bottom-28 left-0 right-0 flex justify-center items-center gap-6 text-[11px] font-bold tracking-widest z-40 overflow-hidden px-10">
          {['PORTRAIT', 'PHOTO', 'SQUARE'].map((m) => (
             <button
               key={m}
               onClick={() => setMode(m as CameraMode)}
               className={`flex-shrink-0 transition-all duration-300 ${mode === m ? 'text-[#FFD60A] scale-110' : 'text-white/40'}`}
             >
               {m}
             </button>
          ))}
       </div>

       {/* Shutter Center */}
       <div className="absolute bottom-0 left-0 right-0 h-28 bg-black/60 backdrop-blur-sm flex items-center justify-between px-10 pb-6 z-40">
          <div className="relative group">
            <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center transition-transform active:scale-95">
               {lastPhotoUrl ? (
                 <img src={lastPhotoUrl} alt="Last" className="w-full h-full object-cover" />
               ) : (
                 <div className="text-[10px] font-black text-white/40">{guestDetails?.photoCount || 0}/25</div>
               )}
            </div>
            {lastPhotoUrl && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-bold text-white">
                {guestDetails?.photoCount || 0}
              </div>
            )}
          </div>

          {!previewCanvas ? (
            <div className="relative flex items-center justify-center">
               {uploadProgress > 0 && (
                  <svg className="absolute w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="44" stroke="#FFD60A" strokeWidth="4" fill="transparent" strokeDasharray={276} strokeDashoffset={276 - (276 * uploadProgress / 100)} className="transition-all duration-200" />
                  </svg>
               )}
               <button 
                 onClick={handleCapture}
                 disabled={(guestDetails ? guestDetails.photoCount >= 25 : false) || countdown !== null}
                 className="w-20 h-20 rounded-full border-[4px] border-white p-1.5 active:scale-95 transition-all disabled:opacity-30"
               >
                  <div className={`w-full h-full rounded-full transition-all ${countdown !== null ? 'bg-red-500 scale-75' : 'bg-white'}`} />
               </button>
            </div>
          ) : (
            <div className="flex-1 flex gap-4 pl-4 px-2">
              <button onClick={handleRetake} disabled={isUploading} className="flex-1 h-12 rounded-xl bg-white/10 backdrop-blur-lg text-white text-sm font-bold disabled:opacity-50 border border-white/10 active:scale-95 transition-transform">Retake</button>
              <button onClick={handleKeep} disabled={isUploading} className="flex-[2] h-12 rounded-xl bg-white text-black text-sm font-extrabold shadow-xl disabled:opacity-50 relative overflow-hidden active:scale-95 transition-transform">
                {isUploading ? 'Sending...' : 'Keep Photo'}
                {isUploading && <div className="absolute left-0 bottom-0 top-0 bg-blue-500/20 transition-all" style={{ width: `${uploadProgress}%` }} />}
              </button>
            </div>
          )}

          <button onClick={handleFlip} disabled={!!previewCanvas || isUploading} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/5 active:rotate-180 transition-all duration-500 disabled:opacity-30">
            <RefreshCw size={24} />
          </button>
       </div>
    </div>
  );
}
