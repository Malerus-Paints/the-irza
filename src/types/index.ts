// ─── Status Types ────────────────────────────────────────────────────────────

export type EntryStatus = 'drafted' | 'canon-locked' | 'needs-lore' | 'published'
export type ArchiveStatus = 'UNCLASSIFIED' | 'ACTIVE' | 'ARCHIVED' | 'SCHEMA MISMATCH'
export type ThreatLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'UNRESOLVABLE'
export type OriginRealityStatus = 'unknown' | 'collapsed' | 'collapsing' | 'stable'
export type EpisodeStatus = 'planned' | 'scripted' | 'filmed' | 'posted'
export type RuntimeClass = 'SHORT' | 'STANDARD' | 'EVENT'
export type EpisodePreset = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

// ─── Registry Types ───────────────────────────────────────────────────────────

export interface Faction {
  id: string
  faction_id: string           // e.g. F-001
  name: string
  domain: string | null        // Anomalous / Bio / Synthetic
  threat_level: ThreatLevel | null
  behavioral_classification: string | null
  collective_or_individual: 'Collective' | 'Individual' | null
  system_status: string
  exhibits_catalogued: number
  origin_reality_status: OriginRealityStatus
  lore_text: string | null
  drive_doc_id: string | null
  drive_doc_url: string | null
  notes: string | null
  status: EntryStatus
  created_at: string
  updated_at: string
}

export interface Squad {
  id: string
  squad_id: string             // e.g. S-001
  name: string
  faction_id: string | null
  faction?: Pick<Faction, 'id' | 'faction_id' | 'name'>
  squad_role: 'VANGUARD' | 'RECON' | 'HEAVY' | 'RITUAL' | 'COMMAND' | 'SUPPORT' | 'UNKNOWN'
  domain: string | null
  threat_level: ThreatLevel | null
  collective_behavior_type: string | null
  system_status: string
  lore_text: string | null
  drive_doc_id: string | null
  drive_doc_url: string | null
  status: EntryStatus
  created_at: string
  updated_at: string
}

export interface Exhibit {
  id: string
  exhibit_number: string | null // e.g. "001"
  name: string
  archive_status: ArchiveStatus
  faction_id: string | null
  faction?: Pick<Faction, 'id' | 'faction_id' | 'name'>
  squad_id: string | null
  squad?: Pick<Squad, 'id' | 'squad_id' | 'name'>
  domain: string | null
  threat_level: ThreatLevel | null
  behavioral_pattern: string | null
  miniature_name: string | null
  paint_scheme: string | null
  base_size: string | null
  episode_type: string | null
  runtime_class: RuntimeClass | null
  preset: EpisodePreset | null
  episode_number: number | null
  filmed: boolean
  posted_date: string | null
  platform: string | null
  lore_text: string | null
  curator_interpretation: string | null
  engineer_assessment: string | null
  biologist_assessment: string | null
  origin_reality_status: OriginRealityStatus
  backlog_release: boolean
  drive_doc_id: string | null
  drive_doc_url: string | null
  status: EntryStatus
  created_at: string
  updated_at: string
}

export interface Anomaly {
  id: string
  anomaly_id: string           // e.g. A-001
  designation: string
  origin_classification: 'UNKNOWN' | 'FRACTURED' | 'SELF-CONTAINED' | 'ECHO'
  domain: string | null
  threat_level: ThreatLevel | null
  behavioral_pattern: string | null
  collective_or_individual: 'Collective' | 'Individual' | null
  system_status: string
  reality_signature: string | null
  episode_number: number | null
  filmed: boolean
  posted_date: string | null
  platform: string | null
  lore_text: string | null
  drive_doc_id: string | null
  drive_doc_url: string | null
  status: EntryStatus
  created_at: string
  updated_at: string
}

export interface Episode {
  id: string
  episode_number: number | null
  title: string
  episode_type: string | null
  preset: EpisodePreset | null
  runtime_class: RuntimeClass | null
  phase: number
  exhibit_id: string | null
  exhibit?: { id: string; name: string; miniature_name: string | null } | null
  squad_id: string | null
  faction_id: string | null
  anomaly_id: string | null
  script_text: string | null
  filmed: boolean
  posted_date: string | null
  platform: string | null
  status: EpisodeStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LoreTemplate {
  id: string
  name: string
  template_type: 'faction' | 'squad' | 'exhibit' | 'anomaly' | 'episode'
  prompt_template: string
  context_fields: string[] | null
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const THREAT_LEVEL_COLORS: Record<string, string> = {
  NONE: 'text-[#4a9e6b]',
  LOW: 'text-[#7bc47a]',
  MODERATE: 'text-[#e8b84b]',
  HIGH: 'text-[#e86b3a]',
  UNRESOLVABLE: 'text-[#cc3355]',
}

export const STATUS_LABELS: Record<EntryStatus, string> = {
  'drafted': 'DRAFTED',
  'canon-locked': 'CANON LOCKED',
  'needs-lore': 'NEEDS LORE',
  'published': 'PUBLISHED',
}

export const STATUS_COLORS: Record<EntryStatus, string> = {
  'drafted': 'bg-archive-700 text-archive-300',
  'canon-locked': 'bg-system-400/20 text-system-300',
  'needs-lore': 'bg-threat-moderate/20 text-[#e8b84b]',
  'published': 'bg-engineer-400/20 text-engineer-300',
}

// ─── Sound Library ────────────────────────────────────────────────────────────

export type SoundStatus = 'unfound' | 'found' | 'licensed' | 'local'

export interface Sound {
  id: string
  category: string
  name: string
  intensity_level: string | null
  character: string | null
  status: SoundStatus
  freesound_id: string | null
  freesound_url: string | null
  local_filename: string | null
  license: string | null
  duration_seconds: number | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export const SOUND_STATUS_LABELS: Record<SoundStatus, string> = {
  unfound: 'UNFOUND',
  found: 'LOCATED',
  licensed: 'LICENSED',
  local: 'IN ARCHIVE',
}

export const SOUND_STATUS_COLORS: Record<SoundStatus, string> = {
  unfound: 'bg-archive-700 text-archive-400',
  found: 'bg-[#e8b84b]/15 text-[#e8b84b]',
  licensed: 'bg-engineer-400/20 text-engineer-300',
  local: 'bg-system-400/20 text-system-300',
}

export const SOUND_CATEGORIES = [
  'FACILITY BED',
  'SYSTEM UI',
  'GLITCH / INSTABILITY',
  'TRANSITIONS',
  'CHARACTER SIGNATURES',
  'ANOMALY / THREAT',
] as const

export const EPISODE_TYPE_LABELS: Record<string, string> = {
  'A': 'Exhibit Record',
  'B': 'Behavioral Cluster',
  'C': 'Cultural Analysis',
  'D': 'System Classification',
  'E': 'Archive Recovery',
  'F': 'Unauthorized Signal',
}
