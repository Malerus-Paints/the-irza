import { useState } from 'react'
import { useSquads } from '../hooks/useData'
import { Spinner, EmptyState, PageHeader, StatusBadge, ThreatBadge, Card, Button } from '../components/ui'
import { SquadDrawer } from '../components/SquadDrawer'
import type { Squad } from '../types'

export function SquadsPage() {
  const { data: squads = [], isLoading } = useSquads()
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState<Squad | null | 'new'>(undefined as never)

  const filtered = squads.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.squad_id.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="SQUAD REGISTRY"
        subtitle="COLLECTIVE BEHAVIORAL SYSTEMS — LINKED TO FACTION REGISTRY"
        action={<Button size="sm" onClick={() => setDrawer('new')}>+ NEW SQUAD</Button>}
      />

      <div className="mb-5">
        <input
          className="bg-[#111318] border border-[#1c1f26] rounded px-3 py-1.5 text-sm text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 w-full max-w-md"
          placeholder="Search squads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-4 px-4 py-3 bg-[#111318] border border-[#1c1f26] rounded font-mono text-xs text-[#3d4352] tracking-widest">
        CLASSIFICATION NOTE: SQUADS ARE NOT SIMPLY GROUPS — THEY ARE COLLECTIVE BEHAVIORAL SYSTEMS.
        A SQUAD WITHOUT A FACTION CANNOT EXIST IN THIS REGISTRY.
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="SQUAD REGISTRY ACTIVE — AWAITING FIRST ENTRY" />
      ) : (
        <div className="space-y-2">
          {filtered.map((squad) => (
            <Card key={squad.id} className="hover:border-[#2a2e38] transition-colors cursor-pointer" onClick={() => setDrawer(squad)}>
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs text-[#3d4352] w-14 shrink-0">{squad.squad_id}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm text-[#dde0e6] truncate">{squad.name}</div>
                  <div className="font-mono text-[10px] text-[#5a6175] mt-0.5">
                    {squad.faction?.name ?? 'NO FACTION'} · {squad.squad_role}
                  </div>
                </div>
                <ThreatBadge level={squad.threat_level} />
                <StatusBadge status={squad.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {drawer !== undefined && (
        <SquadDrawer
          squad={drawer === 'new' ? null : drawer}
          onClose={() => setDrawer(undefined as never)}
        />
      )}
    </div>
  )
}
