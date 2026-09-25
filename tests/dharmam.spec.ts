import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import postgres from 'postgres';
const adminUrl = process.env.LIBRARY_ADMIN_ORIGIN || 'http://localhost:3101';
const readerUrl = process.env.LIBRARY_READER_URL || 'http://localhost:3100';
const chapters = JSON.parse(readFileSync('packages/library/data/dharmam.json', 'utf8'));

test('all five Dharmam chapters preserve supplied passages without exposing private source data', async ({
  request,
}) => {
  const response = await request.get('/api/dharmam');
  expect(response.status()).toBe(200);
  const list = await response.json();
  expect(list.total).toBe(5);
  expect(list.data.map((c: { slug: string }) => c.slug)).toEqual(
    chapters.map((c: { slug: string }) => c.slug),
  );
  for (const chapter of chapters) {
    const detail = await request.get(`/api/dharmam/${chapter.slug}`);
    expect(detail.status()).toBe(200);
    const { data } = await detail.json();
    expect(data.passages).toEqual(chapter.passages);
    expect(data.title).toBe(chapter.title);
    expect(data.sourcePassages).toBeUndefined();
    expect(data.editorialNote).toBeUndefined();
  }
  expect((await request.get('/api/dharmam/missing')).status()).toBe(404);
  expect((await request.get('/api/dharmam?limit=10001')).status()).toBe(400);
  expect((await request.get(`${adminUrl}/api/library/dharmam`)).status()).toBe(401);
  expect((await request.get(`${adminUrl}/api/library/dharmam/dharmam-01`)).status()).toBe(401);
  expect((await (await request.get('/api/krithis')).json()).total).toBe(60);
});

test('Dharmam mobile search, chapter navigation, meanings, saved chapters, themes and zoom', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Sree Narayana Dharmam', exact: true }).click();
  await expect(page).toHaveURL(/\/dharmam$/);
  await expect(page.locator('.dharmam-card')).toHaveCount(5);
  await page.getByRole('textbox', { name: 'Search Dharmam chapters' }).fill('ശിവഗിരി');
  await expect(page.locator('.dharmam-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save Sivagiri Varnnana', exact: true }).click();
  await page.getByRole('link', { name: 'Read Sivagiri Varnnana', exact: true }).click();
  await expect(page.locator('.dharmam-verses')).toHaveText(chapters[2].passages[0].verses);
  await expect(page.locator('.dharmam-explanation p')).toHaveText(
    chapters[2].passages[0].explanation,
  );
  for (let i = 0; i < 9; i++)
    await page.getByRole('button', { name: 'Increase text size' }).click();
  await expect(page.locator('.reading-text')).toHaveCSS('font-size', '40px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.reading-text')).toHaveCSS('font-size', '40px');
  await page.getByRole('link', { name: /Next chapter/ }).click();
  await expect(page).toHaveURL(/\/dharmam\/guru-varnnana$/);
  await expect(page.locator('.dharmam-passage')).toHaveCount(2);
  await page.getByRole('link', { name: /All Dharmam chapters/ }).click();
  await page.getByRole('button', { name: /Saved/ }).click();
  await expect(page.locator('.dharmam-card')).toHaveCount(1);
});

test('Dharmam admin publishing enforces authentication, validation, revisions and audit history', async ({
  request,
  page,
}) => {
  const db = postgres(process.env.DATABASE_URL!);
  const slug = `verification-dharmam-${Date.now()}`;
  let id: string | undefined;
  const input = {
    title: 'പരിശോധന',
    transliteration: 'Verification Dharmam',
    slug,
    passages: chapters[0].passages,
    editorialNote: 'Private editorial note',
    sortOrder: 99,
    status: 'draft',
  };
  const headers = { Origin: adminUrl };
  try {
    expect(
      (await request.post(`${adminUrl}/api/library/dharmam`, { headers, data: input })).status(),
    ).toBe(401);
    expect(
      (
        await request.post(`${adminUrl}/api/library/session`, {
          headers,
          data: {
            email: process.env.LIBRARY_ADMIN_EMAIL,
            password: process.env.LIBRARY_ADMIN_PASSWORD,
          },
        })
      ).ok(),
    ).toBe(true);
    expect(
      (
        await request.post(`${adminUrl}/api/library/dharmam`, {
          headers: { Origin: 'https://wrong-origin.example' },
          data: input,
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.post(`${adminUrl}/api/library/dharmam`, {
          headers,
          data: { ...input, passages: [] },
        })
      ).status(),
    ).toBe(400);
    const created = await request.post(`${adminUrl}/api/library/dharmam`, { headers, data: input });
    expect(created.status()).toBe(201);
    const record = (await created.json()).data;
    id = record.id;
    expect((await request.get(`${readerUrl}/api/dharmam/${slug}`)).status()).toBe(404);
    const published = await request.patch(`${adminUrl}/api/library/dharmam/${id}`, {
      headers,
      data: { ...input, status: 'published', revision: record.revision },
    });
    expect(published.status()).toBe(200);
    const current = (await published.json()).data;
    const publicData = (await (await request.get(`${readerUrl}/api/dharmam/${slug}`)).json()).data;
    expect(publicData.passages).toEqual(input.passages);
    expect(publicData.editorialNote).toBeUndefined();
    expect(
      (
        await request.patch(`${adminUrl}/api/library/dharmam/${id}`, {
          headers,
          data: { ...input, revision: record.revision },
        })
      ).status(),
    ).toBe(409);
    const history = (await (await request.get(`${adminUrl}/api/library/dharmam/${id}`)).json())
      .history;
    expect(history.map((h: { action: string }) => h.action)).toEqual(['updated', 'created']);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${adminUrl}/library/login`);
    await page.getByLabel('Email address').fill(process.env.LIBRARY_ADMIN_EMAIL!);
    await page.getByLabel('Password', { exact: true }).fill(process.env.LIBRARY_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL(`${adminUrl}/library`);
    await page.goto(`${adminUrl}/library/dharmam/${slug}`);
    await expect(page.getByLabel('Verses 1', { exact: true })).toHaveValue(
      input.passages[0].verses,
    );
    await page
      .getByLabel('Malayalam explanation 1', { exact: true })
      .fill(input.passages[0].explanation + '\nപരിശോധന.');
    await page.getByRole('button', { name: 'Save & publish' }).click();
    await expect(page.getByRole('status')).toContainText('Saved and published');
    const edited = (await (await request.get(`${adminUrl}/api/library/dharmam/${id}`)).json()).data;
    expect(edited.revision).toBe(current.revision + 1);
    await page.getByRole('button', { name: 'Reading preview' }).click();
    await expect(page.locator('.la-reading-preview')).toContainText('പരിശോധന.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const archived = await request.patch(`${adminUrl}/api/library/dharmam/${id}`, {
      headers,
      data: { ...input, status: 'archived', revision: edited.revision },
    });
    expect(archived.status()).toBe(200);
    expect((await request.get(`${readerUrl}/api/dharmam/${slug}`)).status()).toBe(404);
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await request.delete(`${adminUrl}/api/library/session`, { headers });
  } finally {
    if (id) {
      await db`delete from library_dharmam_audit_log where chapter_id=${id}`;
      await db`delete from library_dharmam_chapters where id=${id}`;
    }
    await db.end();
  }
});
