/**
 * Initializes the device camera for the event guest flow.
 * Supports toggling between user (selfie) and environment (rear) modes.
 */
export async function initializeCamera(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera API not supported or secured properly context');
  }

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: facingMode, 
      width:  { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.error('Camera initialization failed, trying fallback:', err);
    // Fallback to basic video if complex constraints fail
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }
}

/**
 * Snaps a photo from the active video track using a canvas element.
 */
export function captureFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
     // Flip for selfie if needed
     if (video.style.transform.includes('scaleX(-1)')) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
     }
     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}
