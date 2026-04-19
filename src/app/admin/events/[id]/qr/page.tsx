'use client';

import { useEffect, useState, use } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { downloadQRAsPNG } from '@/lib/qr';
import { downloadA5PrintCard } from '@/lib/pdf-card';

export default function QRGenerationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [eventData, setEventData] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/admin/events/${eventId}`)
      .then(r => r.json())
      .then(d => { if (d.event) setEventData(d.event) });
  }, [eventId]);

  if (!eventData) return <div className="p-10 animate-pulse">Loading Event Specifications...</div>;

  const guestUrl = typeof window !== 'undefined' ? `${window.location.origin}/event/${eventData.id}` : '';
  const qrCanvasId = 'main-qr-canvas';
  const printNodeId = 'a5-print-node';
  const theme = eventData.theme || { primaryColor: '#000', textMode: 'light' };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guestUrl);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-fade-in relative max-w-4xl">
       <div>
         <h1 className="text-4xl font-bold tracking-tight mb-2">QR Code & Distribution</h1>
         <p className="text-neutral-500 text-lg">Generate physical signage or copy the URL directly.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Main Visual Box */}
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-neutral-200 flex flex-col items-center justify-center text-center">
             <div className="p-4 bg-white rounded-2xl shadow-xl mb-8 border border-neutral-100 relative">
               <QRCodeCanvas 
                 id={qrCanvasId}
                 value={guestUrl}
                 size={240}
                 level="H"
                 fgColor={theme.primaryColor}
                 imageSettings={eventData.logo_path ? {
                   src: "https://via.placeholder.com/150", 
                   height: 50,
                   width: 50,
                   excavate: true
                 } : undefined}
               />
             </div>
             
             <h2 className="text-2xl font-bold capitalize mb-2">{eventData.name}</h2>
             <div className="bg-neutral-100 px-4 py-2 rounded-lg font-mono text-sm text-neutral-600 mb-6 cursor-pointer hover:bg-neutral-200 transition-colors" onClick={handleCopyLink}>
                {guestUrl} 📋
             </div>

             <div className="flex gap-4 w-full">
                <button onClick={() => downloadQRAsPNG(qrCanvasId, eventData.name)} className="flex-1 bg-neutral-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-colors">
                   Download PNG
                </button>
             </div>
          </div>

          {/* Action Explanations */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 flex flex-col justify-between">
             <div>
                <h3 className="text-2xl font-bold border-b pb-4 mb-4">Print Format (A5 Card)</h3>
                <p className="text-neutral-500 mb-6 leading-relaxed">
                   Looking for a physical tent card? Generating an A5 PDF will natively drop the precise graphical layout into an offline-ready file perfectly scaled out to 148 x 210 Millimeters.
                </p>
                <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm border border-red-100 flex gap-3">
                   <span className="text-xl">💡</span>
                   <p>Remember to set your printer margins strictly to zero when physically printing this asset!</p>
                </div>
             </div>

             <button 
                disabled={isGeneratingPdf}
                onClick={async () => {
                   setIsGeneratingPdf(true);
                   try {
                     await downloadA5PrintCard(printNodeId, eventData.name);
                   } catch(e: any) { alert(e.message); }
                   finally { setIsGeneratingPdf(false); }
                }}
                className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm disabled:opacity-50"
             >
                {isGeneratingPdf ? 'Processing PDF Canvas...' : 'Generate A5 PDF Tent Card'}
             </button>
          </div>
       </div>

       {/* OFF-SCREEN DOM NODE FOR HTML2CANVAS */}
       <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden' }}>
          <div id={printNodeId} style={{ width: '559px', height: '794px', backgroundColor: '#ffffff', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: theme.fontFamily || 'Inter, sans-serif' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '113px', backgroundColor: theme.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '80px', height: '80px', backgroundColor: '#fff', borderRadius: '50%', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    📸
                 </div>
             </div>
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px', textAlign: 'center' }}>
                 <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', color: theme.textColor === '#ffffff' ? '#000000' : theme.textColor }}>{eventData.name}</h1>
                 <p style={{ fontSize: '18px', margin: 0, color: '#555555', maxWidth: '80%' }}>{eventData.welcome_message || 'Scan the QR code below to share your photos instantly.'}</p>
             </div>
             <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                 <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '20px', border: `3px solid ${theme.primaryColor}` }}>
                   <QRCodeCanvas 
                     value={guestUrl}
                     size={280}
                     level="H"
                     fgColor={theme.primaryColor}
                   />
                 </div>
             </div>
             <div style={{ position: 'absolute', bottom: '40px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', margin: 0, fontWeight: 'bold' }}>Scan to share your photos</h3>
                <p style={{ fontSize: '14px', margin: 0, color: '#888888', textDecoration: 'underline' }}>{guestUrl}</p>
             </div>
          </div>
       </div>

    </div>
  );
}
