import { listDharmam } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { DharmamCollection } from '@/features/dharmam/dharmam-collection';
import { pageMetadata } from '@/features/seo/metadata';
import { collectionGraph, JsonLd } from '@/features/seo/structured-data';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({
  title: 'Sree Narayana Dharmam · ശ്രീനാരായണ ധർമ്മം',
  description:
    'Read Sree Narayana Dharmam with verses and Malayalam explanations. ശ്രീനാരായണ ധർമ്മം ശ്ലോകങ്ങളും അർത്ഥവും സഹിതം വായിക്കാം.',
  path: '/dharmam',
  language: 'ml',
});
export default async function DharmamPage() {
  const chapters = (await listDharmam()).map(({ createdAt, updatedAt, ...chapter }) => {
    void createdAt;
    void updatedAt;
    return chapter;
  });
  return (
    <>
      <SiteHeader />
      <JsonLd
        data={collectionGraph(
          '/dharmam',
          'Sree Narayana Dharmam · ശ്രീനാരായണ ധർമ്മം',
          chapters,
          '/dharmam',
        )}
      />
      <DharmamCollection chapters={chapters} />
    </>
  );
}
