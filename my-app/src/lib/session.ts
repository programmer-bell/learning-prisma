import { createHash, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'lws_auth_token';
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}