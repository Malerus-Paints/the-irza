import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFactions, useSquads, useExhibits, useAnomalies, useEpisodes } from '../hooks/useData'
import { PageHeader, ThreatBadge, StatusBadge } from '../components/ui'

type ResultType = 'faction' | 'squad' | 'exhibit' | 'anomaly' | 'episode'

interface SearchResult {
  id: string
  type: ResultType
  label: string
  sublabel: string
  threat?: string | null
  status?: string
  route: string
}

const TYPE_COLORS: Record<ResultType, string> = {
  faction: 'text-[#66ff99]',
  squad: 'text-[#5ED9FF]',
  exhibit: 'text-[#F5C842]',
  anomaly: 'text-[#cc3355]',
  episode: 'text-[#B8A9C9]',
}

const TYPE_LABELS: Record<ResultType, string> = {
  faction: 'FACTION',
  squad: 'SQUAD',
  exhibit: 'EXHIBIT',
  anomaly: 'ANOMALY',
  episode: 'EPISODE',
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const { data: factions = [] } = useFactions()
  const { data: squads = [] } = useSquads()
  const { data: exhibits = [] } = useExhibits()
  const { data: anomalies = [] } = useAnomalies()
  const { data: episodes = [] } = useEpisodes()

  const q = query.toLowerCase().trim()

  const results = useMemo<SearchResult[]>(() => {
    if (!q) return []

    const out: SearchResult[] = []

    factions.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.faction_id.toLowerCase().includes(q) || (f.domain ?? '').toLowerCase().includes(q)) {
        out.push({
          id: f.id,
          type: 'faction',
          label: f.name,
          sublabel: `${f.faction_id} · ${f.domain ?? 'DOMAIN UNKNOWN'}`,
          threat: f.threat_level,
          status: f.status,
          route: '/factions',
        })
      }
    })

    squads.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.squad_id.toLowerCase().includes(q) || s.squad_role.toLowerCase().includes(q)) {
        out.push({
          id: s.id,
          type: 'squad',
          label: s.name,
          sublabel: `${s.squad_id} · ${s.faction?.name ?? 'NO FACTION'} · ${s.squad_role}`,
          threat: s.threat_level,
          status: s.status,
          route: '/squads',
        })
      }
    })

    exhibits.forEach((e) => {
      if (
        e.name.toLowerCase().includes(q) ||
        (e.exhibit_number ?? '').toLowerCase().includes(q) ||
        (e.domain ?? '').toLowerCase().includes(q) ||
        (e.faction?.name ?? '').toLowerCase().includes(q)
      ) {
        out.push({
          id: e.id,
          type: 'exhibit',
          label: e.name,
          sublabel: `${e.exhibit_number ? `#${e.exhibit_number}` : 'NO NUMBER'} · ${e.faction?.name ?? 'NO FACTION'}`,
          threat: e.threat_level,
          status: e.status,
          route: '/exhibits',
        })
      }
    })

    anomalies.forEach((a) => {
      if (a.designation.toLowerCase().includes(q) || a.anomaly_id.toLowerCase().includes(q) || a.origin_classification.toLowerCase().includes(q)) {
        out.push({
          id: a.id,
          type: 'anomaly',
          label: a.designation,
          sublabel: `${a.anomaly_id} · ${a.origin_classification}`,
          threat: a.threat_level,
          status: a.status,
          route: '/anomalies',
        })
      }
    })

    episodes.forEach((ep) => {
      if (
        ep.title.toLowerCase().includes(q) ||
        String(ep.episode_number ?? '').includes(q) ||
        (ep.notes ?? '').toLowerCase().includes(q)
      ) {
        out.push({
          id: ep.id,
          type: 'episode',
          label: ep.title,
          sublabel: `EP ${ep.episode_number ?? '—'} · ${ep.status.toUpperCase()}`,
          route: '/episodes',
        })
      }
    })

    return out
  }, [q, factions, squads, exhibits, anomalies, episodes])

  const grouped = useMemo(() => {
    const groups: Partial<Record<ResultType, SearchResult[]>> = {}
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = []
      groups[r.type]!.push(r)
    }
    return groups
  }, [results])

  const order: ResultType[] = ['faction', 'squad', 'exhibit', 'anomaly', 'episode']

  return (
    <div>
      <PageHeader
        title="CANON SEARCH"
        subtitle="GLOBAL SEARCH ACROSS ALL REGISTRIES"
      />

      <div className="mb-6">
        <input
          autoFocus
          className="bg-[#111318] border border-[#1c1f26] rounded px-4 py-3 text-base text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 w-full font-sans"
          placeholder="Search factions, squads, exhibits, anomalies, episodes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!q && (
        <div className="text-center py-16">
          <div className="font-mono text-xs text-[#3d4352] tracking-widest">
            ENTER QUERY TO SEARCH THE ARCHIVE
          </div>
          <div className="mt-3 flex justify-center gap-6 font-mono text-[10px] tracking-widest">
            {order.map((t) => (
              <span key={t} className={TYPE_COLORS[t]}>{TYPE_LABELS[t]}</span>
            ))}
          </div>
        </div>
      )}

      {q && results.length === 0 && (
        <div className="text-center py-16">
          <div className="font-mono text-xs text-[#3d4352] tracking-widest">NO RECORDS FOUND — QUERY: {query.toUpperCase()}</div>
        </div>
      )}

      {q && results.length > 0 && (
        <div className="space-y-6">
          <div className="font-mono text-[10px] text-[#3d4352] tracking-widest">
            {results.length} RECORD{results.length !== 1 ? 'S' : ''} MATCHING "{query.toUpperCase()}"
          </div>

          {order.map((type) => {
            const group = grouped[type]
            if (!group?.length) return null
            return (
              <div key={type}>
                <div className={`font-mono text-[10px] tracking-widest mb-2 pb-1 border-b border-[#1c1f26] ${TYPE_COLORS[type]}`}>
                  {TYPE_LABELS[type]} — {group.length} RESULT{group.length !== 1 ? 'S' : ''}
                </div>
                <div className="space-y-1.5">
                  {group.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(r.route)}
                      className="w-full text-left bg-[#111318] border border-[#1c1f26] hover:border-[#2a2e38] rounded px-4 py-3 flex items-center gap-4 transition-colors group"
                    >
                      <div className={`font-mono text-[10px] tracking-widest w-16 shrink-0 ${TYPE_COLORS[r.type]}`}>
                        {TYPE_LABELS[r.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-sm text-[#dde0e6] truncate group-hover:text-white transition-colors">
                          {r.label}
                        </div>
                        <div className="font-mono text-[10px] text-[#5a6175] mt-0.5 truncate">
                          {r.sublabel}
                        </div>
                      </div>
                      {r.threat !== undefined && <ThreatBadge level={r.threat as never} />}
                      {r.status && <StatusBadge status={r.status as never} />}
                      <span className="font-mono text-[10px] text-[#3d4352] group-hover:text-[#5a6175] transition-colors shrink-0">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
