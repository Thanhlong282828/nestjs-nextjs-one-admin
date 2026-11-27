# Production data availability audit — 2026-11-27

The project owner confirmed that Aurum production does not yet exist. No production host, database identity, deployment or credentials were supplied. No production database was connected to or modified. Counts, schemas and tenant classification in a future production system are **not verifiable**; unknown must not be reported as zero. The GitHub repositories are source hosting and do not by themselves establish a deployed application or database.

## Inventory and implementation evidence

| Requested domain | Production REAL / DEMO / UNKNOWN records | Current source evidence |
| --- | --- | --- |
| Companies, branches | Not applicable: production not yet created. | Company/branch Prisma models and scoped read endpoints exist for explicit local development/test only. Two DEMO-labeled companies were verified in local development; names are not a security classification. |
| Departments, employees, attendance | Not applicable: production not yet created. | Candidate Prisma models and migrations exist; HRM application API, audit and Admin integration remain incomplete. |
| Users, memberships, permissions | Not applicable: production not yet created. | Candidate MySQL models and session/authorization code exist. Production HTTP authentication fails closed; local-only auth has test evidence. |
| Payroll, CRM, products, inventory, procurement, orders, accounting | Not applicable: production not yet created. | No complete persisted production workflow has been demonstrated. |

The current schema has no trustworthy REAL/DEMO provenance marker. Real and demo tenant isolation, report segregation, protected production APIs, production deployment, backup, restoration and monitoring are not verified. Do not classify records by name or fabricate REAL data.

## Candidate initial migration and initialization plan — not approved

1. Provision a separate target only after its provider, host, database, application and migration identities, least-privilege grants, network/TLS and owners are determined. Establish read-only discovery and record server identity and migration history; do not infer an empty database from a new plan.
2. Review initial source migrations `202611250001_init`, `202611250003_identity_org`, `202611250004_sessions`, `202611250005_auth_audit`, `202611270006_hrm_organization`, and `202611270007_membership_permissions` against the actual target. MySQL DDL can commit implicitly; assess locking, backup, restoration, rollback and forward-repair for each migration.
3. Design explicit, trusted REAL/DEMO provenance with a safe migration and isolation across authorization, queries, storage, reports and financial aggregation. Current migrations do not supply this mechanism. Review and test this before any mixed-track initialization.
4. Prepare REAL onboarding only from validated information supplied by the business owner; identities, companies, employees and transactions are not yet known. Prepare a separate deterministic, marked, tenant-scoped DEMO manifest with exact identifiers, relationships, idempotency, collision checks and DEMO-only rollback. Neither manifest is ready for execution.
5. Verify security, API and frontend functionality in isolated test environments. The current AppModule authentication is explicitly local-only and cannot be used for production. Distributed abuse controls, proxy/TLS, audit, tenant isolation and HRM database-to-browser E2E are incomplete.
6. Before any production write, present the full 12-point owner plan in `REAL-DATA-GOVERNANCE.md`: target and state, affected tenants/tables/records, migration and provisioning, encrypted backup plus checksum, verified isolated restore, rollback, isolation evidence, downtime and post-change verification. Stop and wait for specific owner approval. Approval for preparation does not permit a write.

No target, proposed REAL record, actual production migration, production backup or restore evidence exists yet; consequently this is a preparation document, not the complete approval package.
