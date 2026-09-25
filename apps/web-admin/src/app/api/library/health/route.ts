import { getSql } from '@anandham/library/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await getSql()`select 1 from library_krithis limit 1`;
    return Response.json({ status: 'ok' });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}
