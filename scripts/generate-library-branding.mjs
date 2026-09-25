import { createRequire } from 'node:module';
const require = createRequire(new URL('../apps/web-user/package.json', import.meta.url));
const sharp = require('sharp');
import { mkdir, writeFile, rm } from 'node:fs/promises';

const mark =
  '<path d="M112 167c54-15 101-7 144 21 43-28 90-36 144-21v185c-53-15-99-7-144 21-45-28-91-36-144-21z" fill="none" stroke="#fff" stroke-width="18" stroke-linejoin="round"/><path d="M256 190v180M148 222c25-3 45 1 65 11m-65 40c25-3 45 1 65 11m86-51c20-10 40-14 65-11m-65 62c20-10 40-14 65-11" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/><path d="M256 76v51m-25-26h50" stroke="#ded1ff" stroke-width="12" stroke-linecap="round"/>';
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#6942c6"/>${mark}</svg>`;
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#201732"/><circle cx="1100" cy="40" r="420" fill="#2e204b"/><rect x="65" y="63" width="95" height="95" rx="22" fill="#6942c6"/><g transform="translate(65 63) scale(.1855)">${mark}</g><text x="185" y="129" font-family="Georgia,serif" font-size="62" fill="#fff">Anandham</text><text x="72" y="270" font-family="Georgia,serif" font-size="77" fill="#fff">Sree Narayana Guru</text><text x="74" y="350" font-family="Georgia,serif" font-size="64" fill="#c7afff">Words to read. Wisdom to live.</text><path d="M75 409h1045" stroke="#675185"/><text x="76" y="478" font-family="Arial,sans-serif" font-size="29" fill="#e7dcff">KRITHIS · SREE NARAYANA DHARMAM</text><text x="76" y="548" font-family="Arial,sans-serif" font-size="26" fill="#c1b4d1">Malayalam texts and explanations · Free to read</text><text x="1120" y="566" text-anchor="end" font-family="Arial,sans-serif" font-size="22" fill="#c1b4d1">anandham.online</text></svg>`;
const iconPng = await sharp(Buffer.from(icon)).resize(48).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico[6] = 48;
ico[7] = 48;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(iconPng.length, 14);
ico.writeUInt32LE(22, 18);
for (const app of ['web-user']) {
  const dir = `apps/${app}/public/branding`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/icon.svg`, icon);
  for (const size of [192, 512])
    await sharp(Buffer.from(icon)).resize(size).png().toFile(`${dir}/icon-${size}.png`);
  await sharp(Buffer.from(icon)).resize(180).png().toFile(`${dir}/apple-touch-icon.png`);
  await writeFile(`apps/${app}/src/app/favicon.ico`, Buffer.concat([ico, iconPng]));
  for (const file of ['next.svg', 'vercel.svg'])
    await rm(`apps/${app}/public/${file}`, { force: true });
}
await sharp(Buffer.from(social)).png().toFile('apps/web-user/public/branding/library-social.png');
console.log('Generated Anandham icons and social sharing image.');
