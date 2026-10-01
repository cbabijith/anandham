import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const quotes = JSON.parse(readFileSync('packages/library/data/guru-arul.json', 'utf8'));

test('home prioritizes reading and searches across all three collections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  expect(
    await page
      .locator('.home-content-grid > section[id]')
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual(['collection', 'dharmam', 'guru-arul']);
  await expect(page.locator('.home-reading-shortcuts a')).toHaveCount(3);
  await expect(page.locator('#collection .reading-row')).toHaveCount(3);
  const search = page.getByRole('textbox', { name: 'Search the library' });
  await search.fill('Daiva Dasakam');
  await expect(page.locator('.home-search-results .reading-row')).toHaveCount(1);
  await page.locator('.home-search-results .reading-row').click();
  await expect(page.locator('.reading-text')).toContainText('ദൈവമേ!');
  await page.goto('/');
  await expect(page.locator('.continue-reading')).toContainText('ദൈവദശകം');
  await search.fill('Arambham');
  await expect(page.locator('.home-search-results')).toContainText('Dharmam');
  await search.fill('ജാതികൊണ്ട് ഒരു ഗുണവുമില്ല');
  await page.locator('.home-search-results .reading-row').click();
  await expect(page).toHaveURL(/guru-arul#jathi-01$/);
  await expect(page.locator('#jathi-01')).toBeInViewport();
});

test('library keeps all 60 works and category, sort and Malayalam search work', async ({
  page,
}) => {
  await page.goto('/krithis');
  await expect(page.locator('.work-card')).toHaveCount(60);
  await page.getByRole('combobox', { name: 'Filter by category' }).selectOption('philosophy');
  await expect(page.locator('.work-card')).toHaveCount(11);
  await page.getByRole('combobox', { name: 'Sort works' }).selectOption('az');
  await expect(page.locator('.work-card').first()).toContainText('Advaita Deepika');
  await page.getByRole('combobox', { name: 'Filter by category' }).selectOption('');
  await page.getByRole('textbox', { name: 'Search krithis' }).fill('ദൈവദശകം');
  await expect(page.locator('.work-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Read Daiva Dasakam', exact: true }).click();
  await expect(page.locator('.reading-text')).toContainText('ദൈവമേ!');
  await page.getByRole('link', { name: 'All krithis', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Reading collections' })
    .getByRole('link', { name: /Dharmam/ })
    .click();
  await expect(page.locator('.dharmam-card')).toHaveCount(21);
});

test('all supplied quotes remain intact, searchable, copyable and saved', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/guru-arul');
  await expect(page.locator('.arul-quote')).toHaveCount(46);
  expect(await page.locator('.arul-quote blockquote').allTextContents()).toEqual(
    quotes.map((quote: { text: string }) => quote.text),
  );
  await page.getByRole('button', { name: /Caste/ }).click();
  await expect(page.locator('.arul-quote')).toHaveCount(15);
  await page.getByRole('button', { name: /Religion/ }).click();
  await expect(page.locator('.arul-quote')).toHaveCount(31);
  await page.getByRole('button', { name: 'All quotes · 46' }).click();
  await page.getByRole('textbox', { name: 'Search Guru Arul' }).fill('ജാതികൊണ്ട് ഒരു ഗുണവുമില്ല');
  await expect(page.locator('.arul-quote')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save quote jathi-01', exact: true }).click();
  await page.getByRole('button', { name: 'Copy quote jathi-01', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${quotes[0].text}\n— ${quotes[0].attribution}`,
  );
  await page.reload();
  await page
    .getByRole('button', { name: /^Saved/ })
    .first()
    .click();
  await expect(page.locator('.arul-quote')).toHaveCount(1);
  await page.getByRole('button', { name: 'Unsave quote jathi-01', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No quotes found' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all quotes', exact: true }).click();
  await expect(page.locator('.arul-quote')).toHaveCount(46);
});

test('Saved combines krithis, chapters and quotes and persists removal', async ({ page }) => {
  await page.goto('/krithis');
  await page.getByRole('button', { name: 'Save Daiva Dasakam', exact: true }).click();
  await page.goto('/dharmam');
  await page.locator('.dharmam-card .bookmark-button').first().click();
  await page.goto('/guru-arul');
  await page.getByRole('button', { name: 'Save quote jathi-01', exact: true }).click();
  await page.goto('/saved');
  await expect(page.locator('.saved-group')).toHaveCount(3);
  await expect(page.locator('.saved-row')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('.saved-row')).toHaveCount(3);
  await page.getByRole('button', { name: 'Remove jathi-01 from saved' }).click();
  await page.reload();
  await expect(page.locator('.saved-row')).toHaveCount(2);
  await page.locator('.saved-row button').first().click();
  await page.locator('.saved-row button').first().click();
  await expect(page.getByRole('heading', { name: 'Keep a favourite here' })).toBeVisible();
});

test('Explore provides published reading links and clearly labels seven future collections', async ({
  page,
}) => {
  await page.goto('/explore');
  await expect(page.locator('.reading-list a')).toHaveCount(3);
  await expect(page.locator('.upcoming-grid li')).toHaveCount(7);
  await expect(page.locator('.upcoming-grid a')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Coming to Anandham' })).toBeVisible();
});

test('navigation, search and all page layouts fit mobile and desktop in both themes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const nav = page.getByRole('navigation', {
      name: width <= 760 ? 'Mobile navigation' : 'Main navigation',
      exact: true,
    });
    await expect(nav.getByRole('link')).toHaveCount(4);
    for (const link of await nav.getByRole('link').all()) await expect(link).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Search the library' })).toHaveCSS(
      'font-size',
      '16px',
    );
    if (width <= 760) {
      expect(
        (await page.getByRole('textbox', { name: 'Search the library' }).boundingBox())!.y,
      ).toBeLessThan(300);
      expect(
        (await page.locator('#collection .reading-row').first().boundingBox())!.y,
      ).toBeLessThan(600);
    }
    for (const path of ['/', '/krithis', '/dharmam', '/guru-arul', '/explore', '/saved']) {
      await page.goto(path);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${width}: ${path}`,
      ).toBe(true);
    }
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
  }
  expect(errors).toEqual([]);
});

test('mobile reader tools stay below the header at maximum text size', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const path of ['/krithis/daiva-dasakam', '/dharmam/shuddhi-panchakam']) {
    await page.goto(path);
    const increase = page.getByRole('button', { name: 'Increase text size' });
    while (await increase.isEnabled()) await increase.click();
    await expect(page.locator('.reading-text')).toHaveCSS('font-size', '40px');
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
    const header = (await page.locator('.site-header').boundingBox())!;
    const toolbar = (await page.locator('.reader-toolbar').boundingBox())!;
    expect(toolbar.y).toBeGreaterThanOrEqual(header.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeInViewport();
  }
});
