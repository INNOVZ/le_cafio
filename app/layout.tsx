import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LE CAFIO | Artisan Coffee',
  description: 'Artisan Coffee in Abu Dhabi',
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
