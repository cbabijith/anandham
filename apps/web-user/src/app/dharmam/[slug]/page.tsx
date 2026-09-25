import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDharmam, listDharmam } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { Reader } from '@/features/reader/reader';
import { pageMetadata } from '@/features/seo/metadata';
import { breadcrumbs, JsonLd, workGraph } from '@/features/seo/structured-data';
export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const chapter = await getDharmam((await params).slug);
  if (!chapter) notFound();
  return pageMetadata({
    title: `${chapter.transliteration} · ${chapter.title} — Sree Narayana Dharmam`,
    description: `Read ${chapter.transliteration} (${chapter.title}) in Sree Narayana Dharmam, with verses and Malayalam meaning. ശ്ലോകങ്ങളും മലയാളത്തിലുള്ള അർത്ഥവും.`,
    path: `/dharmam/${chapter.slug}`,
    language: 'ml',
  });
}
export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const chapter = await getDharmam((await params).slug);
  if (!chapter) notFound();
  const chapters = await listDharmam();
  const index = chapters.findIndex((c) => c.id === chapter.id);
  const neighbor = (i: number) =>
    chapters[i] ? { slug: chapters[i].slug, title: chapters[i].title } : null;
  return (
    <>
      <SiteHeader />
      <JsonLd data={workGraph(chapter, 'dharmam')} />
      <JsonLd
        data={breadcrumbs([
          { name: 'Anandham', path: '/' },
          { name: 'Sree Narayana Dharmam', path: '/dharmam' },
          { name: chapter.title, path: `/dharmam/${chapter.slug}` },
        ])}
      />
      <Reader
        collection="dharmam"
        work={{
          slug: chapter.slug,
          title: chapter.title,
          transliteration: chapter.transliteration,
          body: '',
          passages: chapter.passages,
          categoryName: `Chapter ${chapter.sortOrder + 1}`,
          sourceUrl: '',
        }}
        previous={neighbor(index - 1)}
        next={neighbor(index + 1)}
      />
    </>
  );
}
