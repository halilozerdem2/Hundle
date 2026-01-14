import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'News Pulse',
  description: 'Curated push notifications that honor Android and iOS PWA constraints.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    title: 'News Pulse',
    statusBarStyle: 'default'
  }
};

export const viewport: Viewport = {
  themeColor: '#020617'
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>
      <Header />
      <main className="app-shell">{children}</main>
    </body>
  </html>
);

export default RootLayout;
