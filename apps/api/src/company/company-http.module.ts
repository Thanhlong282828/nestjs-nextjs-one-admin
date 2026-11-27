import { Module, type DynamicModule } from '@nestjs/common';
import { ListCompaniesQueryHandler, ListBranchesQueryHandler } from '@aurum/company';
import type { PrismaClient } from '../generated/prisma/client';
import { SessionGuard } from '../identity/http/session.guard';
import { PrismaPrincipalReader } from '../identity/prisma-principal.reader';
import { CompanyController } from './company.controller';
import { CompanyHttpService } from './company-http.service';
import { PrismaCompanyReader } from './prisma-company.reader';
import { PrismaBranchListReader } from './prisma-branch-list.reader';

@Module({})
export class CompanyHttpModule {
  static forClient(db: PrismaClient, auth: DynamicModule): DynamicModule {
    return {
      module: CompanyHttpModule,
      imports: [auth],
      controllers: [CompanyController],
      providers: [SessionGuard, { provide: CompanyHttpService, useValue: new CompanyHttpService(new PrismaPrincipalReader(db), new ListCompaniesQueryHandler(new PrismaCompanyReader(db)), new ListBranchesQueryHandler(new PrismaBranchListReader(db)), db) }],
    };
  }
}
