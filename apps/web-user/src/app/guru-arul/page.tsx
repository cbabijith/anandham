import { SiteHeader } from '@/features/library/site-header';
import { QuoteCollection } from '@/features/guru-arul/quote-collection';

import { pageMetadata } from '@/features/seo/metadata';
import { JsonLd, breadcrumbs } from '@/features/seo/structured-data';
export const metadata = pageMetadata({
  title: 'ഗുരു അരുൾ · Guru Arul',
  description:
    'Read 46 Malayalam quotes attributed to Sree Narayana Guru, grouped by caste and religion. Search, save and copy your favourites.',
  path: '/guru-arul',
  language: 'ml',
});

export default function GuruArulPage() {
  return (
    <>
      <SiteHeader />
      <JsonLd
        data={breadcrumbs([
          { name: 'Anandham', path: '/' },
          { name: 'Guru Arul', path: '/guru-arul' },
        ])}
      />
      <QuoteCollection />
    </>
  );
}
