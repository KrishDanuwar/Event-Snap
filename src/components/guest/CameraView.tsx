'use client';

import { useEffect, useRef, useState } from 'react';
import { initializeCamera, captureFrame } from '@/lib/camera';
import { uploadPhoto } from '@/lib/upload';
import { useGuestSession } from '@/hooks/useGuestSession';

export default function CameraView({ eventId }: { eventId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [lastPhotoUrl, setLastPhotoUrl] = useState<string | null>(null);
  
  const { session, guestDetails, incrementPhotoCount } = useGuestSession(eventId);

  useEffect(() => {
    async function setupCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        const mediaStream = await initializeCamera(facingMode);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        setError('Camera flip failed. Some devices only support one camera or require permission.');
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    const canvas = captureFrame(videoRef.current);
    setPreviewCanvas(canvas);
  };

  const handleFlip = () => {
     setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
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
      // Side effect for the iOS "Last photo" bubble
      setLastPhotoUrl(previewCanvas.toDataURL('image/jpeg', 0.2));
      setPreviewCanvas(null);
      setUploadProgress(0);
    } else {
      setError(uploadErr || 'Upload failed.');
    }
    setIsUploading(false);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-black overflow-hidden select-none">
       
       {/* Camera Viewport */}
       <div className="flex-1 relative w-full h-full flex items-center justify-center">
          {!previewCanvas ? (
             <video 
               ref={videoRef}
               autoPlay 
               playsInline 
               muted 
               style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
               className="object-cover w-full h-full"
             />
          ) : (
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={previewCanvas.toDataURL('image/jpeg', 0.8)} 
               alt="Preview" 
               className="object-cover w-full h-full"
             />
          )}

          {error && !isUploading && (
            <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 z-20 bg-white shadow-2xl text-red-600 p-6 rounded-3xl text-center font-bold animate-fade-in">
              {error}
              <button 
                onClick={() => setError('')}
                className="mt-4 block w-full bg-neutral-100 py-3 rounded-2xl text-neutral-800"
              >
                Dismiss
              </button>
            </div>
          )}
       </div>

       {/* Top Utility Bar (Premium Light) */}
       <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/20 to-transparent flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-white text-xs font-bold tracking-widest uppercase opacity-80">Live</span>
          </div>
          <button 
            onClick={handleFlip} 
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
          >
            🔄
          </button>
       </div>

       {/* iPhone Style Shutter Control Center */}
       <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/40 to-transparent flex items-center justify-between px-8 pb-10">
          
          {/* Recent Photo Preview */}
          <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-white/20 overflow-hidden shadow-inner flex items-center justify-center">
             {lastPhotoUrl && (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={lastPhotoUrl} alt="Last" className="w-full h-full object-cover" />
             )}
          </div>

          {!previewCanvas ? (
            // The iOS Shutter
            <div className="relative flex items-center justify-center">
               {/* Progress Ring */}
               {uploadProgress > 0 && (
                  <svg className="absolute w-24 h-24 -rotate-90">
                    <circle 
                      cx="48" cy="48" r="44" 
                      stroke="white" strokeWidth="4" fill="transparent" 
                      strokeDasharray={276}
                      strokeDashoffset={276 - (276 * uploadProgress / 100)}
                      className="transition-all duration-200"
                    />
                  </svg>
               )}
               <button 
                 onClick={handleCapture}
                 disabled={guestDetails ? guestDetails.photoCount >= 25 : false}
                 className="w-20 h-20 rounded-full border-[6px] border-white p-1 active:scale-90 transition-transform disabled:opacity-30"
               >
                  <div className="w-full h-full bg-white rounded-full" />
               </button>
            </div>
          ) : (
            // Post-Capture Controls
            <div className="flex-1 flex gap-4 pl-4">
              <button 
                onClick={handleRetake}
                disabled={isUploading}
                className="flex-1 h-14 rounded-2xl bg-white/20 backdrop-blur-lg text-white font-bold disabled:opacity-50"
              >
                Retake
              </button>
              <button 
                onClick={handleKeep}
                disabled={isUploading}
                className="flex-[2] h-14 rounded-2xl bg-white text-black font-extrabold shadow-xl disabled:opacity-50 relative overflow-hidden"
              >
                {isUploading ? 'Sending...' : 'Keep Photo'}
                {isUploading && (
                   <div 
                    className="absolute left-0 bottom-0 top-0 bg-sky-500/20 transition-all" 
                    style={{ width: `${uploadProgress}%` }}
                   />
                )}
              </button>
            </div>
          )}

          {/* Placeholder for symmetry / info */}
          <div className="w-12 h-12 flex flex-col items-center justify-center opacity-70">
             <span className="text-[10px] font-black text-white">{guestDetails?.photoCount || 0}</span>
             <span className="text-[8px] text-white opacity-50 uppercase font-bold">Photos</span>
          </div>
       </div>
    </div>
  );
}
