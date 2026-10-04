import { requireAdmin } from '@/features/library/server';
import { KrithiEditor } from '@/features/library/krithi-editor';
import { listKrithis } from '@anandham/library/repository';
export default async function NewPage() {
  await requireAdmin();
  const works = await listKrithis(true);
  const nextOrder = works.reduce((next, work) => Math.max(next, work.sortOrder + 1), 0);
  return (
    <KrithiEditor
      nextOrder={nextOrder}
      readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
    />
  );
}
