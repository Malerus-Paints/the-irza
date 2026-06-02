import { useState, useEffect } from 'react'
import { useCreateAnomaly, useUpdateAnomaly, useDeleteAnomaly } from '../hooks/useData'
import { Button } from './ui'
import type { Anomaly, EntryStatus, ThreatLevel } from '../types'

type AnomalyFormData = {
  anomaly_id: string
  designation: string
  origin_classification: 'UNKNOWN' | 'FRACTURED' | 'SELF-CONTAINED' | 'ECHO'
  domain: string
  threat_level: ThreatLevel | ''
  behavioral_pattern: string
  collective_or_individual: 'Collective' | 'Individual' | ''
  system_status: string
  reality_signature: string
  lore_text: string
  status: EntryStatus
}

function emptyForm(): AnomalyFormData {
  return {
    anomaly_id: '',
    designation: '',
    origin_classification: 'UNKNOWN',
    domain: '',
    threat_level: '',
    behavioral_pattern: '',
    collective_or_individual: '',
    system_status: 'UNRESOLVED',
    reality_signature: '',
    lore_text: '',
    status: 'drafted',
  }
}

function anomalyToForm(a: Anomaly): AnomalyFormData {
  return {
    anomaly_id: a.anomaly_id,
    designation: a.designation,
    origin_classification: a.origin_classification,
    domain: a.domain ?? '',
    threat_level: a.threat_level ?? '',
    behavioral_pattern: a.behavioral_pattern ?? '',
    collective_or_individual: a.collective_or_individual ?? '',
    system_status: a.system_status,
    reality_signature: a.reality_signature ?? '',
    lore_text: a.lore_text ?? '',
    status: a.status,
  }
}

interface Props {
  anomaly: Anomaly | null
  onClose: () => void
}

export function AnomalyDrawer({ anomaly, onClose }: Props) {
  const [form, setForm] = useState<AnomalyFormData>(anomaly ? anomalyToForm(anomaly) : emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const createAnomaly = useCreateAnomaly()
  const updateAnomaly = useUpdateAnomaly()
  const deleteAnomaly = useDeleteAnomaly()

  const isPending = createAnomaly.isPending || updateAnomaly.isPending || deleteAnomaly.isPending
  const isEdit = !!anomaly

  useEffect(() => {
    setForm(anomaly ? anomalyToForm(anomaly) : emptyForm())
    setConfirmDelete(false)
  }, [anomaly?.id])

  const set = (field: keyof AnomalyFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = () => {
    const payload = {
      anomaly_id: form.anomaly_id.trim(),
      designation: form.designation.trim(),
      origin_classification: form.origin_classification,
      domain: form.domain.trim() || null,
      threat_level: (form.threat_level || null) as ThreatLevel | null,
      behavioral_pattern: form.behavioral_pattern.trim() || null,
      collective_or_individual: (form.collective_or_individual || null) as 'Collective' | 'Individual' | null,
      system_status: form.system_status.trim() || 'UNRESOLVED',
      reality_signature: form.reality_signature.trim() || null,
      lore_text: form.lore_text.trim() || null,
      status: form.status,
    }

    if (isEdit) {
      updateAnomaly.mutate({ id: anomaly!.id, payload }, { onSuccess: onClose })
    } else {
      createAnomaly.mutate(
        { ...payload, episode_number: null, filmed: false, posted_date: null, platform: null, drive_doc_id: null, drive_doc_url: null },
        { onSuccess: onClose }
      )
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-[#0a0c10] border-l border-[#1c1f26] z-50 flex flex-col shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1f26] shrink-0">
          <div>
            <div className="font-mono text-[10px] text-[#cc3355] tracking-widest mb-0.5">
              {isEdit ? `ANOMALY — ${anomaly!.anomaly_id}` : 'NEW ANOMALY'}
            </div>
            <h2 className="font-display text-xl text-[#dde0e6] tracking-widest">
              {isEdit ? form.designation || 'UNNAMED' : 'LOG ANOMALY'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#3d4352] hover:text-[#8891a4] font-mono text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          <Section label="IDENTITY">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ANOMALY ID">
                <TextInput value={form.anomaly_id} onChange={(v) => set('anomaly_id', v)} placeholder="e.g. A-001" />
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
            <Field label="DESIGNATION">
              <TextInput value={form.designation} onChange={(v) => set('designation', v)} placeholder="Anomaly designation" />
            </Field>
          </Section>

          <Section label="CLASSIFICATION">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ORIGIN CLASSIFICATION">
                <SelectInput
                  value={form.origin_classification}
                  onChange={(v) => set('origin_classification', v as AnomalyFormData['origin_classification'])}
                  options={[
                    { value: 'UNKNOWN', label: 'UNKNOWN' },
                    { value: 'FRACTURED', label: 'FRACTURED' },
                    { value: 'SELF-CONTAINED', label: 'SELF-CONTAINED' },
                    { value: 'ECHO', label: 'ECHO' },
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
                <TextInput value={form.domain} onChange={(v) => set('domain', v)} placeholder="Anomalous / Bio / Synthetic" />
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
              <Field label="BEHAVIORAL PATTERN">
                <TextInput value={form.behavioral_pattern} onChange={(v) => set('behavioral_pattern', v)} placeholder="Observed behavior" />
              </Field>
              <Field label="SYSTEM STATUS">
                <TextInput value={form.system_status} onChange={(v) => set('system_status', v)} placeholder="UNRESOLVED" />
              </Field>
            </div>
            <Field label="REALITY SIGNATURE">
              <TextInput value={form.reality_signature} onChange={(v) => set('reality_signature', v)} placeholder="Dimensional trace / signature string" />
            </Field>
          </Section>

          <Section label="LORE RECORD">
            <Field label="LORE TEXT">
              <TextArea value={form.lore_text} onChange={(v) => set('lore_text', v)} placeholder="Full anomaly lore record..." rows={6} />
            </Field>
          </Section>

        </div>

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
                  onClick={() => deleteAnomaly.mutate(anomaly!.id, { onSuccess: onClose })}
                  disabled={isPending}
                >
                  <span className="text-[#cc3355]">{isPending ? 'DELETING...' : 'YES, DELETE'}</span>
                </Button>
              </>
            )}
          </div>
          {(createAnomaly.isError || updateAnomaly.isError) && (
            <span className="font-mono text-[10px] text-[#cc3355] tracking-widest">
              SAVE FAILED — CHECK CONSOLE
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>CANCEL</Button>
            <Button onClick={handleSave} disabled={isPending || !form.designation.trim() || !form.anomaly_id.trim()}>
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
