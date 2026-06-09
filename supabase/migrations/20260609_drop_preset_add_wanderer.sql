-- Consolidate episode classification: drop legacy preset column, episode_type is now the single source.
-- wanderer is a valid episode_type (WandererAnalysis template exists in irza-studio).

ALTER TABLE episodes DROP COLUMN IF EXISTS preset;
ALTER TABLE exhibits DROP COLUMN IF EXISTS preset;

NOTIFY pgrst, 'reload schema';
