import { useState } from 'react'
import { useEpisodes, useCreateEpisode } from '../hooks/useData'
import { Spinner, EmptyState, PageHeader, Card, Button } from '../components/ui'
import { EPISODE_TYPE_LABELS } from '../types'
import type { EpisodeStatus, EpisodePreset, RuntimeClass } from '../types'

const STATUS_COLORS: Record<string, string> = {
  planned:  'text-[#3d4352]',
  scripted: 'text-[#e8b84b]',
  filmed:   'text-[#5ed9ff]',
  posted:   'text-[#66ff99]',
}

const EPISODE_PRESETS: Record<EpisodePreset, string> = {
  'A': 'Exhibit Record',
  'B': 'Behavioral Cluster',
  'C': 'Cultural Analysis',
  'D': 'System Classification',
  'E': 'Archive Recovery',
  'F': 'Unauthorized Signal',
}

const RUNTIME_CLASSES: RuntimeClass[] = ['SHORT', 'STANDARD', 'EVENT']

export function EpisodesPage() {
  const { data: episodes = [], isLoading } = useEpisodes()
  const createEpisode = useCreateEpisode()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    preset: 'A' as EpisodePreset,
    runtime_class: 'STANDARD' as RuntimeClass,
    phase: 1,
    status: 'planned' as EpisodeStatus,
  })

  if (isLoading) return <Spinner />

  const posted = episodes.filter((e) => e.status === 'posted').length
  const scripted = episodes.filter((e) => e.status === 'scripted').length
  const planned = episodes.filter((e) => e.status === 'planned').length

  async function handleCreateEpisode() {
    if (!formData.title.trim()) return
    try {
      await createEpisode.mutateAsync({
        title: formData.title,
        preset: formData.preset,
        runtime_class: formData.runtime_class,
        phase: formData.phase,
        status: formData.status,
        episode_number: null,
        episode_type: null,
        exhibit_id: null,
        squad_id: null,
        faction_id: null,
        anomaly_id: null,
        script_text: null,
        filmed: false,
        posted_date: null,
        platform: null,
        notes: null,
      })
      setShowForm(false)
      setFormData({
        title: '',
        preset: 'A',
        runtime_class: 'STANDARD',
        phase: 1,
        status: 'planned',
      })
    } catch (err) {
      console.error('Failed to create episode:', err)
    }
  }

  return (
    <div>
      <PageHeader
        title="EPISODE TRACKER"
        subtitle={`${posted} POSTED · ${scripted} SCRIPTED · ${planned} PLANNED`}
        action={<Button size="sm" onClick={() => setShowForm(!showForm)}>+ NEW EPISODE</Button>}
      />

      {/* Create episode form */}
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
                <label className="font-mono text-[10px] text-[#5a6175] tracking-widest block mb-1">PRESET</label>
                <select
                  value={formData.preset}
                  onChange={(e) => setFormData({ ...formData, preset: e.target.value as EpisodePreset })}
                  className="w-full bg-[#0a0c10] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] focus:outline-none focus:border-[#66ff99]/40"
                >
                  {(Object.entries(EPISODE_PRESETS) as [EpisodePreset, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{key} — {label}</option>
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
            <Button
              onClick={handleCreateEpisode}
              disabled={!formData.title.trim() || createEpisode.isPending}
              className="flex-1 justify-center"
            >
              {createEpisode.isPending ? 'CREATING...' : '✦ CREATE EPISODE'}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              className="flex-1 justify-center"
              variant="ghost"
            >
              CANCEL
            </Button>
          </div>
        </Card>
      )}

      {/* Phase breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'POSTED', value: posted, color: 'text-[#66ff99]' },
          { label: 'SCRIPTED', value: scripted, color: 'text-[#e8b84b]' },
          { label: 'PLANNED', value: planned, color: 'text-[#3d4352]' },
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
        <div className="space-y-2">
          {episodes.map((episode) => (
            <Card key={episode.id} className="hover:border-[#2a2e38] transition-colors">
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs text-[#3d4352] w-16 shrink-0">
                  EP {episode.episode_number ?? '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm text-[#dde0e6] truncate">{episode.title}</div>
                  <div className="font-mono text-[10px] text-[#5a6175] mt-0.5">
                    {episode.preset ? EPISODE_TYPE_LABELS[episode.preset] : '—'}
                    {episode.runtime_class ? ` · ${episode.runtime_class}` : ''}
                    {episode.phase ? ` · PHASE ${episode.phase}` : ''}
                  </div>
                </div>
                <span className={`font-mono text-[10px] tracking-widest uppercase ${STATUS_COLORS[episode.status] ?? 'text-[#3d4352]'}`}>
                  {episode.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
