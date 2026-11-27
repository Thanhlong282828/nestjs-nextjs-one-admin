import { Controller, Get, Inject, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { SessionGuard, type AuthenticatedSession } from '../identity/http/session.guard';
import { CompanyHttpService } from './company-http.service';

type Request = { auth: AuthenticatedSession };
type Response = { setHeader(name: string, value: string): void };
@Controller('api/v1/companies')
@UseGuards(SessionGuard)
export class CompanyController {
  constructor(@Inject(CompanyHttpService) private readonly service: CompanyHttpService) {}
  @Get()
  list(@Req() request: Request, @Query('page') page: unknown, @Query('pageSize') pageSize: unknown, @Query('search') search: unknown, @Res({ passthrough: true }) response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    return this.service.listCompanies(request.auth.userId, page, pageSize, search);
  }
  @Get(':companyId/branches')
  branches(@Req() request: Request, @Param('companyId') companyId: unknown, @Query('page') page: unknown, @Query('pageSize') pageSize: unknown, @Res({ passthrough: true }) response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    return this.service.listBranches(request.auth.userId, companyId, page, pageSize);
  }
}
