import { useState, useEffect, useCallback } from 'react'
import { useEpisodes, useUpdateEpisode, useCreateEpisode } from '../hooks/useData'
import { Spinner } from '../components/ui'
import { EPISODE_TYPE_LABELS } from '../types'
import type { Episode, EpisodeStatus, RuntimeClass } from '../types'

const CHARACTERS = [
  { name: 'CURATOR',   color: '#F2E9DC', style: 'Metaphor over fact. Weighted conclusions. Never states anything directly.' },
  { name: 'MUSCLE',    color: '#ffffff',  style: 'Reactive, casual. Says what the audience is thinking.' },
  { name: 'ENGINEER',  color: '#5ED9FF', style: 'Clinical, functional, precise. No excess.' },
  { name: 'BIOLOGIST', color: '#F5C842', style: 'Wonder + precision. Slightly fast delivery.' },
  { name: 'SYSTEM',    color: '#66FF99', style: 'ALL CAPS. Fragmented outputs. Never emotional.' },
  { name: 'WANDERER',  color: '#B8A9C9', style: 'Irregular. Something finding its position.' },
  { name: 'COPYCAT',   color: '#A8B8B0', style: 'Desynced. Unauthorized presence. Glitch cadence.' },
  { name: 'MALERUS',   color: '#888888', style: 'Prior operator. Fragmented trace only.' },
]

const EPISODE_TYPE_LABELS: Record<string, string> = {
  A: 'Exhibit Record',
  B: 'Behavioral Cluster',
  C: 'Cultural Analysis',
  D: 'System Classification',
  E: 'Archive Recovery',
  F: 'Unauthorized Signal',
}

const EPISODE_TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  arc: { text: '#7C6FE0', bg: 'rgba(124,111,224,0.15)' },
  reclassification: { text: '#D4891A', bg: 'rgba(212,137,26,0.15)' },
  classifying: { text: '#3A8FD4', bg: 'rgba(58,143,212,0.15)' },
  behavior_collective: { text: '#2BAE82', bg: 'rgba(43,174,130,0.15)' },
  system_alert: { text: '#D94F4F', bg: 'rgba(217,79,79,0.15)' },
  grunt_work: { text: '#C4622D', bg: 'rgba(196,98,45,0.15)' },
  engineer_analysis: { text: '#7DBF2E', bg: 'rgba(125,191,46,0.15)' },
  biologist_analysis: { text: '#7DBF2E', bg: 'rgba(125,191,46,0.15)' },
  copycat: { text: '#999890', bg: 'rgba(153,152,144,0.15)' },
}

const STATUS_FLOW: EpisodeStatus[] = ['planned', 'scripted', 'filmed', 'posted']

const STATUS_COLORS: Record<EpisodeStatus, string> = {
  planned:  'text-[#3d4352] border-[#3d4352]/30',
  scripted: 'text-[#e8b84b] border-[#e8b84b]/30',
  filmed:   'text-[#5ed9ff] border-[#5ed9ff]/30',
  posted:   'text-[#66ff99] border-[#66ff99]/30',
}

type NewEpForm = {
  title: string
  episode_type: string
  runtime_class: RuntimeClass | ''
  phase: number
}

function emptyNewEp(): NewEpForm {
  return { title: '', episode_type: '', runtime_class: 'STANDARD', phase: 1 }
}

