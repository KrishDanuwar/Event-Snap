import { compressToLimit } from './compression';

interface UploadResponse {
  success: boolean;
  photoId?: string;
  error?: string;
}

/**
 * Uploads a canvas exactly following the PRD requirements:
 * 1. Compress to < 10MB
 * 2. Get signed URL
 * 3. PUT bytes to blob URL 
 * 4. Hit /confirm to notify system
 */
export async function uploadPhoto(
  canvas: HTMLCanvasElement, 
  sessionToken: string,
  onProgress: (percent: number) => void
): Promise<UploadResponse> {
  try {
    // 1. Compress
    const blob = await compressToLimit(canvas);
    
    // 2. Fetch Signed URL
    const res = await fetch('/api/photos/upload-url', {
      method: 'POST',
      headers: {
        'X-Session-Token': sessionToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileExt: 'jpg' }) // compression.ts always produces jpeg
    });

    if (!res.ok) {
       const err = await res.json().catch(() => ({}));
       throw new Error(err.error || 'Failed to get upload URL');
    }

    const { uploadUrl, photoId, storagePath } = await res.json();

    // 3. XHR Upload to capture progress (as mandated by PRD)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', 'image/jpeg');
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
         if (xhr.status >= 200 && xhr.status < 300) resolve();
         else reject(new Error('Storage upload failed'));
      };
      
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(blob);
    });

    // 4. Confirm upload
    const confirmRes = await fetch('/api/photos/confirm', {
       method: 'POST',
       headers: {
        'X-Session-Token': sessionToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photoId,
        storagePath,
        fileSize: blob.size,
        width: canvas.width,
        height: canvas.height
      })
    });

    if (!confirmRes.ok) {
       const err = await confirmRes.json().catch(() => ({}));
       throw new Error(err.error || 'Failed to confirm photo upload');
    }

    return { success: true, photoId };

  } catch (error: any) {
    console.error('Upload Error:', error);
    return { success: false, error: error.message };
  }
}
