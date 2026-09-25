import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getKrithi, listKrithis } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { Reader } from '@/features/reader/reader';
import { absoluteUrl, pageMetadata } from '@/features/seo/metadata';
import { breadcrumbs, JsonLd, workGraph } from '@/features/seo/structured-data';
export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const work = await getKrithi((await params).slug);
  if (!work) notFound();
  return pageMetadata({
    title: `${work.transliteration} · ${work.title} — Sree Narayana Guru`,
    description: `Read ${work.transliteration} (${work.title}) by Sree Narayana Guru in Malayalam script. ശ്രീനാരായണ ഗുരുവിന്റെ കൃതി വായിക്കാം.`,
    path: `/krithis/${work.slug}`,
    language: 'ml',
    plainText: true,
  });
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
      <JsonLd data={workGraph(work, 'krithis')} />
      <JsonLd
        data={breadcrumbs([
          { name: 'Anandham', path: '/' },
          { name: 'Krithis', path: '/krithis' },
          { name: work.title, path: `/krithis/${work.slug}` },
        ])}
      />
      <Reader
        work={{
          slug: work.slug,
          title: work.title,
          transliteration: work.transliteration,
          body: work.body,
          categoryName: work.categoryName,
          sourceUrl: work.sourceUrl,
          updatedAt: work.updatedAt,
        }}
        canonicalUrl={absoluteUrl(`/krithis/${work.slug}`)}
        previous={neighbor(index - 1)}
        next={neighbor(index + 1)}
      />
    </>
  );
}
