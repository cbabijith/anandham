import { test, expect, type Page } from '@playwright/test';
import { randomBytes, createHash } from 'node:crypto';
import postgres from 'postgres';

const adminUrl = process.env.LIBRARY_ADMIN_ORIGIN || 'http://localhost:3101';
const readerUrl = process.env.LIBRARY_READER_URL || 'http://localhost:3100';
const headers = { Origin: adminUrl };

async function signIn(page: Page, email: string, password: string) {
  await page.goto(`${adminUrl}/library/login`);
  await page.getByLabel('Email address').fill(email);
  const input = page.getByLabel('Password', { exact: true });
  await input.fill(password);
  await expect(input).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toHaveValue(password);
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(`${adminUrl}/library`);
}

test('owner creates editors; editors manage both collections; password resets and access controls work', async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(120_000);
  const suffix = Date.now().toString();
  const email = `team-${suffix}@example.invalid`;
  const password = randomBytes(24).toString('base64url');
  const newPassword = randomBytes(24).toString('base64url');
  const krithiSlug = `team-krithi-${suffix}`;
  const chapterSlug = `team-chapter-${suffix}`;
  const db = postgres(process.env.DATABASE_URL!);
  const editorContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const editor = await editorContext.newPage();
  try {
    expect((await request.get(`${adminUrl}/api/library/team`)).status()).toBe(401);
    expect(
      (
        await request.post(`${adminUrl}/api/library/team`, { headers, data: { email, password } })
      ).status(),
    ).toBe(401);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await signIn(page, process.env.LIBRARY_ADMIN_EMAIL!, process.env.LIBRARY_ADMIN_PASSWORD!);
    await page.getByRole('link', { name: 'Team members', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Team members', exact: true })).toBeVisible();
    const ownerApi = page.request;
    expect(
      (
        await ownerApi.post(`${adminUrl}/api/library/team`, {
          headers: { Origin: 'https://wrong.example' },
          data: { email, password },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await ownerApi.post(`${adminUrl}/api/library/team`, {
          headers,
          data: { email, password: 'short' },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await ownerApi.post(`${adminUrl}/api/library/team`, {
          headers,
          data: { email, password, role: 'owner' },
        })
      ).status(),
    ).toBe(400);
    await page.getByLabel('Email address').fill(email.toUpperCase());
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Show password', exact: true }).click();
    await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Hide password', exact: true }).click();
    await page.getByRole('button', { name: 'Add team member', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Team member added');
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
    const team = (await (await ownerApi.get(`${adminUrl}/api/library/team`)).json()).data;
    const member = team.find((row: { email: string }) => row.email === email);
    expect(member.role).toBe('editor');
    expect(member.passwordHash).toBeUndefined();
    expect(JSON.stringify(team)).not.toContain(password);
    const owner = team.find((row: { role: string }) => row.role === 'owner');
    expect(
      (
        await ownerApi.patch(`${adminUrl}/api/library/team/${owner.id}`, {
          headers,
          data: { action: 'disable' },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await ownerApi.post(`${adminUrl}/api/library/team`, {
          headers,
          data: { email: email.toUpperCase(), password },
        })
      ).status(),
    ).toBe(409);
    await page.screenshot({ path: 'test-results/team-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: 'test-results/team-mobile.png', animations: 'disabled' });

    await signIn(editor, email, password);
    const editorApi = editor.request;
    expect((await editorApi.get(`${adminUrl}/api/library/team`)).status()).toBe(403);
    expect(
      (
        await editorApi.post(`${adminUrl}/api/library/team`, {
          headers,
          data: { email: `other-${email}`, password },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await editorApi.patch(`${adminUrl}/api/library/team/${member.id}`, {
          headers,
          data: { action: 'enable' },
        })
      ).status(),
    ).toBe(403);
    await editor.goto(`${adminUrl}/library/team`);
    await expect(editor).toHaveURL(`${adminUrl}/library`);
    await expect(editor.getByRole('link', { name: 'Team members', exact: true })).toHaveCount(0);

    await editor.goto(`${adminUrl}/library/krithis/new`);
    await editor.getByLabel('Original title', { exact: true }).fill('പരിശോധന കൃതി');
    await editor.getByLabel('English search title').fill(`Team krithi ${suffix}`);
    await expect(editor.getByLabel('URL slug')).toHaveValue(krithiSlug);
    const originalText =
      'പരിശോധനയ്ക്കുള്ള പുതിയ കൃതി.\nThis is a complete test text for the library.';
    await editor.getByRole('textbox', { name: 'Complete original text' }).fill(originalText);
    await editor.getByRole('button', { name: 'Save krithi changes', exact: true }).click();
    await expect(editor).toHaveURL(`${adminUrl}/library/krithis/${krithiSlug}`);
    expect((await request.get(`${readerUrl}/api/krithis/${krithiSlug}`)).status()).toBe(404);
    await editor.getByLabel('Status', { exact: true }).selectOption('published');
    await editor.getByRole('button', { name: 'Save & publish', exact: true }).click();
    await expect(editor.getByRole('status')).toContainText('Saved and published');
    const krithi = (await (await request.get(`${readerUrl}/api/krithis/${krithiSlug}`)).json())
      .data;
    expect(krithi.body).toBe(originalText);
    await editor
      .getByRole('textbox', { name: 'Complete original text' })
      .fill(originalText + '\nEdited by the new team member.');
    await editor.getByRole('button', { name: 'Save krithi changes', exact: true }).click();
    await expect(editor.getByRole('status')).toContainText('Saved and published');
    await editor.reload();
    await expect(editor.getByRole('textbox', { name: 'Complete original text' })).toHaveValue(
      originalText + '\nEdited by the new team member.',
    );
    expect(
      (
        await editorApi.patch(`${adminUrl}/api/library/krithis/${krithi.id}`, {
          headers,
          data: { ...krithi, body: originalText },
        })
      ).status(),
    ).toBe(409);

    await editor.goto(`${adminUrl}/library/dharmam/new`);
    await editor.getByLabel('Original title', { exact: true }).fill('പരിശോധന ധർമ്മം');
    await editor.getByLabel('English search title').fill(`Team chapter ${suffix}`);
    await expect(editor.getByLabel('URL slug')).toHaveValue(chapterSlug);
    await editor.getByLabel('Verses 1', { exact: true }).fill('ധർമ്മത്തിന്റെ ശ്ലോകം.');
    await editor
      .getByLabel('Malayalam explanation 1', { exact: true })
      .fill('ധർമ്മത്തിന്റെ അർത്ഥം.');
    await editor.getByRole('button', { name: 'Add passage', exact: true }).click();
    await editor.getByLabel('Verses 2', { exact: true }).fill('രണ്ടാമത്തെ ശ്ലോകം.');
    await editor.getByLabel('Malayalam explanation 2', { exact: true }).fill('രണ്ടാമത്തെ അർത്ഥം.');
    await editor.getByRole('button', { name: 'Save chapter changes', exact: true }).click();
    await expect(editor).toHaveURL(`${adminUrl}/library/dharmam/${chapterSlug}`);
    expect((await request.get(`${readerUrl}/api/dharmam/${chapterSlug}`)).status()).toBe(404);
    await editor.getByLabel('Status', { exact: true }).selectOption('published');
    await editor.getByRole('button', { name: 'Save & publish', exact: true }).click();
    await expect(editor.getByRole('status')).toContainText('Saved and published');
    await editor.getByLabel('Malayalam explanation 2', { exact: true }).fill('പുതുക്കിയ അർത്ഥം.');
    await editor.getByRole('button', { name: 'Save chapter changes', exact: true }).click();
    await expect(editor.getByRole('status')).toContainText('Saved and published');
    await editor.reload();
    await expect(editor.getByLabel('Malayalam explanation 2', { exact: true })).toHaveValue(
      'പുതുക്കിയ അർത്ഥം.',
    );
    const chapter = (await (await request.get(`${readerUrl}/api/dharmam/${chapterSlug}`)).json())
      .data;
    expect(chapter.passages).toHaveLength(2);
    expect(chapter.passages[1].explanation).toBe('പുതുക്കിയ അർത്ഥം.');
    expect(chapter.sourcePassages).toBeUndefined();
    const [audit] =
      await db`select admin_id from library_dharmam_audit_log where chapter_id=${chapter.id} limit 1`;
    expect(audit.admin_id).toBe(member.id);
    await editor.getByLabel('Status', { exact: true }).selectOption('archived');
    await editor.getByRole('button', { name: 'Save chapter changes', exact: true }).click();
    await expect(editor.getByRole('status')).toContainText('This chapter is private');
    expect((await request.get(`${readerUrl}/api/dharmam/${chapterSlug}`)).status()).toBe(404);

    const memberCard = page.locator('.la-team-member').filter({ hasText: email });
    await memberCard.getByRole('button', { name: 'Reset password', exact: true }).click();
    await memberCard.getByLabel('New password', { exact: true }).fill(newPassword);
    await memberCard.getByRole('button', { name: 'Show new password', exact: true }).click();
    await expect(memberCard.getByLabel('New password', { exact: true })).toHaveAttribute(
      'type',
      'text',
    );
    await memberCard.getByRole('button', { name: 'Hide new password', exact: true }).click();
    await memberCard.getByRole('button', { name: 'Save new password', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Password updated');
    expect((await editorApi.get(`${adminUrl}/api/library/krithis`)).status()).toBe(401);
    expect(
      (
        await editorApi.post(`${adminUrl}/api/library/session`, {
          headers,
          data: { email, password },
        })
      ).status(),
    ).toBe(401);
    await signIn(editor, email, newPassword);
    page.once('dialog', (dialog) => dialog.accept());
    await memberCard.getByRole('button', { name: 'Disable access', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Access disabled');
    expect((await editorApi.get(`${adminUrl}/api/library/dharmam`)).status()).toBe(401);
    expect(
      (
        await editorApi.post(`${adminUrl}/api/library/session`, {
          headers,
          data: { email, password: newPassword },
        })
      ).status(),
    ).toBe(401);
    await memberCard.getByRole('button', { name: 'Enable access', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Access restored');
    expect((await editorApi.get(`${adminUrl}/api/library/krithis`)).status()).toBe(401);
    await signIn(editor, email, newPassword);
    expect((await editorApi.get(`${adminUrl}/api/library/krithis`)).status()).toBe(200);
    await editor.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(editor).toHaveURL(`${adminUrl}/library/login`);
  } finally {
    await editorContext.close();
    await db`delete from library_audit_log where krithi_id in (select id from library_krithis where slug=${krithiSlug})`;
    await db`delete from library_krithis where slug=${krithiSlug}`;
    await db`delete from library_dharmam_audit_log where chapter_id in (select id from library_dharmam_chapters where slug=${chapterSlug})`;
    await db`delete from library_dharmam_chapters where slug=${chapterSlug}`;
    await db`delete from library_admins where email=${email}`;
    await db`delete from library_login_limits where key=${createHash('sha256').update(email).digest('hex')}`;
    await db.end();
  }
});
