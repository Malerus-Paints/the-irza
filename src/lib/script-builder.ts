import type { Exhibit, Faction, Anomaly } from '../types'

// ── Constants ─────────────────────────────────────────────────────────────────

export const LAYOUTS = [
  { value: 'exhibit',          label: 'Exhibit',          color: '#5ED9FF', note: 'Cyan — standard archive observation' },
  { value: 'collective',       label: 'Collective',       color: '#F5C842', note: 'Amber — squad/behavioral cluster' },
  { value: 'reclassification', label: 'Reclassification', color: '#F5C842', note: 'Amber→Cyan — data swap at dataSwapAt' },
  { value: 'dossier',          label: 'Dossier',          color: '#C4A96A', note: 'Bronze — faction overview, multi-photo' },
  { value: 'duty_log',         label: 'Duty Log',         color: '#C4622D', note: 'Rust — field ops / Muscle POV' },
  { value: 'engineer',         label: 'Engineer',         color: '#2EC4B6', note: 'Teal — structural analysis' },
  { value: 'biologist',        label: 'Biologist',        color: '#7DBF2E', note: 'Green — biological specimen' },
  { value: 'system_alert',     label: 'System Alert',     color: '#D94F4F', note: 'Red — containment breach' },
  { value: 'copycat',          label: 'Copycat',          color: '#A8B8B0', note: 'Purple — unauthorized signal' },
  { value: 'wanderer',         label: 'Wanderer',         color: '#B8A9C9', note: 'Violet — outer perimeter' },
  { value: 'anomaly',          label: 'Anomaly',          color: '#5ED9FF', note: 'Cyan — unclassified entity' },
] as const

export const CAMERA_MOVES = [
  'OBSERVATION_PUSH',
  'ARCHIVE_HOLD',
  'DRIFT_LEFT',
  'REVEAL_PUSH',
  'SPECIMEN_SCAN',
  'DETAIL_CREEP',
  'DETAIL_SCAN_UP',
] as const

export const SPEAKERS = [
  { value: 'curator',   label: 'CURATOR',   color: '#F2E9DC' },
  { value: 'muscle',    label: 'MUSCLE',    color: '#FFFFFF' },
  { value: 'system',    label: 'SYSTEM',    color: '#66FF99' },
  { value: 'engineer',  label: 'ENGINEER',  color: '#5ED9FF' },
  { value: 'biologist', label: 'BIOLOGIST', color: '#F5C842' },
  { value: 'copycat',   label: 'COPYCAT',   color: '#A8B8B0' },
  { value: 'wanderer',  label: 'WANDERER',  color: '#B8A9C9' },
] as const

export const GLITCH_INTENSITIES = ['none', 'minor', 'moderate', 'heavy', 'cut'] as const

export const SYSTEMUI_VARIANTS = [
  { value: 'lore_text',            label: 'Lore Text',            note: 'Dims photo, shows centered lore text' },
  { value: 'status_bar',           label: 'Status Bar',           note: 'Inline status label top-left' },
  { value: 'classification_panel', label: 'Classification Panel', note: 'Classification overlay (arc)' },
  { value: 'scan_overlay',         label: 'Scan Overlay',         note: 'Horizontal scan line' },
  { value: 'boot',                 label: 'Boot (DL)',            note: 'Duty Log — system boot block lower-left' },
  { value: 'status',               label: 'Status (DL)',          note: 'Duty Log — dot-label upper-left' },
  { value: 'error',                label: 'Error (DL)',           note: 'Duty Log — large centered error' },
] as const

export const AUDIO_PRESETS = [
  { value: 'atmStandard', label: 'atmStandard — Main ambient bed (exhibit / arc)' },
  { value: 'atmOrganic',  label: 'atmOrganic — Organic/drone variant (dossier / duty_log)' },
  { value: 'none',        label: 'None — manual cues only' },
] as const

