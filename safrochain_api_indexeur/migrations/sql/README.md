# SQL migrations

## Schema (initial setup)

The Callisto indexer creates tables. To run schema manually:

```bash
./run-schema.sh
```

If the DB already has tables, use `--ignore-existing` to avoid errors:

```bash
./run-schema.sh --ignore-existing
```

## Performance indexes

Run performance indexes (do this before deploying app changes for best effect):

```bash
psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f migrations/sql/add-indexer-performance-indexes.sql
```

Or with explicit values:

```bash
cd safrochain_indexer/safrochain_api_indexeur
psql -h localhost -p 5432 -d safrochain_indexdb -U safrochain_indexuser -f migrations/sql/add-indexer-performance-indexes.sql
```

**Note:** `transaction` and `message` are partitioned tables; PostgreSQL does not support `CONCURRENTLY` on them, so those indexes use plain `CREATE INDEX` (may briefly lock writes). `block` indexes use `CONCURRENTLY`. Run during low traffic if possible.

## Redis cache (optional)

To use Redis instead of in-memory cache, set in `.env`:

```
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # optional
```
