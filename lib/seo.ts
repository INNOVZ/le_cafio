import type { Metadata } from 'next';

export type PublicBranchSlug = 'alreem' | 'adnec';

type LocationLike = {
  name: string;
  phone: string | null;
  addressLine: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
};

export const siteBrand = {
  name: 'Le Cafio',
  legalName: 'LE CAFIO',
  defaultTitle: 'Le Cafio | Cafe & Delivery in Abu Dhabi',
  titleTemplate: '%s | Le Cafio',
  description:
    'Order coffee, pasta, pizza, burgers, smoothies, and your cafe favorites from Le Cafio in Abu Dhabi.',
  locale: 'en_AE',
  instagramUrl: 'https://www.instagram.com/lecafioadnec?igsh=NTV4dWw0ZGlleXV1',
};

export const publicBranchSeo: Record<
  PublicBranchSlug,
  {
    path: string;
    areaName: string;
    title: string;
    description: string;
    keywords: string[];
    eyebrow: string;
    intro: string;
    serviceArea: string;
  }
> = {
  alreem: {
    path: '/alreem',
    areaName: 'Al Reem Island',
    title: 'Le Cafio Al Reem Island | Cafe in Abu Dhabi',
    description:
      'Order coffee, pasta, pizza, burgers, smoothies, and your cafe favorites from Le Cafio Al Reem Island in Abu Dhabi for pickup or nearby delivery.',
    keywords: [
      'cafe in Al Reem Island',
      'coffee delivery Al Reem Island',
      'Italian cafe Al Reem Island',
      'pizza Al Reem Island',
      'pasta Al Reem Island',
      'Le Cafio Al Reem Island',
    ],
    eyebrow: 'Al Reem Island cafe and delivery',
    intro:
      'Fresh coffee, pasta, pizza, burgers, smoothies, and cafe favorites prepared for Al Reem Island customers.',
    serviceArea:
      'Pickup is available from this branch, with delivery offered to nearby addresses inside the active branch delivery radius.',
  },
  adnec: {
    path: '/adnec',
    areaName: 'ADNEC and Capital Centre',
    title: 'Le Cafio ADNEC | Cafe near Capital Centre Abu Dhabi',
    description:
      'Order coffee, pasta, pizza, burgers, smoothies, and your cafe favorites from Le Cafio ADNEC near Capital Centre in Abu Dhabi.',
    keywords: [
      'cafe near ADNEC',
      'coffee delivery ADNEC',
      'Italian cafe ADNEC',
      'pizza near ADNEC',
      'pasta near ADNEC',
      'Le Cafio ADNEC',
    ],
    eyebrow: 'ADNEC cafe and delivery',
    intro:
      'A local Le Cafio branch serving guests, offices, and nearby addresses around ADNEC and Capital Centre.',
    serviceArea:
      'Pickup is available from this branch, with delivery offered to nearby addresses inside the active branch delivery radius.',
  },
};

export const publicBranchSlugs = Object.keys(
  publicBranchSeo
) as PublicBranchSlug[];

function normalizeSiteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return /^(localhost|127\.0\.0\.1)/i.test(value)
    ? `http://${value}`
    : `https://${value}`;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const siteUrl = configuredUrl ?? vercelUrl ?? 'http://localhost:3000';

  return new URL(normalizeSiteUrl(siteUrl));
}

export function getAbsoluteUrl(path = '/') {
  return new URL(path, getSiteUrl()).toString();
}

export function formatLocationAddress(location: LocationLike) {
  const parts = [
    location.addressLine,
    location.addressLine2,
    location.city,
    location.state && location.state !== location.city ? location.state : null,
    location.postalCode,
    location.country,
  ];

  return parts.filter(Boolean).join(', ');
}

export function formatPhoneHref(phone: string | null) {
  if (!phone) {
    return null;
  }

  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const canonicalUrl = getAbsoluteUrl(path);
  const imageUrl = getAbsoluteUrl('/caffebanner.png');

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteBrand.name,
      locale: siteBrand.locale,
      type: 'website',
      images: [
        {
          url: imageUrl,
          alt: `${siteBrand.name} cafe in Abu Dhabi`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildBranchMetadata(slug: PublicBranchSlug) {
  const branch = publicBranchSeo[slug];

  return buildPageMetadata({
    title: branch.title,
    description: branch.description,
    path: branch.path,
    keywords: branch.keywords,
  });
}

export function buildNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export function buildRestaurantJsonLd(
  location: LocationLike,
  slug: PublicBranchSlug
) {
  const branch = publicBranchSeo[slug];
  const pageUrl = getAbsoluteUrl(branch.path);
  const phone = location.phone?.trim() || undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${pageUrl}#restaurant`,
    name: location.name,
    url: pageUrl,
    image: [getAbsoluteUrl('/logo.svg'), getAbsoluteUrl('/caffebanner.png')],
    logo: getAbsoluteUrl('/logo.svg'),
    telephone: phone,
    priceRange: '$$',
    servesCuisine: ['Cafe', 'Coffee', 'Italian'],
    hasMenu: getAbsoluteUrl('/menu.pdf'),
    parentOrganization: {
      '@id': `${getAbsoluteUrl('/')}#organization`,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: [location.addressLine, location.addressLine2]
        .filter(Boolean)
        .join(', '),
      addressLocality: location.city,
      addressRegion: location.state ?? undefined,
      postalCode: location.postalCode || undefined,
      addressCountry: location.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: String(location.latitude),
      longitude: String(location.longitude),
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Abu Dhabi',
      },
      {
        '@type': 'Place',
        name: branch.areaName,
      },
    ],
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${getAbsoluteUrl('/')}#organization`,
    name: siteBrand.legalName,
    alternateName: siteBrand.name,
    url: getAbsoluteUrl('/'),
    logo: getAbsoluteUrl('/logo.svg'),
    image: getAbsoluteUrl('/caffebanner.png'),
    sameAs: [siteBrand.instagramUrl],
    department: publicBranchSlugs.map((slug) => ({
      '@id': `${getAbsoluteUrl(publicBranchSeo[slug].path)}#restaurant`,
    })),
  };
}
