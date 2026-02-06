-- Survey sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_type VARCHAR(50) NOT NULL,  -- 'ar_menu', 'menu_image_0', 'menu_image_1'
  device_type VARCHAR(20) NOT NULL,      -- 'mobile', 'desktop'
  fingerprint VARCHAR(64),               -- Browser fingerprint for idempotency
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  is_screened_out BOOLEAN DEFAULT FALSE
);

-- Survey responses (EAV pattern for flexibility)
CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  response_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add fingerprint column if it doesn't exist (for existing databases)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='fingerprint') THEN
    ALTER TABLE sessions ADD COLUMN fingerprint VARCHAR(64);
  END IF;
END $$;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_responses_session ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_condition ON sessions(condition_type);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON sessions(fingerprint);
