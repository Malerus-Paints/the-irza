import { useState } from 'react'
import { useLoreTemplates, useFactions, useSquads, useExhibits, useUpdateExhibit, useUpdateFaction, useExhibitPhotos } from '../hooks/useData'
import { getExhibitPhotoPublicUrl } from '../lib/api'
import { Spinner, PageHeader, Card, Button, Textarea, Select } from '../components/ui'
import type { LoreTemplate, Faction, Exhibit } from '../types'

type Mode = 'template' | 'full-army'

interface ParsedLore {
  lore_text?: string
  curator_interpretation?: string
  engineer_assessment?: string
  biologist_assessment?: string
  wanderer_assessment?: string
  muscle_assessment?: string
  footnotes?: string
}

const LORE_SECTIONS: Array<{ pattern: RegExp; field: keyof ParsedLore }> = [
  { pattern: /^BEHAVIORAL NOTES\s*:/im,                          field: 'lore_text' },
  { pattern: /^CURATOR INTERPRETATION\s*:/im,                    field: 'curator_interpretation' },
  { pattern: /^ENGINEER (?:ASSESSMENT|CONCLUSION|NOTE)\s*:/im,   field: 'engineer_assessment' },
  { pattern: /^BIOLOGIST (?:ASSESSMENT|NOTE)\s*:/im,             field: 'biologist_assessment' },
  { pattern: /^WANDERER (?:ASSESSMENT|OBSERVATION|NOTE)\s*:/im,  field: 'wanderer_assessment' },
  { pattern: /^MUSCLE (?:ASSESSMENT|REACTION)\s*:/im,            field: 'muscle_assessment' },
  { pattern: /^(?:WANDERER )?FOOTNOTES?\s*:/im,                  field: 'footnotes' },
]

const LORE_FIELDS: { key: keyof ParsedLore; abbrev: string; label: string }[] = [
  { key: 'lore_text',               abbrev: 'B', label: 'BEHAVIORAL NOTES' },
  { key: 'curator_interpretation',  abbrev: 'C', label: 'CURATOR' },
  { key: 'engineer_assessment',     abbrev: 'E', label: 'ENGINEER' },
  { key: 'biologist_assessment',    abbrev: 'I', label: 'BIOLOGIST' },
  { key: 'wanderer_assessment',     abbrev: 'W', label: 'WANDERER' },
  { key: 'muscle_assessment',       abbrev: 'M', label: 'MUSCLE' },
  { key: 'footnotes',               abbrev: 'F', label: 'FOOTNOTES' },
]

const FIELD_LABELS: Record<keyof ParsedLore, string> = {
  lore_text: 'BEHAVIORAL NOTES',
  curator_interpretation: 'CURATOR INTERPRETATION',
  engineer_assessment: 'ENGINEER ASSESSMENT',
  biologist_assessment: 'BIOLOGIST ASSESSMENT',
  wanderer_assessment: 'WANDERER ASSESSMENT',
  muscle_assessment: 'MUSCLE ASSESSMENT',
  footnotes: 'FOOTNOTES',
}

// ─── Single-exhibit lore parser ───────────────────────────────────────────────

function parseLoreResponse(text: string): ParsedLore {
  const matches: Array<{ index: number; end: number; field: keyof ParsedLore }> = []

  for (const { pattern, field } of LORE_SECTIONS) {
    const match = pattern.exec(text)
    if (match) {
      matches.push({ index: match.index, end: match.index + match[0].length, field })
    }
  }

  matches.sort((a, b) => a.index - b.index)

  const result: ParsedLore = {}
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].end
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    const raw = text.slice(start, end)
    const cleaned = raw
      .replace(/^[═\-=─\s]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    if (cleaned) result[matches[i].field] = cleaned
  }

  return result
}

// ─── Faction-wide lore parser ─────────────────────────────────────────────────

function parseFactionLoreResponse(text: string): Record<string, ParsedLore> {
  const result: Record<string, ParsedLore> = {}
  // Split on --- separator lines
  const blocks = text.split(/\n?---+\n/)
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    const nameMatch = trimmed.match(/^\[([^\]]+)\]/)
    if (!nameMatch) continue
    const name = nameMatch[1].trim()
    const rest = trimmed.slice(nameMatch[0].length)
    const lore = parseLoreResponse(rest)
    if (Object.keys(lore).length > 0) {
      result[name] = lore
    }
  }
  return result
}

// ─── Step 1: Dialogue + Behavioral Notes brief ───────────────────────────────

function buildStep1BriefPrompt(faction: Faction, members: Exhibit[]): string {
  const needs = members.filter(e => !e.lore_text?.trim())
  if (needs.length === 0) {
    return '// All exhibits already have behavioral notes — proceed to Step 2.'
  }

  const roster = needs.map((e, i) => {
    const name = e.miniature_name ?? e.name ?? 'UNDESIGNATED'
    const details = [
      e.paint_scheme  && `Paint scheme: ${e.paint_scheme}`,
      e.base_size     && `Base: ${e.base_size}`,
      e.behavioral_pattern && `Known pattern: ${e.behavioral_pattern}`,
    ].filter(Boolean).join('\n   ')
    return `${i + 1}. ${name}${details ? `\n   ${details}` : ''}`
  }).join('\n\n')

  return `You are generating initial behavioral briefs for ${needs.length} IRZA specimen${needs.length !== 1 ? 's' : ''} from ${faction.faction_id} — ${faction.name.toUpperCase()}. This is Step 1: establish the behavioral foundation and team first-contact reactions. Step 2 will use these as context for full character assessments.

CANON RULES:
- Never call entities "miniatures" — always "entities", "specimens", or "exhibits"
- The true premise (archive is an ARK for collapsing realities) is NEVER stated directly
- Curator: metaphor over fact, weighted conclusions, never states directly
- Engineer: clinical, functional, precise — numbers and observations
- Biologist: wonder + precision, scientific awe, slightly fast delivery
- Muscle: reactive, casual, says what the audience is thinking
- Wanderer: irregular rhythm, uncertain, something finding its position

FACTION: ${faction.faction_id} — ${faction.name.toUpperCase()}
Domain: ${faction.domain ?? 'UNCLASSIFIED'} | Threat: ${faction.threat_level ?? 'UNCLASSIFIED'}
Behavioral Classification: ${faction.behavioral_classification ?? 'UNCLASSIFIED'}
${faction.lore_text?.trim() ? `\n${faction.lore_text.trim()}\n` : ''}
════════════════════════════════════════
NEW SPECIMENS — ${needs.length} REQUIRING INITIAL BRIEF
════════════════════════════════════════

${roster}

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════

For each specimen, write a brief that anchors their behavioral presence. The Dialogue Sketch captures team first-contact reactions. Behavioral Notes become the foundation for all other lore in Step 2.

---
[SPECIMEN NAME]

DIALOGUE SKETCH:
ENGINEER: [one clinical observation — measurement, structural reading, containment note]
BIOLOGIST: [one observation of living strangeness — what makes this specimen biologically remarkable]
MUSCLE: [gut reaction — one casual line, slightly alarmed or grudgingly impressed]

BEHAVIORAL NOTES:
[2-3 sentences — observable patterns, movement, response to containment. Clinical but loaded with implication. This is the foundation everything else builds from.]
---

Generate all ${needs.length} specimen${needs.length !== 1 ? 's' : ''}. Keep character voices consistent with the faction's nature. Behavioral notes should read like field records — precise but hinting at something larger.`
}

