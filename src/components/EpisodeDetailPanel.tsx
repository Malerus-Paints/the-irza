import { useState, useEffect } from 'react'
import {
  useEpisodePhotos, useCreateEpisodePhoto, useDeleteEpisodePhoto,
  useExhibitRevelations, useCreateExhibitRevelation, useDeleteExhibitRevelation,
  useUpdateEpisode,
} from '../hooks/useData'
import { EPISODE_TYPE_LABELS, EPISODE_TYPE_RUNTIME } from '../types'
import type { Episode, EpisodeStatus, PhotoRole, RevelationState, RevealedField, RuntimeClass } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PHOTO_ROLES: { value: PhotoRole; label: string }[] = [
  { value: 'primary',    label: 'Primary' },
  { value: 'secondary',  label: 'Secondary' },
  { value: 'background', label: 'Background' },
  { value: 'prop',       label: 'Prop' },
]

const REVELATION_STATES: { value: RevelationState; label: string; color: string }[] = [
  { value: 'revealed',       label: 'REVEALED',       color: 'text-[#66ff99]' },
  { value: 'pending_review', label: 'PENDING REVIEW', color: 'text-[#e8b84b]' },
  { value: 'encrypted',      label: 'ENCRYPTED',      color: 'text-[#5a6175]' },
  { value: 'redacted',       label: 'REDACTED',       color: 'text-[#cc3355]' },
]

const REVEALED_FIELDS: { value: RevealedField; label: string }[] = [
  { value: 'name',                 label: 'Entity Name' },
  { value: 'designation',         label: 'Designation' },
  { value: 'faction',             label: 'Faction' },
  { value: 'origin_sect',         label: 'Origin / Sect' },
  { value: 'hazard_class',        label: 'Hazard Class' },
  { value: 'threat_level',        label: 'Threat Level' },
  { value: 'behavioral_pattern',  label: 'Behavioral Pattern' },
  { value: 'engineer_assessment', label: 'Engineer Assessment' },
  { value: 'biologist_assessment',label: 'Biologist Assessment' },
]

