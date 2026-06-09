-- ── episodes.script_json ──────────────────────────────────────────────────────
-- Stores the canonical script layer for each episode as structured JSONB.
-- Production data (camera moves, audio cues, render timing) stays in irza-studio.
--
-- Expected shape:
-- {
--   "purpose":      string,          -- narrative intent / episode role in arc
--   "setup": {
--     "miniature":  string,          -- filming note: what to put in frame
--     "backdrop":   string,
--     "lighting":   string
--   },
--   "beats": [
--     { "name": "HOOK"|"BEAUTY"|"LORE"|"QUESTION", "from": number, "to": number }
--   ],
--   "dialogue": [
--     { "speaker": string, "text": string, "from": number, "to": number }
--   ],
--   "systemUI": [
--     { "text": string, "from": number, "to": number, "variant": string }
--   ],
--   "glitch": [
--     { "from": number, "to": number, "intensity": string, "note": string }
--   ],
--   "endingFeeling": string,         -- tone/mood note for the final beat
--   "voiceNotes":   string[],        -- craft reminders for recording/editing
--   "caption":      string           -- social media caption (no hashtags inline)
-- }
--
-- Notes:
--   - "from"/"to" values are seconds (float). They are production hints, not
--     render-authoritative — irza-studio ep-*.ts files own the render timing.
--   - "caption" must not contain # characters (hashtags go in social post only).
--   - "glitch" is included here because glitch text/intensity is narrative canon,
--     even though glitch events are also rendered in irza-studio.

ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS script_json jsonb;

COMMENT ON COLUMN episodes.script_json IS
  'Canonical script layer: purpose, setup notes, beats, dialogue, systemUI text, '
  'ending feeling, voice notes, caption. Production data (shots, audio, render timing) '
  'lives in irza-studio src/data/episodes-6-15/.';

NOTIFY pgrst, 'reload schema';
