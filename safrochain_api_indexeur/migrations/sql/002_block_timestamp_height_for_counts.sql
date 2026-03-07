-- Covering index for transaction counts subquery: MIN(height) WHERE timestamp >= X
-- Enables index-only scan for block boundary lookup (no row fetch).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_block_timestamp_height ON block (timestamp, height);
