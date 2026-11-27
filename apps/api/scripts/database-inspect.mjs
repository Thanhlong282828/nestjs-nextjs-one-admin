import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { developmentDatabaseUrl } from './development-target.mjs';

const mode = process.argv[2];
if (!['status', 'health', 'verify'].includes(mode)) throw new Error('Unsupported database check');
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(developmentDatabaseUrl(process.env, { requireSeedConfirmation: false })) });
try {
  const rows = await prisma.$queryRaw`SELECT DATABASE() AS db, CURRENT_USER() AS dbuser`;
  if (rows[0]?.db !== 'aurum_nestjs' || rows[0]?.dbuser !== 'nestjs@localhost') throw new Error('Unexpected database or authenticated MySQL user');
  if (mode === 'health') console.log('Development MySQL connection healthy.');
  if (mode === 'status') console.log(`Development database aurum_nestjs is reachable; company records: ${await prisma.company.count()}. Migration state is not checked by this command.`);
  if (mode === 'verify') {
    const companies = await prisma.company.findMany({ where: { id: { in: ['909a923a-dd52-4b61-a81e-f777fb140001', '909a923a-dd52-4b61-a81e-f777fb140002'] } }, select: { id: true, name: true } });
    const expected = new Map([['909a923a-dd52-4b61-a81e-f777fb140001', '[DEMO] Công ty Ánh Dương'], ['909a923a-dd52-4b61-a81e-f777fb140002', '[DEMO] Công ty Minh Châu']]);
    if (companies.length !== expected.size || companies.some(company => expected.get(company.id) !== company.name)) throw new Error('Development company demo records missing or changed');
    console.log('Two expected development company IDs and names matched; REAL/DEMO classification was not verified.');
  }
} finally { await prisma.$disconnect(); }
