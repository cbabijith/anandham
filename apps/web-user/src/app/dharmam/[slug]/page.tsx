import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDharmam, listDharmam } from '@anandham/library/dharmam-repository';
import { SiteHeader } from '@/features/library/site-header';
import { Reader } from '@/features/reader/reader';
export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const chapter = await getDharmam((await params).slug);
  return {
    title: chapter
      ? `${chapter.title} · Sree Narayana Dharmam | Anandham`
      : 'Chapter not found | Anandham',
  };
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
