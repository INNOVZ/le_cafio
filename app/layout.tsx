import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { Toaster } from 'sonner';
import { getSiteUrl, siteBrand } from '@/lib/seo';
import './globals.css';

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteBrand.defaultTitle,
    template: siteBrand.titleTemplate,
  },
  description: siteBrand.description,
  applicationName: siteBrand.name,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: siteBrand.defaultTitle,
    description: siteBrand.description,
    url: '/',
    siteName: siteBrand.name,
    locale: siteBrand.locale,
    type: 'website',
    images: [
      {
        url: '/caffebanner.png',
        alt: 'Le Cafio cafe in Abu Dhabi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteBrand.defaultTitle,
    description: siteBrand.description,
    images: ['/caffebanner.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${cairo.variable}`}>
      <body className="antialiased w-full h-full">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
