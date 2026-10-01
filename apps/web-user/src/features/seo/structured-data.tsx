import { absoluteUrl, siteName } from './metadata';

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
export const guruEntity = {
  '@type': 'Person',
  '@id': absoluteUrl('/sree-narayana-guru#person'),
  name: 'Sree Narayana Guru',
  alternateName: ['Sri Narayana Guru', 'Narayana Guru', 'ശ്രീനാരായണ ഗുരു', 'ശ്രീനാരായണ ഗുരുദേവൻ'],
  url: absoluteUrl('/sree-narayana-guru'),
  image: absoluteUrl('/images/sree-narayana-guru-original.png'),
  description: 'Spiritual teacher, philosopher, poet and social reformer from Kerala, India.',
  sameAs: ['https://sivagiri.com/history-of-guru'],
};
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: siteName,
        url: absoluteUrl(),
        logo: absoluteUrl('/branding/icon-512.png'),
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: siteName,
        alternateName: 'Anandham Sree Narayana Guru Digital Library',
        url: absoluteUrl(),
        inLanguage: ['en', 'ml'],
        publisher: { '@id': absoluteUrl('/#organization') },
        about: guruEntity,
      },
    ],
  };
}
export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
export function collectionGraph(
  path: string,
  title: string,
  entries: { slug: string; title: string; transliteration: string }[],
  prefix: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl(path),
    url: absoluteUrl(path),
    name: title,
    inLanguage: ['en', 'ml'],
    about: guruEntity,
    isPartOf: { '@id': absoluteUrl('/#website') },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((entry, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${entry.title} · ${entry.transliteration}`,
        url: absoluteUrl(`${prefix}/${entry.slug}`),
      })),
    },
  };
}
export function workGraph(
  work: {
    slug: string;
    title: string;
    transliteration: string;
    updatedAt: Date | string;
    sourceUrl?: string;
  },
  collection: 'krithis' | 'dharmam',
) {
  const path = `/${collection}/${work.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`${path}#work`),
    name: work.title,
    alternateName: work.transliteration,
    url: absoluteUrl(path),
    inLanguage: 'ml',
    isAccessibleForFree: true,
    encoding: {
      '@type': 'MediaObject',
      encodingFormat: 'text/plain',
      contentUrl: absoluteUrl(`${path}/text`),
    },
    dateModified: new Date(work.updatedAt).toISOString(),
    mainEntityOfPage: absoluteUrl(path),
    about: guruEntity,
    ...(collection === 'krithis'
      ? { author: guruEntity, ...(work.sourceUrl ? { isBasedOn: work.sourceUrl } : {}) }
      : {}),
    isPartOf: {
      '@type': 'CollectionPage',
      name: collection === 'krithis' ? 'Sree Narayana Guru Krithis' : 'Sree Narayana Dharmam',
      url: absoluteUrl(`/${collection}`),
    },
  };
}
