import { getDharmam } from '@/lib/library-reader';
import { absoluteUrl } from '@/features/seo/metadata';
import { missingText, textEdition, textResponse } from '@/features/seo/text-edition';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const chapter = await getDharmam((await params).slug);
  if (!chapter || chapter.status !== 'published') return missingText();
  const canonicalUrl = absoluteUrl(`/dharmam/${chapter.slug}`);
  const body = chapter.passages.map((passage, index) =>
    `Passage ${index + 1}: ${canonicalUrl}#passage-${index + 1}\n\nശ്ലോകം\n${passage.verses}\n\nഅർത്ഥം\n${passage.explanation}`,
  ).join('\n\n');
  return textResponse(textEdition({
    ...chapter,
    canonicalUrl,
    source: 'Collection: Sree Narayana Dharmam\nSource: Verses and Malayalam explanations supplied by the library editor.\nChapters are published progressively as text is supplied.',
    body,
  }), canonicalUrl);
}
