import type { Metadata } from 'next';
import { listDharmam } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { DharmamCollection } from '@/features/dharmam/dharmam-collection';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'ശ്രീനാരായണ ധർമ്മം · Sree Narayana Dharmam | Anandham',
  description:
    'Read Sree Narayana Dharmam chapter by chapter, with verses and Malayalam explanations.',
};
export default async function DharmamPage() {
  const chapters = (await listDharmam())
    .map(({ createdAt, updatedAt, ...chapter }) => {
      void createdAt;
      void updatedAt;
      return chapter;
    });
  return (
    <>
      <SiteHeader />
      <DharmamCollection chapters={chapters} />
    </>
  );
}