export const COMMON_AUDIO_CUES = [
  { id: 'UI_SCAN_INITIATION',     note: 'Exhibit/dossier open — HUD boot' },
  { id: 'UI_CLASSIFICATION_LOCK', note: 'System stamp / data lock' },
  { id: 'UI_DATA_SWAP',           note: 'Reclassification data swap ping' },
  { id: 'GLITCH_HIT',             note: 'Glitch burst' },
  { id: 'SYSTEM_ALERT_STAB',      note: 'System alert episodes' },
] as const

// ── State types ───────────────────────────────────────────────────────────────

export interface ShotEntry {
  id: string
  from: number
  to: number
  description: string
  move: string
  photo: string
}

export interface DialogueEntry {
  id: string
  speaker: string
  text: string
  from: number
  to: number
  cps: number
}

export interface UIEventEntry {
  id: string
  variant: string
  text: string
  from: number
  to: number
}

export interface GlitchEntry {
  id: string
  from: number
  to: number
  intensity: string
  note: string
}

export interface AudioCueEntry {
  id: string
  cueId: string
  from: number
  note: string
}

export interface InfoRow {
  key: string
  value: string
}

export interface BuilderState {
  _v: 'builder_v1'
  layout: string
  code: string
  durationSeconds: number
  statusBarTitle: string
  statusBarStatus: string
  statusNode: string
  exhibit_id: string
  faction_id: string
  anomaly_id: string
  infoCardLabel: string
  infoCardRows: InfoRow[]
  miniBadgeTitle: string
  miniBadgeCode: string
  tickStripLabel: string
  dataSwapAt: number
  shots: ShotEntry[]
  dialogue: DialogueEntry[]
  systemUI: UIEventEntry[]
  glitch: GlitchEntry[]
  audioPreset: string
  audioCues: AudioCueEntry[]
  caption: string
  notes: string
}

// ── Constructors ──────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function defaultBuilderState(): BuilderState {
  return {
    _v: 'builder_v1',
    layout: 'exhibit',
    code: '',
    durationSeconds: 28,
    statusBarTitle: 'OBSERVATION: ACTIVE',
    statusBarStatus: 'ARCHIVE: LIVE',
    statusNode: 'ARCHIVE NODE',
    exhibit_id: '',
    faction_id: '',
    anomaly_id: '',
    infoCardLabel: 'EXHIBIT #000',
    infoCardRows: [
      { key: 'CLASS',        value: 'UNCLASSIFIED' },
      { key: 'THREAT LEVEL', value: 'INDETERMINATE' },
      { key: 'FACTION',      value: 'UNKNOWN' },
      { key: 'STATUS',       value: 'ACTIVE' },
    ],
    miniBadgeTitle: 'STATUS\nPENDING',
    miniBadgeCode: 'X_001',
    tickStripLabel: 'ARCHIVE FOOTAGE // OBSERVATION // PRIOR COLLECTION DATE: [REDACTED]',
    dataSwapAt: 0,
    shots: [],
    dialogue: [],
    systemUI: [],
    glitch: [],
    audioPreset: 'atmStandard',
    audioCues: [],
    caption: '',
    notes: '',
  }
}

export function loadBuilderState(json: unknown): BuilderState {
  if (json && typeof json === 'object' && (json as Record<string, unknown>)._v === 'builder_v1') {
    return json as BuilderState
  }
  return defaultBuilderState()
}

export function newShot(from = 0, to = 10): ShotEntry {
  return { id: uid(), from, to, description: '', move: 'OBSERVATION_PUSH', photo: '' }
}

export function newDialogue(from = 1, to = 5): DialogueEntry {
  return { id: uid(), speaker: 'curator', text: '', from, to, cps: 22 }
}

export function newUIEvent(from = 0, to = 8): UIEventEntry {
  return { id: uid(), variant: 'lore_text', text: '', from, to }
}

