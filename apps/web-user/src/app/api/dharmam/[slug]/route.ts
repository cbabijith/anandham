import { NextResponse } from 'next/server';
import { getDharmam, publicDharmam } from '@anandham/library/dharmam-repository';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const row = await getDharmam((await params).slug);
    if (!row) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    return NextResponse.json(
      { data: publicDharmam(row) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'The library is temporarily unavailable.' }, { status: 503 });
  }
}
