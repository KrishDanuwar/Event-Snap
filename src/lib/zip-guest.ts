import { Zip, AsyncZipDeflate } from 'fflate';

/**
 * Downloads a list of signed URLs, streams them through fflate client-side, 
 * and immediately prompts the user to download the generated `.zip` file.
 */
export async function downloadGuestZip(
  photos: { url: string; storagePath: string }[],
  eventName: string,
  onProgress: (percent: number) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    if (photos.length === 0) {
       return { success: false, error: 'No photos to download' };
    }

    return new Promise((resolve, reject) => {
      const zip = new Zip();
      
      const zipChunks: Uint8Array[] = [];
      zip.ondata = (err, chunk, final) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }
        zipChunks.push(chunk);
        if (final) {
          const blob = new Blob(zipChunks, { type: 'application/zip' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_my_photos.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve({ success: true });
        }
      };

      let completedCount = 0;
      let hasFailed = false;

      photos.forEach((photo) => {
        const fileDeflate = new AsyncZipDeflate(photo.storagePath.split('/').pop() || 'photo.jpg');
        zip.add(fileDeflate);

        fetch(photo.url)
          .then((res) => {
            if (!res.ok) throw new Error('Fetch failed');
            return res.blob();
          })
          .then((blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (hasFailed) return;
              fileDeflate.push(new Uint8Array(reader.result as ArrayBuffer), true);
              completedCount++;
              onProgress((completedCount / photos.length) * 100);
              if (completedCount === photos.length) {
                zip.end();
              }
            };
            reader.readAsArrayBuffer(blob);
          })
          .catch((err) => {
            console.error('Failed to fetch photo for zip:', err);
            hasFailed = true;
            reject(new Error('Failed to retrieve some photos. Please try again.'));
          });
      });
      
    });

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
