export async function sharePhoto(url: string, filename: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!navigator.share || !navigator.canShare) {
      return { success: false, error: 'Web Share API not supported on this browser' };
    }

    // Fetch the actual image blob via the signed URL so we share the image itself, not a link.
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image for sharing');

    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'EventSnap Photo',
        text: 'Shared from EventSnap',
      });
      return { success: true };
    } else {
      return { success: false, error: 'File sharing not supported on this device' };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // User cancelled the share sheet manually, not a real error we need to display
      return { success: true }; 
    }
    return { success: false, error: error.message };
  }
}
