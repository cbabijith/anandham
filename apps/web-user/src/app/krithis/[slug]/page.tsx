import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getKrithi, listKrithis } from '@anandham/library/repository';
import { SiteHeader } from '@/features/library/site-header';
import { Reader } from '@/features/reader/reader';
export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const work = await getKrithi((await params).slug);
  return {
    title: work
      ? `${work.title} · ${work.transliteration} | Anandham`
      : 'Work not found | Anandham',
    description: work
      ? `Read ${work.transliteration} by Sree Narayana Guru in the original Malayalam script.`
      : undefined,
  };
}
export default async function KrithiPage({ params }: { params: Promise<{ slug: string }> }) {
  const work = await getKrithi((await params).slug);
  if (!work) notFound();
  const all = await listKrithis();
  const index = all.findIndex((k) => k.id === work.id);
  const neighbor = (i: number) => (all[i] ? { slug: all[i].slug, title: all[i].title } : null);
  return (
    <>
      <SiteHeader />
      <Reader
        work={{
          slug: work.slug,
          title: work.title,
          transliteration: work.transliteration,
          body: work.body,
          categoryName: work.categoryName,
          sourceUrl: work.sourceUrl,
        }}
        previous={neighbor(index - 1)}
        next={neighbor(index + 1)}
      />
    </>
  );
}
