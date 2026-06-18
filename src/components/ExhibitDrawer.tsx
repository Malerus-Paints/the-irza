import { useState, useEffect } from 'react'
import { useCreateExhibit, useUpdateExhibit, useDeleteExhibit, useFactions, useExhibits } from '../hooks/useData'
import { Button } from './ui'
import { EPISODE_TYPE_LABELS } from '../types'
import type {
  Exhibit, EntryStatus, ArchiveStatus, ThreatLevel,
  OriginRealityStatus, RuntimeClass,
} from '../types'

type ExhibitFormData = {
  name: string
  faction_id: string
  status: EntryStatus
  archive_status: ArchiveStatus
  threat_level: ThreatLevel | ''
  domain: string
  behavioral_pattern: string
  origin_reality_status: OriginRealityStatus
  backlog_release: boolean
  miniature_name: string
  paint_scheme: string
  base_size: string
  episode_type: string
  runtime_class: RuntimeClass | ''
  filmed: boolean
  lore_text: string
  curator_interpretation: string
  engineer_assessment: string
  biologist_assessment: string
}

function emptyForm(): ExhibitFormData {
  return {
    name: '',
    faction_id: '',
    status: 'drafted',
    archive_status: 'UNCLASSIFIED',
    threat_level: '',
    domain: '',
    behavioral_pattern: '',
    origin_reality_status: 'unknown',
    backlog_release: false,
    miniature_name: '',
    paint_scheme: '',
    base_size: '',
    episode_type: '',
    runtime_class: '',
    filmed: false,
    lore_text: '',
    curator_interpretation: '',
    engineer_assessment: '',
    biologist_assessment: '',
  }
}

function exhibitToForm(e: Exhibit): ExhibitFormData {
  return {
    name: e.name,
    faction_id: e.faction_id ?? '',
    status: e.status,
    archive_status: e.archive_status,
    threat_level: e.threat_level ?? '',
    domain: e.domain ?? '',
    behavioral_pattern: e.behavioral_pattern ?? '',
    origin_reality_status: e.origin_reality_status,
    backlog_release: e.backlog_release,
    miniature_name: e.miniature_name ?? '',
    paint_scheme: e.paint_scheme ?? '',
    base_size: e.base_size ?? '',
    episode_type: e.episode_type ?? '',
    runtime_class: e.runtime_class ?? '',
    filmed: e.filmed,
    lore_text: e.lore_text ?? '',
    curator_interpretation: e.curator_interpretation ?? '',
    engineer_assessment: e.engineer_assessment ?? '',
    biologist_assessment: e.biologist_assessment ?? '',
  }
}

interface Props {
  exhibit: Exhibit | null   // null = create mode
  onClose: () => void
}

