-- Import IRZA 30-day production schedule into episodes table
-- Paste this into Supabase Dashboard → SQL Editor and run

INSERT INTO episodes (
  episode_number,
  title,
  episode_type,
  preset,
  runtime_class,
  phase,
  status,
  notes,
  created_at,
  updated_at
) VALUES
-- WEEK 1
(1, 'Archive Signal', 'arc', NULL, 'STANDARD', 1, 'planned', 'Channel relaunch. Curator + Muscle + System introduced. Something impossible discovered.', NOW(), NOW()),
(2, 'Reclassification - archive file 001', 'reclassification', 'A', 'SHORT', 1, 'planned', 'Degradation overlay fades in. Older terminology. Designation only - system can''t verify prior record yet.', NOW(), NOW()),
(3, 'Partial Boot', 'arc', NULL, 'STANDARD', 1, 'planned', 'Zoo begins responding. Engineering Layer: Not Found. First Malerus seed.', NOW(), NOW()),
(4, 'Reclassification - archive file 002', 'reclassification', 'A', 'SHORT', 1, 'planned', 'Second archive file surfaces. Terminology conflicts with current system. Designation only.', NOW(), NOW()),
(5, 'First Exhibit', 'arc', NULL, 'STANDARD', 1, 'planned', 'Miniatures are the exhibits. Schema mismatch. Classification failure as a finding.', NOW(), NOW()),
(6, 'Classifying - backlog unit 001', 'classifying', 'A', 'SHORT', 1, 'planned', 'First current-backlog exhibit. System pulled it - reason unknown. Designation only, classification unstable.', NOW(), NOW()),
(7, 'Behavior Cluster', 'arc', NULL, 'STANDARD', 1, 'planned', 'Squads as collective entities. Kinship logic introduced.', NOW(), NOW()),

-- WEEK 2
(8, 'Reclassification - archive file 003', 'reclassification', 'A', 'SHORT', 2, 'planned', 'Degradation heavier - file partially illegible. Older terminology conflicts with current schema.', NOW(), NOW()),
(9, 'Archive Fragment', 'arc', NULL, 'STANDARD', 2, 'planned', 'Prior Operator Trace Detected. Malerus teased by System only.', NOW(), NOW()),
(10, 'Behavior Collective - squad 001', 'behavior_collective', 'B', 'STANDARD', 2, 'planned', 'First squad exhibit. Collective entity framing. Behavioral note only - no analysis yet. Pattern: Unstable.', NOW(), NOW()),
(11, 'Archive Designation', 'arc', NULL, 'STANDARD', 2, 'planned', 'IRZA formally named. Malerus // Fragmented - first real hint. UI stabilizes slightly.', NOW(), NOW()),
(12, 'Reclassification - archive file 004', 'reclassification', 'A', 'SHORT', 2, 'planned', 'Post-designation: archive file shows old name vs new IRZA designation. Terminology conflict visible.', NOW(), NOW()),
(13, 'Collective Observation', 'arc', NULL, 'STANDARD', 2, 'planned', 'Entity Count: Inconsistent. It isn''t counting them - it''s recognising them.', NOW(), NOW()),
(14, 'Classifying - backlog unit 002', 'classifying', 'A', 'SHORT', 2, 'planned', 'System pulled this one next. Basic behavioral note now possible. Why this one, why now - unanswered.', NOW(), NOW()),

-- WEEK 3
(15, 'Reclassification - archive file 005', 'reclassification', 'A', 'SHORT', 3, 'planned', 'Archive file has a threat classification - current system can''t verify it. Flagged as unconfirmed.', NOW(), NOW()),
(16, 'Structural Inconsistency', 'arc', NULL, 'STANDARD', 3, 'planned', 'Engineering Layer: Absent. Archive knows what it sees, not how it functions. Engineer foreshadowed.', NOW(), NOW()),
(17, 'System Alert - containment flag 001', 'system_alert', 'D', 'STANDARD', 3, 'planned', 'System flags something without explanation. High instability UI. No analysis - just the flag and what they can see.', NOW(), NOW()),
(18, 'Cultural Misread', 'arc', NULL, 'STANDARD', 3, 'planned', 'Curator corrects System live. Threat Level: Contextual. Archive Specialization Gap Detected.', NOW(), NOW()),
(19, 'Grunt Work - field note 001', 'grunt_work', 'A', 'SHORT', 3, 'planned', 'Muscle POV. Reacting to whatever the System just put in front of them. No analysis, just the human response.', NOW(), NOW()),
(20, 'Unauthorized Signal', 'arc', NULL, 'STANDARD', 3, 'planned', 'Something outside the archive is watching. Archive Request: Specialized Personnel. Major escalation.', NOW(), NOW()),
(21, 'Copycat - unauthorized signal 001', 'copycat', 'F', 'STANDARD', 3, 'planned', 'First Copycat episode, unlocked by Arc 20. UI being overwritten. Different visual register entirely.', NOW(), NOW()),

-- WEEK 4
(22, 'Arrival: The Engineer', 'arc', NULL, 'STANDARD', 4, 'planned', 'Request fulfilled. System Integrity: 41%. "It has survived." Engineer analysis now possible.', NOW(), NOW()),
(23, 'Engineer Analysis - structural review 001', 'engineer_analysis', 'A', 'STANDARD', 4, 'planned', 'First exhibit with Engineer layer. Conflicts with Curator''s read. Engineer proves his value immediately.', NOW(), NOW()),
(24, 'First Technical Analysis', 'arc', NULL, 'STANDARD', 4, 'planned', '"I understand why the archive was confused." Unresolved: biological layer still missing.', NOW(), NOW()),
(25, 'Reclassification - archive file 006', 'reclassification', 'A', 'SHORT', 4, 'planned', 'Engineer reviews an archive file. His analysis conflicts with Malerus-era terminology. First specialist reclassification.', NOW(), NOW()),
(26, 'Arrival: The Biologist', 'arc', NULL, 'STANDARD', 4, 'planned', '"This shouldn''t exist. The biology alone—" Biological Layer: Restored. Team is now four.', NOW(), NOW()),
(27, 'Biologist Analysis - specimen 001', 'biologist_analysis', 'A', 'STANDARD', 4, 'planned', 'First exhibit with Biologist layer. Wonder before precision. First four-voice record.', NOW(), NOW()),
(28, 'Reclassification Event', 'arc', NULL, 'STANDARD', 4, 'planned', 'Payoff to Arc 05. Schema updated. All four voices clash productively. New exhibit types now available.', NOW(), NOW()),
(29, 'Classifying - backlog unit 003', 'classifying', 'A', 'STANDARD', 4, 'planned', 'First fully-staffed classifying episode. All four voices possible. Fuller record than any prior C- episode.', NOW(), NOW()),
(30, 'Archive Expansion', 'arc', NULL, 'STANDARD', 4, 'planned', 'Reality Stability: Unknown. "I don''t think that''s a status update. I think that''s an admission." Month close.', NOW(), NOW());
