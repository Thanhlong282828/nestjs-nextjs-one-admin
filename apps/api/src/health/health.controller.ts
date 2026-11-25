import { Controller, Get, Header, Inject, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HealthService, type HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HealthService) private readonly healthService: HealthService,
    @Inject(DatabaseService) private readonly database: DatabaseService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  getHealth(): HealthStatus { return this.healthService.getLiveness(); }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async getReadiness(): Promise<{ status: 'ok' }> {
    if (!(await this.database.isReady())) throw new ServiceUnavailableException('Database unavailable');
    return { status: 'ok' };
  }
}
