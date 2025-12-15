-- ========================================
-- LEVEL 13: ANALYTICS DATABASE MIGRATIONS
-- ========================================
-- Run this on Railway PostgreSQL database
-- Date: 2025-12-15
-- ========================================

-- Table 1: Analytics Events
-- Stores all user events for tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- Table 2: User Sessions
-- Tracks user session duration and activity
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  duration INTEGER, -- in seconds
  page_views INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time DESC);

-- Table 3: Daily Metrics
-- Aggregated daily statistics
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  avg_xp_per_user INTEGER DEFAULT 0,
  fraud_violations INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date DESC);

-- Table 4: Conversion Funnels
-- Tracks user conversion milestones
CREATE TABLE IF NOT EXISTS conversion_funnels (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  signup_date TIMESTAMP DEFAULT NOW(),
  first_xp_date TIMESTAMP,
  first_referral_date TIMESTAMP,
  creator_tier_date TIMESTAMP,
  time_to_first_xp INTEGER, -- in hours
  time_to_first_referral INTEGER, -- in hours
  time_to_creator_tier INTEGER -- in hours
);

CREATE INDEX IF NOT EXISTS idx_conversion_funnels_user_id ON conversion_funnels(user_id);

-- Verify tables were created
SELECT 
  'analytics_events' as table_name, 
  COUNT(*) as row_count 
FROM analytics_events
UNION ALL
SELECT 
  'user_sessions' as table_name, 
  COUNT(*) as row_count 
FROM user_sessions
UNION ALL
SELECT 
  'daily_metrics' as table_name, 
  COUNT(*) as row_count 
FROM daily_metrics
UNION ALL
SELECT 
  'conversion_funnels' as table_name, 
  COUNT(*) as row_count 
FROM conversion_funnels;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
