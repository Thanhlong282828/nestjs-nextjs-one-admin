-- The runtime role must not be able to alter migration history.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'enterprise_app') THEN
    REVOKE ALL ON TABLE "_prisma_migrations" FROM enterprise_app;
  END IF;
END $$;