// ─── Step 2: Full assessments (skip filled, use behavioral context) ───────────

function buildStep2AssessmentsPrompt(faction: Faction, members: Exhibit[]): string {
  type SpecData = { exhibit: Exhibit; name: string; missing: string[] }
  const specs: SpecData[] = []

  for (const e of members) {
    const name = e.miniature_name ?? e.name ?? 'UNDESIGNATED'
    const missing: string[] = []
    if (!e.curator_interpretation?.trim()) missing.push('CURATOR INTERPRETATION')
    if (!e.engineer_assessment?.trim())    missing.push('ENGINEER ASSESSMENT')
    if (!e.biologist_assessment?.trim())   missing.push('BIOLOGIST ASSESSMENT')
    if (!e.wanderer_assessment?.trim())    missing.push('WANDERER OBSERVATION')
    if (!e.muscle_assessment?.trim())      missing.push('MUSCLE REACTION')
    if (!e.footnotes?.trim())             missing.push('FOOTNOTES')
    if (missing.length > 0) specs.push({ exhibit: e, name, missing })
  }

  if (specs.length === 0) {
    return '// All exhibits are fully documented — no assessments needed.'
  }

  const contextLines = members
    .filter(e => e.lore_text?.trim())
    .map(e => {
      const name = e.miniature_name ?? e.name ?? 'UNDESIGNATED'
      return `${name}:\n${e.lore_text!.trim()}`
    })
  const contextBlock = contextLines.length > 0
    ? contextLines.join('\n\n')
    : '[No behavioral notes documented yet — infer from faction context and specimen names]'

  const specBlocks = specs.map(({ exhibit: e, name, missing }) => {
    return `---
[${name}]
${e.lore_text?.trim() ? `\nBEHAVIORAL FOUNDATION:\n${e.lore_text.trim()}\n` : ''}
GENERATE: ${missing.join(' | ')}`
  }).join('\n\n')

  return `You are completing IRZA exhibit records for ${specs.length} specimen${specs.length !== 1 ? 's' : ''} from ${faction.faction_id} — ${faction.name}. This is Step 2: deep character assessments. You have behavioral foundations for all faction members — use them to write assessments that reference each other where it adds depth.

CANON RULES:
- Never call entities "miniatures" — always "entities", "specimens", or "exhibits"
- The true premise is NEVER stated directly
- Curator: metaphor over fact, weighted conclusions, implies without stating. 2-3 sentences.
- Engineer: clinical, functional, precise — numbers and readings. 2-3 sentences.
- Biologist: wonder + precision, slightly fast, field observer energy. 2-3 sentences.
- Muscle: reactive, casual, says what the audience is thinking. 1-2 sentences.
- Wanderer: irregular rhythm, searching, occasionally profound by accident. 1-3 sentences.
- Footnotes: Wanderer voice, more disjointed — a fragment, a question, something felt rather than stated.

FACTION: ${faction.faction_id} — ${faction.name.toUpperCase()}
Domain: ${faction.domain ?? 'UNCLASSIFIED'} | Threat: ${faction.threat_level ?? 'UNCLASSIFIED'}
${faction.lore_text?.trim() ? `\n${faction.lore_text.trim()}\n` : ''}
════════════════════════════════════════
BEHAVIORAL CONTEXT — FULL FACTION ROSTER
════════════════════════════════════════

${contextBlock}

════════════════════════════════════════
SPECIMENS REQUIRING ASSESSMENTS — ${specs.length}
════════════════════════════════════════

${specBlocks}

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════

For each specimen, generate ONLY the sections listed after "GENERATE:". Assessments may reference other specimens by name. Match voice length guidelines above.

---
[SPECIMEN NAME]

CURATOR INTERPRETATION:
[text]

ENGINEER ASSESSMENT:
[text]

BIOLOGIST ASSESSMENT:
[text]

WANDERER OBSERVATION:
[text]

MUSCLE REACTION:
[text]

FOOTNOTES:
[text]
---

Output all ${specs.length} specimen${specs.length !== 1 ? 's' : ''}. Keep character voices consistent across the full faction.`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoreGeneratorPage() {
  const { data: templates = [], isLoading: loadingTemplates } = useLoreTemplates()
  const { data: factions = [] } = useFactions()
  const { data: squads = [] } = useSquads()
  const { data: exhibits = [] } = useExhibits()

  const [mode, setMode] = useState<Mode>('template')

  // ── Template mode state ──────────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState<LoreTemplate | null>(null)
  const [selectedExhibitId, setSelectedExhibitId] = useState('')
  const [selectedFactionId, setSelectedFactionId] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})

  // ── Full Army mode state ─────────────────────────────────────────────────────
  const [armyFactionId, setArmyFactionId] = useState('')
  const [armyStep, setArmyStep] = useState<1 | 2>(1)
  const [armyPastedResponse, setArmyPastedResponse] = useState('')
  const [armyParsedLore, setArmyParsedLore] = useState<Record<string, ParsedLore>>({})
  const [armySaveStatuses, setArmySaveStatuses] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error' | 'skipped'>>({})
  const [armySaveSkip, setArmySaveSkip] = useState<Record<string, boolean>>({})
  const [armyParseDone, setArmyParseDone] = useState(false)

  // ── Shared output state ──────────────────────────────────────────────────────
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  // ── Template mode: single-exhibit paste & save state ─────────────────────────
  const [pastedResponse, setPastedResponse] = useState('')
  const [parsedLore, setParsedLore] = useState<ParsedLore | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const updateExhibit = useUpdateExhibit()
  const updateFaction = useUpdateFaction()

  if (loadingTemplates) return <Spinner />

  // ── Template mode derived values ─────────────────────────────────────────────
  const selectedExhibit = exhibits.find((e) => e.id === selectedExhibitId)
  const selectedFaction = selectedExhibit?.faction
    ? factions.find((f) => f.id === selectedExhibit.faction?.id)
    : factions.find((f) => f.id === selectedFactionId)
  const selectedSquad = selectedExhibit?.squad_id ? squads.find((s) => s.id === selectedExhibit.squad_id) : null

  // ── Full Army derived values ──────────────────────────────────────────────────
  const armyFaction = factions.find((f) => f.id === armyFactionId) ?? null
  const armyMembers = armyFactionId
    ? exhibits.filter((e) => e.faction_id === armyFactionId || e.faction?.id === armyFactionId)
    : []
  const armyMemberIds = armyMembers.map((e) => e.id)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: armyPhotos = [] } = useExhibitPhotos(armyFactionId ? armyMemberIds : [])
  const armyPhotoUrls = armyPhotos.reduce<Record<string, string>>((acc, photo) => {
    if (photo.exhibit_id && !acc[photo.exhibit_id]) {
      acc[photo.exhibit_id] = getExhibitPhotoPublicUrl(photo.file_path)
    }
    return acc
  }, {})

  // ── Helper: fill counts ───────────────────────────────────────────────────────
  function getExhibitFillCount(e: Exhibit): number {
    return LORE_FIELDS.filter(({ key }) => (e[key as keyof Exhibit] as string | null)?.trim()).length
  }

  const armyNeedsStep1 = armyMembers.filter(e => !e.lore_text?.trim()).length
  const armyNeedsStep2 = armyMembers.filter(e =>
    !e.curator_interpretation?.trim() || !e.engineer_assessment?.trim() ||
    !e.biologist_assessment?.trim() || !e.wanderer_assessment?.trim() ||
    !e.muscle_assessment?.trim() || !e.footnotes?.trim()
  ).length

  // ── Prompt builders ───────────────────────────────────────────────────────────

  function buildTemplatePrompt() {
    if (!selectedTemplate) return

    let prompt = selectedTemplate.prompt_template

    if (selectedFaction) {
      prompt = prompt
        .replace('{{faction_name}}', selectedFaction.name)
        .replace('{{domain}}', selectedFaction.domain ?? 'UNKNOWN')
        .replace('{{threat_level}}', selectedFaction.threat_level ?? 'UNKNOWN')
        .replace('{{faction_lore}}', selectedFaction.lore_text ?? 'No lore documented yet.')
        .replace('{{behavioral_classification}}', selectedFaction.behavioral_classification ?? 'UNKNOWN')
        .replace('{{collective_or_individual}}', selectedFaction.collective_or_individual ?? 'UNKNOWN')
        .replace('{{origin_reality_status}}', selectedFaction.origin_reality_status)
        .replace('{{notes}}', selectedFaction.notes ?? 'None.')
    }

    if (selectedSquad) {
      prompt = prompt
        .replace('{{squad_name}}', selectedSquad.name)
        .replace('{{squad_role}}', selectedSquad.squad_role ?? 'UNKNOWN')
        .replace('{{squad_lore}}', selectedSquad.lore_text ?? 'No squad lore documented yet.')
        .replace('{{squad_threat_level}}', selectedSquad.threat_level ?? 'UNKNOWN')
        .replace('{{collective_behavior_type}}', selectedSquad.collective_behavior_type ?? 'UNKNOWN')
    }

    if (selectedExhibit) {
      prompt = prompt
        .replace('{{miniature_name}}', selectedExhibit.miniature_name ?? 'UNDESIGNATED')
        .replace('{{paint_scheme}}', selectedExhibit.paint_scheme ?? 'Paint scheme undocumented')
        .replace('{{base_size}}', selectedExhibit.base_size ?? 'Base size unknown')
    }

    Object.entries(customFields).forEach(([key, value]) => {
      prompt = prompt.replace(`{{${key}}}`, value)
    })

    setGeneratedPrompt(prompt)
  }

  function buildUpdatePrompt() {
    if (!selectedExhibit) return
    const name = selectedExhibit.miniature_name ?? selectedExhibit.name ?? 'UNDESIGNATED'
    const faction = selectedFaction

    const existing: string[] = []
    const missing: string[] = []

    if (selectedExhibit.lore_text?.trim()) {
      existing.push(`BEHAVIORAL NOTES:\n${selectedExhibit.lore_text.trim()}`)
    } else { missing.push('Behavioral Notes') }

    if (selectedExhibit.curator_interpretation?.trim()) {
      existing.push(`CURATOR INTERPRETATION:\n${selectedExhibit.curator_interpretation.trim()}`)
    } else { missing.push('Curator Interpretation') }

    if (selectedExhibit.engineer_assessment?.trim()) {
      existing.push(`ENGINEER ASSESSMENT:\n${selectedExhibit.engineer_assessment.trim()}`)
    } else { missing.push('Engineer Assessment') }

    if (selectedExhibit.biologist_assessment?.trim()) {
      existing.push(`BIOLOGIST ASSESSMENT:\n${selectedExhibit.biologist_assessment.trim()}`)
    } else { missing.push('Biologist Assessment') }

    if (selectedExhibit.wanderer_assessment?.trim()) {
      existing.push(`WANDERER ASSESSMENT:\n${selectedExhibit.wanderer_assessment.trim()}`)
    } else { missing.push('Wanderer Assessment') }

    if (selectedExhibit.muscle_assessment?.trim()) {
      existing.push(`MUSCLE ASSESSMENT:\n${selectedExhibit.muscle_assessment.trim()}`)
    } else { missing.push('Muscle Assessment') }

    if (selectedExhibit.footnotes?.trim()) {
      existing.push(`WANDERER FOOTNOTE:\n${selectedExhibit.footnotes.trim()}`)
    } else { missing.push('Wanderer Footnote') }

    const factionBlock = faction
      ? `FACTION CONTEXT:\n${faction.faction_id} — ${faction.name} | Domain: ${faction.domain ?? 'UNCLASSIFIED'} | Threat: ${faction.threat_level ?? 'UNCLASSIFIED'}\n${faction.lore_text?.trim() ?? ''}`
      : ''

    setGeneratedPrompt(`You are completing a partial IRZA exhibit record. Some sections have already been written — do NOT rewrite or summarize them. Generate ONLY the missing sections listed below, using the correct character voice for each.

CANON RULES:
- Never call entities "miniatures" — always "entities", "specimens", or "exhibits"
- The true premise (ark for collapsing realities) is NEVER stated directly
- Curator: metaphor over fact, weighted conclusions, never states directly
- Engineer: clinical, functional, precise — numbers and observations
- Biologist: wonder + precision, scientific awe, slightly fast delivery
- Muscle: reactive, casual, says what the audience is thinking
- Wanderer: irregular rhythm, uncertain, something finding its position
${factionBlock ? `\n${factionBlock}` : ''}

EXHIBIT: ${name}
Paint scheme: ${selectedExhibit.paint_scheme ?? 'undocumented'}

════════════════════════════════════════
ALREADY WRITTEN — do not regenerate
════════════════════════════════════════

${existing.length > 0 ? existing.join('\n\n') : '[No sections completed yet]'}

════════════════════════════════════════
MISSING — generate these now
════════════════════════════════════════

${missing.map((s) => `- ${s}`).join('\n')}

Write only the missing sections above, in order, using the correct voice for each. Match the tone and length of the existing sections.`)
  }

  function buildFactionUpdatePrompt() {
    if (!selectedFaction) return

    const existing: string[] = []
    const missing: string[] = []

    if (selectedFaction.lore_text?.trim()) {
      existing.push(`ORIGIN SUMMARY / BEHAVIORAL PATTERNS:\n${selectedFaction.lore_text.trim()}`)
    } else { missing.push('Origin Summary & Behavioral Patterns') }

    if (selectedFaction.curator_interpretation?.trim()) {
      existing.push(`CURATOR INTERPRETATION:\n${selectedFaction.curator_interpretation.trim()}`)
    } else { missing.push('Curator Interpretation') }

    if (selectedFaction.engineer_assessment?.trim()) {
      existing.push(`ENGINEER ASSESSMENT:\n${selectedFaction.engineer_assessment.trim()}`)
    } else { missing.push('Engineer Assessment') }

    if (selectedFaction.biologist_assessment?.trim()) {
      existing.push(`BIOLOGIST ASSESSMENT:\n${selectedFaction.biologist_assessment.trim()}`)
    } else { missing.push('Biologist Assessment') }

    if (selectedFaction.wanderer_assessment?.trim()) {
      existing.push(`WANDERER ASSESSMENT:\n${selectedFaction.wanderer_assessment.trim()}`)
    } else { missing.push('Wanderer Assessment') }

    if (selectedFaction.muscle_assessment?.trim()) {
      existing.push(`MUSCLE ASSESSMENT:\n${selectedFaction.muscle_assessment.trim()}`)
    } else { missing.push('Muscle Assessment') }

    if (selectedFaction.footnotes?.trim()) {
      existing.push(`WANDERER FOOTNOTE:\n${selectedFaction.footnotes.trim()}`)
    } else { missing.push('Wanderer Footnote') }

    missing.push('System Status Classification')

    setGeneratedPrompt(`You are completing a partial IRZA faction record. Some sections have already been written — do NOT rewrite or summarize them. Generate ONLY the missing sections listed below, using the correct character voice for each.

CANON RULES:
- Factions are collective behavioral systems — patterns across multiple entities from the same origin reality
- Most factions come from collapsed or collapsing realities
- Never state the true premise directly
- Curator: metaphor over fact, weighted conclusions, never states directly
- Engineer: clinical, functional, precise — numbers and observations
- Biologist: wonder + precision, scientific awe, slightly fast delivery
- Muscle: reactive, casual, says what the audience is thinking
- Wanderer: irregular rhythm, uncertain, something finding its position
- System: ALL CAPS, fragmented outputs, never emotional

FACTION: ${selectedFaction.faction_id} — ${selectedFaction.name}
Domain: ${selectedFaction.domain ?? 'UNCLASSIFIED'} | Threat Level: ${selectedFaction.threat_level ?? 'UNCLASSIFIED'}
Behavioral Classification: ${selectedFaction.behavioral_classification ?? 'UNCLASSIFIED'}
Collective/Individual: ${selectedFaction.collective_or_individual ?? 'UNCLASSIFIED'}
Origin Reality Status: ${selectedFaction.origin_reality_status.toUpperCase()}
Notes: ${selectedFaction.notes ?? 'None.'}

════════════════════════════════════════
ALREADY WRITTEN — do not regenerate
════════════════════════════════════════

${existing.length > 0 ? existing.join('\n\n') : '[No sections completed yet]'}

════════════════════════════════════════
MISSING — generate these now
════════════════════════════════════════

${missing.map((s) => `- ${s}`).join('\n')}

Write only the missing sections above, in order, using the correct voice for each. Match the tone and length of the existing sections.`)
  }

  function buildArmyPrompt() {
    if (!armyFaction) return
    if (armyStep === 1) {
      setGeneratedPrompt(buildStep1BriefPrompt(armyFaction, armyMembers))
    } else {
      setGeneratedPrompt(buildStep2AssessmentsPrompt(armyFaction, armyMembers))
    }
  }

  // ── Parse / save handlers ─────────────────────────────────────────────────────

  async function copyPrompt() {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleParse() {
    const result = parseLoreResponse(pastedResponse)
    setParsedLore(Object.keys(result).length > 0 ? result : {})
    setSaveStatus('idle')
  }

  async function handleSaveToDb() {
    if (!parsedLore) return
    setSaveStatus('saving')
    try {
      if (selectedExhibit) {
        await updateExhibit.mutateAsync({ id: selectedExhibit.id, payload: parsedLore as Partial<Exhibit> })
      } else if (selectedFaction && selectedTemplate?.template_type === 'faction') {
        await updateFaction.mutateAsync({ id: selectedFaction.id, payload: parsedLore as Partial<Faction> })
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    }
  }

  function handleArmyParse() {
    const parsed = parseFactionLoreResponse(armyPastedResponse)
    setArmyParsedLore(parsed)
    const skipInit: Record<string, boolean> = {}
    for (const name of Object.keys(parsed)) skipInit[name] = false
    setArmySaveSkip(skipInit)
    setArmySaveStatuses({})
    setArmyParseDone(true)
  }

  async function handleSaveAllArmy() {
    for (const [specName, lore] of Object.entries(armyParsedLore)) {
      if (armySaveSkip[specName]) {
        setArmySaveStatuses(prev => ({ ...prev, [specName]: 'skipped' }))
        continue
      }

      const exhibit = armyMembers.find(e =>
        (e.miniature_name ?? e.name ?? '').toLowerCase() === specName.toLowerCase()
      )
      if (!exhibit) continue

      setArmySaveStatuses(prev => ({ ...prev, [specName]: 'saving' }))

      try {
        const payload: Partial<Exhibit> = {}
        for (const { key } of LORE_FIELDS) {
          const parsedVal = lore[key]
          const existingVal = (exhibit[key as keyof Exhibit] as string | null | undefined)?.trim()
          if (parsedVal && !existingVal) {
            ;(payload as Record<string, string>)[key] = parsedVal
          }
        }

        if (Object.keys(payload).length > 0) {
          await updateExhibit.mutateAsync({ id: exhibit.id, payload })
          setArmySaveStatuses(prev => ({ ...prev, [specName]: 'saved' }))
        } else {
          setArmySaveStatuses(prev => ({ ...prev, [specName]: 'skipped' }))
        }
      } catch {
        setArmySaveStatuses(prev => ({ ...prev, [specName]: 'error' }))
      }
    }
  }

  // ── Mode switch ───────────────────────────────────────────────────────────────

  const saveTarget = selectedExhibit
    ? (selectedExhibit.miniature_name ?? selectedExhibit.name)
    : selectedTemplate?.template_type === 'faction' && selectedFaction
    ? selectedFaction.name
    : null

  function switchMode(m: Mode) {
    setMode(m)
    setGeneratedPrompt('')
    if (m === 'full-army') {
      setArmyPastedResponse('')
      setArmyParsedLore({})
      setArmyParseDone(false)
      setArmySaveStatuses({})
      setArmySaveSkip({})
    }
  }

  // ── Select options ────────────────────────────────────────────────────────────

  const templateOptions = [
    { value: '', label: '— SELECT TEMPLATE —' },
    ...templates.map((t) => ({ value: t.id, label: `${t.template_type.toUpperCase()} — ${t.name}` })),
  ]

  const exhibitOptions = [
    { value: '', label: '— SELECT EXHIBIT (OPTIONAL) —' },
    ...exhibits.map((e) => ({ value: e.id, label: `${e.miniature_name} · ${e.faction?.faction_id ?? '?'}` })),
  ]

  const factionOptions = [
    { value: '', label: '— SELECT FACTION (OPTIONAL) —' },
    ...factions.map((f) => ({ value: f.id, label: `${f.faction_id} — ${f.name}` })),
  ]

  const armyFactionOptions = [
    { value: '', label: '— SELECT FACTION —' },
    ...factions.map((f) => ({ value: f.id, label: `${f.faction_id} — ${f.name}` })),
  ]

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="LORE GENERATOR"
        subtitle="CONTEXT-AWARE PROMPT TEMPLATES — CANON RULES PRE-LOADED"
      />

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => switchMode('template')}
          className={`font-mono text-xs tracking-widest px-4 py-2 rounded border transition-colors ${
            mode === 'template'
              ? 'bg-[#66ff99]/10 border-[#66ff99]/40 text-[#66ff99]'
              : 'border-[#1c1f26] text-[#5a6175] hover:border-[#3d4352] hover:text-[#8890a0]'
          }`}
        >
          TEMPLATE
        </button>
        <button
          onClick={() => switchMode('full-army')}
          className={`font-mono text-xs tracking-widest px-4 py-2 rounded border transition-colors ${
            mode === 'full-army'
              ? 'bg-[#66ff99]/10 border-[#66ff99]/40 text-[#66ff99]'
              : 'border-[#1c1f26] text-[#5a6175] hover:border-[#3d4352] hover:text-[#8890a0]'
          }`}
        >
          FACTION PACKAGE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ══ LEFT PANEL ══════════════════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* ── TEMPLATE MODE ── */}
          {mode === 'template' && (
            <>
              <Card>
                <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">TEMPLATE SELECTION</h2>
                <Select
                  label="TEMPLATE"
                  options={templateOptions}
                  value={selectedTemplate?.id ?? ''}
                  onChange={(e) => {
                    const t = templates.find((t) => t.id === e.target.value) ?? null
                    setSelectedTemplate(t)
                    setCustomFields({})
                    setGeneratedPrompt('')
                  }}
                />
              </Card>

              {selectedTemplate && (
                <>
                  {selectedTemplate.template_type === 'faction' ? (
                    <Card>
                      <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">FACTION</h2>
                      <Select
                        label="SELECT FACTION"
                        options={factionOptions}
                        value={selectedFactionId}
                        onChange={(e) => { setSelectedFactionId(e.target.value); setGeneratedPrompt('') }}
                      />
                      {selectedFaction && (
                        <div className="mt-3 p-3 bg-[#0a0c10] rounded border border-[#1c1f26] space-y-1">
                          <div className="font-mono text-[10px] text-[#66ff99] tracking-widest">{selectedFaction.faction_id} — {selectedFaction.name}</div>
                          <div className="font-mono text-[10px] text-[#5a6175]">
                            {selectedFaction.domain} · {selectedFaction.threat_level} · {selectedFaction.collective_or_individual}
                          </div>
                          <div className="font-mono text-[10px] text-[#3d4352]">
                            ORIGIN: {selectedFaction.origin_reality_status.toUpperCase()}
                          </div>
                          {selectedFaction.lore_text && (
                            <div className="font-mono text-[10px] text-[#3d4352] mt-2 line-clamp-3">
                              {selectedFaction.lore_text}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ) : (
                    <>
                      <Card>
                        <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">EXHIBIT CONTEXT</h2>
                        <Select
                          label="SELECT EXHIBIT"
                          options={exhibitOptions}
                          value={selectedExhibitId}
                          onChange={(e) => {
                            setSelectedExhibitId(e.target.value)
                            setGeneratedPrompt('')
                          }}
                        />
                        {selectedExhibit && (
                          <div className="mt-3 p-3 bg-[#0a0c10] rounded border border-[#1c1f26] space-y-1">
                            <div className="font-mono text-[10px] text-[#66ff99] tracking-widest">{selectedExhibit.miniature_name}</div>
                            <div className="font-mono text-[10px] text-[#5a6175]">
                              {selectedExhibit.faction?.faction_id} — {selectedExhibit.faction?.name}
                              {selectedExhibit.squad_id && selectedSquad && ` · SQUAD ${selectedSquad.squad_id}`}
                            </div>
                            {selectedExhibit.paint_scheme && (
                              <div className="font-mono text-[10px] text-[#3d4352] pt-1">
                                PAINT: {selectedExhibit.paint_scheme}
                              </div>
                            )}
                            {selectedExhibit.base_size && (
                              <div className="font-mono text-[10px] text-[#3d4352]">
                                BASE: {selectedExhibit.base_size}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>

                      {!selectedExhibitId && (
                        <Card>
                          <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">FACTION CONTEXT</h2>
                          <Select
                            label="INJECT FACTION"
                            options={factionOptions}
                            value={selectedFactionId}
                            onChange={(e) => setSelectedFactionId(e.target.value)}
                          />
                          {selectedFaction && (
                            <div className="mt-3 p-3 bg-[#0a0c10] rounded border border-[#1c1f26] space-y-1">
                              <div className="font-mono text-[10px] text-[#66ff99] tracking-widest">{selectedFaction.faction_id} — {selectedFaction.name}</div>
                              <div className="font-mono text-[10px] text-[#5a6175]">
                                {selectedFaction.domain} · {selectedFaction.threat_level} · {selectedFaction.collective_or_individual}
                              </div>
                              <div className="font-mono text-[10px] text-[#3d4352]">
                                ORIGIN: {selectedFaction.origin_reality_status.toUpperCase()}
                              </div>
                            </div>
                          )}
                        </Card>
                      )}
                    </>
                  )}

                  {selectedSquad && (
                    <Card>
                      <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">SQUAD CONTEXT</h2>
                      <div className="p-3 bg-[#0a0c10] rounded border border-[#1c1f26] space-y-1">
                        <div className="font-mono text-[10px] text-[#66ff99] tracking-widest">{selectedSquad.squad_id} — {selectedSquad.name}</div>
                        <div className="font-mono text-[10px] text-[#5a6175]">
                          {selectedSquad.squad_role} · {selectedSquad.threat_level}
                        </div>
                        {selectedSquad.lore_text && (
                          <div className="font-mono text-[10px] text-[#3d4352] mt-2 line-clamp-2">
                            {selectedSquad.lore_text}
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {(selectedTemplate.context_fields ?? [])
                    .filter((f) => !['faction_name', 'domain', 'threat_level', 'faction_lore',
                      'behavioral_classification', 'collective_or_individual', 'origin_reality_status', 'notes',
                      'squad_name', 'squad_role', 'squad_lore', 'squad_threat_level', 'collective_behavior_type',
                      'miniature_name', 'paint_scheme', 'base_size'].includes(f))
                    .length > 0 && (
                    <Card>
                      <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">REQUIRED FIELDS</h2>
                      <div className="space-y-3">
                        {(selectedTemplate.context_fields ?? [])
                          .filter((f) => !['faction_name', 'domain', 'threat_level', 'faction_lore',
                            'behavioral_classification', 'collective_or_individual', 'origin_reality_status', 'notes',
                            'squad_name', 'squad_role', 'squad_lore', 'squad_threat_level', 'collective_behavior_type',
                            'miniature_name', 'paint_scheme', 'base_size'].includes(f))
                          .map((field) => (
                            <div key={field} className="flex flex-col gap-1">
                              <label className="font-mono text-[10px] tracking-widest text-[#5a6175]">
                                {field.toUpperCase().replace(/_/g, ' ')}
                              </label>
                              <input
                                className="bg-[#0a0c10] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
                                placeholder={`Enter ${field}...`}
                                value={customFields[field] ?? ''}
                                onChange={(e) => setCustomFields((prev) => ({ ...prev, [field]: e.target.value }))}
                              />
                            </div>
                          ))}
                      </div>
                    </Card>
                  )}

                  <Button onClick={buildTemplatePrompt} className="w-full justify-center">
                    ✦ BUILD PROMPT
                  </Button>

                  {selectedTemplate.template_type === 'faction' && selectedFaction && (
                    selectedFaction.lore_text || selectedFaction.curator_interpretation ||
                    selectedFaction.engineer_assessment || selectedFaction.biologist_assessment ||
                    selectedFaction.wanderer_assessment || selectedFaction.muscle_assessment
                  ) && (
                    <Button onClick={buildFactionUpdatePrompt} variant="ghost" className="w-full justify-center border border-[#1c1f26]">
                      ↻ UPDATE EXISTING LORE
                    </Button>
                  )}

                  {selectedExhibit && (
                    selectedExhibit.lore_text || selectedExhibit.curator_interpretation ||
                    selectedExhibit.engineer_assessment || selectedExhibit.biologist_assessment ||
                    selectedExhibit.wanderer_assessment || selectedExhibit.muscle_assessment
                  ) && (
                    <Button onClick={buildUpdatePrompt} variant="ghost" className="w-full justify-center border border-[#1c1f26]">
                      ↻ UPDATE EXISTING LORE
                    </Button>
                  )}
                </>
              )}
            </>
          )}

          {/* ── FACTION PACKAGE MODE ── */}
          {mode === 'full-army' && (
            <>
              {/* Faction selector */}
              <Card>
                <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">FACTION SELECTION</h2>
                <Select
                  label="SELECT FACTION"
                  options={armyFactionOptions}
                  value={armyFactionId}
                  onChange={(e) => {
                    setArmyFactionId(e.target.value)
                    setGeneratedPrompt('')
                    setArmyStep(1)
                    setArmyPastedResponse('')
                    setArmyParsedLore({})
                    setArmyParseDone(false)
                    setArmySaveStatuses({})
                    setArmySaveSkip({})
                  }}
                />
                {armyFaction && (
                  <div className="mt-3 p-3 bg-[#0a0c10] rounded border border-[#1c1f26] space-y-1">
                    <div className="font-mono text-[10px] text-[#66ff99] tracking-widest">
                      {armyFaction.faction_id} — {armyFaction.name}
                    </div>
                    <div className="font-mono text-[10px] text-[#5a6175]">
                      {armyFaction.domain ?? 'DOMAIN UNKNOWN'} · {armyFaction.threat_level ?? 'THREAT UNKNOWN'} · {armyFaction.collective_or_individual ?? 'UNCLASSIFIED'}
                    </div>
                    <div className="font-mono text-[10px] text-[#3d4352]">
                      ORIGIN: {armyFaction.origin_reality_status.toUpperCase()}
                    </div>
                    {armyFaction.lore_text && (
                      <div className="font-mono text-[10px] text-[#3d4352] mt-2 line-clamp-3">
                        {armyFaction.lore_text}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Roster with fill status + photos */}
              {armyFaction && (
                <Card>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-mono text-xs text-[#5a6175] tracking-widest">
                      ROSTER — {armyMembers.length} SPECIMEN{armyMembers.length !== 1 ? 'S' : ''}
                    </h2>
                    {/* Legend */}
                    <div className="flex items-center gap-1.5">
                      {LORE_FIELDS.map(({ abbrev, label }) => (
                        <span key={abbrev} title={label} className="font-mono text-[9px] text-[#3d4352] tracking-widest cursor-default">
                          {abbrev}
                        </span>
                      ))}
                    </div>
                  </div>

                  {armyMembers.length === 0 ? (
                    <div className="font-mono text-[10px] text-[#3d4352] tracking-widest">
                      NO EXHIBITS CATALOGUED FOR THIS FACTION
                    </div>
                  ) : (
                    <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                      {armyMembers.map((e) => {
                        const photoUrl = armyPhotoUrls[e.id]
                        const fillCount = getExhibitFillCount(e)
                        return (
                          <div key={e.id} className="flex items-center gap-2 py-1 border-b border-[#1c1f26] last:border-0">
                            {/* Photo thumbnail */}
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt=""
                                className="w-7 h-7 object-cover rounded border border-[#1c1f26] flex-shrink-0"
                                onError={(ev) => { (ev.target as HTMLImageElement).style.display = 'none' }}
                              />
                            ) : (
                              <div className="w-7 h-7 rounded border border-[#1c1f26] bg-[#0a0c10] flex-shrink-0" />
                            )}
                            <div className="font-mono text-[10px] text-[#dde0e6] flex-1 min-w-0 truncate">
                              {e.miniature_name ?? e.name}
                            </div>
                            {/* Fill count */}
                            <span className={`font-mono text-[9px] tracking-widest flex-shrink-0 ${
                              fillCount === 7 ? 'text-[#66ff99]' : fillCount > 0 ? 'text-[#e8b84b]' : 'text-[#3d4352]'
                            }`}>
                              {fillCount}/7
                            </span>
                            {/* Per-field fill dots */}
                            <div className="flex gap-0.5 flex-shrink-0">
                              {LORE_FIELDS.map(({ key, label }) => (
                                <div
                                  key={key}
                                  title={label}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    (e[key as keyof typeof e] as string | null)?.trim()
                                      ? 'bg-[#66ff99]'
                                      : 'bg-[#1c1f26]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Column-level fill summary */}
                  {armyMembers.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#1c1f26] grid grid-cols-7 gap-1">
                      {LORE_FIELDS.map(({ key, abbrev, label }) => {
                        const filled = armyMembers.filter(e => (e[key as keyof typeof e] as string | null)?.trim()).length
                        const pct = armyMembers.length > 0 ? filled / armyMembers.length : 0
                        return (
                          <div key={key} className="flex flex-col items-center gap-0.5" title={label}>
                            <div className="w-full h-0.5 bg-[#1c1f26] rounded overflow-hidden">
                              <div
                                className={`h-full rounded ${pct === 1 ? 'bg-[#66ff99]' : pct > 0 ? 'bg-[#e8b84b]' : 'bg-[#1c1f26]'}`}
                                style={{ width: `${pct * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-[9px] text-[#3d4352]">{abbrev}</span>
                            <span className="font-mono text-[9px] text-[#3d4352]">{filled}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )}

              {/* Generation step selector */}
              {armyFaction && armyMembers.length > 0 && (
                <Card>
                  <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">GENERATION STEP</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setArmyStep(1); setGeneratedPrompt('') }}
                      className={`w-full text-left px-3 py-2.5 rounded border transition-colors ${
                        armyStep === 1
                          ? 'bg-[#66ff99]/10 border-[#66ff99]/40'
                          : 'border-[#1c1f26] hover:border-[#3d4352]'
                      }`}
                    >
                      <div className={`font-mono text-[10px] tracking-widest ${armyStep === 1 ? 'text-[#66ff99]' : 'text-[#5a6175]'}`}>
                        STEP 1 — INITIAL BRIEF
                      </div>
                      <div className="font-mono text-[9px] text-[#3d4352] mt-0.5">
                        Dialogue sketches + behavioral notes
                        {armyNeedsStep1 > 0
                          ? ` · ${armyNeedsStep1} specimen${armyNeedsStep1 !== 1 ? 's' : ''} need this`
                          : ' · all specimens have behavioral notes'}
                      </div>
                    </button>
                    <button
                      onClick={() => { setArmyStep(2); setGeneratedPrompt('') }}
                      className={`w-full text-left px-3 py-2.5 rounded border transition-colors ${
                        armyStep === 2
                          ? 'bg-[#66ff99]/10 border-[#66ff99]/40'
                          : 'border-[#1c1f26] hover:border-[#3d4352]'
                      }`}
                    >
                      <div className={`font-mono text-[10px] tracking-widest ${armyStep === 2 ? 'text-[#66ff99]' : 'text-[#5a6175]'}`}>
                        STEP 2 — FULL ASSESSMENTS
                      </div>
                      <div className="font-mono text-[9px] text-[#3d4352] mt-0.5">
                        All 5 voices · skips filled columns · cross-references faction behavioral context
                        {armyNeedsStep2 > 0
                          ? ` · ${armyNeedsStep2} specimen${armyNeedsStep2 !== 1 ? 's' : ''} need assessments`
                          : ' · all assessments complete'}
                      </div>
                    </button>
                  </div>
                  <p className="font-mono text-[9px] text-[#3d4352] mt-3 leading-relaxed">
                    Run Step 1 first → save → Step 2 will use all behavioral notes as cross-reference context.
                  </p>
                </Card>
              )}

              {armyFaction && armyMembers.length > 0 && (
                <Button onClick={buildArmyPrompt} className="w-full justify-center">
                  {armyStep === 1 ? '✦ BUILD STEP 1 BRIEF' : '✦ BUILD STEP 2 ASSESSMENTS'}
                </Button>
              )}
            </>
          )}
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════════════════════ */}
        <div className="space-y-4">

          {mode === 'template' && selectedTemplate && (
            <Card>
              <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">TEMPLATE PREVIEW</h2>
              <div className="font-mono text-[10px] text-[#3d4352] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedTemplate.prompt_template}
              </div>
            </Card>
          )}

          {generatedPrompt && (
            <Card className="border-[#66ff99]/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-mono text-xs text-[#66ff99] tracking-widest">
                  {mode === 'full-army'
                    ? armyStep === 1 ? 'STEP 1 BRIEF READY' : 'STEP 2 ASSESSMENTS READY'
                    : 'PROMPT READY'}
                </h2>
                <Button size="sm" onClick={copyPrompt}>
                  {copied ? '✓ COPIED' : 'COPY TO CLIPBOARD'}
                </Button>
              </div>
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                className="min-h-[300px] text-xs font-mono"
              />
              <p className="font-mono text-[10px] text-[#3d4352] mt-2 tracking-widest">
                PASTE INTO NEW CLAUDE CONVERSATION — CONTEXT PRE-LOADED
              </p>
            </Card>
          )}

          {/* Template mode: single-exhibit paste & save */}
          {mode === 'template' && saveTarget && (
            <Card>
              <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-1">PASTE RESPONSE</h2>
              <p className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-3">
                TARGET: <span className="text-[#dde0e6]">{saveTarget.toUpperCase()}</span>
              </p>

              <Textarea
                value={pastedResponse}
                onChange={(e) => { setPastedResponse(e.target.value); setParsedLore(null); setSaveStatus('idle') }}
                placeholder="Paste Claude's response here..."
                className="min-h-[160px] text-xs font-mono mb-3"
              />

              <Button
                onClick={handleParse}
                disabled={!pastedResponse.trim()}
                variant="ghost"
                className="w-full justify-center border border-[#1c1f26] mb-3"
              >
                ⟳ PARSE SECTIONS
              </Button>

              {parsedLore !== null && (
                <>
                  <div className="space-y-2 mb-3">
                    {Object.keys(FIELD_LABELS).map((key) => {
                      const field = key as keyof ParsedLore
                      const found = !!parsedLore[field]
                      return (
                        <div key={field} className="flex items-start gap-2">
                          <span className={`font-mono text-[10px] mt-0.5 ${found ? 'text-[#66ff99]' : 'text-[#3d4352]'}`}>
                            {found ? '✓' : '—'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className={`font-mono text-[10px] tracking-widest ${found ? 'text-[#dde0e6]' : 'text-[#3d4352]'}`}>
                              {FIELD_LABELS[field]}
                            </div>
                            {found && (
                              <div className="font-mono text-[9px] text-[#5a6175] line-clamp-2 mt-0.5">
                                {parsedLore[field]}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {Object.keys(parsedLore).length === 0 ? (
                    <p className="font-mono text-[10px] text-[#e86b3a] tracking-widest">
                      NO SECTIONS DETECTED — CHECK FORMATTING
                    </p>
                  ) : (
                    <Button
                      onClick={handleSaveToDb}
                      disabled={saveStatus === 'saving'}
                      className="w-full justify-center"
                    >
                      {saveStatus === 'saving' ? '...' :
                       saveStatus === 'saved' ? '✓ SAVED' :
                       saveStatus === 'error' ? '✕ ERROR — RETRY' :
                       `↓ SAVE TO DATABASE`}
                    </Button>
                  )}
                </>
              )}
            </Card>
          )}

          {/* Faction Package mode: multi-exhibit paste & parse & save */}
          {mode === 'full-army' && armyFaction && armyMembers.length > 0 && (
            <Card>
              <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-1">PASTE RESPONSE</h2>
              <p className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-3">
                TARGET: <span className="text-[#dde0e6]">
                  {armyFaction.name.toUpperCase()} · STEP {armyStep} · {armyMembers.length} SPECIMENS
                </span>
              </p>

              <Textarea
                value={armyPastedResponse}
                onChange={(e) => {
                  setArmyPastedResponse(e.target.value)
                  setArmyParsedLore({})
                  setArmyParseDone(false)
                  setArmySaveStatuses({})
                }}
                placeholder="Paste Claude's response here..."
                className="min-h-[140px] text-xs font-mono mb-3"
              />

              <Button
                onClick={handleArmyParse}
                disabled={!armyPastedResponse.trim()}
                variant="ghost"
                className="w-full justify-center border border-[#1c1f26] mb-3"
              >
                ⟳ PARSE SPECIMENS
              </Button>

              {armyParseDone && (
                <>
                  {Object.keys(armyParsedLore).length === 0 ? (
                    <p className="font-mono text-[10px] text-[#e86b3a] tracking-widest mb-3">
                      NO SPECIMENS DETECTED — RESPONSE MUST USE [NAME] HEADERS AFTER --- SEPARATORS
                    </p>
                  ) : (
                    <div className="space-y-1.5 mb-3 max-h-80 overflow-y-auto pr-1">
                      {Object.entries(armyParsedLore).map(([specName, lore]) => {
                        const exhibit = armyMembers.find(e =>
                          (e.miniature_name ?? e.name ?? '').toLowerCase() === specName.toLowerCase()
                        )
                        const status = armySaveStatuses[specName] ?? 'idle'
                        const skipped = !!armySaveSkip[specName]

                        const newFields: string[] = []
                        const alreadyFilled: string[] = []

                        for (const { key, abbrev } of LORE_FIELDS) {
                          const parsedVal = lore[key]
                          const existingVal = exhibit
                            ? (exhibit[key as keyof typeof exhibit] as string | null)?.trim()
                            : null
                          if (parsedVal) {
                            if (existingVal) alreadyFilled.push(abbrev)
                            else newFields.push(abbrev)
                          }
                        }

                        return (
                          <div
                            key={specName}
                            className={`p-2 rounded border transition-opacity ${
                              skipped ? 'border-[#1c1f26] opacity-40' : 'border-[#1c1f26]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Include/skip toggle */}
                              <button
                                onClick={() => setArmySaveSkip(prev => ({ ...prev, [specName]: !prev[specName] }))}
                                title={skipped ? 'Click to include' : 'Click to skip'}
                                className={`w-3.5 h-3.5 rounded border flex-shrink-0 transition-colors ${
                                  skipped
                                    ? 'border-[#3d4352] bg-transparent'
                                    : 'border-[#66ff99]/50 bg-[#66ff99]/10'
                                }`}
                              />
                              <div className="font-mono text-[10px] text-[#dde0e6] flex-1 truncate min-w-0">
                                {specName}
                              </div>
                              {!exhibit && (
                                <span className="font-mono text-[9px] text-[#e86b3a] tracking-widest flex-shrink-0">NO MATCH</span>
                              )}
                              {status === 'saving' && <span className="font-mono text-[9px] text-[#5a6175]">...</span>}
                              {status === 'saved'  && <span className="font-mono text-[9px] text-[#66ff99]">✓</span>}
                              {status === 'skipped' && <span className="font-mono text-[9px] text-[#3d4352]">—</span>}
                              {status === 'error'  && <span className="font-mono text-[9px] text-[#e86b3a]">✕</span>}
                            </div>
                            <div className="flex gap-3 mt-1 pl-5">
                              {newFields.length > 0 && (
                                <span className="font-mono text-[9px] text-[#66ff99]">
                                  +{newFields.join(' ')}
                                </span>
                              )}
                              {alreadyFilled.length > 0 && (
                                <span className="font-mono text-[9px] text-[#3d4352]">
                                  ~{alreadyFilled.join(' ')} (skip)
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {Object.keys(armyParsedLore).length > 0 && (
                    <>
                      <div className="font-mono text-[9px] text-[#3d4352] tracking-widest mb-2">
                        {Object.entries(armyParsedLore).filter(([n]) => !armySaveSkip[n]).length} SPECIMENS QUEUED
                        · ALREADY-FILLED COLUMNS WILL BE SKIPPED
                      </div>
                      <Button
                        onClick={handleSaveAllArmy}
                        disabled={Object.values(armySaveStatuses).some(s => s === 'saving')}
                        className="w-full justify-center"
                      >
                        {Object.values(armySaveStatuses).some(s => s === 'saving')
                          ? 'SAVING...'
                          : Object.keys(armySaveStatuses).length > 0 &&
                            Object.values(armySaveStatuses).every(s => s === 'saved' || s === 'skipped')
                          ? '✓ ALL SAVED'
                          : `↓ SAVE ${Object.entries(armyParsedLore).filter(([n]) => !armySaveSkip[n]).length} SPECIMENS TO DATABASE`
                        }
                      </Button>
                    </>
                  )}
                </>
              )}
            </Card>
          )}

          {!generatedPrompt && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-[#1c1f26] text-4xl mb-3">✦</div>
              {mode === 'template' ? (
                <>
                  <div className="font-mono text-xs text-[#3d4352] tracking-widest">
                    SELECT A TEMPLATE TO BEGIN
                  </div>
                  <div className="font-mono text-[10px] text-[#1c1f26] tracking-widest mt-2">
                    CANON RULES AND FACTION CONTEXT WILL BE INJECTED AUTOMATICALLY
                  </div>
                </>
              ) : (
                <>
                  <div className="font-mono text-xs text-[#3d4352] tracking-widest">
                    SELECT A FACTION TO BEGIN
                  </div>
                  <div className="font-mono text-[10px] text-[#1c1f26] tracking-widest mt-2">
                    STEP 1 BRIEFS · STEP 2 ASSESSMENTS · BATCH IMPORT
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
