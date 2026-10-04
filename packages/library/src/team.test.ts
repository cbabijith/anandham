import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teamMemberInput, teamMemberUpdate } from './team-validation';
import { suggestSlug } from './editor-utils';
import { verifyPassword } from './auth';

test('team accounts normalize email and reject weak credentials or injected roles', () => {
  const member = { email: '  Editor@Example.com ', password: 'a-long-editor-passphrase' };
  assert.equal(teamMemberInput.parse(member).email, 'editor@example.com');
  for (const change of [
    { email: 'not-an-email' },
    { password: 'short' },
    { password: 'a'.repeat(257) },
    { role: 'owner' },
  ])
    assert.equal(teamMemberInput.safeParse({ ...member, ...change }).success, false);
  assert.equal(
    teamMemberInput.parse({ ...member, password: '  preserve these spaces  ' }).password,
    '  preserve these spaces  ',
  );
});
test('team changes accept only explicit access actions and validated passwords', () => {
  assert.ok(teamMemberUpdate.safeParse({ action: 'disable' }).success);
  assert.ok(teamMemberUpdate.safeParse({ action: 'enable' }).success);
  assert.ok(
    teamMemberUpdate.safeParse({ action: 'reset-password', password: 'valid-new-password' })
      .success,
  );
  for (const value of [
    { action: 'promote' },
    { action: 'reset-password', password: '' },
    { action: 'enable', role: 'owner' },
  ])
    assert.equal(teamMemberUpdate.safeParse(value).success, false);
});
test('suggested URLs handle punctuation, accents and length without changing Malayalam titles', () => {
  assert.equal(suggestSlug(' Śrī Nārāyana — Chapter 2 '), 'sri-narayana-chapter-2');
  assert.equal(suggestSlug('Daiva Dasakam'), 'daiva-dasakam');
  assert.equal(suggestSlug('a'.repeat(119) + ' more'), 'a'.repeat(119));
  assert.equal(suggestSlug(''), '');
});
test('malformed stored password hashes fail safely', () => {
  assert.equal(verifyPassword('anything', 'a'.repeat(32) + ':' + 'z'.repeat(128)), false);
  assert.equal(verifyPassword('anything', 'invalid'), false);
});
