-- Performance indexes for indexer (list, filter, search, address transactions).
-- Run manually: psql -d your_db -f migrations/sql/add-indexer-performance-indexes.sql
-- Idempotent: IF NOT EXISTS used where supported (PostgreSQL 9.5+).

-- Transaction: list/filter order and join to block
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transaction_height_desc ON transaction (height DESC);

-- Transaction: filter by success
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transaction_success ON transaction (success);

-- Transaction: composite for common filtered list (success + order by height)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transaction_success_height ON transaction (success, height DESC);

-- Transaction: partial index for successful transactions only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transaction_success_height_partial ON transaction (height DESC) WHERE success = true;

-- Block: date_from / date_to filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_timestamp ON block (timestamp);

-- Block: composite for join + date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_height_timestamp ON block (height, timestamp);

-- Message: EXISTS subqueries and preloadMessagesByHash
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_tx_partition ON message (transaction_hash, partition_id);

-- Message: filter by message_type / message_types
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_type ON message (type);

-- Message: address/validator filters (= ANY, &&) on involved_accounts_addresses
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_involved_gin ON message USING GIN (involved_accounts_addresses);

-- Message: height for filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_height ON message (height);
