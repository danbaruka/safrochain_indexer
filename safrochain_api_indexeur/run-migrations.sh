#!/usr/bin/env bash
# Run SQL migrations with tracking. Migrations run in order (by filename).
# Usage: ./run-migrations.sh
#
# Migrations are stored in migrations/sql/ with numeric prefix (001_, 002_, ...).
# Applied migrations are recorded in schema_migrations table.
# Idempotent: safe to run multiple times; already-applied migrations are skipped.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${SCRIPT_DIR}/migrations/sql"
ENV_FILE="${SCRIPT_DIR}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env not found at $ENV_FILE"
  echo "Copy env.example to .env and set DB_* variables."
  exit 1
fi

# Load DB_* vars from .env
while IFS= read -r line; do
  [[ "$line" =~ ^DB_ ]] || continue
  [[ "$line" =~ ^# ]] || [[ -z "$line" ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  export "$key=$value"
done < <(grep -E '^DB_' "$ENV_FILE" 2>/dev/null || true)

for var in DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD; do
  if [[ -z "${!var}" ]]; then
    echo "Error: $var is not set in .env"
    exit 1
  fi
done

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Error: migrations directory not found at $MIGRATIONS_DIR"
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

# Create schema_migrations table if not exists
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -t -A <<'EOSQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
EOSQL

echo "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "Migrations: $MIGRATIONS_DIR"
echo "---"

APPLIED=0
SKIPPED=0

for file in $(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  [[ -f "$file" ]] || continue
  name="$(basename "$file")"

  # Check if already applied
  name_escaped="${name//\'/\'\'}"
  EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -c "SELECT 1 FROM schema_migrations WHERE name = '$name_escaped' LIMIT 1" 2>/dev/null || echo "")

  if [[ "$EXISTS" == "1" ]]; then
    echo "SKIP  $name (already applied)"
    ((SKIPPED++)) || true
    continue
  fi

  echo "RUN   $name"
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$file"; then
    name_escaped="${name//\'/\'\'}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations (name) VALUES ('$name_escaped')"
    echo "OK    $name"
    ((APPLIED++)) || true
  else
    echo "FAIL  $name"
    exit 1
  fi
done

echo "---"
echo "Done. Applied: $APPLIED, Skipped: $SKIPPED"
