# SQL migrations

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
