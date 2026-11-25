import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { SessionService } from '../dist/index.js';

function store() {
  const records = new Map();
  return { records,
    async create(record) { records.set(record.tokenHash, {...record, revokedAt:null, userStatus:'active'}); },
    async findByTokenHash(hash) { return records.get(hash) ?? null; },
    async revokeByIdForUser(id,userId,at) { for (const item of records.values()) if (item.id===id && item.userId===userId && !item.revokedAt) { item.revokedAt=at; return true; } return false; },
    async revokeAllForUser(userId,at) { let n=0; for (const item of records.values()) if (item.userId===userId && !item.revokedAt) { item.revokedAt=at; n++; } return n; },
  };
}

test('opaque session stores only token hash and rejects expiry, disabled and revoked sessions', async () => {
  const repository=store(), service=new SessionService(repository), userId=randomUUID(), now=new Date('2026-01-01T00:00:00Z');
  const issued=await service.issue(userId,now); const saved=[...repository.records.values()][0];
  assert.notEqual(saved.tokenHash,issued.token); assert.equal(saved.tokenHash.length,64);
  assert.deepEqual(await service.authenticate(issued.token,now),{sessionId:issued.id,userId});
  assert.equal(await service.authenticate(issued.token,issued.expiresAt),null);
  saved.userStatus='disabled'; assert.equal(await service.authenticate(issued.token,now),null);
  saved.userStatus='active'; assert.equal(await service.revokeOwnedSession(randomUUID(),issued.id,now),false);
  assert.equal(await service.revokeOwnedSession(userId,issued.id,now),true);
  assert.equal(await service.authenticate(issued.token,now),null);
  assert.equal(await service.authenticate('invalid',now),null);
});
test('logout all is scoped to the owner', async () => {
  const repository=store(), service=new SessionService(repository), a=randomUUID(), b=randomUUID();
  const one=await service.issue(a), two=await service.issue(a), other=await service.issue(b);
  assert.notEqual(one.token,two.token); assert.equal(await service.revokeAll(a),2);
  assert.equal(await service.authenticate(one.token),null); assert.ok(await service.authenticate(other.token));
});