const STATE_COLORS: Record<RevelationState, string> = {
  revealed:       'text-[#66ff99]',
  pending_review: 'text-[#e8b84b]',
  encrypted:      'text-[#5a6175]',
  redacted:       'text-[#cc3355]',
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls = 'bg-[#0a0c10] border border-[#1c1f26] rounded px-2 py-1.5 text-xs text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/30 w-full'
const labelCls = 'font-mono text-[9px] text-[#5a6175] tracking-widest block mb-1 uppercase'

// ─── Episode edit form ────────────────────────────────────────────────────────

type EditFields = {
  title: string
  episode_number: string
  episode_type: string
  runtime_class: RuntimeClass | ''
  status: EpisodeStatus
  phase: string
  posted_date: string
  notes: string
}

function toEditFields(ep: Episode): EditFields {
  return {
    title: ep.title,
    episode_number: ep.episode_number != null ? String(ep.episode_number) : '',
    episode_type: ep.episode_type ?? '',
    runtime_class: ep.runtime_class ?? '',
    status: ep.status,
    phase: String(ep.phase),
    posted_date: ep.posted_date ?? '',
    notes: ep.notes ?? '',
  }
}

function EpisodeEditForm({ episode }: { episode: Episode }) {
  const update = useUpdateEpisode()
  const [fields, setFields] = useState<EditFields>(() => toEditFields(episode))
  const [isDirty, setIsDirty] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setFields(toEditFields(episode))
    setIsDirty(false)
    setSaveError(null)
  }, [episode.id])

  function set(patch: Partial<EditFields>) {
    setFields((f) => ({ ...f, ...patch }))
    setIsDirty(true)
    setSaveError(null)
  }

  function handleSave() {
    if (!fields.title.trim()) return

    const epNumRaw = fields.episode_number.trim()
    const epNum = epNumRaw !== '' ? parseInt(epNumRaw) : null
    // Only include episode_number in payload if it actually changed, to avoid
    // spurious unique-constraint conflicts when the field is just re-submitted
    const origEpNum = episode.episode_number
    const epNumChanged = epNum !== origEpNum

    update.mutate(
      {
        id: episode.id,
        payload: {
          title: fields.title.trim(),
          ...(epNumChanged ? { episode_number: epNum } : {}),
          episode_type: fields.episode_type || null,
          runtime_class: (fields.runtime_class || null) as RuntimeClass | null,
          status: fields.status,
          phase: parseInt(fields.phase) || 1,
          posted_date: fields.posted_date.trim() || null,
          notes: fields.notes.trim() || null,
        },
      },
      {
        onSuccess: () => { setIsDirty(false); setSaveError(null) },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? 'Unknown error'
          setSaveError(
            msg.includes('unique') || msg.includes('duplicate')
              ? 'EP # already taken — choose a different number'
              : msg
          )
        },
      }
    )
  }

  return (
    <div className="mb-4 pb-4 border-b border-[#1c1f26]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[9px] text-[#5a6175] tracking-widest">EPISODE FIELDS</span>
        <div className="flex items-center gap-3">
          {isDirty && !saveError && <span className="font-mono text-[9px] text-[#e8b84b] tracking-widest">UNSAVED</span>}
          {saveError && (
            <span className="font-mono text-[9px] text-[#cc3355] tracking-widest max-w-[220px] text-right leading-tight">
              {saveError}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || !fields.title.trim() || update.isPending}
            className="font-mono text-[9px] tracking-widest px-3 py-1 rounded bg-[#66ff99]/10 text-[#66ff99] hover:bg-[#66ff99]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {update.isPending ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2 mb-2">
        <div className="col-span-3">
          <label className={labelCls}>Title</label>
          <input
            value={fields.title}
            onChange={(e) => set({ title: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Ep #</label>
          <input
            type="number"
            min={1}
            placeholder="—"
            value={fields.episode_number}
            onChange={(e) => set({ episode_number: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Phase</label>
          <input
            type="number"
            min={1}
            value={fields.phase}
            onChange={(e) => set({ phase: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={fields.status}
            onChange={(e) => set({ status: e.target.value as EpisodeStatus })}
            className={inputCls}
          >
            <option value="planned">PLANNED</option>
            <option value="scripted">SCRIPTED</option>
            <option value="filmed">FILMED</option>
            <option value="posted">POSTED</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div>
          <label className={labelCls}>Type</label>
          <select
            value={fields.episode_type}
            onChange={(e) => {
              const t = e.target.value
              set({ episode_type: t, ...(EPISODE_TYPE_RUNTIME[t] ? { runtime_class: EPISODE_TYPE_RUNTIME[t] } : {}) })
            }}
            className={inputCls}
          >
            <option value="">— UNCLASSIFIED —</option>
            {Object.entries(EPISODE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Runtime</label>
          <select
            value={fields.runtime_class}
            onChange={(e) => set({ runtime_class: e.target.value as RuntimeClass | '' })}
            className={inputCls}
          >
            <option value="">— —</option>
            <option value="SHORT">SHORT — 30–40s</option>
            <option value="STANDARD">STANDARD — 2–3min</option>
            <option value="LONG">LONG — 3min+</option>
            <option value="EVENT">EVENT — as needed</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Posted Date</label>
          <input
            type="date"
            value={fields.posted_date}
            onChange={(e) => set({ posted_date: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          rows={2}
          placeholder="Production notes, reminders..."
          value={fields.notes}
          onChange={(e) => set({ notes: e.target.value })}
          className={`${inputCls} resize-none`}
        />
      </div>
    </div>
  )
}

// ─── Photos sub-panel ─────────────────────────────────────────────────────────

function PhotosPanel({ episode }: { episode: Episode }) {
  const { data: photos = [], isLoading } = useEpisodePhotos(episode.id)
  const create = useCreateEpisodePhoto()
  const remove = useDeleteEpisodePhoto()

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ file_path: '', photo_role: 'primary' as PhotoRole, notes: '' })

  async function handleAdd() {
    if (!form.file_path.trim()) return
    await create.mutateAsync({
      episode_id: episode.id,
      exhibit_id: episode.exhibit_id,
      file_path: form.file_path.trim(),
      photo_role: form.photo_role,
      notes: form.notes.trim() || null,
    })
    setForm({ file_path: '', photo_role: 'primary', notes: '' })
    setShowAdd(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] text-[#5a6175] tracking-widest">ASSETS USED</span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="font-mono text-[9px] text-[#5ed9ff] tracking-widest hover:text-[#5ed9ff]/70 transition-colors"
        >
          {showAdd ? '— CANCEL' : '+ ADD PHOTO'}
        </button>
      </div>

      {isLoading && <div className="font-mono text-[9px] text-[#3d4352] tracking-widest">LOADING...</div>}

      {photos.length > 0 && (
        <div className="space-y-1 mb-2">
          {photos.map((p) => (
            <div key={p.id} className="flex items-start gap-2 group">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] text-[#dde0e6] truncate">{p.file_path}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[9px] text-[#5ed9ff] tracking-widest">{p.photo_role.toUpperCase()}</span>
                  {p.notes && <span className="font-mono text-[9px] text-[#3d4352]">{p.notes}</span>}
                </div>
              </div>
              <button
                onClick={() => remove.mutate(p.id)}
                className="font-mono text-[9px] text-[#3d4352] hover:text-[#cc3355] opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && photos.length === 0 && !showAdd && (
        <div className="font-mono text-[9px] text-[#2a2e38] tracking-widest">NO ASSETS LOGGED</div>
      )}

      {showAdd && (
        <div className="border border-[#1c1f26] rounded p-3 space-y-2 mt-2">
          <div>
            <label className={labelCls}>File Path</label>
            <input
              type="text"
              placeholder="Mini Photos/Faction/Name.jpg"
              value={form.file_path}
              onChange={(e) => setForm({ ...form, file_path: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Role</label>
              <select
                value={form.photo_role}
                onChange={(e) => setForm({ ...form, photo_role: e.target.value as PhotoRole })}
                className={inputCls}
              >
                {PHOTO_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <input
                type="text"
                placeholder="Optional..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.file_path.trim() || create.isPending}
            className="font-mono text-[9px] tracking-widest px-3 py-1.5 rounded bg-[#5ed9ff]/10 text-[#5ed9ff] hover:bg-[#5ed9ff]/20 disabled:opacity-40 transition-colors w-full"
          >
            {create.isPending ? 'LOGGING...' : 'LOG ASSET'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Revelations sub-panel ────────────────────────────────────────────────────

function RevelationsPanel({ episode, gateLevel }: { episode: Episode; gateLevel: number }) {
  const { data: revelations = [], isLoading } = useExhibitRevelations({ episodeId: episode.id })
  const create = useCreateExhibitRevelation()
  const remove = useDeleteExhibitRevelation()

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<{
    field_name: RevealedField
    revealed_value: string
    revelation_state: RevelationState
  }>({
    field_name: 'name',
    revealed_value: '',
    revelation_state: 'revealed',
  })

  async function handleAdd() {
    await create.mutateAsync({
      episode_id: episode.id,
      exhibit_id: episode.exhibit_id,
      faction_id: episode.faction_id,
      field_name: form.field_name,
      revealed_value: form.revealed_value.trim() || null,
      revelation_state: form.revelation_state,
      gate_level: gateLevel,
      notes: null,
    })
    setForm({ field_name: 'name', revealed_value: '', revelation_state: 'revealed' })
    setShowAdd(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] text-[#5a6175] tracking-widest">DATA REVEALED</span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="font-mono text-[9px] text-[#66ff99] tracking-widest hover:text-[#66ff99]/70 transition-colors"
        >
          {showAdd ? '— CANCEL' : '+ ADD REVELATION'}
        </button>
      </div>

      {isLoading && <div className="font-mono text-[9px] text-[#3d4352] tracking-widest">LOADING...</div>}

      {revelations.length > 0 && (
        <div className="space-y-1 mb-2">
          {revelations.map((r) => (
            <div key={r.id} className="flex items-start gap-2 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[9px] text-[#5a6175] tracking-widest shrink-0">
                    {REVEALED_FIELDS.find((f) => f.value === r.field_name)?.label ?? r.field_name}
                  </span>
                  {r.revealed_value && (
                    <span className="font-mono text-[10px] text-[#dde0e6] truncate">{r.revealed_value}</span>
                  )}
                </div>
                <span className={`font-mono text-[9px] tracking-widest ${STATE_COLORS[r.revelation_state]}`}>
                  {r.revelation_state.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => remove.mutate(r.id)}
                className="font-mono text-[9px] text-[#3d4352] hover:text-[#cc3355] opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && revelations.length === 0 && !showAdd && (
        <div className="font-mono text-[9px] text-[#2a2e38] tracking-widest">NO REVELATIONS LOGGED</div>
      )}

      {showAdd && (
        <div className="border border-[#1c1f26] rounded p-3 space-y-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Field</label>
              <select
                value={form.field_name}
                onChange={(e) => setForm({ ...form, field_name: e.target.value as RevealedField })}
                className={inputCls}
              >
                {REVEALED_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>State</label>
              <select
                value={form.revelation_state}
                onChange={(e) => setForm({ ...form, revelation_state: e.target.value as RevelationState })}
                className={inputCls}
              >
                {REVELATION_STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Value Shown <span className="text-[#3d4352] normal-case">(leave blank if encrypted/redacted)</span></label>
            <input
              type="text"
              placeholder="e.g. BRIGHTHELM, ELARA"
              value={form.revealed_value}
              onChange={(e) => setForm({ ...form, revealed_value: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">
              GATE {gateLevel} · {episode.exhibit_id ? 'EXHIBIT LINKED' : 'NO EXHIBIT'}
            </span>
            <button
              onClick={handleAdd}
              disabled={create.isPending}
              className="font-mono text-[9px] tracking-widest px-3 py-1.5 rounded bg-[#66ff99]/10 text-[#66ff99] hover:bg-[#66ff99]/20 disabled:opacity-40 transition-colors"
            >
              {create.isPending ? 'LOGGING...' : 'LOG REVELATION'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function EpisodeDetailPanel({
  episode,
  gateLevel,
}: {
  episode: Episode
  gateLevel: number
}) {
  return (
    <div className="border-t border-[#1c1f26] mt-3 pt-3">
      <EpisodeEditForm episode={episode} />
      <div className="grid grid-cols-2 gap-6">
        <PhotosPanel episode={episode} />
        <RevelationsPanel episode={episode} gateLevel={gateLevel} />
      </div>
    </div>
  )
}
