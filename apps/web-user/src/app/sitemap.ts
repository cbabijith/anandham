import type { MetadataRoute } from 'next';
import { listKrithis, listDharmam } from '@/lib/library-reader';
import { absoluteUrl, profileLanguages } from '@/features/seo/metadata';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, chapters] = await Promise.all([listKrithis(), listDharmam()]);
  return [
    ...['/', '/krithis', '/dharmam', '/about'].map((path) => ({ url: absoluteUrl(path) })),
    ...['/sree-narayana-guru', '/ml/sree-narayana-guru'].map((path) => ({
      url: absoluteUrl(path),
      alternates: { languages: profileLanguages },
    })),
    ...works.map((work) => ({
      url: absoluteUrl(`/krithis/${work.slug}`),
      lastModified: work.updatedAt,
    })),
    ...chapters.map((chapter) => ({
      url: absoluteUrl(`/dharmam/${chapter.slug}`),
      lastModified: chapter.updatedAt,
    })),
  ];
}