export function ExhibitDrawer({ exhibit, onClose }: Props) {
  const [form, setForm] = useState<ExhibitFormData>(exhibit ? exhibitToForm(exhibit) : emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { data: factions = [] } = useFactions()
  const { data: exhibits = [] } = useExhibits()
  const createExhibit = useCreateExhibit()
  const updateExhibit = useUpdateExhibit()
  const deleteExhibit = useDeleteExhibit()

  // Auto-assign next exhibit number in create mode (parses trailing digits from "Ex - NNN" format)
  const nextExhibitNumber = (() => {
    const nums = exhibits
      .map(e => { const m = (e.exhibit_number ?? '').match(/(\d+)$/); return m ? parseInt(m[1], 10) : NaN })
      .filter(n => !isNaN(n))
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `Ex - ${String(max + 1).padStart(3, '0')}`
  })()

  const isPending = createExhibit.isPending || updateExhibit.isPending || deleteExhibit.isPending
  const isEdit = !!exhibit

  // Re-populate form when exhibit changes (e.g. switching rows)
  useEffect(() => {
    setForm(exhibit ? exhibitToForm(exhibit) : emptyForm())
  }, [exhibit?.id])

  const set = (field: keyof ExhibitFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = () => {
    const payload = {
      name: form.name.trim(),
      faction_id: form.faction_id || null,
      status: form.status,
      archive_status: form.archive_status,
      threat_level: (form.threat_level || null) as ThreatLevel | null,
      domain: form.domain.trim() || null,
      behavioral_pattern: form.behavioral_pattern.trim() || null,
      origin_reality_status: form.origin_reality_status,
      backlog_release: form.backlog_release,
      miniature_name: form.miniature_name.trim() || null,
      paint_scheme: form.paint_scheme.trim() || null,
      base_size: form.base_size.trim() || null,
      episode_type: form.episode_type.trim() || null,
      runtime_class: (form.runtime_class || null) as RuntimeClass | null,
      filmed: form.filmed,
      lore_text: form.lore_text.trim() || null,
      curator_interpretation: form.curator_interpretation.trim() || null,
      engineer_assessment: form.engineer_assessment.trim() || null,
      biologist_assessment: form.biologist_assessment.trim() || null,
    }

    if (isEdit) {
      // exhibit_number is intentionally excluded — it cannot change after assignment
      updateExhibit.mutate({ id: exhibit!.id, payload }, { onSuccess: onClose })
    } else {
      createExhibit.mutate(
        {
          ...payload,
          exhibit_number: nextExhibitNumber,
          wanderer_assessment: null,
          muscle_assessment: null,
          footnotes: null,
          squad_id: null,
          episode_number: null,
          posted_date: null,
          platform: null,
          drive_doc_id: null,
          drive_doc_url: null,
        },
        { onSuccess: onClose }
      )
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-[#0a0c10] border-l border-[#1c1f26] z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1f26] shrink-0">
          <div>
            <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-0.5">
              {isEdit ? `EXHIBIT — ${exhibit!.exhibit_number ?? 'UNNUMBERED'}` : 'NEW EXHIBIT'}
            </div>
            <h2 className="font-display text-xl text-[#dde0e6] tracking-widest">
              {isEdit ? form.name || 'UNNAMED' : 'CATALOGUE ENTRY'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#3d4352] hover:text-[#8891a4] font-mono text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Section: Identity ── */}
          <Section label="IDENTITY">
            <Field label="DESIGNATION">
              <TextInput value={form.name} onChange={(v) => set('name', v)} placeholder="Exhibit name" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="EXHIBIT NUMBER">
                <div className="w-full bg-[#0d0f14] border border-[#1c1f26] rounded px-3 py-2 text-sm font-mono text-[#5a6175]">
                  {isEdit ? (exhibit!.exhibit_number ?? '—') : nextExhibitNumber}
                </div>
              </Field>
              <Field label="FACTION">
                <SelectInput
                  value={form.faction_id}
                  onChange={(v) => set('faction_id', v)}
                  options={[
                    { value: '', label: '— UNASSIGNED —' },
                    ...factions.map((f) => ({ value: f.id, label: `${f.faction_id} — ${f.name}` })),
                  ]}
                />
              </Field>
            </div>
            <Field label="STATUS">
              <div className="flex gap-1 flex-wrap">
                {(['drafted', 'needs-lore', 'canon-locked', 'published'] as EntryStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => set('status', s)}
                    className={`px-3 py-1.5 font-mono text-[10px] tracking-widest rounded transition-colors ${
                      form.status === s
                        ? 'bg-[#66ff99]/10 text-[#66ff99] border border-[#66ff99]/30'
                        : 'text-[#5a6175] hover:text-[#8891a4] border border-[#1c1f26]'
                    }`}
                  >
                    {s.toUpperCase().replace('-', ' ')}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          {/* ── Section: Classification ── */}
          <Section label="CLASSIFICATION">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ARCHIVE STATUS">
                <SelectInput
                  value={form.archive_status}
                  onChange={(v) => set('archive_status', v as ArchiveStatus)}
                  options={[
                    { value: 'UNCLASSIFIED', label: 'UNCLASSIFIED' },
                    { value: 'ACTIVE', label: 'ACTIVE' },
                    { value: 'ARCHIVED', label: 'ARCHIVED' },
                    { value: 'SCHEMA MISMATCH', label: 'SCHEMA MISMATCH' },
                  ]}
                />
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
              <Field label="DOMAIN">
                <TextInput value={form.domain} onChange={(v) => set('domain', v)} placeholder="Bio / Synthetic / Anomalous" />
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
            </div>
            <Field label="BEHAVIORAL PATTERN">
              <TextInput value={form.behavioral_pattern} onChange={(v) => set('behavioral_pattern', v)} placeholder="Observed behavior class" />
            </Field>
            <div className="flex items-center gap-2">
              <input
                id="backlog"
                type="checkbox"
                checked={form.backlog_release}
                onChange={(e) => set('backlog_release', e.target.checked)}
                className="accent-[#66ff99]"
              />
              <label htmlFor="backlog" className="font-mono text-[10px] text-[#5a6175] tracking-widest cursor-pointer">
                BACKLOG RELEASE — PRIOR COLLECTION DATE: [REDACTED]
              </label>
            </div>
          </Section>

          {/* ── Section: Physical ── */}
          <Section label="SPECIMEN DATA // MINICØDEX">
            <div className="grid grid-cols-2 gap-3">
              <Field label="MINIATURE NAME">
                <TextInput value={form.miniature_name} onChange={(v) => set('miniature_name', v)} placeholder="Physical model name" />
              </Field>
              <Field label="BASE SIZE">
                <TextInput value={form.base_size} onChange={(v) => set('base_size', v)} placeholder="e.g. 32mm" />
              </Field>
            </div>
            <Field label="PAINT SCHEME">
              <TextInput value={form.paint_scheme} onChange={(v) => set('paint_scheme', v)} placeholder="Colour scheme description" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="RUNTIME CLASS">
                <SelectInput
                  value={form.runtime_class}
                  onChange={(v) => set('runtime_class', v)}
                  options={[
                    { value: '', label: '—' },
                    { value: 'SHORT', label: 'SHORT — 30–40s' },
                    { value: 'STANDARD', label: 'STANDARD — 2–3min' },
                    { value: 'LONG', label: 'LONG — 3min+' },
                    { value: 'EVENT', label: 'EVENT — as needed' },
                  ]}
                />
              </Field>
              <Field label="EPISODE TYPE">
                <SelectInput
                  value={form.episode_type}
                  onChange={(v) => set('episode_type', v)}
                  options={[
                    { value: '', label: '—' },
                    ...Object.entries(EPISODE_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v })),
                  ]}
                />
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="filmed"
                type="checkbox"
                checked={form.filmed}
                onChange={(e) => set('filmed', e.target.checked)}
                className="accent-[#66ff99]"
              />
              <label htmlFor="filmed" className="font-mono text-[10px] text-[#5a6175] tracking-widest cursor-pointer">
                FILMING COMPLETE
              </label>
            </div>
          </Section>

          {/* ── Section: Lore ── */}
          <Section label="LORE RECORD">
            <Field label="LORE TEXT">
              <TextArea
                value={form.lore_text}
                onChange={(v) => set('lore_text', v)}
                placeholder="General lore / entity background..."
                rows={4}
              />
            </Field>
            <Field label="CURATOR INTERPRETATION" labelColor="text-[#F2E9DC]">
              <TextArea
                value={form.curator_interpretation}
                onChange={(v) => set('curator_interpretation', v)}
                placeholder="Curator's weighted conclusions..."
                rows={3}
              />
            </Field>
            <Field label="ENGINEER ASSESSMENT" labelColor="text-[#5ED9FF]">
              <TextArea
                value={form.engineer_assessment}
                onChange={(v) => set('engineer_assessment', v)}
                placeholder="Clinical, functional analysis..."
                rows={3}
              />
            </Field>
            <Field label="BIOLOGIST ASSESSMENT" labelColor="text-[#F5C842]">
              <TextArea
                value={form.biologist_assessment}
                onChange={(v) => set('biologist_assessment', v)}
                placeholder="Biological observation..."
                rows={3}
              />
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
                  onClick={() => deleteExhibit.mutate(exhibit!.id, { onSuccess: onClose })}
                  disabled={isPending}
                >
                  <span className="text-[#cc3355]">{isPending ? 'DELETING...' : 'YES, DELETE'}</span>
                </Button>
              </>
            )}
          </div>
          {(createExhibit.isError || updateExhibit.isError) && (
            <span className="font-mono text-[10px] text-[#cc3355] tracking-widest">
              SAVE FAILED — CHECK CONSOLE
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              CANCEL
            </Button>
            <Button onClick={handleSave} disabled={isPending || !form.name.trim()}>
              {isPending ? 'SAVING...' : isEdit ? 'COMMIT CHANGES' : 'COMMIT TO ARCHIVE'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Small primitives ──────────────────────────────────────────────────────────

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

function Field({
  label,
  labelColor = 'text-[#3d4352]',
  children,
}: {
  label: string
  labelColor?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className={`font-mono text-[10px] tracking-widest mb-1 ${labelColor}`}>{label}</div>
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

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
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

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
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
