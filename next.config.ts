import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket (r2.dev or custom domain)
      { protocol: 'https', hostname: '*.r2.dev' },
      // Add your custom domain here if you set one later:
      // { protocol: 'https', hostname: 'media.yourdomain.com' },
    ],
  },
  // Allow the inbound-email API route to receive larger payloads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
