import { NextResponse } from 'next/server';
import { getKrithi } from '@anandham/library/repository';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const row = await getKrithi((await params).slug);
    if (!row) return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    const { sourceBody: _source, ...data } = row;
    void _source;
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'The library is temporarily unavailable.' }, { status: 503 });
  }
}
