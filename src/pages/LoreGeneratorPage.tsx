import { useState } from 'react'
import { useLoreTemplates, useFactions, useSquads, useExhibits } from '../hooks/useData'
import { Spinner, PageHeader, Card, Button, Textarea, Select } from '../components/ui'
import type { LoreTemplate, Faction } from '../types'

type Mode = 'template' | 'full-army'

function buildFullArmyPrompt(faction: Faction, members: { name: string; lore_text: string | null }[]): string {
  const roster = members
    .map((m, i) => {
      const lore = m.lore_text?.trim()
      return `${i + 1}. ${m.name}${lore ? `\n   Known data: ${lore}` : ''}`
    })
    .join('\n\n')

  return `You are generating IRZA exhibit records for an entire faction. The Archive is a facility preserving entities from collapsing realities. Staff do not know the true premise.

CANON RULES:
- Never call entities "miniatures" — always "entities", "specimens", or "exhibits"
- The Archive is never called a zoo by staff in formal records
- The true premise (ark for collapsing realities) is NEVER stated directly
- Curator: metaphor over fact, weighted conclusions, never states directly
- Engineer: clinical, functional, precise — numbers and observations
- Biologist: wonder + precision, scientific awe, slightly fast delivery
- Muscle: reactive, casual, says what the audience is thinking
- Wanderer: irregular rhythm, uncertain, something finding its position
- System: ALL CAPS, fragmented outputs, never emotional

FACTION CONTEXT:
${faction.faction_id} — ${faction.name.toUpperCase()} | Domain: ${faction.domain ?? 'UNCLASSIFIED'} | Threat: ${faction.threat_level ?? 'UNCLASSIFIED'}
Behavioral Classification: ${faction.behavioral_classification ?? 'UNCLASSIFIED'} | ${faction.collective_or_individual ?? 'UNCLASSIFIED'} | Origin: ${faction.origin_reality_status.toUpperCase()}

${faction.lore_text?.trim() ?? '[No faction lore documented. Infer from name, domain, and specimen data.]'}

════════════════════════════════════════
ROSTER — ${members.length} SPECIMEN${members.length !== 1 ? 'S' : ''} CATALOGUED
════════════════════════════════════════

${roster}

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════

Generate a full exhibit record for each specimen above. Use the specimen name exactly as listed. Do not skip any specimens. Each record follows this format:

---
[SPECIMEN NAME]

BEHAVIORAL NOTES:
[2-3 sentences — observable behavioral patterns, movement, response to containment, interaction with other specimens. Clinical but not dry — the behavior should feel like it means something.]

CURATOR INTERPRETATION:
[2-3 sentences — metaphorical, weighted, indirect. The Curator implies the entity's deeper nature without stating it. Speaks in meaning, not fact.]

ENGINEER ASSESSMENT:
[2-3 sentences — functional, precise. Physical properties, containment readings, behavioral signatures that matter for operations. No emotion.]

BIOLOGIST ASSESSMENT:
[2-3 sentences — scientific wonder barely contained. Field observation framing. Notes what makes this specimen remarkable as a living thing. Slightly fast, slightly awed.]

MUSCLE REACTION:
[1-2 sentences — gut response. Casual register. What the average person would actually say looking at this thing. Grounded, sometimes alarmed, occasionally reluctant to admit it's interesting.]

WANDERER OBSERVATION:
[1-3 sentences — irregular rhythm. May address the specimen directly. Searching for something. Occasionally profound by accident.]
---

Generate all ${members.length} specimen${members.length !== 1 ? 's' : ''}. Keep character voices consistent across the full army. Lore should feel like it belongs to the same faction — shared origin, shared strangeness, related but individually distinct.`
}

