import { Injectable } from '@nestjs/common';

export type HealthStatus = { status: 'ok'; service: 'aurum-api' };

@Injectable()
export class HealthService {
  getLiveness(): HealthStatus {
    return { status: 'ok', service: 'aurum-api' };
  }
}
