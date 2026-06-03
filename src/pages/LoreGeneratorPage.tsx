import { useState } from 'react'
import { useLoreTemplates, useFactions, useSquads, useExhibits } from '../hooks/useData'
import { Spinner, PageHeader, Card, Button, Textarea, Select } from '../components/ui'
import type { LoreTemplate } from '../types'

export function LoreGeneratorPage() {
  const { data: templates = [], isLoading: loadingTemplates } = useLoreTemplates()
  const { data: factions = [] } = useFactions()
  const { data: squads = [] } = useSquads()
  const { data: exhibits = [] } = useExhibits()

  const [selectedTemplate, setSelectedTemplate] = useState<LoreTemplate | null>(null)
  const [selectedExhibitId, setSelectedExhibitId] = useState('')
  const [selectedFactionId, setSelectedFactionId] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  if (loadingTemplates) return <Spinner />

  const selectedExhibit = exhibits.find((e) => e.id === selectedExhibitId)
  const selectedFaction = selectedExhibit?.faction ? factions.find((f) => f.id === selectedExhibit.faction?.id) : factions.find((f) => f.id === selectedFactionId)
  const selectedSquad = selectedExhibit?.squad_id ? squads.find((s) => s.id === selectedExhibit.squad_id) : null

  function buildPrompt() {
    if (!selectedTemplate) return

    let prompt = selectedTemplate.prompt_template

    // Auto-inject faction context
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

    // Auto-inject squad context if exhibit belongs to one
    if (selectedSquad) {
      prompt = prompt
        .replace('{{squad_name}}', selectedSquad.name)
        .replace('{{squad_role}}', selectedSquad.squad_role ?? 'UNKNOWN')
        .replace('{{squad_lore}}', selectedSquad.lore_text ?? 'No squad lore documented yet.')
        .replace('{{squad_threat_level}}', selectedSquad.threat_level ?? 'UNKNOWN')
        .replace('{{collective_behavior_type}}', selectedSquad.collective_behavior_type ?? 'UNKNOWN')
    }

    // Inject custom fields
    Object.entries(customFields).forEach(([key, value]) => {
      prompt = prompt.replace(`{{${key}}}`, value)
    })

    setGeneratedPrompt(prompt)
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  return (
    <div>
      <PageHeader
        title="LORE GENERATOR"
        subtitle="CONTEXT-AWARE PROMPT TEMPLATES — CANON RULES PRE-LOADED"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: configuration */}
        <div className="space-y-4">
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

              {/* Custom field inputs for remaining template variables */}
              {(selectedTemplate.context_fields ?? [])
                .filter((f) => !['faction_name', 'domain', 'threat_level', 'faction_lore',
                  'behavioral_classification', 'collective_or_individual', 'origin_reality_status', 'notes',
                  'squad_name', 'squad_role', 'squad_lore', 'squad_threat_level', 'collective_behavior_type'].includes(f))
                .length > 0 && (
                <Card>
                  <h2 className="font-mono text-xs text-[#5a6175] tracking-widest mb-3">REQUIRED FIELDS</h2>
                  <div className="space-y-3">
                    {(selectedTemplate.context_fields ?? [])
                      .filter((f) => !['faction_name', 'domain', 'threat_level', 'faction_lore',
                        'behavioral_classification', 'collective_or_individual', 'origin_reality_status', 'notes',
                        'squad_name', 'squad_role', 'squad_lore', 'squad_threat_level', 'collective_behavior_type'].includes(f))
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

              <Button onClick={buildPrompt} className="w-full justify-center">
                ✦ BUILD PROMPT
              </Button>
            </>
          )}
        </div>

        {/* Right: output */}
        <div className="space-y-4">
          {selectedTemplate && (
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
                <h2 className="font-mono text-xs text-[#66ff99] tracking-widest">PROMPT READY</h2>
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

          {!generatedPrompt && !selectedTemplate && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-[#1c1f26] text-4xl mb-3">✦</div>
              <div className="font-mono text-xs text-[#3d4352] tracking-widest">
                SELECT A TEMPLATE TO BEGIN
              </div>
              <div className="font-mono text-[10px] text-[#1c1f26] tracking-widest mt-2">
                CANON RULES AND FACTION CONTEXT WILL BE INJECTED AUTOMATICALLY
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
