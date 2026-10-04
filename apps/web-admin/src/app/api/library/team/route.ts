import { NextResponse } from 'next/server';
import { createTeamMember, listTeamMembers } from '@anandham/library/team';
import { apiError, checkOrigin, readJson, requireApiOwner } from '@/features/library/server';

export async function GET() {
  try {
    await requireApiOwner();
    return NextResponse.json(
      { data: await listTeamMembers() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireApiOwner();
    return NextResponse.json(
      { data: await createTeamMember(await readJson(request)) },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
