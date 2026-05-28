import { useState } from 'react'
import { useFactions, useUpdateFaction } from '../hooks/useData'
import { Spinner, EmptyState, PageHeader, StatusBadge, ThreatBadge, Button, Card } from '../components/ui'
import { FactionDrawer } from '../components/FactionDrawer'
import { FactionLoreEditor } from '../components/FactionLoreEditor'
import type { Faction, EntryStatus } from '../types'

const STATUS_OPTIONS: { value: EntryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ALL' },
  { value: 'drafted', label: 'DRAFTED' },
  { value: 'needs-lore', label: 'NEEDS LORE' },
  { value: 'canon-locked', label: 'CANON LOCKED' },
  { value: 'published', label: 'PUBLISHED' },
]

export function FactionsPage() {
  const { data: factions = [], isLoading } = useFactions()
  const updateFaction = useUpdateFaction()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [drawerFaction, setDrawerFaction] = useState<Faction | null | undefined>(undefined)
  const [loreEditorFaction, setLoreEditorFaction] = useState<Faction | null>(null)
  // undefined = closed, null = create mode, Faction = edit mode

  const filtered = factions.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.faction_id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="FACTION REGISTRY"
        subtitle={`${factions.length} FACTIONS LOGGED — CROSS-REFERENCING ACTIVE`}
        action={
          <Button size="sm" onClick={() => setDrawerFaction(null)}>+ NEW FACTION</Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          className="bg-[#111318] border border-[#1c1f26] rounded px-3 py-1.5 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 flex-1 min-w-48"
          placeholder="Search factions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setStatusFilter(o.value)}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-widest rounded transition-colors ${
                statusFilter === o.value
                  ? 'bg-[#66ff99]/10 text-[#66ff99] border border-[#66ff99]/30'
                  : 'text-[#5a6175] hover:text-[#8891a4] border border-[#1c1f26]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState message="NO FACTIONS MATCH CURRENT FILTER PARAMETERS" />
      ) : (
        <div className="space-y-2">
          {filtered.map((faction) => (
            <FactionRow
              key={faction.id}
              faction={faction}
              expanded={expanded === faction.id}
              onToggle={() => setExpanded(expanded === faction.id ? null : faction.id)}
              onStatusChange={(status) => updateFaction.mutate({ id: faction.id, payload: { status } })}
              onEdit={() => setDrawerFaction(faction)}
              onEditLore={() => setLoreEditorFaction(faction)}
            />
          ))}
        </div>
      )}
      {drawerFaction !== undefined && (
        <FactionDrawer
          faction={drawerFaction}
          onClose={() => setDrawerFaction(undefined)}
        />
      )}
      {loreEditorFaction && (
        <FactionLoreEditor
          faction={loreEditorFaction}
          onClose={() => setLoreEditorFaction(null)}
        />
      )}
    </div>
  )
}

function FactionRow({
  faction,
  expanded,
  onToggle,
  onStatusChange,
  onEdit,
  onEditLore,
}: {
  faction: Faction
  expanded: boolean
  onToggle: () => void
  onStatusChange: (status: EntryStatus) => void
  onEdit: () => void
  onEditLore: () => void
}) {
  return (
    <Card className={`cursor-pointer transition-colors ${expanded ? 'border-[#66ff99]/20' : 'hover:border-[#2a2e38]'}`}>
      <div className="flex items-center gap-4" onClick={onToggle}>
        {/* ID */}
        <div className="font-mono text-xs text-[#3d4352] w-14 shrink-0">{faction.faction_id}</div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="font-sans text-sm text-[#dde0e6] truncate">{faction.name}</div>
          {faction.domain && (
            <div className="font-mono text-[10px] text-[#5a6175] mt-0.5">{faction.domain}</div>
          )}
        </div>

        {/* Threat */}
        <div className="w-28 text-right">
          <ThreatBadge level={faction.threat_level} />
        </div>

        {/* System status */}
        <div className="hidden md:block w-48 text-right">
          <span className="font-mono text-[10px] text-[#3d4352] tracking-widest">
            {faction.system_status}
          </span>
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge status={faction.status} />
        </div>

        {/* Chevron */}
        <div className={`text-[#3d4352] transition-transform ${expanded ? 'rotate-90' : ''}`}>›</div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#1c1f26] space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">DOMAIN</div>
              <div className="font-sans text-sm text-[#8891a4]">{faction.domain ?? '—'}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">BEHAVIORAL CLASS</div>
              <div className="font-sans text-sm text-[#8891a4]">{faction.behavioral_classification ?? '—'}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">COLLECTIVE / IND</div>
              <div className="font-sans text-sm text-[#8891a4]">{faction.collective_or_individual ?? '—'}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">ORIGIN REALITY</div>
              <div className="font-sans text-sm text-[#8891a4] uppercase">{faction.origin_reality_status}</div>
            </div>
          </div>

          {faction.notes && (
            <div>
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">NOTES</div>
              <div className="font-sans text-sm text-[#8891a4] italic">{faction.notes}</div>
            </div>
          )}

          {faction.lore_text && (
            <div>
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1">LORE RECORD</div>
              <div className="font-sans text-sm text-[#8891a4] whitespace-pre-wrap leading-relaxed">
                {faction.lore_text}
              </div>
            </div>
          )}

          {/* Status controls */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span className="font-mono text-[10px] text-[#3d4352] tracking-widest">SET STATUS:</span>
            {(['drafted', 'needs-lore', 'canon-locked', 'published'] as EntryStatus[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={faction.status === s ? 'primary' : 'ghost'}
                onClick={() => onStatusChange(s)}
              >
                {s.toUpperCase().replace('-', ' ')}
              </Button>
            ))}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="ghost" onClick={onEditLore}>EDIT LORE</Button>
              <Button size="sm" onClick={onEdit}>EDIT RECORD</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
