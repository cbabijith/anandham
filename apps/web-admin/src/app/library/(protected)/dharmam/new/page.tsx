import { listDharmam } from '@anandham/library/dharmam-repository';
import { requireAdmin } from '@/features/library/server';
import { DharmamEditor } from '@/features/dharmam/dharmam-editor';
export default async function NewChapterPage() {
  await requireAdmin();
  const chapters = await listDharmam(true);
  const nextOrder = chapters.reduce((next, c) => Math.max(next, c.sortOrder + 1), 0);
  return (
    <DharmamEditor
      nextOrder={nextOrder}
      readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
    />
  );
}
