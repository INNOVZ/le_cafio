import HomeBanner from '@/components/home/HomeBanner';
import HomeFooter from '@/components/home/HomeFooter';
import JsonLd from '@/components/seo/JsonLd';
import {
  buildOrganizationJsonLd,
  buildPageMetadata,
  siteBrand,
} from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: siteBrand.defaultTitle,
  description:
    'Order coffee, pasta, pizza, burgers, smoothies, and cafe favorites from Le Cafio branches in Abu Dhabi.',
  path: '/',
  keywords: [
    'Le Cafio Abu Dhabi',
    'cafe in Abu Dhabi',
    'coffee delivery Abu Dhabi',
    'Italian cafe Abu Dhabi',
    'pizza delivery Abu Dhabi',
    'pasta delivery Abu Dhabi',
  ],
});

export default function Home() {
  return (
    <main className="-mt-25 max-h-screen">
      <JsonLd data={buildOrganizationJsonLd()} />
      <HomeBanner />
      <HomeFooter />
    </main>
  );
}
