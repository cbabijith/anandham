import { NextResponse } from 'next/server';
import { readGuruArul } from '@anandham/library/guru-arul-repository';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return NextResponse.json(
      { data: await readGuruArul() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'Guru Arul is temporarily unavailable.' }, { status: 503 });
  }
}
