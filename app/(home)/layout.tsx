import '../globals.css';
import Navbar from '@/components/nav/Navbar';

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
