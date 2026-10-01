import { listKrithis, listDharmam } from '@/lib/library-reader';
import { SiteHeader } from '@/features/library/site-header';
import { HomeLibrary } from '@/features/library/home-library';
import { pageMetadata, siteDescription } from '@/features/seo/metadata';
import { JsonLd, siteGraph } from '@/features/seo/structured-data';
export const metadata = pageMetadata({
  title: 'Sree Narayana Guru Krithis, Dharmam & Guru Arul',
  description: siteDescription,
  path: '/',
});
export const dynamic = 'force-dynamic';
export default async function Home() {
  const [works, chapters] = await Promise.all([listKrithis(), listDharmam()]);
  return (
    <>
      <SiteHeader />
      <JsonLd data={siteGraph()} />
      <HomeLibrary works={works} chapters={chapters} />
    </>
  );
}
