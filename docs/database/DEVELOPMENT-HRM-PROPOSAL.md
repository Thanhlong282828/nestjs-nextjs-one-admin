# HRM development data proposal — draft, not executable

Read-only verification on 2026-11-27 selected MySQL `aurum_nestjs` on the configured local server. It contains `_prisma_migrations` and `companies`; only `202611250001_init` is complete. Existing records to preserve:

| Company ID | Name |
| --- | --- |
| `909a923a-dd52-4b61-a81e-f777fb140001` | `[DEMO] Công ty Ánh Dương` |
| `909a923a-dd52-4b61-a81e-f777fb140002` | `[DEMO] Công ty Minh Châu` |

The proposal below is synthetic DEMO data only. It is not an implementation, production seed, authorization to write, or a claim that existing names are a sufficient security boundary. Before execution, implement and test structural provenance, collision checks, idempotent provisioning, restore and rollback; verify the database target and current records again.

| Proposed entity | Stable ID | Relationship and proposed label |
| --- | --- | --- |
| Branch A | `a0010000-0000-4000-8000-000000000001` | Existing company Ánh Dương; `[DEMO] Chi nhánh A` |
| Branch B | `a0010000-0000-4000-8000-000000000002` | Existing company Minh Châu; `[DEMO] Chi nhánh B` |
| Department A | `a0020000-0000-4000-8000-000000000001` | Branch A; code `DEMO-A`, name `[DEMO] Vận hành A` |
| Department B | `a0020000-0000-4000-8000-000000000002` | Branch B; code `DEMO-B`, name `[DEMO] Vận hành B` |
| Employee A | `a0030000-0000-4000-8000-000000000001` | Department A; code `DEMO-A-001`, `[DEMO] Nhân viên A` |
| Employee B | `a0030000-0000-4000-8000-000000000002` | Department B; code `DEMO-B-001`, `[DEMO] Nhân viên B` |
| Attendance A | `a0040000-0000-4000-8000-000000000001` | Employee A, 2026-01-02, `present` |
| Attendance B | `a0040000-0000-4000-8000-000000000002` | Employee B, 2026-01-02, `present` |
| Local viewer identity | `a0050000-0000-4000-8000-000000000001` | One synthetic identity; proposed reserved email `demo.viewer@example.invalid`; password securely supplied locally at bootstrap and Argon2id-hashed, never committed. |

Proposed relationships: two active memberships link the viewer to the existing companies; two branch grants link the viewer to the corresponding branch; five explicit permissions per membership: `company.read`, `branch.read`, `department.read`, `employee.read`, `attendance.read`. No user, membership, permission, branch, employee or attendance record has been created by this proposal. The recorded status `present` is a sample state, not evidence of a real check-in, payroll, payment or accounting transaction.

Candidate affected tables: `branches` +2, `hrm_departments` +2, `hrm_employees` +2, `hrm_attendance` +2, `identity_users` +1, `company_memberships` +2, `branch_grants` +2, `membership_permissions` +10. Existing `companies` +0. Subsequent authenticated use writes sessions, authentication audit and HRM read audit; those are not part of initial provisioning counts. IDs and email are proposals subject to collision inspection; a collision must stop rather than overwrite or guess.

Candidate migration sequence after current 001: `202611250003_identity_org`, `202611250004_sessions`, `202611250005_auth_audit`, `202611270006_hrm_organization`, `202611270007_membership_permissions`, `202611270008_hrm_read_audit`, `202611270009_hrm_employee_audit`, `202611270010_hrm_security_audit`, plus any reviewed provenance migration needed before provisioning. MySQL DDL may implicitly commit and lock tables; duration is unmeasured and reversing migration history by hand is not a safe rollback. Review SQL and perform a full test migration and compatibility check before requesting approval.

Read-only verification after any future approved change should use a scoped connection and `SELECT DATABASE()` first; check company IDs, joins among branch/department/employee/attendance, membership and grants, permission counts, migration status and absence of cross-company references. Exact executable verification and DEMO-only rollback depend on the final provenance model and provisioner and are not ready. The previous encrypted backup and isolated restore evidence are in [DEVELOPMENT-BACKUP-RESTORE.md](DEVELOPMENT-BACKUP-RESTORE.md); its freshness must be verified and a new restore-tested backup created if required. Never restore over the source database as part of a restore test.

**Do not execute:** DEMO provenance and centralized idempotent provisioning/rollback are not implemented. Once the complete plan and recovery evidence are ready, present the exact operation and obtain explicit owner approval before any development migration or data write. Production does not currently exist and retains its separate v3.0 gate.


### Update 2026-11-27 — still not approval-ready

Migrations 009 and 010 exist in source and have been applied only to `aurum_nestjs_test`; the development schema and current records must be re-inventoried before proposing any write. Additional tables would be `hrm_employee_audit` and `hrm_security_audit`, initially empty. Exact DDL impacts, current backup freshness, isolated restore, authenticated DEMO provenance, executor and DEMO-only rollback remain unverified. This is not authorization to write or provision development.

### Current V4 status — 2026-11-27
V4 supplies standing approval for additive development migration and explicitly DEMO records after the mandated safety gates; the prior requirement to seek a separate approval for each additive run is superseded. This proposal remains **not executable** for technical reasons, not because owner authorization is absent: the verified backup has not been compared with current records; the source migration directory includes `202611270011_demo_ownership_test`, explicitly test-only, in the sequence Prisma deploy would consume; the available provisioner refuses development and only owns a newly created company; and the two existing companies have no structural classification. The list above lacks `tenant.demo.read` and classification/branch sidecars now required by the real local API. Recalculate record counts and plan once those gaps are resolved. Never reclassify existing companies based only on names, modify existing rows or use a destructive rollback as a shortcut. Test the exact migration path and provisioning in an isolated database first; then recheck current development target and backup/restore and execute only V4-authorized additive changes.