export function ScriptWorkspacePage() {
  const { data: episodes = [], isLoading } = useEpisodes()
  const updateEpisode = useUpdateEpisode()
  const createEpisode = useCreateEpisode()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scriptText, setScriptText] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newEp, setNewEp] = useState<NewEpForm>(emptyNewEp())
  const [search, setSearch] = useState('')

  const selectedEpisode = episodes.find((e) => e.id === selectedId) ?? null

  useEffect(() => {
    if (selectedEpisode) {
      setScriptText(selectedEpisode.script_text ?? '')
      setIsDirty(false)
    }
  }, [selectedId]) // intentionally only on ID change

  const handleSave = useCallback(() => {
    if (!selectedEpisode) return
    const nextStatus: EpisodeStatus =
      selectedEpisode.status === 'planned' ? 'scripted' : selectedEpisode.status
    updateEpisode.mutate(
      { id: selectedEpisode.id, payload: { script_text: scriptText, status: nextStatus } },
      { onSuccess: () => setIsDirty(false) }
    )
  }, [selectedEpisode, scriptText, updateEpisode])

  // Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDirty, handleSave])

  const handleSelectEpisode = (id: string) => {
    setSelectedId(id)
    setCreating(false)
  }

  const handleStatusChange = (status: EpisodeStatus) => {
    if (!selectedEpisode) return
    updateEpisode.mutate({ id: selectedEpisode.id, payload: { status } })
  }

  const handleCreate = () => {
    if (!newEp.title.trim()) return
    createEpisode.mutate(
      {
        title: newEp.title.trim(),
        episode_number: null,
        episode_type: newEp.episode_type || null,
        runtime_class: (newEp.runtime_class || null) as RuntimeClass | null,
        phase: newEp.phase,
        exhibit_id: null,
        squad_id: null,
        faction_id: null,
        anomaly_id: null,
        script_text: null,
        filmed: false,
        posted_date: null,
        platform: null,
        status: 'planned',
        notes: null,
      },
      {
        onSuccess: (ep: Episode) => {
          setSelectedId(ep.id)
          setCreating(false)
          setNewEp(emptyNewEp())
        },
      }
    )
  }

  const filteredEpisodes = episodes.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      String(e.episode_number ?? '').includes(search)
  )

  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0

  if (isLoading) return <Spinner />

  return (
    <div className="flex gap-3" style={{ height: 'calc(100vh - 7rem)' }}>

      {/* ── Left: Episode list ─────────────────────────────────── */}
      <div className="w-48 shrink-0 flex flex-col bg-[#0a0c10] border border-[#1c1f26] rounded-lg overflow-hidden">
        <div className="px-3 py-3 border-b border-[#1c1f26] shrink-0">
          <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-2">EPISODES</div>
          <input
            className="w-full bg-[#111318] border border-[#1c1f26] rounded px-2 py-1 text-xs text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/30 font-sans"
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {filteredEpisodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => handleSelectEpisode(ep.id)}
              className={`w-full text-left px-3 py-2.5 transition-colors border-r-2 ${
                selectedId === ep.id
                  ? 'bg-[#66ff99]/5 border-[#66ff99] text-[#dde0e6]'
                  : 'border-transparent hover:bg-[#1c1f26]/60 text-[#8891a4]'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <div className="font-mono text-[10px] tracking-widest" style={{ color: STATUS_COLORS[ep.status].split(' ')[0].replace('text-[', '').replace(']', '') }}>
                  EP {ep.episode_number ?? '—'}
                </div>
                {ep.episode_type && (
                  <div
                    className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 rounded border"
                    style={{
                      color: EPISODE_TYPE_COLORS[ep.episode_type]?.text || '#5a6175',
                      backgroundColor: EPISODE_TYPE_COLORS[ep.episode_type]?.bg || 'rgba(90,97,117,0.15)',
                      borderColor: `${EPISODE_TYPE_COLORS[ep.episode_type]?.text || '#5a6175'}4D`,
                    }}
                  >
                    {ep.episode_type.toUpperCase().replace('_', ' ')}
                  </div>
                )}
              </div>
              <div className="font-sans text-xs truncate leading-tight">
                {ep.title}
              </div>
            </button>
          ))}
          {filteredEpisodes.length === 0 && (
            <div className="px-3 py-4 font-mono text-[10px] text-[#3d4352] tracking-widest text-center">
              NO EPISODES
            </div>
          )}
        </div>

        <div className="px-3 py-3 border-t border-[#1c1f26] shrink-0">
          <button
            onClick={() => { setCreating(true); setSelectedId(null) }}
            className="w-full text-left font-mono text-[10px] text-[#3d4352] hover:text-[#66ff99] tracking-widest transition-colors"
          >
            + NEW EPISODE
          </button>
        </div>
      </div>

      {/* ── Center: Script editor ──────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#0a0c10] border border-[#1c1f26] rounded-lg overflow-hidden min-w-0">

        {creating ? (
          <NewEpisodeForm
            form={newEp}
            onChange={(f) => setNewEp((p) => ({ ...p, ...f }))}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
            isPending={createEpisode.isPending}
          />
        ) : selectedEpisode ? (
          <>
            {/* Episode header */}
            <div className="px-5 py-4 border-b border-[#1c1f26] shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">
                    EP {selectedEpisode.episode_number ?? '—'} ·{' '}
                    {selectedEpisode.episode_type ? (EPISODE_TYPE_LABELS[selectedEpisode.episode_type] ?? selectedEpisode.episode_type) : 'UNCLASSIFIED'}{' '}
                    {selectedEpisode.runtime_class ? `· ${selectedEpisode.runtime_class}` : ''}{' '}
                    {selectedEpisode.phase ? `· PHASE ${selectedEpisode.phase}` : ''}
                  </div>
                  <h2 className="font-display text-xl text-[#dde0e6] tracking-widest truncate">
                    {selectedEpisode.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status stepper */}
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updateEpisode.isPending}
                      className={`font-mono text-[10px] tracking-widest px-2 py-1 rounded border transition-colors ${
                        selectedEpisode.status === s
                          ? STATUS_COLORS[s]
                          : 'text-[#3d4352] border-[#1c1f26] hover:border-[#2a2e38]'
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Script textarea */}
            <div className="flex-1 flex flex-col min-h-0 px-5 py-4">
              <textarea
                value={scriptText}
                onChange={(e) => { setScriptText(e.target.value); setIsDirty(true) }}
                placeholder={`EPISODE: ${selectedEpisode.title}\n\n[SCENE OPEN]\n\nCURATOR: \nMUSCLE: \nENGINEER: \nBIOLOGIST: \nSYSTEM: \n\n[SCENE CLOSE]`}
                className="flex-1 w-full bg-transparent text-[#dde0e6] font-mono text-sm leading-relaxed placeholder-[#3d4352] focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#1c1f26] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-[#3d4352] tracking-widest">
                  {wordCount} WORDS
                </span>
                {isDirty && (
                  <span className="font-mono text-[10px] text-[#e8b84b] tracking-widest">
                    UNSAVED
                  </span>
                )}
                {updateEpisode.isError && (
                  <span className="font-mono text-[10px] text-[#cc3355] tracking-widest">
                    SAVE FAILED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#3d4352] tracking-widest">
                  CTRL+S
                </span>
                <button
                  onClick={handleSave}
                  disabled={!isDirty || updateEpisode.isPending}
                  className="bg-[#66ff99]/10 hover:bg-[#66ff99]/20 border border-[#66ff99]/30 text-[#66ff99] font-mono text-[10px] tracking-widest px-3 py-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {updateEpisode.isPending ? 'SAVING...' : 'SAVE SCRIPT'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="font-mono text-xs text-[#3d4352] tracking-widest">SELECT AN EPISODE TO BEGIN</div>
              <div className="font-mono text-[10px] text-[#2a2e38] tracking-widest">OR CREATE A NEW EPISODE</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Voice guide ─────────────────────────────────── */}
      {showGuide ? (
        <div className="w-52 shrink-0 flex flex-col bg-[#0a0c10] border border-[#1c1f26] rounded-lg overflow-hidden">
          <div className="px-3 py-3 border-b border-[#1c1f26] flex items-center justify-between shrink-0">
            <div className="font-mono text-[10px] text-[#66ff99] tracking-widest">VOICE GUIDE</div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-[#3d4352] hover:text-[#8891a4] font-mono text-sm transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-3 space-y-4 px-3">
            {CHARACTERS.map((c) => (
              <div key={c.name}>
                <div
                  className="font-mono text-[10px] tracking-widest mb-1"
                  style={{ color: c.color }}
                >
                  {c.name}
                </div>
                <div className="font-sans text-[10px] text-[#5a6175] leading-relaxed">
                  {c.style}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-[#1c1f26] shrink-0">
            <div className="font-mono text-[10px] text-[#2a2e38] tracking-widest">
              TRUE PREMISE NEVER STATED DIRECTLY
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowGuide(true)}
          className="w-6 shrink-0 flex items-center justify-center bg-[#0a0c10] border border-[#1c1f26] rounded-lg hover:border-[#2a2e38] transition-colors"
        >
          <span className="font-mono text-[10px] text-[#3d4352] tracking-widest"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            VOICE GUIDE
          </span>
        </button>
      )}
    </div>
  )
}

function NewEpisodeForm({
  form, onChange, onSave, onCancel, isPending,
}: {
  form: NewEpForm
  onChange: (f: Partial<NewEpForm>) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div className="flex-1 flex flex-col px-5 py-5">
      <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-1">NEW EPISODE</div>
      <h2 className="font-display text-xl text-[#dde0e6] tracking-widest mb-6">CREATE EPISODE</h2>

      <div className="space-y-4 max-w-md">
        <div>
          <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">TITLE</div>
          <input
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Episode title"
            className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">TYPE</div>
            <select
              value={form.episode_type}
              onChange={(e) => onChange({ episode_type: e.target.value })}
              className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans focus:outline-none focus:border-[#66ff99]/40"
            >
              <option value="">— TYPE —</option>
              {Object.entries(EPISODE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">RUNTIME</div>
            <select
              value={form.runtime_class}
              onChange={(e) => onChange({ runtime_class: e.target.value as RuntimeClass | '' })}
              className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans focus:outline-none focus:border-[#66ff99]/40"
            >
              <option value="">— RUNTIME —</option>
              <option value="SHORT">SHORT</option>
              <option value="STANDARD">STANDARD</option>
              <option value="EVENT">EVENT</option>
            </select>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">PHASE</div>
          <input
            type="number"
            min={1}
            value={form.phase}
            onChange={(e) => onChange({ phase: parseInt(e.target.value) || 1 })}
            className="w-24 bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans focus:outline-none focus:border-[#66ff99]/40"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onSave}
            disabled={isPending || !form.title.trim()}
            className="bg-[#66ff99]/10 hover:bg-[#66ff99]/20 border border-[#66ff99]/30 text-[#66ff99] font-mono text-[10px] tracking-widest px-4 py-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isPending ? 'CREATING...' : 'CREATE EPISODE'}
          </button>
          <button
            onClick={onCancel}
            className="font-mono text-[10px] text-[#3d4352] hover:text-[#8891a4] tracking-widest transition-colors px-2"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
