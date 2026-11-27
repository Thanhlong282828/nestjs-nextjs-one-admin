import { Controller, Get, Inject, NotFoundException, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { SessionGuard, type AuthenticatedSession } from '../identity/http/session.guard';
import { HrmReadService } from './hrm-read.service';

type Request = { auth: AuthenticatedSession };
type Response = { setHeader(name: string, value: string): void };
type QueryValues = { companyId?: unknown; branchId?: unknown; page?: unknown; pageSize?: unknown; departmentId?: unknown; from?: unknown; to?: unknown; search?: unknown; sort?: unknown; direction?: unknown };
@Controller('api/v1/hrm')
@UseGuards(SessionGuard)
export class HrmReadController {
  constructor(@Inject(HrmReadService) private readonly service: HrmReadService) {}
  @Get('employees') employees(@Req() req: Request, @Query() q: QueryValues, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return this.service.list(req.auth, 'employees', q); }
  @Get('employees/:id') async employee(@Req() req: Request, @Param('id') id: string, @Query() q: QueryValues, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); const result = await this.service.list(req.auth, 'employees', { companyId: q.companyId, branchId: q.branchId, employeeId: id, page: '1', pageSize: '1' }); if (!result.items[0]) throw new NotFoundException(); return result.items[0]; }
  @Get('departments') departments(@Req() req: Request, @Query() q: QueryValues, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return this.service.list(req.auth, 'departments', q); }
  @Get('attendances') attendance(@Req() req: Request, @Query() q: QueryValues, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return this.service.list(req.auth, 'attendance', q); }
}
