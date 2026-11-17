// frontend/src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import './globals.css';

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
  metadataBase: new URL("https://www.panditjimarblemurtiarts.in"),
  title: {
    default: 'Shree Durga Tiles | Marble, Granite & Designer Tiles',
    template: '%s | Shree Durga Tiles',
  },
  description:
    'Explore premium marble, granite, designer tiles, quartz and stone for homes and projects. Visit Shree Durga Tiles in Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.',
  keywords:
    'marble, granite, designer tiles, quartz, kitchen tops, outdoor flooring, stone showroom, Govindgarh, Alwar',
  authors: [{ name: 'Shree Durga Tiles' }],
  creator: 'Shree Durga Tiles',
  publisher: 'Shree Durga Tiles',
  robots: 'index, follow',
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: 'Shree Durga Tiles | Marble, Granite & Designer Tiles',
    description: 'Premium marble, granite, tiles and stone in Govindgarh, Alwar.',
    url: 'https://www.panditjimarblemurtiarts.in',
    siteName: 'Shree Durga Tiles',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584925906119-eaf7bbd206c3?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Premium stone and tile showroom',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shree Durga Tiles | Marble, Granite & Designer Tiles',
    description: 'Premium marble, granite, tiles and stone in Govindgarh, Alwar.',
    images: ['https://images.unsplash.com/photo-1584925906119-eaf7bbd206c3?w=1200&q=80'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="bg-ivory text-brown antialiased">
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