// frontend/src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getLocalBusinessSchema, JsonLd } from '../lib/seo';

// Providers
import { ReactQueryProvider } from '../providers/ReactQueryProvider';

// Layout components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollReset from '../components/layout/ScrollReset';
import PageViewTracker from '../components/analytics/PageViewTracker';

// Toast notifications
import { Toaster } from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

// ------------------------------------------------------------------
// Metadata & Viewport (SEO + PWA ready)
// ------------------------------------------------------------------
export const metadata: Metadata = {
  metadataBase: new URL('https://www.shreedurgatiles.site'),
  title: 'Shree Durga Tiles | Marble, Granite & Tiles in Alwar',
  description:
    'Shree Durga Tiles (श्री दुर्गा टाइल्स), Naugaon, Alwar: marble, granite, designer tiles and mandir stone. Visit our showroom or WhatsApp for a free quote.',
  authors: [{ name: 'Shree Durga Tiles' }],
  creator: 'Shree Durga Tiles',
  publisher: 'Shree Durga Tiles',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// ------------------------------------------------------------------
// Root Layout
// ------------------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className="bg-ivory text-brown antialiased">
        <JsonLd data={getLocalBusinessSchema()} />
        <ReactQueryProvider>
          <>
            <ScrollReset />
            <PageViewTracker />

            {/* Fixed header */}
            <Navbar />

            {/* Main content */}
            <main className="min-h-screen">{children}</main>

            {/* Footer */}
            <Footer />

            {/* Toast notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4500,
                style: {
                  background: 'transparent',
                  boxShadow: 'none',
                  padding: 0,
                },
                success: { icon: <Sparkles className="h-5 w-5" /> },
                error: { icon: <Sparkles className="h-5 w-5" /> },
              }}
            />
          </>
        </ReactQueryProvider>
      </body>
    </html>
  );
}