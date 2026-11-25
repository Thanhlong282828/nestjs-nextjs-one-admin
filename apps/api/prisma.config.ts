import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/mysql-migrations' },
  datasource: { url: process.env.MIGRATION_DATABASE_URL },
});
