import { useState } from 'react'
import { useEpisodes, useCreateEpisode } from '../hooks/useData'
import { Spinner, EmptyState, PageHeader, Card, Button } from '../components/ui'
import { EpisodeDetailPanel } from '../components/EpisodeDetailPanel'
import { EPISODE_TYPE_LABELS, EPISODE_TYPE_RUNTIME } from '../types'
import type { Episode, EpisodeStatus, RuntimeClass } from '../types'

// ─── Episode meta computation ─────────────────────────────────────────────────

const TYPE_ABBREV: Record<string, string> = {
  reclassification:   'R',
  classifying:        'C',
  behavior_collective:'B',
  system_alert:       'SA',
  duty_log:           'DL',
  copycat:            'CPY',
  engineer_analysis:  'EA',
  biologist_analysis: 'BA',
  faction_dossier:    'FD',
  anomaly_report:     'AR',
  wanderer:           'W',
}

const GATE_LABELS: Record<number, string> = {
  1: 'GATE I — DESIGNATION ONLY',
  2: 'GATE II — BEHAVIORAL NOTE',
  3: 'GATE III — THREAT LEVEL',
  4: 'GATE IV — ENGINEER ANALYSIS',
  5: 'GATE V — FULL RECORD',
}

const EXHIBIT_REQUIRED_TYPES = new Set([
  'reclassification', 'classifying', 'behavior_collective',
  'engineer_analysis', 'biologist_analysis',
])

type EpisodeMeta = Episode & {
  typePrefix: string
  arcNumber: number | undefined
  gateWindow: number
  needsExhibit: boolean
}

function computeMeta(episodes: Episode[]): EpisodeMeta[] {
  const sorted = [...episodes].sort((a, b) => {
    if (a.episode_number == null) return 1
    if (b.episode_number == null) return -1
    return a.episode_number - b.episode_number
  })

  const typeCounters: Record<string, number> = {}
  let arcCount = 0

  return sorted.map((ep) => {
    const type = ep.episode_type ?? ''
    let typePrefix: string
    let arcNumber: number | undefined

    if (type === 'arc') {
      arcCount++
      arcNumber = arcCount
      typePrefix = `ARC-${String(arcCount).padStart(3, '0')}`
    } else {
      const abbrev = TYPE_ABBREV[type] ?? type.slice(0, 2).toUpperCase()
      typeCounters[abbrev] = (typeCounters[abbrev] ?? 0) + 1
      typePrefix = `${abbrev}-${String(typeCounters[abbrev]).padStart(3, '0')}`
    }

    let gateWindow: number
    if (arcCount <= 4) gateWindow = 1
    else if (arcCount <= 8) gateWindow = 2
    else if (arcCount <= 10) gateWindow = 3
    else if (arcCount <= 12) gateWindow = 4
    else gateWindow = 5

    const needsExhibit = EXHIBIT_REQUIRED_TYPES.has(type) && !ep.exhibit_id

    return { ...ep, typePrefix, arcNumber, gateWindow, needsExhibit }
  })
}

function groupByWeek(episodes: EpisodeMeta[]) {
  const map = new Map<number, EpisodeMeta[]>()
  for (const ep of episodes) {
    const week = ep.episode_number != null ? Math.ceil(ep.episode_number / 7) : 0
    if (!map.has(week)) map.set(week, [])
    map.get(week)!.push(ep)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([week, eps]) => ({ week, episodes: eps }))
}

// ─── Status colors ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<EpisodeStatus, string> = {
  planned:  'text-[#3d4352]',
  scripted: 'text-[#e8b84b]',
  filmed:   'text-[#5ed9ff]',
  posted:   'text-[#66ff99]',
}

const RUNTIME_CLASSES: RuntimeClass[] = ['SHORT', 'STANDARD', 'LONG', 'EVENT']

// ─── Component ────────────────────────────────────────────────────────────────

