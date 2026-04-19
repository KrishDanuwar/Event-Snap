export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

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
  const qualitySteps = [0.92, 0.85, 0.75, 0.65];

  // Pass 1: reduce JPEG quality only (no dimension change)
  for (const quality of qualitySteps) {
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= MAX_BYTES) return blob;
  }

  // Pass 2: scale canvas dimensions (last resort)
  let scale = 0.9;
  while (scale > 0.3) {
    const scaled = scaleCanvas(canvas, scale);
    const blob = await canvasToBlob(scaled, 'image/jpeg', 0.65);
    if (blob.size <= MAX_BYTES) return blob;
    scale = parseFloat((scale - 0.1).toFixed(1));
  }

  // Fallback: return best effort
  return canvasToBlob(canvas, 'image/jpeg', 0.65);
}
