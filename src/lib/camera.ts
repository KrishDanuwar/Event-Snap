/**
 * Initializes the device camera for the event guest flow.
 * Ensures the rear camera is preferred, and requests high resolution natively.
 */
export async function initializeCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera API not supported or secured properly context');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' }, // rear camera preferred
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
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}
