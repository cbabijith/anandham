import { listDharmam, listKrithis } from '@/lib/library-reader';
import { absoluteUrl } from '@/features/seo/metadata';

export const dynamic = 'force-dynamic';
const label = (text: string) => text.replace(/\s+/g, ' ').replace(/[\\[\]]/g, '\\$&');

// An optional navigation aid, not an AI ranking directive or a substitute for HTML/sitemaps.
export async function GET() {
  const [works, chapters] = await Promise.all([listKrithis(), listDharmam()]);
  const krithis = works.filter((work) => work.status === 'published');
  const dharmam = chapters.filter((chapter) => chapter.status === 'published');
  const entry = (work: { slug: string; title: string; transliteration: string }, collection: string) => {
    const url = absoluteUrl(`/${collection}/${work.slug}`);
    return `- [${label(work.transliteration)} — ${label(work.title)}](${url}): [Plain text](${url}/text)`;
  };
  const text = [
    '# Anandham — Sree Narayana Guru Digital Library',
    '',
    '> Free reading of Sree Narayana Guru’s krithis and Sree Narayana Dharmam in Malayalam script, with English search titles.',
    '',
    'Anandham is an independent reading resource at https://anandham.online, not an official Sivagiri Mutt publication.',
    'The krithi collection follows Sivagiri Mutt’s Gurudeva Krithikal catalogue. Each sourced work identifies its original source.',
    'Dharmam verses and Malayalam explanations are supplied by the library editor and published progressively. This collection is incomplete.',
    'English work titles are transliterations; the library does not provide English translations of every work.',
    '',
    '## Guides and sources',
    `- [Sree Narayana Guru: life, teachings and writings](${absoluteUrl('/sree-narayana-guru')})`,
    `- [ശ്രീനാരായണ ഗുരു: ജീവിതവും ദർശനവും കൃതികളും](${absoluteUrl('/ml/sree-narayana-guru')})`,
    `- [Sources and editorial approach](${absoluteUrl('/about')})`,
    `- [Canonical XML sitemap](${absoluteUrl('/sitemap.xml')})`,
    '',
    `## Krithis — ${krithis.length} published works`,
    ...krithis.map((work) => entry(work, 'krithis')),
    '',
    `## Sree Narayana Dharmam — ${dharmam.length} published chapters`,
    ...dharmam.map((chapter) => entry(chapter, 'dharmam')),
    '',
  ].join('\n');
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', 'X-Robots-Tag': 'noindex, follow' },
  });
}
