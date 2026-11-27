# Development backup/restore — evidence 2026-11-27

Scope: MySQL development `aurum_nestjs` at `127.0.0.1:3306`; never apply this procedure to production, Laravel databases or `pma.test`. Source was checked via `DATABASE()` plus guarded `db:status` / `db:verify`, including both DEMO companies. Two tables and completed initial migration were observed.

## Diagnosis and backup

A safe reproduction of the original `mysqldump` command exited **2** with complete stderr:

```text
mysqldump: Couldn't execute 'FLUSH /*!40101 LOCAL */ TABLES': Access denied; you need (at least one of) the RELOAD or FLUSH_TABLES privilege(s) for this operation (1227)
```

`mysqldump` and server were MySQL 9.6.0; `age` was 1.3.2. No permissions were changed. Adding `--set-gtid-purged=OFF` to `--single-transaction --skip-lock-tables --no-tablespaces --databases aurum_nestjs` succeeded; this is a logical application-data backup, **not** a GTID/binlog or full-server point-in-time recovery backup. The original incomplete artifact remains identified `INCOMPLETE-do-not-restore` and must never be used.

New encrypted archive: `.aurum-local-backups/development-646fadeb-101c-419e-9e41-a743ab0ce44f.sql.age`, 3,943 bytes, mode 0600, Git-ignored. SHA-256: `59a2fa9b74b7ef9bbfb529af5e17c9ef9d53f99f73face2505d9aedc89ea772e`. Identity file is separately kept under Git-ignored `.aurum-local-backup-keys/`, mode 0600, and is not printed here. Decrypt-to-`/dev/null` and a second checksum passed. Backup and key are on the same Mac, so this is **not an independent offsite disaster-recovery copy**; loss of the Mac or key can make recovery impossible. Store protected copies according to owner policy before relying on this for disaster recovery.

## Restore evidence

The encrypted archive was decrypted and streamed to a separate Homebrew MySQL 9.6.0 instance with a newly initialized private temporary datadir, dedicated socket and `--skip-networking`; the source server/database was never a restore target. Read-only comparison found both original company IDs/names, table names, columns, constraints, database name and migration status matched. Counts: two companies and one completed initial migration. This verifies the snapshot at this time, not future changes or production readiness. The temporary server was stopped; its temporary datadir is not a durable backup.

## Controlled restore procedure

1. Confirm the selected archive is the validated `.sql.age` above, verify its SHA-256 and locate the corresponding private identity **without printing its contents**; refuse any `INCOMPLETE` artifact or checksum mismatch.
2. Initialize a **new**, empty, private temporary MySQL datadir using compatible MySQL, start with a dedicated socket and `--skip-networking`, and verify the socket/process/datadir belong to that temporary instance. Never use the source server's socket or TCP endpoint.
3. With shell `pipefail` enabled, stream `age --decrypt -i "$RESTORE_IDENTITY" "$BACKUP_FILE" | mysql --no-defaults --protocol=socket --socket="$ISOLATED_SOCKET" --user=root` only after confirming the isolated target. The archive contains `CREATE DATABASE aurum_nestjs`, so it must never be replayed into the original server.
4. Compare `information_schema.TABLES`, `COLUMNS`, `TABLE_CONSTRAINTS`, company IDs/names and `_prisma_migrations` between source and isolated restore using read-only queries; do not print credentials or private records. Verify source did not change during capture/verification or repeat the snapshot.
5. Stop only the temporary instance. Preserve the archive/key and evidence; do not delete existing schemas or volumes. For an actual recovery into development, make a separate reviewed recovery plan and obtain required authorization; a restore test is not permission to overwrite data.

## Proposed development migration (not executed)

The current development history contains only `202611250001_init`. Pending source migrations are `202611250003_identity_org`, `202611250004_sessions`, `202611250005_auth_audit`, and `202611270006_hrm_organization`. Migration 003 adds identity/branches/memberships and branch grants; 004 sessions; 005 authentication audit; 006 departments, employees and attendance with company/branch composite foreign keys. These are additive but MySQL DDL can implicitly commit and acquire metadata locks; exact lock duration/downtime is unmeasured and must be scheduled/monitored. Test database migration and Prisma schema diff passed previously. HRM audit, real permission store, authentication HTTP and provisioning are still incomplete; further review, runtime security and an explicitly authorized development write are required. A production write remains subject to the separate v3.0 owner gate.
