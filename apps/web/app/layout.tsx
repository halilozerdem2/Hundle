import './globals.css';
import { cookies } from 'next/headers';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Header from '../components/Header';
import Providers from '../components/Providers';
import { LANGUAGE_COOKIE, resolveLanguage } from '../lib/i18n';

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

const RootLayout = ({ children }: { children: ReactNode }) => {
  const cookieStore = cookies();
  const initialLanguage = resolveLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  return (
    <html lang={initialLanguage}>
      <body>
        <Providers initialLanguage={initialLanguage}>
          <Header />
          <main className="app-shell">{children}</main>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
