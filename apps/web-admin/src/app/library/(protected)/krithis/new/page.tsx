import { requireAdmin } from '@/features/library/server';
import { KrithiEditor } from '@/features/library/krithi-editor';
export default async function NewPage() {
  await requireAdmin();
  return <KrithiEditor readerUrl={process.env.LIBRARY_READER_URL ?? 'http://localhost:3000'} />;
}
