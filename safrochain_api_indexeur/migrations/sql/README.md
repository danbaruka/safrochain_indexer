# SQL Migrations

## Overview

- **Schema** (tables): Created by Callisto indexer. Run `./run-schema.sh` for initial setup.
- **Migrations** (indexes, etc.): Tracked migrations. Run `./run-migrations.sh`.

## 1. Schema (initial setup)

Creates tables from Callisto schema. Run once on a fresh database:

```bash
./run-schema.sh
```

If the DB already has tables (e.g. Callisto ran first):

```bash
./run-schema.sh --ignore-existing
```

## 2. Migrations (indexes, schema changes)

Run migrations with tracking. Safe to run multiple times; applied migrations are skipped.

```bash
./run-migrations.sh
```

Migrations are in `migrations/sql/` with numeric prefix (`001_`, `002_`, ...). Applied migrations are recorded in `schema_migrations` table.

### Adding a new migration

1. Create `migrations/sql/NNN_description.sql` (e.g. `002_add_foo_index.sql`)
2. Use `IF NOT EXISTS` where possible for idempotency
3. For partitioned tables (`transaction`, `message`): do **not** use `CONCURRENTLY` (PostgreSQL limitation)
4. For non-partitioned tables: use `CREATE INDEX CONCURRENTLY` to avoid write locks

## Deploy flow

```bash
# 1. Pull latest code
git pull origin main

# 2. Install deps
npm ci

# 3. Run migrations (idempotent)
./run-migrations.sh

# 4. Build and start
npm run build
npm run start:prod
```

## Redis cache (optional)

To use Redis instead of in-memory cache, set in `.env`:

```
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```
