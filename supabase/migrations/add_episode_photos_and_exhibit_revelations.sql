-- ── episode_photos ────────────────────────────────────────────────────────
-- Tracks which photo files were used in each episode and which exhibit
-- they belong to. file_path matches public/ paths in irza-studio.

CREATE TABLE episode_photos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id   uuid        NOT NULL REFERENCES episodes(id)  ON DELETE CASCADE,
  exhibit_id   uuid                 REFERENCES exhibits(id)  ON DELETE SET NULL,
  file_path    text        NOT NULL,
  photo_role   text        NOT NULL DEFAULT 'primary',
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT episode_photos_role_check
    CHECK (photo_role IN ('primary','secondary','background','prop'))
);

CREATE INDEX idx_episode_photos_episode ON episode_photos(episode_id);
CREATE INDEX idx_episode_photos_exhibit ON episode_photos(exhibit_id);

ALTER TABLE episode_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full_access" ON episode_photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ── exhibit_revelations ───────────────────────────────────────────────────
-- Public-facing audit trail: what the audience has been shown, per episode.
-- The exhibits table holds the full in-system record; this table tracks
-- what has actually been revealed on screen and in which episode.

CREATE TABLE exhibit_revelations (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id        uuid        NOT NULL REFERENCES episodes(id)  ON DELETE CASCADE,
  exhibit_id        uuid                 REFERENCES exhibits(id)  ON DELETE CASCADE,
  faction_id        uuid                 REFERENCES factions(id)  ON DELETE SET NULL,
  field_name        text        NOT NULL,
  revealed_value    text,
  revelation_state  text        NOT NULL DEFAULT 'revealed',
  gate_level        integer,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT exhibit_revelations_state_check
    CHECK (revelation_state IN ('revealed','pending_review','encrypted','redacted')),
  CONSTRAINT exhibit_revelations_gate_check
    CHECK (gate_level BETWEEN 1 AND 5),
  CONSTRAINT exhibit_revelations_field_check
    CHECK (field_name IN (
      'name','origin_sect','hazard_class','threat_level',
      'behavioral_pattern','engineer_assessment','biologist_assessment',
      'faction','designation'
    ))
);

CREATE INDEX idx_exhibit_revelations_episode ON exhibit_revelations(episode_id);
CREATE INDEX idx_exhibit_revelations_exhibit ON exhibit_revelations(exhibit_id);
CREATE INDEX idx_exhibit_revelations_field   ON exhibit_revelations(field_name);

ALTER TABLE exhibit_revelations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_full_access" ON exhibit_revelations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
