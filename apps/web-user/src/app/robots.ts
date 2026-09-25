import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/features/seo/metadata';
export default function robots(): MetadataRoute.Robots {
  return {
    // Specific groups must repeat exclusions: bots do not inherit the wildcard group.
    rules: ['*', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User',
      'Googlebot', 'Google-Extended', 'bingbot'].map((userAgent) => ({
      userAgent,
      allow: '/',
      disallow: ['/api/', '/login', '/library/'],
    })),
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
