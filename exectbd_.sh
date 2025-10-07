cd /Users/danbaruka/Projects/safrochain/INDEXEUR-SAFROCHAIN/callisto/database/schema
export PGPASSWORD='rootroot'
for file in $(ls -1v *.sql); do
  echo "Running $file..."
  psql -U safrochain_indexuser -d safrochain_indexdb -f "$file"
done