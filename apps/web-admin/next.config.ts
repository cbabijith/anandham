import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ['@anandham/library'],
  serverExternalPackages: ['postgres'],
  experimental: {
    proxyClientMaxBodySize: 20 * 1024 * 1024,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-4e12664ec9494c0b8774528892357583.r2.dev',
      },
    ],
  },
};

export default nextConfig;
