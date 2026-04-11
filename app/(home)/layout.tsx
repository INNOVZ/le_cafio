import type { Metadata } from 'next';
import '../globals.css';
import Navbar from '@/components/nav/Navbar';

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
    <div className="top-0">
      <Navbar />
      <main className="-mt-6.25">{children}</main>
    </div>
  );
}
