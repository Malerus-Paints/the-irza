import { useState, useEffect } from 'react'
import { useExhibits, useFactions, useAnomalies } from '../hooks/useData'
import {
  BuilderState, ShotEntry, DialogueEntry, UIEventEntry, GlitchEntry, AudioCueEntry, InfoRow,
  LAYOUTS, CAMERA_MOVES, SPEAKERS, GLITCH_INTENSITIES, SYSTEMUI_VARIANTS, AUDIO_PRESETS, COMMON_AUDIO_CUES,
  defaultBuilderState, loadBuilderState,
  exhibitToCard, factionToCard, anomalyToCard,
  newShot, newDialogue, newUIEvent, newGlitch, newAudioCue, generateTS,
} from '../lib/script-builder'
import type { Episode } from '../types'

// ── Style constants ───────────────────────────────────────────────────────────

const inputCls = 'w-full bg-[#111318] border border-[#1c1f26] rounded px-2 py-1.5 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 transition-colors'
const selectCls = 'bg-[#111318] border border-[#1c1f26] rounded px-2 py-1.5 text-sm text-[#dde0e6] font-sans focus:outline-none focus:border-[#66ff99]/40'
const numCls = 'w-16 bg-[#111318] border border-[#1c1f26] rounded px-2 py-1.5 text-sm text-[#dde0e6] font-mono text-center focus:outline-none focus:border-[#66ff99]/40'
const textareaCls = 'w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-mono leading-relaxed placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 resize-none transition-colors'

// ── Shared primitives ─────────────────────────────────────────────────────────

function Section({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] text-[#66ff99] tracking-widest">{label}</div>
        {action && <div>{action}</div>}
      </div>
      <div className="border-t border-[#1c1f26] pt-3">
        {children}
      </div>
    </div>
  )
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] text-[#3d4352] tracking-widest mb-1">{label}</div>
      {children}
    </div>
  )
}

