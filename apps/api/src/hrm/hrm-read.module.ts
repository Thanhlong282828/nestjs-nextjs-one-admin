import { Module, type DynamicModule } from '@nestjs/common';
import type { PrismaClient } from '../generated/prisma/client';
import { SessionGuard } from '../identity/http/session.guard';
import { HrmReadController } from './hrm-read.controller';
import { HrmReadService } from './hrm-read.service';
import { HrmWriteController } from './hrm-write.controller';
import { HrmWriteService } from './hrm-write.service';

@Module({})
export class HrmReadModule {
  static forClient(db: PrismaClient, auth: DynamicModule): DynamicModule {
    return { module: HrmReadModule, imports: [auth], controllers: [HrmReadController, HrmWriteController], providers: [SessionGuard, { provide: HrmReadService, useValue: new HrmReadService(db) }, { provide: HrmWriteService, useValue: new HrmWriteService(db) }] };
  }
}
