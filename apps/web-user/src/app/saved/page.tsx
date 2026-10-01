import type { Metadata } from 'next';
import { listKrithis, listDharmam } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { SavedCollection } from '@/features/library/saved-collection';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Saved readings',
  robots: { index: false, follow: true },
};
export default async function SavedPage() {
  const [works, chapters] = await Promise.all([listKrithis(), listDharmam()]);
  return (
    <>
      <SiteHeader />
      <SavedCollection works={works} chapters={chapters} />
    </>
  );
}
