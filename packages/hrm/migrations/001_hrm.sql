-- Apply through a migration runner under an administrative role, never per request.
CREATE TABLE IF NOT EXISTS hrm_employees (
  id uuid PRIMARY KEY,
  company_id uuid NOT NULL,
  code varchar(32) NOT NULL,
  full_name varchar(120) NOT NULL,
  department varchar(100) NOT NULL,
  status varchar(8) NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hrm_employee_company_code_unique UNIQUE (company_id, code)
);
CREATE INDEX IF NOT EXISTS hrm_employees_company_created_idx ON hrm_employees (company_id, created_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS hrm_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  action varchar(100) NOT NULL,
  employee_id uuid NOT NULL REFERENCES hrm_employees(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hrm_audit_company_created_idx ON hrm_audit_log (company_id, created_at DESC);
