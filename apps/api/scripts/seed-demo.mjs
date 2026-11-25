import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';

// A dedicated database must be provisioned and migrated before running this script.
const url = new URL(process.env.DEMO_DATABASE_URL ?? '');
if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || url.port !== '3306' || url.pathname !== '/aurum_nestjs_demo' || url.username !== 'nestjs_migrate' || url.search || url.hash) {
  throw new Error('Refusing seed: expected local aurum_nestjs_demo with the migration user');
}
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url.toString()) });
const companies = [
  { id: '909a923a-dd52-4b61-a81e-f777fb140001', name: '[DEMO] Công ty Ánh Dương' },
  { id: '909a923a-dd52-4b61-a81e-f777fb140002', name: '[DEMO] Công ty Minh Châu' },
];
try {
  const rows = await prisma.$queryRaw`SELECT DATABASE() AS name`;
  if (rows[0]?.name !== 'aurum_nestjs_demo') throw new Error('Unexpected connected database');
  const result = await prisma.company.createMany({ data: companies, skipDuplicates: true });
  console.log(`Demo companies inserted: ${result.count}; existing records were not changed.`);
} finally {
  await prisma.$disconnect();
}
