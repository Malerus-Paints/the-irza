import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',            label: 'ARCHIVE STATUS',   icon: '◈' },
  { to: '/factions',   label: 'FACTION REGISTRY',  icon: '⬡' },
  { to: '/squads',     label: 'SQUAD REGISTRY',    icon: '⬢' },
  { to: '/exhibits',   label: 'EXHIBIT DATABASE',  icon: '◉' },
  { to: '/anomalies',  label: 'ANOMALY REGISTRY',  icon: '⚠' },
  { to: '/episodes',   label: 'EPISODE TRACKER',   icon: '▶' },
  { to: '/lore',       label: 'LORE GENERATOR',    icon: '✦' },
]

export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-[#0a0c10] border-r border-[#1c1f26] flex flex-col z-40">
      {/* Header */}
      <div className="px-4 pt-6 pb-5 border-b border-[#1c1f26]">
        <div className="text-[#66ff99] font-mono text-xs tracking-widest mb-1">IRZA SYSTEM</div>
        <div className="text-[#dde0e6] font-display text-xl tracking-widest leading-tight">
          INTER-REALITY<br />ZOOLOGICAL<br />ARCHIVE
        </div>
        <div className="mt-2 text-[#5a6175] font-mono text-[10px] tracking-widest">
          ARCHIVE STATUS: ACTIVE
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 font-mono text-xs tracking-widest transition-colors ${
                isActive
                  ? 'text-[#66ff99] bg-[#66ff99]/5 border-r-2 border-[#66ff99]'
                  : 'text-[#5a6175] hover:text-[#8891a4] hover:bg-[#1c1f26]/50'
              }`
            }
          >
            <span className="text-base w-4 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#1c1f26]">
        <div className="text-[#3d4352] font-mono text-[10px] tracking-widest">
          SYSTEM v1.0.0
        </div>
      </div>
    </aside>
  )
}