export function LoreGeneratorPage() {
  const { data: templates = [], isLoading: loadingTemplates } = useLoreTemplates()
  const { data: factions = [] } = useFactions()
  const { data: squads = [] } = useSquads()
  const { data: exhibits = [] } = useExhibits()

  const [mode, setMode] = useState<Mode>('template')

  // Template mode state
  const [selectedTemplate, setSelectedTemplate] = useState<LoreTemplate | null>(null)
  const [selectedExhibitId, setSelectedExhibitId] = useState('')
  const [selectedFactionId, setSelectedFactionId] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})

  // Full Army mode state
  const [armyFactionId, setArmyFactionId] = useState('')

  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  if (loadingTemplates) return <Spinner />

  // Template mode derived values
  const selectedExhibit = exhibits.find((e) => e.id === selectedExhibitId)
  const selectedFaction = selectedExhibit?.faction
    ? factions.find((f) => f.id === selectedExhibit.faction?.id)
    : factions.find((f) => f.id === selectedFactionId)
  const selectedSquad = selectedExhibit?.squad_id ? squads.find((s) => s.id === selectedExhibit.squad_id) : null

  // Full Army derived values
  const armyFaction = factions.find((f) => f.id === armyFactionId) ?? null
  const armyMembers = armyFactionId
    ? exhibits.filter((e) => e.faction_id === armyFactionId || e.faction?.id === armyFactionId)
    : []

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

  function buildArmyPrompt() {
    if (!armyFaction) return
    const members = armyMembers.map((e) => ({
      name: e.miniature_name ?? e.name ?? 'UNDESIGNATED',
      lore_text: e.lore_text,
    }))
    setGeneratedPrompt(buildFullArmyPrompt(armyFaction, members))
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setGeneratedPrompt('')
  }

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
          FULL ARMY
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: configuration */}
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
                </>
              )}
            </>
          )}

          {/* ── FULL ARMY MODE ── */}
          {mode === 'full-army' && (
            <>
              <Card>
                <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">FACTION SELECTION</h2>
                <Select
                  label="SELECT FACTION"
                  options={armyFactionOptions}
                  value={armyFactionId}
                  onChange={(e) => {
                    setArmyFactionId(e.target.value)
                    setGeneratedPrompt('')
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

              {armyFaction && (
                <Card>
                  <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">
                    ROSTER — {armyMembers.length} SPECIMEN{armyMembers.length !== 1 ? 'S' : ''}
                  </h2>
                  {armyMembers.length === 0 ? (
                    <div className="font-mono text-[10px] text-[#3d4352] tracking-widest">
                      NO EXHIBITS CATALOGUED FOR THIS FACTION
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {armyMembers.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 py-1 border-b border-[#1c1f26] last:border-0">
                          <div className="font-mono text-[10px] text-[#dde0e6] flex-1">
                            {e.miniature_name ?? e.name}
                          </div>
                          {e.lore_text ? (
                            <div className="font-mono text-[9px] text-[#66ff99] tracking-widest">LORE</div>
                          ) : (
                            <div className="font-mono text-[9px] text-[#3d4352] tracking-widest">NO LORE</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {armyFaction && (
                <Card>
                  <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-2">VOICE SECTIONS</h2>
                  <p className="font-mono text-[10px] text-[#3d4352] leading-relaxed">
                    Prompt will generate per-specimen blocks for all 5 voices:
                  </p>
                  <div className="mt-2 space-y-1">
                    {[
                      { label: 'CURATOR', color: '#F2E9DC' },
                      { label: 'ENGINEER', color: '#5ED9FF' },
                      { label: 'BIOLOGIST', color: '#F5C842' },
                      { label: 'MUSCLE', color: '#dde0e6' },
                      { label: 'WANDERER', color: '#B8A9C9' },
                    ].map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-mono text-[10px] tracking-widest" style={{ color }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {armyFaction && armyMembers.length > 0 && (
                <Button onClick={buildArmyPrompt} className="w-full justify-center">
                  ✦ BUILD ARMY BRIEF
                </Button>
              )}
            </>
          )}
        </div>

        {/* Right: output */}
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
                  {mode === 'full-army' ? 'ARMY BRIEF READY' : 'PROMPT READY'}
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
                    SELECT A FACTION TO BUILD ARMY BRIEF
                  </div>
                  <div className="font-mono text-[10px] text-[#1c1f26] tracking-widest mt-2">
                    ALL SPECIMENS · 5 CHARACTER VOICES · READY TO PASTE
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
