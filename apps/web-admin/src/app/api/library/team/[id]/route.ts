import { NextResponse } from 'next/server';
import { updateTeamMember } from '@anandham/library/team';
import { apiError, checkOrigin, readJson, requireApiOwner } from '@/features/library/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    await requireApiOwner();
    return NextResponse.json({
      data: await updateTeamMember((await params).id, await readJson(request)),
    });
  } catch (error) {
    return apiError(error);
  }
}
