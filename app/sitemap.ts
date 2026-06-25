import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, publicBranchSeo, publicBranchSlugs } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: getAbsoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...publicBranchSlugs.map((slug) => ({
      url: getAbsoluteUrl(publicBranchSeo[slug].path),
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ];
}
