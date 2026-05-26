import { useArchiveStats } from '../hooks/useData'
import { Spinner, Card } from '../components/ui'

export function DashboardPage() {
  const { data: stats, isLoading } = useArchiveStats()

  if (isLoading) return <Spinner />

  const statCards = [
    { label: 'FACTIONS LOGGED', value: stats?.factions ?? 0, color: 'text-[#66ff99]' },
    { label: 'SQUADS REGISTERED', value: stats?.squads ?? 0, color: 'text-[#66ff99]' },
    { label: 'EXHIBITS CATALOGUED', value: stats?.exhibits ?? 0, color: 'text-[#5ed9ff]' },
    { label: 'ANOMALIES CONTAINED', value: stats?.anomalies ?? 0, color: 'text-[#cc3355]' },
    { label: 'EPISODES POSTED', value: stats?.episodes_posted ?? 0, color: 'text-[#f2e9dc]' },
    { label: 'NEEDS LORE', value: stats?.needs_lore ?? 0, color: 'text-[#e8b84b]' },
  ]

  return (
    <div>
      {/* System header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-[#66ff99] tracking-widest mb-1">
          ARCHIVE NODE // ACTIVE
        </div>
        <h1 className="font-display text-4xl text-[#dde0e6] tracking-widest mb-2">
          ARCHIVE STATUS
        </h1>
        <p className="font-mono text-xs text-[#5a6175] tracking-widest">
          INTER-REALITY ZOOLOGICAL ARCHIVE — MANAGEMENT SYSTEM v1.0
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {statCards.map(({ label, value, color }) => (
          <Card key={label}>
            <div className={`font-display text-3xl ${color} mb-1`}>{value}</div>
            <div className="font-mono text-[10px] text-[#5a6175] tracking-widest">{label}</div>
          </Card>
        ))}
      </div>

      {/* System notices */}
      <div className="space-y-3">
        <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-2">
          SYSTEM NOTICES
        </div>
        <Card>
          <div className="font-mono text-xs text-[#66ff99] tracking-widest mb-1">
            ARCHIVE NODE INITIALIZING
          </div>
          <p className="font-sans text-sm text-[#8891a4]">
            Canon data loaded from Drive sync. Faction registry populated with 11 entries.
            Exhibit, Squad, and Anomaly registries awaiting first entries.
          </p>
        </Card>
        <Card>
          <div className="font-mono text-xs text-[#e8b84b] tracking-widest mb-1">
            BACKLOG STATUS: UNKNOWN DEPTH
          </div>
          <p className="font-sans text-sm text-[#8891a4]">
            System has been collecting from collapsing realities continuously.
            Archive capacity to process arrivals remains behind collection rate.
          </p>
        </Card>
        {(stats?.needs_lore ?? 0) > 0 && (
          <Card>
            <div className="font-mono text-xs text-[#e8b84b] tracking-widest mb-1">
              CLASSIFICATION INCOMPLETE
            </div>
            <p className="font-sans text-sm text-[#8891a4]">
              {stats?.needs_lore} entries require lore documentation before canon lock.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