function AddBtn({ onClick, label = '+ ADD' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[10px] text-[#3d4352] hover:text-[#66ff99] tracking-widest transition-colors"
    >
      {label}
    </button>
  )
}

function RemoveBtn({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="text-[#3d4352] hover:text-[#cc3355] font-mono text-base leading-none transition-colors flex-shrink-0 px-1"
    >
      ×
    </button>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="font-mono text-[9px] text-[#2a2e38] tracking-widest py-1">{text}</p>
}

// ── Row sub-components ────────────────────────────────────────────────────────

function ShotRow({ shot, onChange, onRemove }: { shot: ShotEntry; onChange: (s: ShotEntry) => void; onRemove: () => void }) {
  return (
    <div className="bg-[#0d0f14] border border-[#1c1f26] rounded p-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">FROM</span>
        <input
          type="number" min={0} step={0.1} value={shot.from}
          onChange={e => onChange({ ...shot, from: parseFloat(e.target.value) || 0 })}
          className={numCls}
        />
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">TO</span>
        <input
          type="number" min={0} step={0.1} value={shot.to}
          onChange={e => onChange({ ...shot, to: parseFloat(e.target.value) || 0 })}
          className={numCls}
        />
        <select
          value={shot.move}
          onChange={e => onChange({ ...shot, move: e.target.value })}
          className={selectCls + ' flex-shrink-0'}
        >
          {CAMERA_MOVES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          value={shot.description}
          onChange={e => onChange({ ...shot, description: e.target.value })}
          placeholder="description"
          className={inputCls + ' flex-1 min-w-0'}
        />
        <RemoveBtn onRemove={onRemove} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest flex-shrink-0">PHOTO</span>
        <input
          value={shot.photo}
          onChange={e => onChange({ ...shot, photo: e.target.value })}
          placeholder="Mini Photos/Faction/Name (1).jpg"
          className={inputCls + ' font-mono text-xs'}
        />
      </div>
    </div>
  )
}

function DialogueRow({ line, onChange, onRemove }: { line: DialogueEntry; onChange: (l: DialogueEntry) => void; onRemove: () => void }) {
  const speaker = SPEAKERS.find(s => s.value === line.speaker)
  return (
    <div
      className="bg-[#0d0f14] border rounded p-3 space-y-2"
      style={{ borderColor: `${speaker?.color ?? '#1c1f26'}22` }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={line.speaker}
          onChange={e => onChange({ ...line, speaker: e.target.value })}
          className={selectCls + ' flex-shrink-0 font-mono'}
          style={{ color: speaker?.color ?? '#dde0e6' }}
        >
          {SPEAKERS.map(s => (
            <option key={s.value} value={s.value} style={{ color: s.color }}>{s.label}</option>
          ))}
        </select>
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">FROM</span>
        <input
          type="number" min={0} step={0.1} value={line.from}
          onChange={e => onChange({ ...line, from: parseFloat(e.target.value) || 0 })}
          className={numCls}
        />
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">TO</span>
        <input
          type="number" min={0} step={0.1} value={line.to}
          onChange={e => onChange({ ...line, to: parseFloat(e.target.value) || 0 })}
          className={numCls}
        />
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">CPS</span>
        <input
          type="number" min={8} max={60} value={line.cps}
          onChange={e => onChange({ ...line, cps: parseInt(e.target.value) || 22 })}
          className={numCls}
        />
        <RemoveBtn onRemove={onRemove} />
      </div>
      <textarea
        value={line.text}
        onChange={e => onChange({ ...line, text: e.target.value })}
        rows={2}
        placeholder="Dialogue text — press Enter for a line break in the subtitle box."
        className={textareaCls}
        style={{ borderColor: `${speaker?.color ?? '#1c1f26'}22` }}
      />
    </div>
  )
}

function UIEventRow({ ev, onChange, onRemove }: { ev: UIEventEntry; onChange: (e: UIEventEntry) => void; onRemove: () => void }) {
  const variantInfo = SYSTEMUI_VARIANTS.find(v => v.value === ev.variant)
  return (
    <div className="bg-[#0d0f14] border border-[#1c1f26] rounded p-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={ev.variant}
          onChange={e => onChange({ ...ev, variant: e.target.value })}
          className={selectCls + ' flex-shrink-0'}
        >
          {SYSTEMUI_VARIANTS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">FROM</span>
        <input
          type="number" min={0} step={0.1} value={ev.from}
          onChange={e => onChange({ ...ev, from: parseFloat(e.target.value) || 0 })}
          className={numCls}
        />
        <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">TO</span>
        <input
          type="number" min={0} step={0.1} value={ev.to}
          onChange={e => onChange({ ...ev, to: parseFloat(e.target.value) || 0 })}
          className={numCls}
        />
        {variantInfo && (
          <span className="font-mono text-[9px] text-[#3d4352] tracking-widest flex-1 hidden xl:block">
            — {variantInfo.note}
          </span>
        )}
        <RemoveBtn onRemove={onRemove} />
      </div>
      <textarea
        value={ev.text}
        onChange={e => onChange({ ...ev, text: e.target.value })}
        rows={2}
        placeholder="Overlay text content"
        className={textareaCls}
      />
    </div>
  )
}

function GlitchRow({ g, onChange, onRemove }: { g: GlitchEntry; onChange: (g: GlitchEntry) => void; onRemove: () => void }) {
  const isCut = g.intensity === 'cut'
  return (
    <div
      className="bg-[#0d0f14] border rounded px-3 py-2 flex items-center gap-2 flex-wrap"
      style={{ borderColor: isCut ? '#D94F4F33' : '#1c1f26' }}
    >
      <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">FROM</span>
      <input
        type="number" min={0} step={0.1} value={g.from}
        onChange={e => onChange({ ...g, from: parseFloat(e.target.value) || 0 })}
        className={numCls}
      />
      <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">TO</span>
      <input
        type="number" min={0} step={0.1} value={g.to}
        onChange={e => onChange({ ...g, to: parseFloat(e.target.value) || 0 })}
        className={numCls}
      />
      <select
        value={g.intensity}
        onChange={e => onChange({ ...g, intensity: e.target.value })}
        className={selectCls + ' flex-shrink-0'}
        style={{ color: isCut ? '#D94F4F' : undefined }}
      >
        {GLITCH_INTENSITIES.map(gi => <option key={gi} value={gi}>{gi}</option>)}
      </select>
      <input
        value={g.note}
        onChange={e => onChange({ ...g, note: e.target.value })}
        placeholder="note (optional)"
        className={inputCls + ' flex-1 min-w-0 text-xs'}
      />
      <RemoveBtn onRemove={onRemove} />
    </div>
  )
}

function AudioCueRow({ cue, onChange, onRemove }: { cue: AudioCueEntry; onChange: (c: AudioCueEntry) => void; onRemove: () => void }) {
  const isCustom = !COMMON_AUDIO_CUES.find(c => c.id === cue.cueId)
  return (
    <div className="bg-[#0d0f14] border border-[#1c1f26] rounded px-3 py-2 flex items-center gap-2 flex-wrap">
      <select
        value={isCustom ? '__custom__' : cue.cueId}
        onChange={e => {
          if (e.target.value !== '__custom__') onChange({ ...cue, cueId: e.target.value })
        }}
        className={selectCls + ' flex-shrink-0'}
      >
        {COMMON_AUDIO_CUES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
        <option value="__custom__">CUSTOM...</option>
      </select>
      {isCustom && (
        <input
          value={cue.cueId}
          onChange={e => onChange({ ...cue, cueId: e.target.value })}
          placeholder="CUSTOM_CUE_ID"
          className={inputCls + ' w-44 font-mono text-xs'}
        />
      )}
      <span className="font-mono text-[9px] text-[#3d4352] tracking-widest">FROM</span>
      <input
        type="number" min={0} step={0.1} value={cue.from}
        onChange={e => onChange({ ...cue, from: parseFloat(e.target.value) || 0 })}
        className={numCls}
      />
      <input
        value={cue.note}
        onChange={e => onChange({ ...cue, note: e.target.value })}
        placeholder="note"
        className={inputCls + ' flex-1 min-w-0 text-xs'}
      />
      <RemoveBtn onRemove={onRemove} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  episode: Episode
  onSave: (state: BuilderState) => void
  isSaving?: boolean
}

export function ScriptBuilderPanel({ episode, onSave, isSaving }: Props) {
  const [state, setState] = useState<BuilderState>(() => loadBuilderState(episode.script_json))
  const [isDirty, setIsDirty] = useState(false)
  const [copyDone, setCopyDone] = useState(false)
  const [subjectOpen, setSubjectOpen] = useState(false)
  const [subjectTab, setSubjectTab] = useState<'exhibit' | 'faction' | 'anomaly'>('exhibit')
  const [subjectSearch, setSubjectSearch] = useState('')

  const { data: exhibits = [] } = useExhibits()
  const { data: factions = [] } = useFactions()
  const { data: anomalies = [] } = useAnomalies()

  // Reload when episode changes
  useEffect(() => {
    setState(loadBuilderState(episode.script_json))
    setIsDirty(false)
  }, [episode.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function upd(patch: Partial<BuilderState>) {
    setState(s => ({ ...s, ...patch }))
    setIsDirty(true)
  }

  function handleCopyTS() {
    navigator.clipboard.writeText(generateTS(state))
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }

  // Subject auto-fill
  function selectExhibit(ex: (typeof exhibits)[0]) {
    upd({ ...exhibitToCard(ex), exhibit_id: ex.id, faction_id: '', anomaly_id: '' })
    setSubjectOpen(false)
    setSubjectSearch('')
  }
  function selectFaction(f: (typeof factions)[0]) {
    upd({ ...factionToCard(f), faction_id: f.id, exhibit_id: '', anomaly_id: '' })
    setSubjectOpen(false)
    setSubjectSearch('')
  }
  function selectAnomaly(a: (typeof anomalies)[0]) {
    upd({ ...anomalyToCard(a), anomaly_id: a.id, exhibit_id: '', faction_id: '' })
    setSubjectOpen(false)
    setSubjectSearch('')
  }

  const filteredExhibits = exhibits
    .filter(e => e.name.toLowerCase().includes(subjectSearch.toLowerCase()) || (e.exhibit_number ?? '').includes(subjectSearch))
    .slice(0, 10)
  const filteredFactions = factions
    .filter(f => f.name.toLowerCase().includes(subjectSearch.toLowerCase()) || f.faction_id.toLowerCase().includes(subjectSearch.toLowerCase()))
    .slice(0, 10)
  const filteredAnomalies = anomalies
    .filter(a => a.designation.toLowerCase().includes(subjectSearch.toLowerCase()) || a.anomaly_id.toLowerCase().includes(subjectSearch.toLowerCase()))
    .slice(0, 10)

  const selectedLayout = LAYOUTS.find(l => l.value === state.layout)
  const selectedExhibit = exhibits.find(e => e.id === state.exhibit_id)
  const selectedFaction = factions.find(f => f.id === state.faction_id)
  const selectedAnomaly = anomalies.find(a => a.id === state.anomaly_id)
  const currentSubject = selectedExhibit?.name ?? selectedFaction?.name ?? selectedAnomaly?.designation ?? null

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-7">

        {/* IDENTITY */}
        <Section label="IDENTITY">
          <div className="grid grid-cols-3 gap-3">
            <FieldLabel label="LAYOUT">
              <select
                value={state.layout}
                onChange={e => upd({ layout: e.target.value })}
                className={selectCls + ' w-full'}
                style={{ color: selectedLayout?.color }}
              >
                {LAYOUTS.map(l => (
                  <option key={l.value} value={l.value} style={{ color: l.color }}>{l.label}</option>
                ))}
              </select>
              {selectedLayout && (
                <p className="font-mono text-[8px] text-[#3d4352] tracking-widest mt-1">{selectedLayout.note}</p>
              )}
            </FieldLabel>
            <FieldLabel label="DURATION (s)">
              <input
                type="number" min={5} value={state.durationSeconds}
                onChange={e => upd({ durationSeconds: parseFloat(e.target.value) || 28 })}
                className={inputCls + ' font-mono'}
              />
            </FieldLabel>
            <FieldLabel label="CODE">
              <input
                value={state.code}
                onChange={e => upd({ code: e.target.value })}
                placeholder="C-003"
                className={inputCls + ' font-mono'}
              />
            </FieldLabel>
          </div>
          {state.layout === 'reclassification' && (
            <div className="mt-3 w-40">
              <FieldLabel label="DATA SWAP AT (s)">
                <input
                  type="number" min={0} step={0.5} value={state.dataSwapAt}
                  onChange={e => upd({ dataSwapAt: parseFloat(e.target.value) || 0 })}
                  className={inputCls + ' font-mono'}
                />
              </FieldLabel>
            </div>
          )}
        </Section>

        {/* SUBJECT */}
        <Section label="SUBJECT — DB LINK">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSubjectOpen(o => !o)}
                className="bg-[#111318] border border-[#1c1f26] hover:border-[#66ff99]/30 rounded px-3 py-1.5 font-mono text-[10px] text-[#3d4352] hover:text-[#66ff99] tracking-widest transition-colors"
              >
                {subjectOpen ? 'CLOSE' : '+ LINK SUBJECT'}
              </button>
              {currentSubject && (
                <span className="font-mono text-[10px] text-[#66ff99] tracking-widest">
                  {selectedExhibit ? `EXHIBIT #${selectedExhibit.exhibit_number}` : selectedFaction ? `FACTION ${selectedFaction.faction_id}` : `ANOMALY ${selectedAnomaly?.anomaly_id}`}
                  {' — '}
                  {currentSubject.toUpperCase()}
                </span>
              )}
            </div>

            {subjectOpen && (
              <div className="bg-[#0d0f14] border border-[#1c1f26] rounded p-3 space-y-3">
                {/* Tabs */}
                <div className="flex gap-1">
                  {(['exhibit', 'faction', 'anomaly'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => { setSubjectTab(tab); setSubjectSearch('') }}
                      className={`font-mono text-[10px] tracking-widest px-3 py-1 rounded border transition-colors ${
                        subjectTab === tab
                          ? 'border-[#66ff99]/30 text-[#66ff99] bg-[#66ff99]/5'
                          : 'border-[#1c1f26] text-[#3d4352] hover:text-[#8891a4]'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <input
                  autoFocus
                  value={subjectSearch}
                  onChange={e => setSubjectSearch(e.target.value)}
                  placeholder={`Search ${subjectTab}s...`}
                  className={inputCls}
                />

                {/* Results */}
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {subjectTab === 'exhibit' && (
                    filteredExhibits.length === 0
                      ? <p className="font-mono text-[9px] text-[#3d4352] tracking-widest">No results</p>
                      : filteredExhibits.map(ex => (
                          <button
                            key={ex.id}
                            onClick={() => selectExhibit(ex)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1c1f26] transition-colors"
                          >
                            <span className="font-mono text-[10px] text-[#5a6175] tracking-widest mr-2">#{ex.exhibit_number}</span>
                            <span className="font-sans text-sm text-[#dde0e6]">{ex.name}</span>
                            {ex.faction && <span className="font-mono text-[9px] text-[#3d4352] ml-2">{ex.faction.name}</span>}
                          </button>
                        ))
                  )}
                  {subjectTab === 'faction' && (
                    filteredFactions.length === 0
                      ? <p className="font-mono text-[9px] text-[#3d4352] tracking-widest">No results</p>
                      : filteredFactions.map(f => (
                          <button
                            key={f.id}
                            onClick={() => selectFaction(f)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1c1f26] transition-colors"
                          >
                            <span className="font-mono text-[10px] text-[#5a6175] tracking-widest mr-2">{f.faction_id}</span>
                            <span className="font-sans text-sm text-[#dde0e6]">{f.name}</span>
                            {f.domain && <span className="font-mono text-[9px] text-[#3d4352] ml-2">{f.domain.toUpperCase()}</span>}
                          </button>
                        ))
                  )}
                  {subjectTab === 'anomaly' && (
                    filteredAnomalies.length === 0
                      ? <p className="font-mono text-[9px] text-[#3d4352] tracking-widest">No results</p>
                      : filteredAnomalies.map(a => (
                          <button
                            key={a.id}
                            onClick={() => selectAnomaly(a)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1c1f26] transition-colors"
                          >
                            <span className="font-mono text-[10px] text-[#5a6175] tracking-widest mr-2">{a.anomaly_id}</span>
                            <span className="font-sans text-sm text-[#dde0e6]">{a.designation}</span>
                          </button>
                        ))
                  )}
                </div>
                <p className="font-mono text-[8px] text-[#2a2e38] tracking-widest">
                  Selecting fills InfoCard rows, MiniBadge code, and TickStrip label.
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* STATUS BAR */}
        <Section label="STATUS BAR">
          <div className="grid grid-cols-3 gap-3">
            <FieldLabel label="TITLE">
              <input value={state.statusBarTitle} onChange={e => upd({ statusBarTitle: e.target.value })} className={inputCls} />
            </FieldLabel>
            <FieldLabel label="STATUS">
              <input value={state.statusBarStatus} onChange={e => upd({ statusBarStatus: e.target.value })} className={inputCls} />
            </FieldLabel>
            <FieldLabel label="NODE">
              <input value={state.statusNode} onChange={e => upd({ statusNode: e.target.value })} className={inputCls} />
            </FieldLabel>
          </div>
        </Section>

        {/* HUD PANELS */}
        <Section label="HUD PANELS">
          <div className="space-y-4">
            <FieldLabel label="INFOCARD LABEL">
              <input value={state.infoCardLabel} onChange={e => upd({ infoCardLabel: e.target.value })} className={inputCls} />
            </FieldLabel>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-mono text-[9px] text-[#3d4352] tracking-widest">INFOCARD ROWS</div>
                <AddBtn
                  label="+ ADD ROW"
                  onClick={() => upd({ infoCardRows: [...state.infoCardRows, { key: '', value: '' }] })}
                />
              </div>
              <div className="space-y-1.5">
                {state.infoCardRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={row.key}
                      onChange={e => {
                        const rows = [...state.infoCardRows]
                        rows[i] = { ...row, key: e.target.value }
                        upd({ infoCardRows: rows })
                      }}
                      placeholder="KEY"
                      className="w-36 bg-[#111318] border border-[#1c1f26] rounded px-2 py-1.5 text-xs text-[#dde0e6] font-mono placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
                    />
                    <input
                      value={row.value}
                      onChange={e => {
                        const rows = [...state.infoCardRows]
                        rows[i] = { ...row, value: e.target.value }
                        upd({ infoCardRows: rows })
                      }}
                      placeholder="VALUE"
                      className={inputCls + ' text-xs'}
                    />
                    <RemoveBtn onRemove={() => upd({ infoCardRows: state.infoCardRows.filter((_, j) => j !== i) })} />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FieldLabel label="BADGE TITLE (\\n = line break)">
                <input
                  value={state.miniBadgeTitle}
                  onChange={e => upd({ miniBadgeTitle: e.target.value })}
                  placeholder="LINE 1\nLINE 2"
                  className={inputCls + ' font-mono text-xs'}
                />
              </FieldLabel>
              <FieldLabel label="BADGE CODE">
                <input
                  value={state.miniBadgeCode}
                  onChange={e => upd({ miniBadgeCode: e.target.value })}
                  className={inputCls + ' font-mono'}
                />
              </FieldLabel>
            </div>

            <FieldLabel label="TICK STRIP LABEL">
              <input value={state.tickStripLabel} onChange={e => upd({ tickStripLabel: e.target.value })} className={inputCls} />
            </FieldLabel>
          </div>
        </Section>

        {/* SHOTS */}
        <Section
          label="SHOTS"
          action={
            <AddBtn
              label="+ ADD SHOT"
              onClick={() => {
                const last = state.shots[state.shots.length - 1]
                const from = last ? last.to : 0
                upd({ shots: [...state.shots, newShot(from, Math.min(from + 12, state.durationSeconds))] })
              }}
            />
          }
        >
          {state.shots.length === 0 && <EmptyHint text="No shots defined — add at least one to set the photo and camera move." />}
          <div className="space-y-2">
            {state.shots.map((shot, i) => (
              <ShotRow
                key={shot.id}
                shot={shot}
                onChange={s => { const shots = [...state.shots]; shots[i] = s; upd({ shots }) }}
                onRemove={() => upd({ shots: state.shots.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </Section>

        {/* DIALOGUE */}
        <Section
          label="DIALOGUE"
          action={
            <AddBtn
              label="+ ADD LINE"
              onClick={() => {
                const last = state.dialogue[state.dialogue.length - 1]
                const from = last ? last.to + 0.5 : 1
                upd({ dialogue: [...state.dialogue, newDialogue(from, from + 4)] })
              }}
            />
          }
        >
          {state.dialogue.length === 0 && <EmptyHint text="No dialogue lines. CPS (chars/sec) controls typewriter speed — default 22." />}
          <div className="space-y-2">
            {state.dialogue.map((line, i) => (
              <DialogueRow
                key={line.id}
                line={line}
                onChange={l => { const dialogue = [...state.dialogue]; dialogue[i] = l; upd({ dialogue }) }}
                onRemove={() => upd({ dialogue: state.dialogue.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </Section>

        {/* SYSTEM UI */}
        <Section
          label="SYSTEM UI"
          action={
            <AddBtn
              label="+ ADD EVENT"
              onClick={() => {
                const last = state.systemUI[state.systemUI.length - 1]
                const from = last ? last.to + 1 : 0
                upd({ systemUI: [...state.systemUI, newUIEvent(from, from + 8)] })
              }}
            />
          }
        >
          {state.systemUI.length === 0 && <EmptyHint text="No overlays. lore_text dims the photo and shows centered text — supports multiple independent windows." />}
          <div className="space-y-2">
            {state.systemUI.map((ev, i) => (
              <UIEventRow
                key={ev.id}
                ev={ev}
                onChange={e => { const systemUI = [...state.systemUI]; systemUI[i] = e; upd({ systemUI }) }}
                onRemove={() => upd({ systemUI: state.systemUI.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </Section>

        {/* GLITCH */}
        <Section
          label="GLITCH"
          action={
            <AddBtn
              label="+ ADD EVENT"
              onClick={() => upd({ glitch: [...state.glitch, newGlitch(state.durationSeconds - 1, state.durationSeconds)] })}
            />
          }
        >
          {state.glitch.length === 0 && <EmptyHint text='No glitch events. Tip: "cut" intensity = hard black frame — good for the closing beat.' />}
          <div className="space-y-1.5">
            {state.glitch.map((g, i) => (
              <GlitchRow
                key={g.id}
                g={g}
                onChange={gg => { const glitch = [...state.glitch]; glitch[i] = gg; upd({ glitch }) }}
                onRemove={() => upd({ glitch: state.glitch.filter((_, j) => j !== i) })}
              />
            ))}
          </div>
        </Section>

        {/* AUDIO */}
        <Section
          label="AUDIO"
          action={<AddBtn label="+ ADD CUE" onClick={() => upd({ audioCues: [...state.audioCues, newAudioCue(0.5)] })} />}
        >
          <div className="space-y-3">
            <FieldLabel label="PRESET">
              <select
                value={state.audioPreset}
                onChange={e => upd({ audioPreset: e.target.value })}
                className={selectCls + ' w-full'}
              >
                {AUDIO_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </FieldLabel>
            {state.audioCues.length > 0 && (
              <div className="space-y-1.5">
                {state.audioCues.map((cue, i) => (
                  <AudioCueRow
                    key={cue.id}
                    cue={cue}
                    onChange={c => { const audioCues = [...state.audioCues]; audioCues[i] = c; upd({ audioCues }) }}
                    onRemove={() => upd({ audioCues: state.audioCues.filter((_, j) => j !== i) })}
                  />
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* CAPTION & NOTES */}
        <Section label="CAPTION & NOTES">
          <div className="space-y-3">
            <FieldLabel label="CAPTION (for posting)">
              <textarea
                value={state.caption}
                onChange={e => upd({ caption: e.target.value })}
                rows={3}
                placeholder={'Caption text.\n\n#IRZA #Hashtags'}
                className={textareaCls + ' font-sans'}
              />
            </FieldLabel>
            <FieldLabel label="PRODUCTION NOTES (one per line — not rendered)">
              <textarea
                value={state.notes}
                onChange={e => upd({ notes: e.target.value })}
                rows={3}
                placeholder={'Curator reads measured&#10;MUSCLE is the audience surrogate&#10;Let the closing SYSTEM stamp land'}
                className={textareaCls + ' font-sans'}
              />
            </FieldLabel>
          </div>
        </Section>

        <div className="h-4" />
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-[#1c1f26] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {isDirty && (
            <span className="font-mono text-[10px] text-[#e8b84b] tracking-widest">UNSAVED</span>
          )}
          <span className="font-mono text-[9px] text-[#2a2e38] tracking-widest">
            {state.shots.length}s · {state.dialogue.length}d · {state.systemUI.length}ui · {state.glitch.length}g
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyTS}
            className="bg-[#e8b84b]/10 hover:bg-[#e8b84b]/20 border border-[#e8b84b]/30 text-[#e8b84b] font-mono text-[10px] tracking-widest px-3 py-1.5 rounded transition-colors"
          >
            {copyDone ? '✓ COPIED' : 'COPY TYPESCRIPT'}
          </button>
          <button
            onClick={() => { onSave(state); setIsDirty(false) }}
            disabled={isSaving}
            className="bg-[#66ff99]/10 hover:bg-[#66ff99]/20 border border-[#66ff99]/30 text-[#66ff99] font-mono text-[10px] tracking-widest px-3 py-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSaving ? 'SAVING...' : 'SAVE JSON'}
          </button>
        </div>
      </div>
    </div>
  )
}
