import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { UploadMediaCommand, UploadMediaHandler, MediaRejectedError, ScannerUnavailableError } from '../dist/index.js';

const actor = { companyId: randomUUID(), branchId: randomUUID(), permissions: ['media.upload'] };
const png = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,1]);
const pdf = Buffer.from('%PDF-1.7 demo');
function harness(result = 'clean') {
  const calls = [];
  const scanner = { async scan() { calls.push('scan'); if (result === 'error') throw Error('offline'); return result; } };
  const stores = { cloudflareImages: { async put(input) { calls.push(['image', input]); } }, supabaseS3: { async put(input) { calls.push(['document', input]); } } };
  return { calls, handler: new UploadMediaHandler(scanner, stores) };
}
test('scan precedes routing to the correct store and keys include scope', async () => {
  for (const [kind, mime, bytes, expected] of [['image','image/png',png,'image'], ['document','application/pdf',pdf,'document']]) {
    const { calls, handler } = harness();
    const receipt = await handler.execute(new UploadMediaCommand(actor, kind, mime, bytes));
    assert.equal(calls[0], 'scan'); assert.equal(calls[1][0], expected);
    assert.match(receipt.key, new RegExp(`^${actor.companyId}/${actor.branchId}/`));
    assert.equal(receipt.sha256.length, 64);
  }
});
test('malware, scanner outage, missing permission and disguised files never reach storage', async () => {
  for (const verdict of ['infected', 'error']) {
    const {calls, handler} = harness(verdict);
    await assert.rejects(() => handler.execute(new UploadMediaCommand(actor, 'image', 'image/png', png)), verdict === 'error' ? ScannerUnavailableError : MediaRejectedError);
    assert.deepEqual(calls, ['scan']);
  }
  const {calls, handler} = harness();
  await assert.rejects(() => handler.execute(new UploadMediaCommand({...actor, permissions: []}, 'image', 'image/png', png)), MediaRejectedError);
  await assert.rejects(() => handler.execute(new UploadMediaCommand(actor, 'image', 'image/png', pdf)), MediaRejectedError);
  await assert.rejects(() => handler.execute(new UploadMediaCommand(actor, 'document', 'application/pdf', Buffer.alloc(0))), MediaRejectedError);
  assert.deepEqual(calls, []);
});
test('caller mutation during scanning cannot replace the verified bytes', async () => {
  const original = Buffer.from(png); let written;
  const scanner = { async scan() { original.fill(0); return 'clean'; } };
  const stores = { cloudflareImages: { async put(input) { written = input.contents; } }, supabaseS3: { async put() { assert.fail('wrong provider'); } } };
  await new UploadMediaHandler(scanner, stores).execute(new UploadMediaCommand(actor, 'image', 'image/png', original));
  assert.deepEqual(written, png);
});
