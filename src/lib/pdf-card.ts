import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Executes a client-side headless rendering of an A5 printout card by capturing
 * a hidden DOM node and injecting precisely scaled bytes into a jsPDF document natively.
 */
export async function downloadA5PrintCard(elementId: string, eventName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Print node not found');

  try {
    // 1. Capture physical pixels precisely using html2canvas
    const canvas = await html2canvas(element, {
      scale: 3, // High DPI suitable for printing
      useCORS: true, // Needed if logos are stored in S3/Supabase Storage
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // 2. Initialize jsPDF targeting A5 layout (148 x 210 mm)
    // mm dimensions -> 148 w by 210 h
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // 3. Inject image exactly spanning A5 margins
    pdf.addImage(imgData, 'JPEG', 0, 0, 148, 210);

    // 4. Prompt physical file array
    pdf.save(`${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tent_card.pdf`);

  } catch (err: any) {
    console.error('PDF Generation Failed', err);
    throw new Error('Failed to generate printable PDF. Ensure all assets are loaded.');
  }
}
