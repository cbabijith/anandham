import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import postgres from 'postgres';
const adminUrl = process.env.LIBRARY_ADMIN_ORIGIN || 'http://localhost:3101';
const readerUrl = process.env.LIBRARY_READER_URL || 'http://localhost:3100';
const corpus = JSON.parse(readFileSync('packages/library/data/krithis.json', 'utf8'));

test('all 60 public texts match the imported corpus; invalid and missing requests are rejected', async ({
  request: api,
}) => {
  const list = await api.get('/api/krithis');
  expect(list.status()).toBe(200);
  expect((await list.json()).total).toBe(60);
  for (const row of corpus) {
    const res = await api.get(`/api/krithis/${row.slug}`);
    expect(res.status(), row.slug).toBe(200);
    const { data } = await res.json();
    expect(createHash('sha256').update(data.body).digest('hex'), row.slug).toBe(row.sourceHash);
    expect(data.sourceBody).toBeUndefined();
  }
  expect((await api.get('/api/krithis?limit=100001')).status()).toBe(400);
  expect((await api.get('/api/krithis/missing-work')).status()).toBe(404);
  const missingPage = await api.get('/krithis/missing-work');
  const missingHtml = await missingPage.text();
  expect(missingHtml).toContain('This work isn’t available.');
  expect(missingHtml).toContain('noindex'); // Next.js streamed not-found pages send 200 + noindex.
  expect((await api.get(`${adminUrl}/api/library/krithis`)).status()).toBe(401);
  expect((await api.get(`${adminUrl}/api/library/krithis/sivagiri-1`)).status()).toBe(401);
  expect(
    (
      await api.post(`${adminUrl}/api/library/krithis`, { data: {}, headers: { Origin: adminUrl } })
    ).status(),
  ).toBe(401);
  expect(
    (
      await api.post(`${adminUrl}/api/library/session`, {
        data: { email: 'invalid@example.com', password: 'invalid' },
        headers: { Origin: 'https://wrong-origin.example' },
      })
    ).status(),
  ).toBe(403);
});

