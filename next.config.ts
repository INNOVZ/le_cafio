import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage is already CDN-backed. Bypassing Next's proxy prevents
    // one slow upstream image from delaying the entire customer menu response.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwvwxzsjarobpkevflac.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
