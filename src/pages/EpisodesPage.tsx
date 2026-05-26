import { useEpisodes } from '../hooks/useData'
import { Spinner, EmptyState, PageHeader, Card, Button } from '../components/ui'
import { EPISODE_TYPE_LABELS } from '../types'

const STATUS_COLORS: Record<string, string> = {
  planned:  'text-[#3d4352]',
  scripted: 'text-[#e8b84b]',
  filmed:   'text-[#5ed9ff]',
  posted:   'text-[#66ff99]',
}

export function EpisodesPage() {
  const { data: episodes = [], isLoading } = useEpisodes()

  if (isLoading) return <Spinner />

  const posted = episodes.filter((e) => e.status === 'posted').length
  const scripted = episodes.filter((e) => e.status === 'scripted').length
  const planned = episodes.filter((e) => e.status === 'planned').length

  return (
    <div>
      <PageHeader
        title="EPISODE TRACKER"
        subtitle={`${posted} POSTED · ${scripted} SCRIPTED · ${planned} PLANNED`}
        action={<Button size="sm">+ NEW EPISODE</Button>}
      />

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
