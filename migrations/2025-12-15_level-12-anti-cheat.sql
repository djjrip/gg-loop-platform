-- ========================================
-- LEVEL 12: ANTI-CHEAT LITE DATABASE MIGRATIONS
-- ========================================
-- Run this on Railway PostgreSQL database
-- Date: 2025-12-15
-- ========================================

-- Table 1: Anti-Cheat Violations
-- Stores all anti-cheat violation records with evidence
CREATE TABLE IF NOT EXISTS anti_cheat_violations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  evidence JSONB,
  fraud_score_impact INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_anti_cheat_violations_user_id ON anti_cheat_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_violations_created_at ON anti_cheat_violations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_violations_severity ON anti_cheat_violations(severity);

-- Table 2: Rate Limit State
-- Tracks rate limiting and cooldown state per user
CREATE TABLE IF NOT EXISTS rate_limit_state (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp_sync_count INTEGER DEFAULT 0,
  match_verify_count INTEGER DEFAULT 0,
  last_xp_sync TIMESTAMP,
  last_match_verify TIMESTAMP,
  cooldown_until TIMESTAMP,
  window_start TIMESTAMP DEFAULT NOW()
);

-- Index for faster cooldown checks
CREATE INDEX IF NOT EXISTS idx_rate_limit_state_cooldown ON rate_limit_state(cooldown_until) WHERE cooldown_until IS NOT NULL;

-- Verify tables were created
SELECT 
  'anti_cheat_violations' as table_name, 
  COUNT(*) as row_count 
FROM anti_cheat_violations
UNION ALL
SELECT 
  'rate_limit_state' as table_name, 
  COUNT(*) as row_count 
FROM rate_limit_state;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
