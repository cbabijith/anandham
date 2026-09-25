import { listKrithis, summarize } from '@anandham/library/repository';
import { requireAdmin } from '@/features/library/server';
import { KrithiTable } from '@/features/library/krithi-table';
export default async function CollectionPage() {
  await requireAdmin();
  const rows = (await listKrithis(true)).map(summarize);
  return (
    <KrithiTable
      works={rows.map((k) => ({
        id: k.id,
        title: k.title,
        transliteration: k.transliteration,
        category: k.category,
        categoryName: k.categoryName,
        slug: k.slug,
        status: k.status,
        sourceId: k.sourceId,
        characters: k.characters,
        sortOrder: k.sortOrder,
      }))}
      readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
    />
  );
}
