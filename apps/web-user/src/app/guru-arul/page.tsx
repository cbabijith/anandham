import type { Metadata } from 'next';
import { SiteHeader } from '@/features/library/site-header';
import { QuoteCollection } from '@/features/guru-arul/quote-collection';

export const metadata: Metadata = {
  title: 'ഗുരു അരുൾ · Guru Arul | Anandham',
  description:
    'Read 46 Malayalam quotes attributed to Sree Narayana Guru, grouped by caste and religion. Search, save and copy your favourites.',
};

export default function GuruArulPage() {
  return (
    <>
      <SiteHeader />
      <QuoteCollection />
    </>
  );
}
