import { listKrithis } from '@/lib/library-reader';
import { Collection } from '@/features/library/collection';
import { SiteHeader } from '@/features/library/site-header';
import { pageMetadata } from '@/features/seo/metadata';
import { collectionGraph, JsonLd } from '@/features/seo/structured-data';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({
  title: 'Sree Narayana Guru Krithis · ശ്രീനാരായണ ഗുരുവിന്റെ കൃതികൾ',
  description:
    'Browse Sree Narayana Guru’s krithis in Malayalam script with English titles. Read Daiva Dasakam, Atmopadesa Sathakam and the full Sivagiri catalogue.',
  path: '/krithis',
});
export default async function Page() {
  const works = (await listKrithis()).map(({ createdAt, updatedAt, ...work }) => {
    void createdAt;
    void updatedAt;
    return work;
  });
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <header className="catalogue-intro section-container">
          <span className="eyebrow">THE WRITINGS OF SREE NARAYANA GURU</span>
          <h1>Sree Narayana Guru Krithis</h1>
          <p lang="ml">ശ്രീനാരായണ ഗുരുവിന്റെ കൃതികൾ</p>
          <p>
            {works.length} works from Sivagiri’s Gurudeva Krithikal catalogue, free to read in
            Malayalam script.
          </p>
        </header>
        <Collection works={works} />
      </main>
      <JsonLd
        data={collectionGraph(
          '/krithis',
          'Sree Narayana Guru Krithis · ഗുരുദേവകൃതികൾ',
          works,
          '/krithis',
        )}
      />
    </>
  );
}
