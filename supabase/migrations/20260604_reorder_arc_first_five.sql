-- Reorder posting schedule: first 5 days are Arc 1-5 back-to-back.
-- Arc Fragment (originally ep 9) moves to day 5; week-1 non-arc content
-- shifts to days 6-8; week-2 ordering adjusts accordingly.
-- Episodes 12-30 are unchanged.
--
-- Uses temp-negative episode numbers to sidestep the unique constraint
-- on episode_number during the reorder.

BEGIN;

-- ── Step 1: park changing rows at temporary negative numbers ──────────────
UPDATE episodes SET episode_number = -2  WHERE title = 'Partial Boot';
UPDATE episodes SET episode_number = -3  WHERE title = 'First Exhibit';
UPDATE episodes SET episode_number = -4  WHERE title = 'Behavior Cluster';
UPDATE episodes SET episode_number = -5  WHERE title = 'Archive Fragment';
UPDATE episodes SET episode_number = -6  WHERE title = 'Reclassification - archive file 001';
UPDATE episodes SET episode_number = -7  WHERE title = 'Reclassification - archive file 002';
UPDATE episodes SET episode_number = -8  WHERE title = 'Classifying - backlog unit 001';
UPDATE episodes SET episode_number = -9  WHERE title = 'Behavior Collective - squad 001';
UPDATE episodes SET episode_number = -10 WHERE title = 'Archive Designation';
UPDATE episodes SET episode_number = -11 WHERE title = 'Reclassification - archive file 003';

-- ── Step 2: assign final positions and correct phases ────────────────────
-- WEEK 1 (phase 1): Arc 1-5 first, then reclassification backfill
UPDATE episodes SET episode_number = 2,  phase = 1 WHERE title = 'Partial Boot';
UPDATE episodes SET episode_number = 3,  phase = 1 WHERE title = 'First Exhibit';
UPDATE episodes SET episode_number = 4,  phase = 1 WHERE title = 'Behavior Cluster';
UPDATE episodes SET episode_number = 5,  phase = 1 WHERE title = 'Archive Fragment';
UPDATE episodes SET episode_number = 6,  phase = 1 WHERE title = 'Reclassification - archive file 001';
UPDATE episodes SET episode_number = 7,  phase = 1 WHERE title = 'Reclassification - archive file 002';

-- WEEK 2 (phase 2): classifying 001 opens the week, squad + designation shift up
UPDATE episodes SET episode_number = 8,  phase = 2 WHERE title = 'Classifying - backlog unit 001';
UPDATE episodes SET episode_number = 9,  phase = 2 WHERE title = 'Behavior Collective - squad 001';
UPDATE episodes SET episode_number = 10, phase = 2 WHERE title = 'Archive Designation';
UPDATE episodes SET episode_number = 11, phase = 2 WHERE title = 'Reclassification - archive file 003';
-- episodes 12-14 (reclass 004, Collective Observation, classifying 002) unchanged

COMMIT;

NOTIFY pgrst, 'reload schema';