test('mobile collection, Malayalam search, saved works, reader zoom and theme persist', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.work-card')).toHaveCount(60);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ caret: 'initial', path: 'test-results/reader-mobile.png' });
  await page.getByRole('textbox', { name: 'Search krithis' }).fill('ദൈവദശകം');
  await expect(page.locator('.work-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save Daiva Dasakam', exact: true }).click();
  await page.getByRole('link', { name: 'Read Daiva Dasakam', exact: true }).click();
  await expect(page.locator('.reading-text')).toContainText('ദൈവമേ!');
  await page.getByRole('button', { name: 'Increase text size' }).click();
  await expect(page.locator('.reading-text')).toHaveCSS('font-size', '24px');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.reading-text')).toHaveCSS('font-size', '24px');
  await expect(page.getByRole('button', { name: 'Unsave this work' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  for (let i = 0; i < 10; i++) {
    const plus = page.getByRole('button', { name: 'Increase text size' });
    if (await plus.isEnabled()) await plus.click();
  }
  await expect(page.locator('.reading-text')).toHaveCSS('font-size', '40px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ caret: 'initial', path: 'test-results/reader-dark-zoom-mobile.png' });
  await page.getByRole('button', { name: 'Reset text size' }).click();
  await expect(page.locator('.reading-text')).toHaveCSS('font-size', '22px');
  await page.goto('/#collection');
  await page.getByRole('button', { name: /^Saved/ }).click();
  await expect(page.locator('.work-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Unsave Daiva Dasakam', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No works found' })).toBeVisible();
});

test('desktop reading layout and categories', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('/');
  await page.screenshot({ caret: 'initial', path: 'test-results/reader-desktop.png' });
  await page.getByRole('button', { name: 'Philosophy', exact: true }).click();
  await expect(page.locator('.work-card')).toHaveCount(11);
  await page.getByRole('combobox', { name: 'Sort works' }).selectOption('az');
  await expect(page.locator('.work-card').first()).toContainText('Advaita Deepika');
  await page.goto('/krithis/atmopadesa-sathakam');
  await page.getByText('Note on this source text').click();
  await expect(page.locator('.source-note')).toContainText('repeats part of verse 88');
});

test('admin login, mobile editor, full publishing lifecycle, conflict protection, audit and logout', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${adminUrl}/library/krithis`);
  await expect(page).toHaveURL(/\/library\/login$/);
  await page.getByLabel('Email address').fill(process.env.LIBRARY_ADMIN_EMAIL!);
  await page.getByLabel('Password', { exact: true }).fill(process.env.LIBRARY_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(`${adminUrl}/library`);
  await page.screenshot({ caret: 'initial', path: 'test-results/admin-desktop.png' });
  await page.getByRole('link', { name: 'Manage krithis' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(60);
  await page.screenshot({ caret: 'initial', path: 'test-results/admin-collection-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('link', { name: 'Add a work' }).click();
  await page.getByLabel('Original title', { exact: true }).fill('പരിശോധന');
  await page.getByLabel('English search title').fill('Library verification draft');
  const slug = `verification-${Date.now()}`;
  await page.getByLabel('URL slug').fill(slug);
  await page
    .getByRole('textbox', { name: 'Complete original text' })
    .fill('പരിശോധനയ്ക്കുള്ള താൽക്കാലിക കൃതി.\nLine two. <script>alert("plain text")</script>');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL(new RegExp(`/library/krithis/${slug}$`));
  const api = page.request;
  const { data: rows } = await (await api.get(`${adminUrl}/api/library/krithis`)).json();
  const row = rows.find((x: { slug: string }) => x.slug === slug);
  try {
    expect((await api.get(`${readerUrl}/api/krithis/${slug}`)).status()).toBe(404);
    await page.getByRole('button', { name: 'Reading preview' }).click();
    await expect(page.locator('.la-reading-preview')).toContainText('<script>');
    await page.getByLabel('Status', { exact: true }).selectOption('published');
    await page.getByRole('button', { name: 'Save & publish' }).click();
    await expect(page.getByRole('status')).toContainText('Saved and published');
    const pub = await api.get(`${readerUrl}/api/krithis/${slug}`);
    expect(pub.status()).toBe(200);
    const { data: saved } = await pub.json();
    expect(saved.body).toContain('Line two.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ caret: 'initial', path: 'test-results/admin-editor-mobile.png' });
    const stale = await api.patch(`${adminUrl}/api/library/krithis/${row.id}`, {
      headers: { Origin: adminUrl },
      data: { ...saved, revision: 1 },
    });
    expect(stale.status()).toBe(409);
    const bad = await api.patch(`${adminUrl}/api/library/krithis/${row.id}`, {
      headers: { Origin: adminUrl },
      data: { ...saved, slug: '../../bad' },
    });
    expect(bad.status()).toBe(400);
    const csrf = await api.patch(`${adminUrl}/api/library/krithis/${row.id}`, {
      headers: { Origin: 'https://evil.example' },
      data: saved,
    });
    expect(csrf.status()).toBe(403);
    await page.getByLabel('Status', { exact: true }).selectOption('archived');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('status')).toContainText('This work is private');
    expect((await api.get(`${readerUrl}/api/krithis/${slug}`)).status()).toBe(404);
    const detail = await (await api.get(`${adminUrl}/api/library/krithis/${row.id}`)).json();
    expect(detail.history.length).toBe(3);
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL(/\/library\/login$/);
    expect((await api.get(`${adminUrl}/api/library/krithis`)).status()).toBe(401);
  } finally {
    // This test runs only against the dedicated local database, never Railway.
    const url = process.env.DATABASE_URL!;
    if (new URL(url).hostname !== '127.0.0.1') throw new Error('Refusing nonlocal cleanup');
    const sql = postgres(url);
    await sql`delete from library_audit_log where krithi_id=${row.id}`;
    await sql`delete from library_krithis where id=${row.id}`;
    await sql.end();
  }
});

// Forms must never put credentials into URLs before hydration or without JS.
test('sign-in cannot submit before JavaScript initializes', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${adminUrl}/library/login`);
  await expect(page.locator('form')).toHaveAttribute('method', 'post');
  await expect(page.locator('form button')).toBeDisabled();
  await context.close();
});
