import { listKrithis } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { ReadingTabs } from '@/features/library/reading-tabs';
import { Collection } from '@/features/library/collection';
import { pageMetadata } from '@/features/seo/metadata';
import { collectionGraph, JsonLd } from '@/features/seo/structured-data';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({
  title: 'Sree Narayana Guru Krithis · ഗുരുദേവ കൃതികൾ',
  description:
    'Browse Sree Narayana Guru’s krithis in Malayalam script with English search titles. Read Daiva Dasakam, Atmopadesa Sathakam and the Sivagiri catalogue.',
  path: '/krithis',
});
export default async function KrithisPage() {
  const works = await listKrithis();
  return (
    <>
      <SiteHeader />
      <JsonLd data={collectionGraph('/krithis', 'Sree Narayana Guru Krithis', works, '/krithis')} />
      <main id="main-content" className="library-page app-container">
        <ReadingTabs />
        <Collection works={works} />
      </main>
    </>
  );
}
