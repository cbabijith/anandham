import { SiteHeader } from '@/features/library/site-header';
import { QuoteCollection } from '@/features/guru-arul/quote-collection';
import { getGuruArul } from '@/lib/library-reader';

import { pageMetadata } from '@/features/seo/metadata';
import { JsonLd, breadcrumbs } from '@/features/seo/structured-data';
export const metadata = pageMetadata({
  title: 'ഗുരു അരുൾ · Guru Arul',
  description:
    'Read Malayalam quotes attributed to Sree Narayana Guru, grouped by topic: caste, religion, God, temples, Vedanta and more. Search, save and copy your favourites.',
  path: '/guru-arul',
  language: 'ml',
});

export const dynamic = 'force-dynamic';
export default async function GuruArulPage() {
  const collection = await getGuruArul();
  return (
    <>
      <SiteHeader />
      <JsonLd
        data={breadcrumbs([
          { name: 'Anandham', path: '/' },
          { name: 'Guru Arul', path: '/guru-arul' },
        ])}
      />
      <QuoteCollection collection={collection} />
    </>
  );
}
