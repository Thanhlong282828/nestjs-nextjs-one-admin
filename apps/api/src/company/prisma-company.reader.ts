import type { CompanyListCriteria, CompanyListReader, CompanyPage, CompanyReader, CompanyView } from '@aurum/company';
import type { PrismaClient } from '../generated/prisma/client';

/** Adapter only: a trusted principal must be authorized before invoking this port. */
export class PrismaCompanyReader implements CompanyReader, CompanyListReader {
  constructor(private readonly db: Pick<PrismaClient, 'company'>) {}

  async findById(id: string): Promise<CompanyView | null> {
    return this.db.company.findUnique({ where: { id }, select: { id: true, name: true } });
  }

  async findPage(criteria: CompanyListCriteria): Promise<CompanyPage> {
    const where = { id: { in: [...criteria.allowedCompanyIds] }, name: { contains: criteria.search } };
    const [items, total] = await Promise.all([
      this.db.company.findMany({ where, select: { id: true, name: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }], skip: criteria.offset, take: criteria.limit }),
      this.db.company.count({ where }),
    ]);
    return { items, total };
  }
}
