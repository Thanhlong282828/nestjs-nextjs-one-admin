import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  if (Object.keys(process.env).some(key => key.includes('MIGRATION') && process.env[key])) throw new Error('Migration credentials must not be supplied to the API runtime');
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use(helmet());
  if (process.env.AURUM_ENABLE_DEVELOPMENT_AUTH === '1') {
    const origins = (process.env.AURUM_AUTH_ORIGINS ?? '').split(',').map(origin => origin.trim());
    app.enableCors({ origin: origins, credentials: true, methods: ['GET', 'POST', 'PATCH'], allowedHeaders: ['Content-Type', 'X-Aurum-Request'] });
  }
  app.enableShutdownHooks();
  const port = Number(process.env.AURUM_API_PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid API port');
  await app.listen(port, '127.0.0.1');
}
void bootstrap();
