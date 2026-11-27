import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DevelopmentAuthModule } from './identity/http/development-auth.module';

const authEnabled = process.env.AURUM_ENABLE_DEVELOPMENT_AUTH;
if (authEnabled !== undefined && authEnabled !== '0' && authEnabled !== '1') throw new Error('Invalid development authentication switch');
@Module({ imports: [HealthModule, ...(authEnabled === '1' ? [DevelopmentAuthModule.fromEnvironment(process.env)] : [])] })
export class AppModule {}
