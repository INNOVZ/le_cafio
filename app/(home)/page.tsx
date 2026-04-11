import HomeBanner from '@/components/home/HomeBanner';
import HomeFooter from '@/components/home/HomeFooter';

export default function Home() {
  return (
    <main className="-mt-25 max-h-screen">
      <HomeBanner />
      <HomeFooter />
    </main>
  );
}
