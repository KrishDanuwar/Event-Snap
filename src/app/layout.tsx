import type { Metadata } from 'next';
import './globals.css';
import DevPanelLoader from '@/components/shared/DevPanelLoader';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'EventSnap — Live Event Photo Sharing',
  description:
    'Capture and share photos at live events. Scan, snap, share — no app install required.',
  keywords: ['event photos', 'live sharing', 'QR code', 'photo gallery', 'wedding photos'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
        <DevPanelLoader />
      </body>
    </html>
  );
}
