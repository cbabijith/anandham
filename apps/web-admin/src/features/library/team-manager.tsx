'use client';
import { useState, useSyncExternalStore } from 'react';
import { CheckCircle2, KeyRound, UserPlus, Users } from 'lucide-react';
import { PasswordField } from './password-field';

export type TeamMember = {
  id: string;
  email: string;
  role: 'owner' | 'editor';
  disabledAt: string | null;
  createdAt: string;
};
const subscribe = () => () => {};
export function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [members, setMembers] = useState(initialMembers);
  const [pending, setPending] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(url: string, method: string, data: unknown, success: string) {
    setPending(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update the team.');
      const member: TeamMember = result.data;
      setMembers((current) =>
        current.some((row) => row.id === member.id)
          ? current.map((row) => (row.id === member.id ? member : row))
          : [...current, member],
      );
      setMessage(success);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update the team.');
      return false;
    } finally {
      setPending(false);
    }
  }

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (
      await submit(
        '/api/library/team',
        'POST',
        {
          email: data.get('email'),
          password: data.get('password'),
        },
        'Team member added. They can sign in now and manage both collections.',
      )
    )
      form.reset();
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>, member: TeamMember) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (
      await submit(
        `/api/library/team/${member.id}`,
        'PATCH',
        {
          action: 'reset-password',
          password: data.get('password'),
        },
        `Password updated for ${member.email}. Previous sessions have been signed out.`,
      )
    )
      setResetId(null);
  }

  return (
    <>
      <div className="la-page-heading">
        <div>
          <span className="la-eyebrow">PEOPLE WHO CARE FOR THE LIBRARY</span>
          <h1>Team members</h1>
          <p>Give your team access to add, edit, and publish krithis and Dharmam chapters.</p>
        </div>
        <Users size={28} />
      </div>
      {error && (
        <p className="la-message error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="la-message success" role="status">
          <CheckCircle2 size={18} />
          {message}
        </p>
      )}
      <div className="la-team-grid">
        <section className="la-panel la-editor-fields">
          <h2>Add a team member</h2>
          <p>Create their sign-in details. Share the email and password with your teammate.</p>
          <form method="post" onSubmit={addMember}>
            <fieldset disabled={pending} className="la-fieldset">
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="off"
                  required
                  maxLength={254}
                  placeholder="teammate@example.com"
                />
              </label>
              <PasswordField
                name="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={256}
                hint="Use at least 12 characters. A phrase works well."
                disabled={pending}
              />
              <p className="la-help-text">
                Editors can manage all krithis and Dharmam chapters. Only the owner can manage the
                team.
              </p>
              <button className="la-button primary" disabled={pending || !hydrated}>
                <UserPlus size={17} /> Add team member
              </button>
            </fieldset>
          </form>
        </section>
        <section className="la-panel">
          <div className="la-panel-heading">
            <h2>Your team</h2>
            <span>{members.length} members</span>
          </div>
          <ul className="la-team-list">
            {members.map((member) => (
              <li key={member.id} className="la-team-member">
                <div className="la-team-member-heading">
                  <div>
                    <strong>{member.email}</strong>
                    <small>
                      {member.role === 'owner'
                        ? 'Owner · Manages the team and library'
                        : 'Editor · Krithis & Dharmam'}
                    </small>
                  </div>
                  <span className={`la-badge ${member.disabledAt ? 'archived' : 'published'}`}>
                    {member.disabledAt ? 'Disabled' : 'Active'}
                  </span>
                </div>
                {member.role === 'editor' && (
                  <>
                    <div className="la-team-actions">
                      <button
                        type="button"
                        className="la-button small"
                        disabled={pending}
                        onClick={() => setResetId(resetId === member.id ? null : member.id)}
                      >
                        <KeyRound size={15} /> Reset password
                      </button>
                      <button
                        type="button"
                        className="la-button small"
                        disabled={pending}
                        onClick={() => {
                          if (
                            !member.disabledAt &&
                            !confirm(
                              `Disable access for ${member.email}? Their active sessions will end.`,
                            )
                          )
                            return;
                          void submit(
                            `/api/library/team/${member.id}`,
                            'PATCH',
                            { action: member.disabledAt ? 'enable' : 'disable' },
                            member.disabledAt
                              ? `Access restored for ${member.email}.`
                              : `Access disabled for ${member.email}. Their content is preserved.`,
                          );
                        }}
                      >
                        {member.disabledAt ? 'Enable access' : 'Disable access'}
                      </button>
                    </div>
                    {resetId === member.id && (
                      <form
                        method="post"
                        className="la-editor-fields la-team-reset"
                        onSubmit={(event) => resetPassword(event, member)}
                      >
                        <PasswordField
                          label="New password"
                          name="password"
                          autoComplete="new-password"
                          required
                          minLength={12}
                          maxLength={256}
                          hint="At least 12 characters. This signs out their existing sessions."
                          disabled={pending}
                        />
                        <div className="la-team-actions">
                          <button
                            className="la-button primary small"
                            disabled={pending || !hydrated}
                          >
                            Save new password
                          </button>
                          <button
                            type="button"
                            className="la-button small"
                            disabled={pending}
                            onClick={() => setResetId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
