import type { Metadata } from 'next';
import { listKrithis } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { ReadingTabs } from '@/features/library/reading-tabs';
import { Collection } from '@/features/library/collection';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'ഗുരുദേവ കൃതികൾ · Krithis | Anandham' };
export default async function KrithisPage() {
  const works = await listKrithis();
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="library-page app-container">
        <ReadingTabs />
        <Collection works={works} />
      </main>
    </>
  );
}
