-- Sound Library table
create table sounds (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  intensity_level text,           -- 'Low' | 'Medium' | 'High'
  character text,                 -- for CHARACTER SIGNATURES category
  status text not null default 'unfound', -- 'unfound' | 'found' | 'licensed' | 'local'
  freesound_id text,
  freesound_url text,
  local_filename text,
  license text,
  duration_seconds numeric,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sounds enable row level security;

create policy "allow_all_sounds"
  on sounds for all
  to anon, authenticated
  using (true)
  with check (true);

-- Seed: FACILITY BED
insert into sounds (category, name, status, sort_order) values
  ('FACILITY BED', 'Institutional Hum', 'local', 10),
  ('FACILITY BED', 'Resonant Drone', 'unfound', 20),
  ('FACILITY BED', 'Cyberpunk Ambient Loop', 'unfound', 30),
  ('FACILITY BED', 'Ritual Drone', 'unfound', 40),
  ('FACILITY BED', 'Server Room Ambience', 'unfound', 50),
  ('FACILITY BED', 'Distant Machinery Hum', 'unfound', 60);

-- Seed: SYSTEM UI
insert into sounds (category, name, status, sort_order) values
  ('SYSTEM UI', 'Scan Initiation Tone', 'unfound', 10),
  ('SYSTEM UI', 'Scan Completion Tone', 'unfound', 20),
  ('SYSTEM UI', 'Classification Lock', 'unfound', 30),
  ('SYSTEM UI', 'Classification Update / Reclassify', 'unfound', 40),
  ('SYSTEM UI', 'Data Processing Loop', 'unfound', 50),
  ('SYSTEM UI', 'System Alert', 'unfound', 60),
  ('SYSTEM UI', 'Instability Alert', 'unfound', 70),
  ('SYSTEM UI', 'UI Element Appear', 'unfound', 80),
  ('SYSTEM UI', 'UI Element Dismiss', 'unfound', 90),
  ('SYSTEM UI', 'Data Input / Typing', 'unfound', 100);

-- Seed: GLITCH / INSTABILITY
insert into sounds (category, name, intensity_level, status, sort_order) values
  ('GLITCH / INSTABILITY', 'Signal Flutter', 'Low', 'unfound', 10),
  ('GLITCH / INSTABILITY', 'Data Corruption Tick', 'Low', 'unfound', 20),
  ('GLITCH / INSTABILITY', 'Short Glitch Burst', 'Medium', 'unfound', 30),
  ('GLITCH / INSTABILITY', 'Audio Dropout', 'Medium', 'unfound', 40),
  ('GLITCH / INSTABILITY', 'Pitch Shift Glitch', 'Medium', 'unfound', 50),
  ('GLITCH / INSTABILITY', 'Extended Corruption', 'High', 'unfound', 60),
  ('GLITCH / INSTABILITY', 'System Stutter Loop', 'High', 'unfound', 70),
  ('GLITCH / INSTABILITY', 'Full Signal Collapse', 'High', 'unfound', 80);

-- Seed: TRANSITIONS
insert into sounds (category, name, status, sort_order) values
  ('TRANSITIONS', 'Facility Power-On', 'unfound', 10),
  ('TRANSITIONS', 'Hard Cut Whoosh', 'unfound', 20),
  ('TRANSITIONS', 'Archive Access Tone', 'unfound', 30),
  ('TRANSITIONS', 'Signal Lock', 'unfound', 40),
  ('TRANSITIONS', 'Fade to Static', 'unfound', 50),
  ('TRANSITIONS', 'Deep Thud / Impact', 'unfound', 60);

-- Seed: CHARACTER SIGNATURES
insert into sounds (category, name, character, status, sort_order) values
  ('CHARACTER SIGNATURES', 'Curator Presence Tone', 'Curator', 'unfound', 10),
  ('CHARACTER SIGNATURES', 'System Activation', 'The System', 'unfound', 20),
  ('CHARACTER SIGNATURES', 'Muscle Foley', 'The Muscle', 'unfound', 30),
  ('CHARACTER SIGNATURES', 'Copycat Feed Interrupt', 'The Copycat', 'unfound', 40);

-- Seed: ANOMALY / THREAT
insert into sounds (category, name, intensity_level, status, sort_order) values
  ('ANOMALY / THREAT', 'Low Threat Presence', 'Low', 'unfound', 10),
  ('ANOMALY / THREAT', 'Medium Threat Vocalization', 'Medium', 'unfound', 20),
  ('ANOMALY / THREAT', 'High Threat Environmental Response', 'High', 'unfound', 30),
  ('ANOMALY / THREAT', 'Reality Signature Sound', null, 'unfound', 40);
