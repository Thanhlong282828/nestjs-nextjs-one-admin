import { verifyPassword } from '../domain/password';

export type LoginCredential = Readonly<{ userId: string; passwordHash: string; status: 'active' | 'disabled' }>;
export interface CredentialReader {
  /** Email is normalized by the application layer. */
  findByEmail(email: string): Promise<LoginCredential | null>;
}

/** Internal credential verification only. It does not rate-limit, audit, issue sessions or expose HTTP. */
export class VerifyCredentials {
  constructor(private readonly credentials: CredentialReader, private readonly dummyArgon2Hash: string) {
    if (!dummyArgon2Hash.startsWith('$argon2id$')) throw new Error('A valid dummy Argon2id hash is required');
  }

  async execute(email: string, password: string): Promise<{ userId: string } | null> {
    const verified = await this.verifyForLogin(email, password);
    return verified ? { userId: verified.userId } : null;
  }

  /** Internal result only: the hash must never cross an HTTP boundary or be logged. */
  async verifyForLogin(email: string, password: string): Promise<{ userId: string; passwordHash: string } | null> {
    if (typeof email !== 'string' || typeof password !== 'string' || Buffer.byteLength(email, 'utf8') > 254 || Buffer.byteLength(password, 'utf8') > 1024) return null;
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return null;
    const user = await this.credentials.findByEmail(normalizedEmail);
    // Run Argon2 for missing and disabled accounts too; the caller must return a uniform error.
    const valid = await verifyPassword(user?.passwordHash ?? this.dummyArgon2Hash, password);
    return valid && user?.status === 'active' ? { userId: user.userId, passwordHash: user.passwordHash } : null;
  }
}
