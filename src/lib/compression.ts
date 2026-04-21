export const MAX_BYTES = 2.5 * 1024 * 1024; // 2.5 MB - balanced for speed and quality

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      },
      type,
      quality
    );
  });
}

function scaleCanvas(canvas: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = canvas.width * scale;
  scaledCanvas.height = canvas.height * scale;
  const ctx = scaledCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
  }
  return scaledCanvas;
}

export async function compressToLimit(canvas: HTMLCanvasElement): Promise<Blob> {
  // Start with a reasonable quality for faster processing
  const qualitySteps = [0.85, 0.75, 0.60];

  // Pass 1: reduce JPEG quality
  for (const quality of qualitySteps) {
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= MAX_BYTES) return blob;
  }

  // Pass 2: scale canvas dimensions (if still too large)
  let scale = 0.8;
  while (scale > 0.4) {
    const scaled = scaleCanvas(canvas, scale);
    const blob = await canvasToBlob(scaled, 'image/jpeg', 0.60);
    if (blob.size <= MAX_BYTES) return blob;
    scale -= 0.2;
  }

  // Fallback
  return canvasToBlob(canvas, 'image/jpeg', 0.50);
}
