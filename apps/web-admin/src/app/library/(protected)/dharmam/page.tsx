import { listDharmam, summarizeDharmam } from '@anandham/library/dharmam-repository';
import { requireAdmin } from '@/features/library/server';
import { DharmamTable } from '@/features/dharmam/dharmam-table';
export default async function DharmamPage() {
  await requireAdmin();
  const chapters = (await listDharmam(true))
    .map(summarizeDharmam)
    .map(({ createdAt, updatedAt, ...chapter }) => {
      void createdAt;
      void updatedAt;
      return chapter;
    });
  return (
    <DharmamTable
      chapters={chapters}
      readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'}
    />
  );
}
