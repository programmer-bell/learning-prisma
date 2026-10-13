import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  parseLoginForm,
  parseNoteForm,
  parseRegistrationForm,
} from './validation';

test('registration normalizes identity fields and rejects weak passwords', () => {
  const formData = new FormData();
  formData.set('name', '  Ada Lovelace  ');
  formData.set('email', ' ADA@EXAMPLE.COM ');
  formData.set('password', 'a sufficiently long password');

  assert.deepEqual(parseRegistrationForm(formData), {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'a sufficiently long password',
  });
  formData.set('password', 'short');
  assert.equal('error' in parseRegistrationForm(formData), true);
});

test('login validates the email and preserves password bytes', () => {
  const formData = new FormData();
  formData.set('email', ' USER@EXAMPLE.COM ');
  formData.set('password', ' pass phrase ');

  assert.deepEqual(parseLoginForm(formData), {
    email: 'user@example.com',
    password: ' pass phrase ',
  });
});

test('note fields are bounded and duplicate tag IDs are removed', () => {
  const formData = new FormData();
  formData.set('title', '  Prisma notes  ');
  formData.set('content', '  Migration details  ');
  formData.append('tags', 'tag-1');
  formData.append('tags', 'tag-1');

  assert.deepEqual(parseNoteForm(formData), {
    title: 'Prisma notes',
    content: 'Migration details',
    tagIds: ['tag-1'],
  });
  formData.set('title', ' '.repeat(161));
  assert.equal('error' in parseNoteForm(formData), true);
});