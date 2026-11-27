import { Body, Controller, Inject, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { OriginCsrfGuard } from '../identity/http/origin-csrf.guard';
import { SessionGuard, type AuthenticatedSession } from '../identity/http/session.guard';
import { HrmWriteService } from './hrm-write.service';

type Request = { auth: AuthenticatedSession };
type Response = { setHeader(name: string, value: string): void };
@Controller(['api/v1/hrm', 'api/hrm'])
@UseGuards(SessionGuard, OriginCsrfGuard)
export class HrmWriteController {
  constructor(@Inject(HrmWriteService) private readonly service: HrmWriteService) {}
  @Post('employees') create(@Req() req: Request, @Body() body: unknown, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return this.service.create(req.auth, body); }
  @Patch('employees/:id') update(@Req() req: Request, @Param('id') id: string, @Body() body: unknown, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return this.service.update(req.auth, id, body); }
  @Patch('employees/:id/status') status(@Req() req: Request, @Param('id') id: string, @Body() body: unknown, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return this.service.changeStatus(req.auth, id, body); }
}
