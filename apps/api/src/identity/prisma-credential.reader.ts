import type { CredentialReader, LoginCredential } from '@aurum/identity';
import type { PrismaClient } from '../generated/prisma/client';

/** Internal adapter only; do not expose password hashes or register as an HTTP endpoint. */
export class PrismaCredentialReader implements CredentialReader {
  constructor(private readonly db: Pick<PrismaClient, 'identityUser'>) {}

  async findByEmail(email: string): Promise<LoginCredential | null> {
    const user = await this.db.identityUser.findUnique({ where: { email }, select: { id: true, status: true, passwordHash: true } });
    if (!user) return null;
    return { userId: user.id, passwordHash: user.passwordHash, status: user.status === 'active' ? 'active' : 'disabled' };
  }
}
