import { useState, useEffect } from 'react'
import { useCreateFaction, useUpdateFaction, useDeleteFaction } from '../hooks/useData'
import { Button } from './ui'
import type { Faction, EntryStatus, ThreatLevel, OriginRealityStatus } from '../types'

type FactionFormData = {
  faction_id: string
  name: string
  domain: string
  threat_level: ThreatLevel | ''
  behavioral_classification: string
  collective_or_individual: 'Collective' | 'Individual' | ''
  origin_reality_status: OriginRealityStatus
  system_status: string
  notes: string
  lore_text: string
  status: EntryStatus
}

function emptyForm(): FactionFormData {
  return {
    faction_id: '',
    name: '',
    domain: '',
    threat_level: '',
    behavioral_classification: '',
    collective_or_individual: '',
    origin_reality_status: 'unknown',
    system_status: 'MONITORING',
    notes: '',
    lore_text: '',
    status: 'drafted',
  }
}

function factionToForm(f: Faction): FactionFormData {
  return {
    faction_id: f.faction_id,
    name: f.name,
    domain: f.domain ?? '',
    threat_level: f.threat_level ?? '',
    behavioral_classification: f.behavioral_classification ?? '',
    collective_or_individual: f.collective_or_individual ?? '',
    origin_reality_status: f.origin_reality_status,
    system_status: f.system_status,
    notes: f.notes ?? '',
    lore_text: f.lore_text ?? '',
    status: f.status,
  }
}

interface Props {
  faction: Faction | null  // null = create mode
  onClose: () => void
}