export function newGlitch(from = 0, to = 0.5): GlitchEntry {
  return { id: uid(), from, to, intensity: 'minor', note: '' }
}

export function newAudioCue(from = 0.5): AudioCueEntry {
  return { id: uid(), cueId: 'UI_SCAN_INITIATION', from, note: '' }
}

// ── Auto-fill from DB records ──────────────────────────────────────────────────

type CardPatch = Pick<BuilderState, 'infoCardLabel' | 'infoCardRows' | 'miniBadgeCode' | 'tickStripLabel'>

export function exhibitToCard(exhibit: Exhibit): CardPatch {
  const num = exhibit.exhibit_number ?? '000'
  return {
    infoCardLabel: `EXHIBIT #${num} — ${exhibit.name.toUpperCase()}`,
    infoCardRows: [
      { key: 'EXHIBIT ID',   value: `#${num}` },
      { key: 'THREAT LEVEL', value: exhibit.threat_level ?? 'INDETERMINATE' },
      { key: 'FACTION',      value: exhibit.faction?.name?.toUpperCase() ?? 'UNKNOWN' },
      { key: 'STATUS',       value: exhibit.archive_status },
    ],
    miniBadgeCode: `E_${num}`,
    tickStripLabel: `ARCHIVE FOOTAGE // EXHIBIT #${num} // PRIOR COLLECTION DATE: [REDACTED]`,
  }
}

export function factionToCard(faction: Faction): CardPatch {
  return {
    infoCardLabel: `FACTION ${faction.faction_id} — ${faction.name.toUpperCase()}`,
    infoCardRows: [
      { key: 'FACTION ID',   value: faction.faction_id },
      { key: 'DOMAIN',       value: faction.domain?.toUpperCase() ?? 'UNKNOWN' },
      { key: 'THREAT LEVEL', value: faction.threat_level ?? 'INDETERMINATE' },
      { key: 'STATUS',       value: faction.system_status },
    ],
    miniBadgeCode: faction.faction_id.replace('-', '_'),
    tickStripLabel: `FACTION ARCHIVE // ${faction.faction_id} // PRIOR COLLECTION DATE: [REDACTED]`,
  }
}

export function anomalyToCard(anomaly: Anomaly): CardPatch {
  return {
    infoCardLabel: `ANOMALY ${anomaly.anomaly_id} — ${anomaly.designation.toUpperCase()}`,
    infoCardRows: [
      { key: 'ANOMALY ID',   value: anomaly.anomaly_id },
      { key: 'ORIGIN CLASS', value: anomaly.origin_classification },
      { key: 'THREAT LEVEL', value: anomaly.threat_level ?? 'INDETERMINATE' },
      { key: 'DOMAIN',       value: anomaly.domain?.toUpperCase() ?? 'UNKNOWN' },
    ],
    miniBadgeCode: anomaly.anomaly_id.replace('-', '_'),
    tickStripLabel: `ANOMALY ARCHIVE // ${anomaly.anomaly_id} // PRIOR COLLECTION DATE: [REDACTED]`,
  }
}

// ── TypeScript file generator ──────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

