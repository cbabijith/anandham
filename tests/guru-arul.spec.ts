import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import postgres from 'postgres';
const readerUrl = `http://localhost:${process.env.LIBRARY_TEST_READER_PORT || 3100}`;
const adminUrl = `http://localhost:${process.env.LIBRARY_TEST_ADMIN_PORT || 3101}`;
const apiUrl = `${adminUrl}/api/library/guru-arul`;

test('Guru Arul admin routes reject anonymous access and hostile origins', async ({ request }) => {
  expect((await request.get(apiUrl)).status()).toBe(401);
  expect((await request.get(`${apiUrl}/jathi`)).status()).toBe(401);
  for (const method of ['POST', 'PATCH', 'DELETE']) {
    const url = method === 'POST' ? apiUrl : `${apiUrl}/jathi`;
    expect(
      (await request.fetch(url, { method, headers: { Origin: adminUrl }, data: {} })).status(),
    ).toBe(401);
    expect(
      (
        await request.fetch(url, {
          method,
          headers: { Origin: 'https://untrusted.example' },
          data: {},
        })
      ).status(),
    ).toBe(403);
  }
});

test('topics and quotes support editing, ordering, drafts, bookmarks, conflicts and deletion', async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  await page.goto(`${adminUrl}/library/guru-arul`);
  await expect(page).toHaveURL(/\/library\/login$/);
  await page.getByLabel('Email address').fill(process.env.LIBRARY_ADMIN_EMAIL!);
  await page.getByLabel('Password', { exact: true }).fill(process.env.LIBRARY_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('link', { name: 'Manage Guru Arul' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(21);
  await page.screenshot({ caret: 'initial', path: 'test-results/guru-arul-admin-desktop.png' });
  await page.getByRole('link', { name: 'Add topic', exact: true }).click();
  const title = `പരിശോധന ${Date.now()}`;
  await page.getByLabel('Malayalam title').fill(title);
  await page.getByLabel('English title').fill('Editorial verification');
  await page.getByRole('button', { name: 'Add quote', exact: true }).click();
  await page
    .getByLabel('Quote 1 text', { exact: true })
    .fill('ആദ്യ വാക്കുകൾ\nA complete second line. <script>plain text</script>');
  await page.getByRole('button', { name: 'Add quote', exact: true }).click();
  await page.getByLabel('Quote 2 text', { exact: true }).fill('Private second quote');
  await page.getByLabel('Quote 2 status').selectOption('draft');
  await page.getByRole('button', { name: 'Save changes', exact: true }).first().click();
  await expect(page).toHaveURL(/\/library\/guru-arul\/[a-f0-9-]+$/);
  const id = page.url().split('/').at(-1)!;
  const api = page.request;
  const publicContext = await browser.newContext();
  const reader = await publicContext.newPage();
  const publicData = async () => (await (await api.get(`${readerUrl}/api/guru-arul`)).json()).data;
  try {
    expect((await publicData()).categories.some((t: { id: string }) => t.id === id)).toBe(false);
    await page.getByLabel('Topic status').selectOption('published');
    await page.getByRole('button', { name: 'Save & publish', exact: true }).first().click();
    await expect(page.getByRole('status')).toContainText('Saved and published');
    const first = (await (await api.get(`${apiUrl}/${id}`)).json()).data;
    let data = await publicData();
    expect(data.quotes.filter((q: { category: string }) => q.category === id)).toHaveLength(1);
    const quoteId = first.quotes[0].id;
    await reader.goto(`${readerUrl}/guru-arul#${quoteId}`);
    await expect(reader.locator(`[id="${quoteId}"] blockquote`)).toContainText(
      'A complete second line. <script>plain text</script>',
    );
    await reader.getByRole('button', { name: `Save quote ${quoteId}`, exact: true }).click();
    await reader.goto(`${readerUrl}/saved`);
    await expect(reader.locator('.saved-row')).toContainText('A complete second line.');
    const stale = await api.patch(`${apiUrl}/${id}`, {
      headers: { Origin: adminUrl },
      data: { ...first, revision: 1 },
    });
    expect(stale.status()).toBe(409);
    expect(
      (
        await api.delete(`${apiUrl}/${id}`, {
          headers: { Origin: adminUrl },
          data: { revision: 1 },
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await api.patch(`${apiUrl}/${id}`, {
          headers: { Origin: adminUrl },
          data: { ...first, quotes: [{ ...first.quotes[0], id: 'jathi-01' }] },
        })
      ).status(),
    ).toBe(400);
    await page.getByLabel('Malayalam title').fill(`${title} പുതിയത്`);
    await page
      .getByLabel('Quote 1 text', { exact: true })
      .fill('Edited words\nവാക്കുകൾ നിലനിൽക്കുന്നു.');
    await page.getByLabel('Quote 2 status').selectOption('published');
    await page.getByRole('button', { name: 'Move quote 2 up', exact: true }).click();
    await expect(page.getByLabel('Quote 1 text', { exact: true })).toHaveValue(
      'Private second quote',
    );
    await page.getByRole('button', { name: 'Save & publish', exact: true }).first().click();
    await expect(page.getByRole('status')).toContainText('Saved and published');
    data = await publicData();
    expect(data.categories.find((t: { id: string }) => t.id === id).title).toBe(`${title} പുതിയത്`);
    expect(
      data.quotes
        .filter((q: { category: string }) => q.category === id)
        .map((q: { id: string }) => q.id),
    ).toEqual([first.quotes[1].id, quoteId]);
    await reader.reload();
    await expect(reader.locator('.saved-row')).toContainText('Edited words');
    await reader.goto(readerUrl);
    await reader.getByRole('textbox', { name: 'Search the library' }).fill('Edited words');
    await expect(reader.locator('.home-search-results')).toContainText('Edited words');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Reading preview', exact: true }).click();
    await expect(page.locator('.la-arul-preview').last()).toContainText('Edited words');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      caret: 'initial',
      path: 'test-results/guru-arul-admin-mobile.png',
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Edit quotes', exact: true }).click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete quote 2', exact: true }).click();
    await page.getByRole('button', { name: 'Save & publish', exact: true }).first().click();
    await expect(page.getByRole('status')).toContainText('Saved and published');
    await reader.goto(`${readerUrl}/saved`);
    await expect(reader.getByRole('heading', { name: 'Keep a favourite here' })).toBeVisible();
    expect((await publicData()).quotes.some((q: { id: string }) => q.id === quoteId)).toBe(false);
    await page.getByLabel('Topic status').selectOption('archived');
    await page.getByRole('button', { name: 'Save changes', exact: true }).first().click();
    await expect(page.getByRole('status')).toContainText('This topic is private');
    expect((await publicData()).categories.some((t: { id: string }) => t.id === id)).toBe(false);
    const history = (await (await api.get(`${apiUrl}/${id}`)).json()).history;
    expect(history.length).toBe(5);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete topic', exact: true }).click();
    await expect(page).toHaveURL(`${adminUrl}/library/guru-arul`);
    expect((await api.get(`${apiUrl}/${id}`)).status()).toBe(404);
    const sql = postgres(process.env.DATABASE_URL!);
    try {
      expect(
        (
          await sql`select action from library_guru_arul_audit_log where topic_id=${id} and action='deleted'`
        ).length,
      ).toBe(1);
    } finally {
      await sql.end();
    }
  } finally {
    await publicContext.close();
    const sql = postgres(process.env.DATABASE_URL!);
    await sql`delete from library_guru_arul_audit_log where topic_id=${id}`;
    await sql`delete from library_guru_arul_topics where id=${id}`;
    await sql.end();
  }
});

test('re-running setup preserves changed titles and deleted source topics', async () => {
  const sql = postgres(process.env.DATABASE_URL!);
  const original =
    await sql`select * from library_guru_arul_topics where id in ('thyagam', 'jathi') order by id`;
  try {
    await sql`update library_guru_arul_topics set title='Editorially updated title' where id='jathi'`;
    await sql`delete from library_guru_arul_topics where id='thyagam'`;
    execFileSync(
      process.execPath,
      ['--env-file=.env.local', '--import', 'tsx', 'packages/library/scripts/setup.ts'],
      { stdio: 'pipe' },
    );
    expect((await sql`select title from library_guru_arul_topics where id='jathi'`)[0].title).toBe(
      'Editorially updated title',
    );
    expect((await sql`select id from library_guru_arul_topics where id='thyagam'`).length).toBe(0);
  } finally {
    await sql`update library_guru_arul_topics set title=${original.find((r) => r.id === 'jathi')!.title} where id='jathi'`;
    const t = original.find((r) => r.id === 'thyagam')!;
    await sql`insert into library_guru_arul_topics (id,title,english,quotes,sort_order,status,revision,created_at,updated_at) values (${t.id},${t.title},${t.english},${sql.json(t.quotes)},${t.sort_order},${t.status},${t.revision},${t.created_at},${t.updated_at}) on conflict (id) do nothing`;
    await sql.end();
  }
});

test('topic headings and complete quotes stay readable on mobile and desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('/guru-arul');
  await page.screenshot({ caret: 'initial', path: 'test-results/guru-arul-public-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('group', { name: 'Filter Guru Arul by topic' })).toBeVisible();
  await page
    .getByRole('group', { name: 'Filter Guru Arul by topic' })
    .getByRole('button', { name: /Sivagiri pilgrimage/ })
    .click();
  await expect(page.locator('.arul-quote')).toHaveCount(5);
  await expect(page.locator('.arul-topic-heading h2')).toHaveText('ശിവഗിരി തീർത്ഥാടനം');
  await page.screenshot({ caret: 'initial', path: 'test-results/guru-arul-public-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.screenshot({
    caret: 'initial',
    path: 'test-results/guru-arul-public-mobile-dark.png',
  });
});

test('an empty published collection is supported by the home page, reader and Saved', async ({
  page,
}) => {
  const sql = postgres(process.env.DATABASE_URL!);
  const original = await sql`select id, status from library_guru_arul_topics`;
  try {
    await sql`update library_guru_arul_topics set status='draft'`;
    await page.goto('/');
    await expect(page.locator('#guru-arul')).toContainText(
      'New quotes will appear here when published.',
    );
    await page.goto('/guru-arul');
    await expect(page.getByRole('heading', { name: 'No quotes found' })).toBeVisible();
    await page.evaluate(() =>
      localStorage.setItem('anandham-guru-arul-bookmarks', JSON.stringify(['jathi-01'])),
    );
    await page.goto('/saved');
    await expect(page.getByRole('heading', { name: 'Keep a favourite here' })).toBeVisible();
  } finally {
    await sql.begin(async (tx) => {
      for (const topic of original)
        await tx`update library_guru_arul_topics set status=${topic.status} where id=${topic.id}`;
    });
    await sql.end();
  }
});
