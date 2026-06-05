-- Set posted_date for all 30 episodes.
-- Episode 1 = 2026-06-03 (yesterday); each subsequent episode +1 day.
-- Episode 30 lands on 2026-07-02.

UPDATE episodes
SET
  posted_date = ('2026-06-02'::date + (episode_number || ' days')::interval)::date,
  updated_at  = NOW()
WHERE episode_number BETWEEN 1 AND 30;

-- Mark eps 1 & 2 as posted (they aired on 2026-06-03 and 2026-06-04)
UPDATE episodes
SET status = 'posted', updated_at = NOW()
WHERE episode_number IN (1, 2);

NOTIFY pgrst, 'reload schema';
