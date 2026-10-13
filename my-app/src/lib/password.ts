import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const SALT_BYTES = 16;
const KEY_BYTES = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const key = (await scrypt(password, salt, KEY_BYTES)) as Buffer;
  return `scrypt$${salt}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, salt, keyHex] = encodedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !keyHex || keyHex.length !== KEY_BYTES * 2) {
    return false;
  }

  const expectedKey = Buffer.from(keyHex, 'hex');
  const actualKey = (await scrypt(password, salt, KEY_BYTES)) as Buffer;
  return timingSafeEqual(actualKey, expectedKey);
}