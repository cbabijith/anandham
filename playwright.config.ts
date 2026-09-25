import { defineConfig } from '@playwright/test';
process.loadEnvFile('.env.local');
if (new URL(process.env.DATABASE_URL ?? '').hostname !== '127.0.0.1') {
  throw new Error('The mutation tests require a dedicated database on 127.0.0.1.');
}
const readerPort = Number(process.env.LIBRARY_TEST_READER_PORT || 3100);
const adminPort = Number(process.env.LIBRARY_TEST_ADMIN_PORT || 3101);
process.env.LIBRARY_ADMIN_ORIGIN = `http://localhost:${adminPort}`;
process.env.LIBRARY_READER_URL = `http://localhost:${readerPort}`;
export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: process.env.LIBRARY_READER_URL, headless: true, trace: 'retain-on-failure' },
  webServer: [
    {
      command: `npm run dev -w @anandham/web-user -- --port ${readerPort}`,
      url: `${process.env.LIBRARY_READER_URL}/api/health`,
      reuseExistingServer: true,
    },
    {
      command: `npm run dev -w @anandham/web-admin -- --port ${adminPort}`,
      url: `${process.env.LIBRARY_ADMIN_ORIGIN}/api/library/health`,
      reuseExistingServer: true,
    },
  ],
});
