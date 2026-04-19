/**
 * Exports the currently rendered QR Code Canvas to a strictly defined PNG format locally.
 */
export function downloadQRAsPNG(canvasId: string, eventName: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    alert('QR code not rendered yet.');
    return;
  }
  
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
