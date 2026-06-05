-- Enforce that episode titles never contain '#'.
-- The '#' character belongs only in captions/hashtags — never in a canonical title.

ALTER TABLE episodes
  ADD CONSTRAINT episodes_title_no_hash
  CHECK (title NOT LIKE '%#%');

NOTIFY pgrst, 'reload schema';
