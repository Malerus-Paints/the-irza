import { useState } from 'react'
import { useExhibits } from '../hooks/useData'
import { Spinner, EmptyState, PageHeader, StatusBadge, ThreatBadge, Card, Button } from '../components/ui'
import { ExhibitDrawer } from '../components/ExhibitDrawer'
import type { Exhibit, EntryStatus } from '../types'

export function ExhibitsPage() {
  const { data: exhibits = [], isLoading } = useExhibits()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'all'>('all')
  const [drawerExhibit, setDrawerExhibit] = useState<Exhibit | null | undefined>(undefined)
  // undefined = closed, null = create mode, Exhibit = edit mode

  const exhibitNumbers = new Map(exhibits.map((e, i) => [e.id, i + 1]))

  const filtered = exhibits.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.exhibit_number?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
      (e.faction?.name.toLowerCase() ?? '').includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="EXHIBIT DATABASE"
        subtitle={`${exhibits.length} EXHIBITS CATALOGUED`}
        action={
          <Button size="sm" onClick={() => setDrawerExhibit(null)}>+ NEW EXHIBIT</Button>
        }
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          className="bg-[#111318] border border-[#1c1f26] rounded px-3 py-1.5 text-sm text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 flex-1 min-w-48"
          placeholder="Search exhibits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(['all', 'drafted', 'needs-lore', 'canon-locked', 'published'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 font-mono text-[10px] tracking-widest rounded transition-colors ${
              statusFilter === s
                ? 'bg-[#66ff99]/10 text-[#66ff99] border border-[#66ff99]/30'
                : 'text-[#5a6175] hover:text-[#8891a4] border border-[#1c1f26]'
            }`}
          >
            {s === 'all' ? 'ALL' : s.toUpperCase().replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="font-mono text-[10px] text-[#2a3040] tracking-widest mb-3">
        MINICØDEX COMPATIBLE — SPECIMEN DATA READABLE BY THE ZOO INVENTORY SYSTEM
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="EXHIBIT DATABASE AWAITING FIRST ENTRY" />
      ) : (
        <div className="space-y-2">
          {filtered.map((exhibit) => (
            <Card
              key={exhibit.id}
              className="hover:border-[#2a2e38] transition-colors cursor-pointer"
              onClick={() => setDrawerExhibit(exhibit)}
            >
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs text-[#3d4352] w-24 shrink-0">
                  Exhibit - {String(exhibitNumbers.get(exhibit.id) ?? 0).padStart(3, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm text-[#dde0e6] truncate">{exhibit.name}</div>
                  <div className="font-mono text-[10px] text-[#5a6175] mt-0.5">
                    {exhibit.faction?.name ?? 'NO FACTION'}{exhibit.squad ? ` · ${exhibit.squad.name}` : ''}
                  </div>
                </div>
                <ThreatBadge level={exhibit.threat_level} />
                <span className={`font-mono text-[10px] tracking-widest hidden md:block ${
                  exhibit.archive_status === 'ACTIVE' ? 'text-[#66ff99]' :
                  exhibit.archive_status === 'SCHEMA MISMATCH' ? 'text-[#cc3355]' :
                  'text-[#3d4352]'
                }`}>
                  {exhibit.archive_status}
                </span>
                <StatusBadge status={exhibit.status} />
                <div className="text-[#3d4352] font-mono text-sm shrink-0">›</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Drawer — only mount when open */}
      {drawerExhibit !== undefined && (
        <ExhibitDrawer
          exhibit={drawerExhibit}
          onClose={() => setDrawerExhibit(undefined)}
          sequentialNumber={drawerExhibit ? (exhibitNumbers.get(drawerExhibit.id) ?? undefined) : undefined}
        />
      )}
    </div>
  )
}
