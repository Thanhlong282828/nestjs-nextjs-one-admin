import { argon2id, hash, verify } from 'argon2';

export class InvalidPasswordError extends Error {}

/** New passwords only; local demo accounts must never bypass this policy in production. */
export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 1024) {
    throw new InvalidPasswordError('Password must be at least 12 characters and at most 1024 bytes');
  }
  return hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

/** Invalid stored hashes and overly long input never authenticate. */
export async function verifyPassword(encodedHash: string, password: string): Promise<boolean> {
  if (typeof encodedHash !== 'string' || !encodedHash.startsWith('$argon2id$') || typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 1024) return false;
  try { return await verify(encodedHash, password); }
  catch { return false; }
}