export function FactionDrawer({ faction, onClose }: Props) {
  const [form, setForm] = useState<FactionFormData>(faction ? factionToForm(faction) : emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const createFaction = useCreateFaction()
  const updateFaction = useUpdateFaction()
  const deleteFaction = useDeleteFaction()

  const isPending = createFaction.isPending || updateFaction.isPending || deleteFaction.isPending
  const isEdit = !!faction

  useEffect(() => {
    setForm(faction ? factionToForm(faction) : emptyForm())
    setConfirmDelete(false)
  }, [faction?.id])

  const set = (field: keyof FactionFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = () => {
    const payload = {
      faction_id: form.faction_id.trim(),
      name: form.name.trim(),
      domain: form.domain.trim() || null,
      threat_level: (form.threat_level || null) as ThreatLevel | null,
      behavioral_classification: form.behavioral_classification.trim() || null,
      collective_or_individual: (form.collective_or_individual || null) as 'Collective' | 'Individual' | null,
      origin_reality_status: form.origin_reality_status,
      system_status: form.system_status.trim() || 'MONITORING',
      notes: form.notes.trim() || null,
      lore_text: form.lore_text.trim() || null,
      status: form.status,
    }

    if (isEdit) {
      updateFaction.mutate({ id: faction!.id, payload }, { onSuccess: onClose })
    } else {
      createFaction.mutate(
        { ...payload, exhibits_catalogued: 0, drive_doc_id: null, drive_doc_url: null },
        { onSuccess: onClose }
      )
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-[#0a0c10] border-l border-[#1c1f26] z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1f26] shrink-0">
          <div>
            <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-0.5">
              {isEdit ? `FACTION — ${faction!.faction_id}` : 'NEW FACTION'}
            </div>
            <h2 className="font-display text-xl text-[#dde0e6] tracking-widest">
              {isEdit ? form.name || 'UNNAMED' : 'REGISTER FACTION'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#3d4352] hover:text-[#8891a4] font-mono text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          <Section label="IDENTITY">
            <div className="grid grid-cols-2 gap-3">
              <Field label="FACTION ID">
                <TextInput value={form.faction_id} onChange={(v) => set('faction_id', v)} placeholder="e.g. F-012" />
              </Field>
              <Field label="STATUS">
                <SelectInput
                  value={form.status}
                  onChange={(v) => set('status', v as EntryStatus)}
                  options={[
                    { value: 'drafted', label: 'DRAFTED' },
                    { value: 'needs-lore', label: 'NEEDS LORE' },
                    { value: 'canon-locked', label: 'CANON LOCKED' },
                    { value: 'published', label: 'PUBLISHED' },
                  ]}
                />
              </Field>
            </div>
            <Field label="NAME">
              <TextInput value={form.name} onChange={(v) => set('name', v)} placeholder="Faction designation" />
            </Field>
          </Section>

          <Section label="CLASSIFICATION">
            <div className="grid grid-cols-2 gap-3">
              <Field label="DOMAIN">
                <TextInput value={form.domain} onChange={(v) => set('domain', v)} placeholder="Anomalous / Bio / Synthetic" />
              </Field>
              <Field label="THREAT LEVEL">
                <SelectInput
                  value={form.threat_level}
                  onChange={(v) => set('threat_level', v)}
                  options={[
                    { value: '', label: '— UNASSESSED —' },
                    { value: 'NONE', label: 'NONE' },
                    { value: 'LOW', label: 'LOW' },
                    { value: 'MODERATE', label: 'MODERATE' },
                    { value: 'HIGH', label: 'HIGH' },
                    { value: 'UNRESOLVABLE', label: 'UNRESOLVABLE' },
                  ]}
                />
              </Field>
              <Field label="BEHAVIORAL CLASS">
                <TextInput value={form.behavioral_classification} onChange={(v) => set('behavioral_classification', v)} placeholder="Behavioral pattern" />
              </Field>
              <Field label="COLLECTIVE / INDIVIDUAL">
                <SelectInput
                  value={form.collective_or_individual}
                  onChange={(v) => set('collective_or_individual', v as 'Collective' | 'Individual' | '')}
                  options={[
                    { value: '', label: '— UNKNOWN —' },
                    { value: 'Collective', label: 'COLLECTIVE' },
                    { value: 'Individual', label: 'INDIVIDUAL' },
                  ]}
                />
              </Field>
              <Field label="ORIGIN REALITY">
                <SelectInput
                  value={form.origin_reality_status}
                  onChange={(v) => set('origin_reality_status', v as OriginRealityStatus)}
                  options={[
                    { value: 'unknown', label: 'UNKNOWN' },
                    { value: 'stable', label: 'STABLE' },
                    { value: 'collapsing', label: 'COLLAPSING' },
                    { value: 'collapsed', label: 'COLLAPSED' },
                  ]}
                />
              </Field>
              <Field label="SYSTEM STATUS">
                <TextInput value={form.system_status} onChange={(v) => set('system_status', v)} placeholder="MONITORING" />
              </Field>
            </div>
          </Section>

          <Section label="LORE RECORD">
            <Field label="NOTES">
              <TextArea value={form.notes} onChange={(v) => set('notes', v)} placeholder="Operational notes..." rows={3} />
            </Field>
            <Field label="LORE TEXT">
              <TextArea value={form.lore_text} onChange={(v) => set('lore_text', v)} placeholder="Full faction lore record..." rows={6} />
            </Field>
          </Section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1c1f26] flex items-center justify-between shrink-0 bg-[#0a0c10]">
          <div className="flex gap-2">
            {isEdit && !confirmDelete && (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)} disabled={isPending}>
                <span className="text-[#cc3355]">DELETE</span>
              </Button>
            )}
            {isEdit && confirmDelete && (
              <>
                <span className="font-mono text-[10px] text-[#cc3355] tracking-widest self-center">CONFIRM DELETE?</span>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={isPending}>CANCEL</Button>
                <Button
                  onClick={() => deleteFaction.mutate(faction!.id, { onSuccess: onClose })}
                  disabled={isPending}
                >
                  <span className="text-[#cc3355]">{isPending ? 'DELETING...' : 'YES, DELETE'}</span>
                </Button>
              </>
            )}
          </div>
          {(createFaction.isError || updateFaction.isError) && (
            <span className="font-mono text-[10px] text-[#cc3355] tracking-widest">
              SAVE FAILED — CHECK CONSOLE
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>CANCEL</Button>
            <Button onClick={handleSave} disabled={isPending || !form.name.trim() || !form.faction_id.trim()}>
              {isPending ? 'SAVING...' : isEdit ? 'COMMIT CHANGES' : 'COMMIT TO ARCHIVE'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-3 pb-1 border-b border-[#1c1f26]">
        {label}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">{label}</div>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
    />
  )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans focus:outline-none focus:border-[#66ff99]/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 resize-y leading-relaxed"
    />
  )
}
