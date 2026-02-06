#!/usr/bin/env bash
# Run Callisto database schema SQL files using DB config from .env
# Usage: ./run-schema.sh   (from safrochain_api_indexeur directory)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="${SCRIPT_DIR}/../callisto/database/schema"
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

if [[ ! -d "$SCHEMA_DIR" ]]; then
  echo "Error: schema directory not found at $SCHEMA_DIR"
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

echo "Using database: $DB_NAME @ $DB_HOST:$DB_PORT (user: $DB_USER)"
echo "Running schema from: $SCHEMA_DIR"
echo "---"

for file in "$SCHEMA_DIR"/*.sql; do
  if [[ -f "$file" ]]; then
    name="$(basename "$file")"
    echo "Running $name..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" || exit 1
  fi
done

echo "---"
echo "Schema applied successfully."
