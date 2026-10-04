import { listTeamMembers } from '@anandham/library/team';
import { requireOwner } from '@/features/library/server';
import { TeamManager } from '@/features/library/team-manager';

export default async function TeamPage() {
  await requireOwner();
  const members = await listTeamMembers();
  return (
    <TeamManager
      initialMembers={members.map((member) => ({
        ...member,
        createdAt: member.createdAt.toISOString(),
        disabledAt: member.disabledAt?.toISOString() ?? null,
      }))}
    />
  );
}
