import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import {
  authenticateUser,
  createUserSession,
  getUserFromSession,
  registerAccount,
  revokeUserSession,
} from './auth-service';
import {
  createNoteForUser,
  deleteNoteForUser,
  getNoteForUser,
  listNotesForUser,
  noteTagsExist,
  updateNoteForUser,
} from './note-service';
import { hashSessionToken } from './session';

before(async () => {
  await prisma.$connect();
  await prisma.session.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.session.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

test('account authentication and session lifecycle work with hashed credentials', async () => {
  const email = `${randomUUID()}@example.test`;
  const account = await registerAccount({
    name: 'Test User',
    email,
    password: 'test password long enough',
  });

  await assert.rejects(
    registerAccount({
      name: 'Duplicate User',
      email,
      password: 'test password long enough',
    }),
    (error: unknown) =>
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  );

  assert.deepEqual(await authenticateUser(email, 'test password long enough'), {
    id: account.id,
  });
  assert.equal(await authenticateUser(email, 'incorrect password'), null);

  const session = await createUserSession(account.id);
  const storedSession = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(session.token) },
  });
  assert.ok(storedSession);
  assert.notEqual(storedSession.tokenHash, session.token);
  assert.equal((await getUserFromSession(session.token))?.id, account.id);
  await revokeUserSession(session.token);
  assert.equal(await getUserFromSession(session.token), null);

  const expiredSession = await createUserSession(account.id);
  await prisma.session.update({
    where: { tokenHash: hashSessionToken(expiredSession.token) },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  assert.equal(await getUserFromSession(expiredSession.token), null);
});

test('note CRUD, search, tags, and ownership are enforced by the data service', async () => {
  const owner = await registerAccount({
    name: 'Note Owner',
    email: `${randomUUID()}@example.test`,
    password: 'test password long enough',
  });
  const otherUser = await registerAccount({
    name: 'Other User',
    email: `${randomUUID()}@example.test`,
    password: 'test password long enough',
  });
  const tag = await prisma.tag.create({
    data: { name: `Test-${randomUUID()}`, color: 'neo-cyan' },
  });

  const titleMatch = await createNoteForUser(owner.id, {
    title: 'Migration checklist',
    content: 'Release details',
    tagIds: [tag.id],
  });
  const contentMatch = await createNoteForUser(owner.id, {
    title: 'Database setup',
    content: 'Migration details',
    tagIds: [],
  });
  await createNoteForUser(otherUser.id, {
    title: 'Migration other user',
    content: 'Private note',
    tagIds: [],
  });

  assert.equal(await noteTagsExist([tag.id]), true);
  assert.equal(await noteTagsExist(['missing-tag']), false);
  assert.deepEqual(
    (await listNotesForUser(owner.id)).map((note) => note.id).sort(),
    [titleMatch.id, contentMatch.id].sort()
  );
  assert.deepEqual(
    (await listNotesForUser(owner.id, { search: 'migration' })).map((note) => note.id).sort(),
    [titleMatch.id, contentMatch.id].sort()
  );
  assert.deepEqual(
    (await listNotesForUser(owner.id, { tag: tag.name })).map((note) => note.id),
    [titleMatch.id]
  );
  assert.equal(await getNoteForUser(titleMatch.id, otherUser.id), null);
  assert.equal(
    await updateNoteForUser(titleMatch.id, otherUser.id, {
      title: 'Unauthorized edit',
      content: 'Nope',
      tagIds: [],
    }),
    false
  );
  assert.equal(await deleteNoteForUser(titleMatch.id, otherUser.id), false);
  assert.equal((await getNoteForUser(titleMatch.id, owner.id))?.title, 'Migration checklist');

  assert.equal(
    await updateNoteForUser(titleMatch.id, owner.id, {
      title: 'Updated checklist',
      content: 'Updated details',
      tagIds: [],
    }),
    true
  );
  assert.equal((await getNoteForUser(titleMatch.id, owner.id))?.title, 'Updated checklist');
  assert.equal(await deleteNoteForUser(titleMatch.id, owner.id), true);
  assert.equal(await getNoteForUser(titleMatch.id, owner.id), null);
});