export function generateTS(state: BuilderState): string {
  const D = state.durationSeconds

  const audioImport =
    state.audioPreset === 'atmStandard' ? "import { atmStandard } from '../../lib/audio-presets'"
    : state.audioPreset === 'atmOrganic' ? "import { atmOrganic } from '../../lib/audio-presets'"
    : ''

  const audioBody: string[] = []
  if (state.audioPreset === 'atmStandard') audioBody.push('    ...atmStandard(DURATION),')
  else if (state.audioPreset === 'atmOrganic') audioBody.push('    ...atmOrganic(DURATION),')
  state.audioCues.forEach(c => {
    audioBody.push(`    { id: '${esc(c.cueId)}', from: ${c.from}${c.note ? `, note: '${esc(c.note)}'` : ''} },`)
  })

  const shotsStr = state.shots.length
    ? state.shots.map(s =>
        `    { from: ${s.from}, to: ${s.to}, description: '${esc(s.description)}', move: '${s.move}', photo: '${esc(s.photo)}' },`
      ).join('\n')
    : '    // { from: 0, to: DURATION, description: \'\', move: \'OBSERVATION_PUSH\', photo: \'Mini Photos/...\' },'

  const dialogueStr = state.dialogue.length
    ? state.dialogue.map(d =>
        `    { speaker: '${d.speaker}', text: '${esc(d.text)}', from: ${d.from}, to: ${d.to}${d.cps !== 22 ? `, cps: ${d.cps}` : ''} },`
      ).join('\n')
    : '    // { speaker: \'curator\', text: \'...\', from: 1, to: 5 },'

  const systemUIStr = state.systemUI.length
    ? state.systemUI.map(e =>
        `    { text: '${esc(e.text)}', from: ${e.from}, to: ${e.to}, variant: '${e.variant}' },`
      ).join('\n')
    : '    // { text: \'...\', from: 12, to: 20, variant: \'lore_text\' },'

  const glitchStr = state.glitch.length
    ? state.glitch.map(g =>
        `    { from: ${g.from}, to: ${g.to}, intensity: '${g.intensity}'${g.note ? `, note: '${esc(g.note)}'` : ''} },`
      ).join('\n')
    : `    { from: 0, to: 0.5, intensity: 'minor', note: 'Hook flicker' },\n    { from: DURATION - 1, to: DURATION, intensity: 'cut', note: 'Closing glitch-cut' },`

  const infoRows = state.infoCardRows
    .map(r => `      ['${esc(r.key)}', '${esc(r.value)}'],`)
    .join('\n')

  const dataSwapLine = state.layout === 'reclassification' && state.dataSwapAt > 0
    ? `\n  dataSwapAt: ${state.dataSwapAt},`
    : ''

  const captionBlock = state.caption.trim()
    ? `\n  caption: '${esc(state.caption)}',`
    : ''

  const notesBlock = state.notes.trim()
    ? `\n  notes: [\n${state.notes.split('\n').filter(Boolean).map(n => `    '${esc(n.trim())}',`).join('\n')}\n  ],`
    : ''

  return `// Place this file in src/scenes/[category]/[name].ts
// Adjust the relative import paths if your file depth differs from two levels.

import type { Episode } from '../../data/types'
${audioImport ? audioImport + '\n' : ''}
const DURATION = ${D}

const episode: Episode = {
  id:     9999,  // ← assign next ID in your series (r=1000s, c=2000s, b=3000s, fd=4000s, dl=5000s)
  code:   '${esc(state.code)}',
  layout: '${state.layout}',
  slug:   'episode-slug',
  title:  'UNTITLED',
  runtimeClass: 'SHORT',
  runtimeRange: [20, 35],
  durationSeconds: DURATION,

  setup: {
    miniature: '',
    backdrop:  'Black void.',
    lighting:  'Directional side lighting.',
  },

  statusBarTitle:  '${esc(state.statusBarTitle)}',
  statusBarStatus: '${esc(state.statusBarStatus)}',
  statusNode:      '${esc(state.statusNode)}',${dataSwapLine}

  infoCard: {
    label: '${esc(state.infoCardLabel)}',
    rows: [
${infoRows}
    ],
  },
  miniBadge: { title: '${esc(state.miniBadgeTitle)}', code: '${esc(state.miniBadgeCode)}', width: 280 },
  tickStripLabel: '${esc(state.tickStripLabel)}',

  shots: [
${shotsStr}
  ],

  dialogue: [
${dialogueStr}
  ],

  systemUI: [
${systemUIStr}
  ],

  glitch: [
${glitchStr}
  ],

  audio: [
${audioBody.join('\n')}
  ],
${captionBlock}${notesBlock}
}

export default episode
`
}
