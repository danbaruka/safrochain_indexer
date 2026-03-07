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
psql -d "$DB_NAME" -U "$DB_USER" -f migrations/sql/add-indexer-performance-indexes.sql
```

Or from project root:

```bash
cd safrochain_indexer/safrochain_api_indexeur
psql -d safrochain_indexdb -U safrochain_indexuser -f migrations/sql/add-indexer-performance-indexes.sql
```

Indexes use `CONCURRENTLY` so they do not lock writes; each statement runs outside a transaction.

## Redis cache (optional)

To use Redis instead of in-memory cache, set in `.env`:

```
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # optional
```
