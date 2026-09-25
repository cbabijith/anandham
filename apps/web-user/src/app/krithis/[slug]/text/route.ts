import { getKrithi } from '@/lib/library-reader';
import { absoluteUrl } from '@/features/seo/metadata';
import { missingText, textEdition, textResponse } from '@/features/seo/text-edition';
import { sourceNotes } from '@anandham/library/catalogue';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const work = await getKrithi((await params).slug);
  if (!work || work.status !== 'published') return missingText();
  const canonicalUrl = absoluteUrl(`/krithis/${work.slug}`);
  const source = [
    'Author: Sree Narayana Guru',
    work.sourceUrl ? `Source: ${work.sourceUrl}` : 'Source: Library editorial contribution',
    'Source spellings and textual variants are retained.',
    sourceNotes[work.slug] ? `Source note: ${sourceNotes[work.slug]}` : '',
  ].filter(Boolean).join('\n');
  return textResponse(textEdition({ ...work, canonicalUrl, source }), canonicalUrl);
}
