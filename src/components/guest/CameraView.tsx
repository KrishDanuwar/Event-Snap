'use client';

import { useEffect, useRef, useState } from 'react';
import { initializeCamera, captureFrame } from '@/lib/camera';
import { uploadPhoto } from '@/lib/upload';
import { useGuestSession } from '@/hooks/useGuestSession';

export default function CameraView({ eventId }: { eventId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  const { session, guestDetails, incrementPhotoCount } = useGuestSession(eventId);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await initializeCamera();
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        setError('Camera permission denied or not available. Please allow access.');
      }
    }
    setupCamera();

    return () => {
      // Cleanup camera on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = captureFrame(videoRef.current);
    setPreviewCanvas(canvas);
  };

  const handleRetake = () => {
    setPreviewCanvas(null);
    setError('');
  };

  const handleKeep = async () => {
    if (!previewCanvas || !session) return;
    
    // PRD constraint
    if (guestDetails && guestDetails.photoCount >= 25) {
      setError('You have reached the maximum photo limit (25). Delete one from your gallery to take more.');
      return;
    }

    setIsUploading(true);
    setError('');
    
    const { success, error: uploadErr } = await uploadPhoto(previewCanvas, session.sessionToken, (pct) => {
      setUploadProgress(pct);
    });

    if (success) {
      incrementPhotoCount();
      // Reset to camera live feed
      setPreviewCanvas(null);
      setUploadProgress(0);
    } else {
      setError(uploadErr || 'Upload failed. Please try again.');
    }
    setIsUploading(false);
  };

  return (
    <div className="relative flex-1 flex flex-col bg-black overflow-hidden">
       {/* Max Photo Warning */}
       {guestDetails && guestDetails.photoCount >= 25 && !previewCanvas && (
         <div className="absolute top-4 left-4 right-4 z-20 bg-red-600 text-white p-3 rounded-xl text-center text-sm font-semibold shadow-xl border border-red-500/50">
            Limit Reached (25/25). Delete photos in Gallery to capture more.
         </div>
       )}

       {/* Camera / Preview Feed */}
       <div className="flex-1 relative w-full h-full flex items-center justify-center">
          {!previewCanvas ? (
             <video 
               ref={videoRef}
               autoPlay 
               playsInline 
               muted 
               className="object-cover w-full h-full"
             />
          ) : (
             // Render the captured canvas frame as an image element for Preview
             // eslint-disable-next-line @next/next/no-img-element
             <img 
               src={previewCanvas.toDataURL('image/jpeg', 0.8)} 
               alt="Preview" 
               className="object-cover w-full h-full"
             />
          )}

          {error && !isUploading && (
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 z-20 bg-black/80 text-white p-4 rounded-xl text-center font-medium border border-white/20">
              {error}
            </div>
          )}
       </div>

       {/* Controls Array */}
       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center pb-8 gap-10">
          {!previewCanvas ? (
            // Shutter Button
            <button 
              onClick={handleCapture}
              disabled={guestDetails ? guestDetails.photoCount >= 25 : false}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:border-gray-500"
            >
               <div className="w-[1.125rem] h-[1.125rem] bg-white rounded-full"></div>
            </button>
          ) : (
            // Review Buttons
            <>
              <button 
                onClick={handleRetake}
                disabled={isUploading}
                className="px-6 py-3 rounded-full bg-white/20 text-white font-semibold flex items-center justify-center disabled:opacity-50"
              >
                Retake
              </button>

              <button 
                onClick={handleKeep}
                disabled={isUploading}
                className="px-8 py-3 rounded-full text-white font-bold flex items-center justify-center shadow-lg relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-button)' }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-200 pointer-events-none" 
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className="relative z-10">{isUploading ? 'Uploading...' : 'Keep Photo'}</span>
              </button>
            </>
          )}
       </div>
    </div>
  );
}
