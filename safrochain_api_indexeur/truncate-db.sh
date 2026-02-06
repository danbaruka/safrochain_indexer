#!/usr/bin/env bash
# Truncate all tables in the database using DB config from .env
# Usage: ./truncate-db.sh [ -f | --force ]   (from safrochain_api_indexeur directory)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env not found at $ENV_FILE"
  echo "Copy env.example to .env and set DB_* variables."
  exit 1
fi

# Load only DB_* vars from .env (avoids errors from values with spaces in other vars)
while IFS= read -r line; do
  [[ "$line" =~ ^DB_ ]] || continue
  [[ "$line" =~ ^# ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  export "$key=$value"
done < <(grep -E '^DB_' "$ENV_FILE")

for var in DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD; do
  if [[ -z "${!var}" ]]; then
    echo "Error: $var is not set in .env"
    exit 1
  fi
done

export PGPASSWORD="$DB_PASSWORD"

echo "Database: $DB_NAME @ $DB_HOST:$DB_PORT (user: $DB_USER)"
echo "This will TRUNCATE all tables in the public schema (CASCADE)."
if [[ "${1:-}" != "-f" && "${1:-}" != "--force" ]]; then
  read -r -p "Are you sure? [y/N] " response
  if [[ ! "$response" =~ ^[yY]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename)
  LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    RAISE NOTICE 'Truncated: %', r.tablename;
  END LOOP;
END $$;
SQL

echo "Done. All tables truncated."
