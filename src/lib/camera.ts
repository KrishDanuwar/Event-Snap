/**
 * Initializes the device camera for the event guest flow.
 * Supports toggling between user (selfie) and environment (rear) modes.
 */
export async function initializeCamera(facingMode: 'user' | 'environment' = 'environment'): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera API not supported or secured properly context');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { exact: facingMode }, 
      width:  { ideal: 3840 },
      height: { ideal: 2160 },
    },
    audio: false,
  });

  return stream;
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
