import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Send metadata in the initial head for crawlers and readers that do not run JavaScript.
  htmlLimitedBots: /.*/,
  transpilePackages: ['@anandham/library'],
  serverExternalPackages: ['postgres'],
  async rewrites() {
    const apiUrl = process.env.LIBRARY_API_URL?.replace(/\/+$/, '');
    return {
      beforeFiles: apiUrl ? [{ source: '/api/:path*', destination: `${apiUrl}/:path*` }] : [],
    };
  },
  async headers() {
    return [
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/login', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
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
