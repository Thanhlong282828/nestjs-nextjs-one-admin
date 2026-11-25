import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

/** Prisma is the sole database entry point for the NestJS application. */
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private readonly prisma: PrismaClient | null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const url = connectionString ? new URL(connectionString) : null;
    if (url && url.protocol !== 'mysql:') throw new Error('DATABASE_URL must use MySQL');
    if (url) {
      url.searchParams.set('connectionLimit', '5');
      url.searchParams.set('acquireTimeout', '2000');
      url.searchParams.set('connectTimeout', '2000');
      url.searchParams.set('initializationTimeout', '2000');
    }
    this.prisma = url ? new PrismaClient({ adapter: new PrismaMariaDb(url.toString()) }) : null;
  }

  async isReady(): Promise<boolean> {
    if (!this.prisma) return false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.prisma?.$disconnect();
  }
}
