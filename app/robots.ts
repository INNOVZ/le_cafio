import type { MetadataRoute } from 'next';

import { getAbsoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/dashboard/',
        '/dashboard/*',
        '/auth',
        '/auth/',
        '/auth/*',
        '/checkout',
        '/payment',
        '/*/checkout',
        '/*/payment',
      ],
    },
    sitemap: getAbsoluteUrl('/sitemap.xml'),
  };
}
