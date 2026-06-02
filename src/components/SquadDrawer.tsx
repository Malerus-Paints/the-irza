import { useState, useEffect } from 'react'
import { useCreateSquad, useUpdateSquad, useDeleteSquad, useFactions } from '../hooks/useData'
import { Button } from './ui'
import type { Squad, EntryStatus, ThreatLevel } from '../types'

type SquadRole = 'VANGUARD' | 'RECON' | 'HEAVY' | 'RITUAL' | 'COMMAND' | 'SUPPORT' | 'UNKNOWN'

type SquadFormData = {
  squad_id: string
  name: string
  faction_id: string
  squad_role: SquadRole
  domain: string
  threat_level: ThreatLevel | ''
  collective_behavior_type: string
  system_status: string
  lore_text: string
  status: EntryStatus
}

function emptyForm(): SquadFormData {
  return {
    squad_id: '',
    name: '',
    faction_id: '',
    squad_role: 'UNKNOWN',
    domain: '',
    threat_level: '',
    collective_behavior_type: '',
    system_status: 'MONITORING',
    lore_text: '',
    status: 'drafted',
  }
}

function squadToForm(s: Squad): SquadFormData {
  return {
    squad_id: s.squad_id,
    name: s.name,
    faction_id: s.faction_id ?? '',
    squad_role: s.squad_role,
    domain: s.domain ?? '',
    threat_level: s.threat_level ?? '',
    collective_behavior_type: s.collective_behavior_type ?? '',
    system_status: s.system_status,
    lore_text: s.lore_text ?? '',
    status: s.status,
  }
}

interface Props {
  squad: Squad | null
  onClose: () => void
}

export function SquadDrawer({ squad, onClose }: Props) {
  const [form, setForm] = useState<SquadFormData>(squad ? squadToForm(squad) : emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const createSquad = useCreateSquad()
  const updateSquad = useUpdateSquad()
  const deleteSquad = useDeleteSquad()
  const { data: factions = [] } = useFactions()

  const isPending = createSquad.isPending || updateSquad.isPending || deleteSquad.isPending
  const isEdit = !!squad

  useEffect(() => {
    setForm(squad ? squadToForm(squad) : emptyForm())
    setConfirmDelete(false)
  }, [squad?.id])

  const set = (field: keyof SquadFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = () => {
    const payload = {
      squad_id: form.squad_id.trim(),
      name: form.name.trim(),
      faction_id: form.faction_id || null,
      squad_role: form.squad_role,
      domain: form.domain.trim() || null,
      threat_level: (form.threat_level || null) as ThreatLevel | null,
      collective_behavior_type: form.collective_behavior_type.trim() || null,
      system_status: form.system_status.trim() || 'MONITORING',
      lore_text: form.lore_text.trim() || null,
      status: form.status,
    }

    if (isEdit) {
      updateSquad.mutate({ id: squad!.id, payload }, { onSuccess: onClose })
    } else {
      createSquad.mutate(
        { ...payload, drive_doc_id: null, drive_doc_url: null },
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
            <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-0.5">
              {isEdit ? `SQUAD — ${squad!.squad_id}` : 'NEW SQUAD'}
            </div>
            <h2 className="font-display text-xl text-[#dde0e6] tracking-widest">
              {isEdit ? form.name || 'UNNAMED' : 'REGISTER SQUAD'}
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
              <Field label="SQUAD ID">
                <TextInput value={form.squad_id} onChange={(v) => set('squad_id', v)} placeholder="e.g. S-001" />
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
              <TextInput value={form.name} onChange={(v) => set('name', v)} placeholder="Squad designation" />
            </Field>
            <Field label="FACTION">
              <SelectInput
                value={form.faction_id}
                onChange={(v) => set('faction_id', v)}
                options={[
                  { value: '', label: '— SELECT FACTION —' },
                  ...factions.map((f) => ({ value: f.id, label: `${f.faction_id} — ${f.name}` })),
                ]}
              />
            </Field>
          </Section>

          <Section label="CLASSIFICATION">
            <div className="grid grid-cols-2 gap-3">
              <Field label="SQUAD ROLE">
                <SelectInput
                  value={form.squad_role}
                  onChange={(v) => set('squad_role', v as SquadRole)}
                  options={[
                    { value: 'UNKNOWN', label: 'UNKNOWN' },
                    { value: 'VANGUARD', label: 'VANGUARD' },
                    { value: 'RECON', label: 'RECON' },
                    { value: 'HEAVY', label: 'HEAVY' },
                    { value: 'RITUAL', label: 'RITUAL' },
                    { value: 'COMMAND', label: 'COMMAND' },
                    { value: 'SUPPORT', label: 'SUPPORT' },
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
              <Field label="SYSTEM STATUS">
                <TextInput value={form.system_status} onChange={(v) => set('system_status', v)} placeholder="MONITORING" />
              </Field>
            </div>
            <Field label="COLLECTIVE BEHAVIOR TYPE">
              <TextInput value={form.collective_behavior_type} onChange={(v) => set('collective_behavior_type', v)} placeholder="Observed collective behavior pattern" />
            </Field>
          </Section>

          <Section label="LORE RECORD">
            <Field label="LORE TEXT">
              <TextArea value={form.lore_text} onChange={(v) => set('lore_text', v)} placeholder="Full squad lore record..." rows={6} />
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
                  onClick={() => deleteSquad.mutate(squad!.id, { onSuccess: onClose })}
                  disabled={isPending}
                >
                  <span className="text-[#cc3355]">{isPending ? 'DELETING...' : 'YES, DELETE'}</span>
                </Button>
              </>
            )}
          </div>
          {(createSquad.isError || updateSquad.isError) && (
            <span className="font-mono text-[10px] text-[#cc3355] tracking-widest">
              SAVE FAILED — CHECK CONSOLE
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>CANCEL</Button>
            <Button onClick={handleSave} disabled={isPending || !form.name.trim() || !form.squad_id.trim()}>
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
