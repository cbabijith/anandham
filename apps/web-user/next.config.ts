import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // The persistent cache restored stale global CSS during production verification.
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
  },
  transpilePackages: ['@anandham/library'],
  serverExternalPackages: ['postgres'],
  async rewrites() {
    const apiUrl = process.env.LIBRARY_API_URL?.replace(/\/+$/, '');
    return {
      beforeFiles: apiUrl
        ? [{ source: '/api/:path*', destination: `${apiUrl}/:path*` }]
        : [],
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};
export default nextConfig;
