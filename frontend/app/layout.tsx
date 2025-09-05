import './globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import Navbar from './components/Navbar'
import { Providers } from './providers'


import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChyrpLite',
  description: 'Modern ChyrpLite',
  openGraph: {
    title: 'ChyrpLite',
    description: 'Modern ChyrpLite',
    url: 'https://yourdomain.com',
    siteName: 'ChyrpLite',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChyrpLite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChyrpLite',
    description: 'Modern ChyrpLite',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://yourdomain.com'),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'RSS Feed' },
      ],
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `(()=>{try{const s=localStorage.getItem('theme');if(s){if(s==='dark')document.documentElement.classList.add('dark');return;}if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`}} />
      </head>
      <body>
        <ThemeProvider>
          <Providers>
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