export function EpisodesPage() {
  const { data: rawEpisodes = [], isLoading } = useEpisodes()
  const createEpisode = useCreateEpisode()
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    episode_type: '' as string,
    runtime_class: 'STANDARD' as RuntimeClass,
    phase: 1,
    status: 'planned' as EpisodeStatus,
  })

  if (isLoading) return <Spinner />

  const posted   = rawEpisodes.filter((e) => e.status === 'posted').length
  const filmed   = rawEpisodes.filter((e) => e.status === 'filmed').length
  const scripted = rawEpisodes.filter((e) => e.status === 'scripted').length
  const planned  = rawEpisodes.filter((e) => e.status === 'planned').length

  const episodes = computeMeta(rawEpisodes)
  const weeks    = groupByWeek(episodes)

  async function handleCreateEpisode() {
    if (!formData.title.trim()) return
    if (formData.title.includes('#')) {
      alert('Episode titles must not contain #. Use the caption field for hashtags.')
      return
    }
    try {
      await createEpisode.mutateAsync({
        title: formData.title,
        episode_type: formData.episode_type || null,
        runtime_class: formData.runtime_class,
        phase: formData.phase,
        status: formData.status,
        episode_number: null,
        exhibit_id: null,
        squad_id: null,
        faction_id: null,
        anomaly_id: null,
        script_text: null,
        script_json: null,
        filmed: false,
        posted_date: null,
        platform: null,
        notes: null,
      })
      setShowForm(false)
      setFormData({ title: '', episode_type: '', runtime_class: 'STANDARD', phase: 1, status: 'planned' })
    } catch (err) {
      console.error('Failed to create episode:', err)
    }
  }

  return (
    <div>
      <PageHeader
        title="EPISODE TRACKER"
        subtitle={`${posted} POSTED · ${filmed} FILMED · ${scripted} SCRIPTED · ${planned} PLANNED`}
        action={<Button size="sm" onClick={() => setShowForm(!showForm)}>+ NEW EPISODE</Button>}
      />

      {showForm && (
        <Card className="mb-6 p-4 space-y-4 border-[#66ff99]/30">
          <h3 className="font-mono text-xs text-[#66ff99] tracking-widest">NEW EPISODE</h3>
          <div className="space-y-3">
            <div>
              <label className="font-mono text-[10px] text-[#5a6175] tracking-widest block mb-1">TITLE</label>
              <input
                type="text"
                placeholder="Episode title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#0a0c10] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-[#5a6175] tracking-widest block mb-1">EPISODE TYPE</label>
                <select
                  value={formData.episode_type}
                  onChange={(e) => {
                    const t = e.target.value
                    setFormData({ ...formData, episode_type: t, runtime_class: EPISODE_TYPE_RUNTIME[t] ?? formData.runtime_class })
                  }}
                  className="w-full bg-[#0a0c10] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] focus:outline-none focus:border-[#66ff99]/40"
                >
                  <option value="">— TYPE —</option>
                  {Object.entries(EPISODE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-[#5a6175] tracking-widest block mb-1">RUNTIME</label>
                <select
                  value={formData.runtime_class}
                  onChange={(e) => setFormData({ ...formData, runtime_class: e.target.value as RuntimeClass })}
                  className="w-full bg-[#0a0c10] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] focus:outline-none focus:border-[#66ff99]/40"
                >
                  {RUNTIME_CLASSES.map((rc) => (
                    <option key={rc} value={rc}>{rc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-[#5a6175] tracking-widest block mb-1">PHASE</label>
                <input
                  type="number"
                  min="1"
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#0a0c10] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] focus:outline-none focus:border-[#66ff99]/40"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-[#5a6175] tracking-widest block mb-1">STATUS</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EpisodeStatus })}
                  className="w-full bg-[#0a0c10] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] focus:outline-none focus:border-[#66ff99]/40"
                >
                  <option value="planned">PLANNED</option>
                  <option value="scripted">SCRIPTED</option>
                  <option value="filmed">FILMED</option>
                  <option value="posted">POSTED</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateEpisode} disabled={!formData.title.trim() || createEpisode.isPending} className="flex-1 justify-center">
              {createEpisode.isPending ? 'CREATING...' : '✦ CREATE EPISODE'}
            </Button>
            <Button onClick={() => setShowForm(false)} className="flex-1 justify-center" variant="ghost">
              CANCEL
            </Button>
          </div>
        </Card>
      )}

      {/* Stat bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'POSTED',   value: posted,   color: 'text-[#66ff99]' },
          { label: 'FILMED',   value: filmed,   color: 'text-[#5ed9ff]' },
          { label: 'SCRIPTED', value: scripted, color: 'text-[#e8b84b]' },
          { label: 'PLANNED',  value: planned,  color: 'text-[#3d4352]' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <div className={`font-display text-2xl ${color}`}>{value}</div>
            <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mt-1">{label}</div>
          </Card>
        ))}
      </div>

      {episodes.length === 0 ? (
        <EmptyState message="EPISODE LOG AWAITING FIRST ENTRY" />
      ) : (
        <div className="space-y-6">
          {weeks.map(({ week, episodes: weekEps }) => {
            const gate = weekEps[0]?.gateWindow ?? 1
            const dayStart = week > 0 ? (week - 1) * 7 + 1 : null
            const dayEnd   = week > 0 ? week * 7 : null

            return (
              <div key={week}>
                {/* Week header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[10px] text-[#3d4352] tracking-widest shrink-0">
                    {week > 0
                      ? `WEEK ${week} · DAYS ${dayStart}–${dayEnd} · ${GATE_LABELS[gate]}`
                      : 'UNSCHEDULED'}
                  </span>
                  <div className="flex-1 h-px bg-[#1c1f26]" />
                </div>

                {/* Episode rows */}
                <div className="space-y-1.5">
                  {weekEps.map((ep) => {
                    const isExpanded = expandedId === ep.id
                    return (
                      <Card
                        key={ep.id}
                        className={`transition-colors cursor-pointer select-none ${
                          isExpanded
                            ? 'border-[#2a2e38]'
                            : ep.needsExhibit
                              ? 'border-[#e8b84b]/20 hover:border-[#e8b84b]/40'
                              : 'hover:border-[#2a2e38]'
                        }`}
                        onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Type prefix */}
                          <div className="font-mono text-[10px] tracking-widest w-20 shrink-0 pt-0.5"
                            style={{ color: ep.episode_type === 'arc' ? '#66ff99' : '#5ed9ff' }}>
                            {ep.typePrefix}
                          </div>

                          {/* Title + exhibit */}
                          <div className="flex-1 min-w-0">
                            <div className="font-sans text-sm text-[#dde0e6]">{ep.title}</div>
                            {ep.exhibit ? (
                              <div className="font-mono text-[10px] text-[#5a6175] mt-0.5">
                                {ep.exhibit.name}
                                {ep.exhibit.miniature_name && ep.exhibit.miniature_name !== ep.exhibit.name && (
                                  <span className="text-[#3d4352]"> · {ep.exhibit.miniature_name}</span>
                                )}
                              </div>
                            ) : ep.needsExhibit ? (
                              <div className="font-mono text-[10px] text-[#e8b84b]/50 mt-0.5">
                                NO EXHIBIT ASSIGNED
                              </div>
                            ) : null}
                          </div>

                          {/* Runtime + status + chevron */}
                          <div className="flex items-center gap-3 shrink-0">
                            {ep.runtime_class && (
                              <span className="font-mono text-[10px] text-[#3d4352] tracking-widest">
                                {ep.runtime_class}
                              </span>
                            )}
                            <span className={`font-mono text-[10px] tracking-widest uppercase ${STATUS_COLORS[ep.status] ?? 'text-[#3d4352]'}`}>
                              {ep.status}
                            </span>
                            <span className="font-mono text-[10px] text-[#3d4352]">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <EpisodeDetailPanel episode={ep} gateLevel={ep.gateWindow} />
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
