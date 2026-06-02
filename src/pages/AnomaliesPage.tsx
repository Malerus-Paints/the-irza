import { useState } from 'react'
import { useAnomalies } from '../hooks/useData'
import { Spinner, EmptyState, PageHeader, StatusBadge, ThreatBadge, Card, Button } from '../components/ui'
import { AnomalyDrawer } from '../components/AnomalyDrawer'
import type { Anomaly } from '../types'

export function AnomaliesPage() {
  const { data: anomalies = [], isLoading } = useAnomalies()
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState<Anomaly | null | 'new'>(undefined as never)

  const filtered = anomalies.filter((a) =>
    a.designation.toLowerCase().includes(search.toLowerCase()) ||
    a.anomaly_id.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="ANOMALY REGISTRY"
        subtitle="ENTITIES WITHOUT CONFIRMED FACTION ORIGIN — PARALLEL REGISTRY ACTIVE"
        action={<Button size="sm" onClick={() => setDrawer('new')}>+ LOG ANOMALY</Button>}
      />

      <div className="mb-5">
        <input
          className="bg-[#111318] border border-[#1c1f26] rounded px-3 py-1.5 text-sm text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#cc3355]/40 w-full max-w-md"
          placeholder="Search anomalies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Classification notice */}
      <div className="mb-5 px-4 py-3 bg-[#cc3355]/5 border border-[#cc3355]/20 rounded font-mono text-xs text-[#cc3355]/70 tracking-widest">
        CLASSIFICATION NOTICE: ENTITIES IN THIS REGISTRY DO NOT BELONG TO ANY CONFIRMED FACTION.
        STANDARD FACTION-SQUAD-EXHIBIT HIERARCHY DOES NOT APPLY.
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="ANOMALY REGISTRY OPERATING — UNRESOLVED ENTITIES: 0" />
      ) : (
        <div className="space-y-2">
          {filtered.map((anomaly) => (
            <Card key={anomaly.id} className="hover:border-[#cc3355]/20 transition-colors cursor-pointer" onClick={() => setDrawer(anomaly)}>
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs text-[#cc3355]/60 w-16 shrink-0">{anomaly.anomaly_id}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm text-[#dde0e6] truncate">{anomaly.designation}</div>
                  <div className="font-mono text-[10px] text-[#5a6175] mt-0.5">
                    ORIGIN: {anomaly.origin_classification} · {anomaly.domain ?? 'DOMAIN UNKNOWN'}
                  </div>
                </div>
                <ThreatBadge level={anomaly.threat_level} />
                <span className="font-mono text-[10px] text-[#3d4352] tracking-widest hidden md:block">
                  {anomaly.system_status}
                </span>
                <StatusBadge status={anomaly.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {drawer !== undefined && (
        <AnomalyDrawer
          anomaly={drawer === 'new' ? null : drawer}
          onClose={() => setDrawer(undefined as never)}
        />
      )}
    </div>
  )
}
