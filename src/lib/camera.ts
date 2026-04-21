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
 * Supports center-cropping for square (1:1) mode and digital zoom.
 */
export function captureFrame(
  video: HTMLVideoElement, 
  isSquare: boolean = false,
  zoom: number = 1
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;

  // Apply Digital Zoom if factor > 1
  if (zoom > 1) {
    const zoomedWidth = sourceWidth / zoom;
    const zoomedHeight = sourceHeight / zoom;
    sourceX = (sourceWidth - zoomedWidth) / 2;
    sourceY = (sourceHeight - zoomedHeight) / 2;
    sourceWidth = zoomedWidth;
    sourceHeight = zoomedHeight;
  }

  if (isSquare) {
    const size = Math.min(sourceWidth, sourceHeight);
    sourceX += (sourceWidth - size) / 2;
    sourceY += (sourceHeight - size) / 2;
    sourceWidth = size;
    sourceHeight = size;
    canvas.width = size;
    canvas.height = size;
  } else {
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
  }

  const ctx = canvas.getContext('2d');
  
  if (ctx) {
     // Flip for selfie if needed
     if (video.style.transform.includes('scaleX(-1)')) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
     }
     ctx.drawImage(
        video, 
        sourceX, sourceY, sourceWidth, sourceHeight, 
        0, 0, canvas.width, canvas.height
     );
  }
  return canvas;
}
