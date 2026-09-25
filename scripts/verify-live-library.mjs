/** Read-only live smoke test. No editorial data is changed. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const reader=process.env.LIBRARY_READER_URL??'https://web-user-production-b9c9.up.railway.app';
const admin=process.env.LIBRARY_ADMIN_ORIGIN??'https://web-admin-production-1fe2.up.railway.app';
const corpus=JSON.parse(readFileSync(new URL('../packages/library/data/krithis.json',import.meta.url),'utf8'));
async function json(url) { const r=await fetch(url,{signal:AbortSignal.timeout(30000)}); assert.equal(r.status,200,`${url}: ${r.status}`); return r.json(); }
const health=await json(`${reader}/api/health`); assert.equal(health.published,60);
assert.equal((await json(`${admin}/api/library/health`)).status,'ok');
const list=await json(`${reader}/api/krithis`); assert.equal(list.total,60);
for(let offset=0;offset<corpus.length;offset+=4) {
 await Promise.all(corpus.slice(offset,offset+4).map(async row=>{
  const {data}=await json(`${reader}/api/krithis/${row.slug}`);
  assert.equal(createHash('sha256').update(data.body).digest('hex'),row.sourceHash,row.slug);
 }));
}
assert.equal((await fetch(`${admin}/api/library/krithis`)).status,401);
assert.equal((await fetch(`${reader}/api/krithis/not-a-work`)).status,404);
const home=await fetch(reader);assert.equal(home.status,200);assert.ok((await home.text()).includes('Timeless words'));
const readerPage=await fetch(`${reader}/krithis/daiva-dasakam`);assert.equal(readerPage.status,200);assert.ok((await readerPage.text()).includes('ദൈവമേ!'));
const signIn=await fetch(`${admin}/library`);assert.ok(signIn.url.endsWith('/library/login')||(await signIn.text()).includes('/library/login'));
console.log('PASS: both live services healthy; all 60 texts match source checksums; reader pages, private API protection, missing-work handling and admin sign-in redirect verified.');
