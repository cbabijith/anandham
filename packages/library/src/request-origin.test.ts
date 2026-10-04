import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin } from './request-origin';

const origins = [
  'https://admin.anandham.online',
  'https://web-admin-production-1fe2.up.railway.app',
];

test('both configured admin domains can submit same-origin requests', () => {
  for (const origin of origins) assert.equal(isAllowedOrigin(origin, origins), true);
  assert.equal(isAllowedOrigin(origins[0], [` ${origins[0]}/ `]), true);
  assert.equal(isAllowedOrigin('http://localhost:3001', ['http://localhost:3001']), true);
});

test('unconfigured origins, missing origins and deceptive hostnames are rejected', () => {
  for (const origin of [
    null,
    '',
    'null',
    'https://anandham.online',
    'https://admin.anandham.online.attacker.example',
    'https://attacker.example/admin.anandham.online',
    'http://admin.anandham.online',
    'https://admin.anandham.online:8443',
    'https://admin.anandham.online/',
    `${origins[0]},https://attacker.example`,
  ])
    assert.equal(isAllowedOrigin(origin, origins), false, String(origin));
});

test('invalid configuration cannot authorize a different origin', () => {
  for (const configured of [
    '*',
    '',
    'https://*.anandham.online',
    'https://user:password@admin.anandham.online',
    'https://admin.anandham.online/library',
    'https://admin.anandham.online?host=other',
    'https://admin.anandham.online#other',
  ])
    assert.equal(isAllowedOrigin(origins[0], [configured]), false, configured);
});
