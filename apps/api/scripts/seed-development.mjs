import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { developmentDatabaseUrl } from './development-target.mjs';

const moduleName = process.argv[2] ?? 'company';
if (moduleName !== 'company') throw new Error('Only the company seed is currently implemented');
const databaseUrl = developmentDatabaseUrl(process.env);
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
const companies = [
  { id: '909a923a-dd52-4b61-a81e-f777fb140001', name: '[DEMO] Công ty Ánh Dương' },
  { id: '909a923a-dd52-4b61-a81e-f777fb140002', name: '[DEMO] Công ty Minh Châu' },
];
try {
  const result = await prisma.$transaction(async tx => {
    const info = await tx.$queryRaw`SELECT DATABASE() AS db, CURRENT_USER() AS dbuser`;
    if (info[0]?.db !== 'aurum_nestjs' || info[0]?.dbuser !== 'nestjs@localhost') throw new Error('Unexpected database or authenticated MySQL user');
    const grants = await tx.$queryRaw`SHOW GRANTS`;
    const companyGrant = grants.map(row => Object.values(row)[0]).find(value => typeof value === 'string' && /ON `aurum_nestjs`\.`companies` TO /i.test(value));
    if (typeof companyGrant !== 'string' || !/\bSELECT\b/i.test(companyGrant) || !/\bINSERT\b/i.test(companyGrant)) throw new Error('Expected company SELECT and INSERT privileges are unavailable');
    let inserted = 0;
    for (const company of companies) {
      const existing = await tx.company.findUnique({ where: { id: company.id }, select: { name: true } });
      if (existing && existing.name !== company.name) throw new Error('Seed ID conflicts with an existing record; no records changed');
      if (!existing) { await tx.company.create({ data: company }); inserted++; }
    }
    return inserted;
  }, { isolationLevel: 'Serializable' });
  console.log(`Development company seed complete: ${result} inserted; existing records preserved.`);
} finally {
  await prisma.$disconnect();
}
