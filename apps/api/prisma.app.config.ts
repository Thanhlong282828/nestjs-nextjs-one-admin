import { defineConfig } from 'prisma/config';

/** Application migration stream excludes the experimental test-only ownership table. */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/mysql-app-migrations' },
  datasource: { url: process.env.MIGRATION_DATABASE_URL },
});
