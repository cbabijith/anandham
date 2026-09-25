import type { DharmamPassage } from '@anandham/library/schema';

export function passageText(passages: DharmamPassage[]) {
  return passages.map((passage) => `${passage.verses}\n\nഅർത്ഥം\n${passage.explanation}`).join('\n\n');
}

export function textEdition({ title, transliteration, canonicalUrl, updatedAt, source, body }: {
  title: string;
  transliteration: string;
  canonicalUrl: string;
  updatedAt: string;
  source: string;
  body: string;
}) {
  return `${title}\n${transliteration}\n\nAnandham — Sree Narayana Guru Digital Library\nCanonical reading page: ${canonicalUrl}\nText last updated: ${new Date(updatedAt).toISOString()}\n${source}\nLanguage: Malayalam script. The English title is a transliteration, not a translation.\n\n${body}\n`;
}

export function textResponse(text: string, canonicalUrl: string) {
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Language': 'ml, en',
      Link: `<${canonicalUrl}>; rel="canonical"`,
      // Keep the HTML reading page as the search result; the text is freely retrievable.
      'X-Robots-Tag': 'noindex, follow',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export function missingText() {
  return new Response('Published text not found.\n', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}
