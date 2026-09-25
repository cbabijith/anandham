import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@anandham/library/db';
import { krithis, auditLog } from '@anandham/library/schema';
import { saveKrithi } from '@anandham/library/repository';
import { apiError, checkOrigin, readJson, requireApiAdmin } from '@/features/library/server';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin();
    const { id } = await params;
    const [data] = await getDb().select().from(krithis).where(eq(krithis.id, id));
    if (!data) return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    const history = await getDb()
      .select({ id: auditLog.id, action: auditLog.action, createdAt: auditLog.createdAt })
      .from(auditLog)
      .where(and(eq(auditLog.krithiId, id)))
      .orderBy(desc(auditLog.createdAt))
      .limit(30);
    return NextResponse.json({ data, history }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    const admin = await requireApiAdmin();
    return NextResponse.json({
      data: await saveKrithi(await readJson(request), admin.id, (await params).id),
    });
  } catch (error) {
    return apiError(error);
  }
}
