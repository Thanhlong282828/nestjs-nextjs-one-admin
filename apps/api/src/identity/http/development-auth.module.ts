import { Module, type DynamicModule, type OnApplicationShutdown } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';
import { AuthHttpModule } from './auth-http.module';
import { CompanyHttpModule } from '../../company/company-http.module';
import { HrmReadModule } from '../../hrm/hrm-read.module';

/** An explicit local-only switch; never silently point development auth at another database. */
@Module({})
export class DevelopmentAuthModule {
  static fromEnvironment(env: NodeJS.ProcessEnv): DynamicModule {
    if (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test') throw new Error('Development authentication requires NODE_ENV development or test');
    if (!env.DATABASE_URL || !env.AURUM_AUTH_DUMMY_HASH || !env.AURUM_AUTH_ORIGINS) throw new Error('Development authentication configuration is incomplete');
    const url = new URL(env.DATABASE_URL);
    const dbName = env.NODE_ENV === 'test' ? '/aurum_nestjs_test' : '/aurum_nestjs';
    if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306', '3307'].includes(url.port) || url.pathname !== dbName || url.search || url.hash) throw new Error('Invalid development authentication database target');
    const origins = env.AURUM_AUTH_ORIGINS.split(',').map(origin => origin.trim());
    if (origins.some(origin => { try { const parsed = new URL(origin); return parsed.origin !== origin || parsed.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(parsed.hostname); } catch { return true; } })) throw new Error('Invalid local authentication origin');
    const db = new PrismaClient({ adapter: new PrismaMariaDb(env.DATABASE_URL) });
    const cleanup: OnApplicationShutdown = { async onApplicationShutdown() { await db.$disconnect(); } };
    const auth = AuthHttpModule.forClient(db, env.AURUM_AUTH_DUMMY_HASH, origins, false);
    return {
      module: DevelopmentAuthModule,
      imports: [CompanyHttpModule.forClient(db, auth), HrmReadModule.forClient(db, auth)],
      providers: [{ provide: 'AURUM_DEVELOPMENT_AUTH_DATABASE_LIFECYCLE', useValue: cleanup }],
    };
  }
}
