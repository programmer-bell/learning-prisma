import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashPassword, verifyPassword } from './password';

test('passwords are stored as salted hashes and verified safely', async () => {
  const password = 'correct horse battery staple';
  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);

  assert.notEqual(firstHash, password);
  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword(password, firstHash), true);
  assert.equal(await verifyPassword('wrong password', firstHash), false);
  assert.equal(await verifyPassword(password, 'invalid-hash'), false);
});