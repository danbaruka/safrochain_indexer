-- Performance indexes for indexer (list, filter, search, address transactions).
-- Run manually: psql -d your_db -f migrations/sql/add-indexer-performance-indexes.sql
-- Idempotent: IF NOT EXISTS used where supported (PostgreSQL 9.5+).
--
-- Note: transaction and message are partitioned tables. PostgreSQL does not support
-- CREATE INDEX CONCURRENTLY on partitioned tables, so we use plain CREATE INDEX
-- (indexes are created on all partitions automatically). Block is not partitioned,
-- so we use CONCURRENTLY to avoid write locks.

-- ========== Transaction (partitioned: no CONCURRENTLY) ==========
CREATE INDEX IF NOT EXISTS idx_transaction_height_desc ON transaction (height DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_success ON transaction (success);
CREATE INDEX IF NOT EXISTS idx_transaction_success_height ON transaction (success, height DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_success_height_partial ON transaction (height DESC) WHERE success = true;

-- ========== Block (non-partitioned: CONCURRENTLY safe) ==========
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_timestamp ON block (timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_height_timestamp ON block (height, timestamp);

-- ========== Message (partitioned: no CONCURRENTLY) ==========
CREATE INDEX IF NOT EXISTS idx_message_tx_partition ON message (transaction_hash, partition_id);
CREATE INDEX IF NOT EXISTS idx_message_type ON message (type);
CREATE INDEX IF NOT EXISTS idx_message_involved_gin ON message USING GIN (involved_accounts_addresses);
CREATE INDEX IF NOT EXISTS idx_message_height ON message (height);
