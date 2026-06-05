ALTER TABLE episodes ADD COLUMN IF NOT EXISTS tracker_id text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_episodes_tracker_id ON episodes(tracker_id);
NOTIFY pgrst, 'reload schema';
