# THE IRZA — Claude Code Project Guide

## Project Overview

**Inter-Reality Zoological Archive** — management system for a TikTok/YouTube found-footage institutional sci-fi series. Painted miniatures are presented as real entities preserved from collapsing realities. This app manages the canon database: factions, squads, exhibits, anomalies, episodes, and lore generation.

**Live app:** Vercel (check dashboard for URL — auto-deploys on push to main)
**Supabase project:** `gtpnlgqyqxbqnjlgojvz` (the-irza)

---

## Canon Rules (NEVER VIOLATE IN GENERATED CONTENT)

- Miniatures are **never** called miniatures — always "entities", "specimens", or "exhibits"
- **Surface premise** (what the cast knows): a facility pulling creatures from other realities for study
- **True premise** (what only The System knows): the Archive is an ARK — source realities are COLLAPSING
- The true premise is **never stated directly** in any episode — it is the slow-burn revelation of the series
- The System AI is the only entity with full situational awareness
- Anomaly containment is dimensional triage, not classification management — cast doesn't know this
- Backlog releases are deliberate System choices — "PRIOR COLLECTION DATE: [REDACTED]"

## Character Voices

| Character | Subtitle Color | Style |
|-----------|---------------|-------|
| Curator | `#F2E9DC` warm gold | Metaphor over fact, weighted conclusions, never states directly |
| Muscle | White | Reactive, casual, says what the audience is thinking |
| Engineer | `#5ED9FF` cyan | Clinical, functional, precise |
| Biologist | `#F5C842` amber | Wonder + precision, slightly fast delivery |
| System | `#66FF99` terminal green | ALL CAPS, fragmented outputs, never emotional |
| Wanderer | `#B8A9C9` violet | Irregular, something finding its position |
| Copycat | `#A8B8B0` glitch | Desynced, unauthorized presence |
| Malerus | `#888888` grey | Prior operator, fragmented trace only |

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| Data fetching | TanStack React Query v5 |
| Global state | Zustand (`useAuthStore`, `useFilterStore`) |
| Backend | Supabase (Postgres + Auth) — project `gtpnlgqyqxbqnjlgojvz` |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) — custom `archive-*` and character palettes |
| Fonts | Bebas Neue (`font-display`), JetBrains Mono (`font-mono`), DM Sans (`font-sans`) |
| Deployment | Vercel (auto-deploy on push to main) |

---

## Key Files

```
src/
  types/index.ts          — all shared types, enums, constants (source of truth)
  lib/
    api.ts                — all Supabase query/mutation functions
    supabase.ts           — supabase client singleton
    store.ts              — Zustand stores (auth, filters)
  hooks/
    useData.ts            — React Query hooks wrapping api.ts
  pages/
    DashboardPage.tsx     — archive status overview + stat cards
    FactionsPage.tsx      — faction registry with expand/status editing
    SquadsPage.tsx        — squad registry
    ExhibitsPage.tsx      — exhibit database
    AnomaliesPage.tsx     — anomaly registry
    EpisodesPage.tsx      — episode tracker
    LoreGeneratorPage.tsx — context-aware prompt template builder
  components/
    ui/index.tsx          — shared UI primitives (Button, Card, StatusBadge, etc.)
    layout/
      Sidebar.tsx         — fixed left navigation
supabase/
  migrations/             — SQL migration files (run in Supabase Dashboard → SQL Editor)
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `factions` | Faction registry — 11 seeded from Drive (F-001 to F-011) |
| `squads` | Squad registry — collective behavioral systems per faction |
| `exhibits` | Individual exhibit records (the miniatures as canon entities) |
| `anomalies` | Entities without confirmed faction origin |
| `episodes` | Episode tracker — title, type, preset, runtime class, status |
| `lore_templates` | Prompt templates with context injection — 4 seeded |
| `drive_sync_log` | Track Drive pull/push operations |

### Entry Status Flow
`drafted` → `needs-lore` → `canon-locked` → `published`

---

## UI / Style Conventions

- **Color palette:** `archive-*` for backgrounds/text (dark near-black), character colors for accents
- **Typography:** `font-display` (Bebas Neue) for page headings UPPERCASE, `font-mono` (JetBrains Mono) for labels/IDs/System text, `font-sans` (DM Sans) for body
- **Cards:** `bg-[#111318] border border-[#1c1f26] rounded-lg` — standard container
- **System text:** ALL CAPS, `font-mono text-[10px] tracking-widest text-[#66ff99]`
- **Threat level colors:** NONE=green, LOW=light-green, MODERATE=amber, HIGH=orange, UNRESOLVABLE=red
- **Status badges:** inline pill, color-coded per status

---

## Data Fetching Patterns

- **All Supabase calls go through `src/lib/api.ts`** — components only call hooks from `useData.ts`
- React Query hooks: `useFactions()`, `useSquads()`, `useExhibits()`, `useAnomalies()`, `useEpisodes()`, `useLoreTemplates()`, `useArchiveStats()`
- Mutations: `useCreateFaction()`, `useUpdateFaction()`, `useUpdateExhibit()`, etc.
- Cache invalidation: mutations invalidate the relevant query key

---

## Gotchas

1. **Tailwind v4 config:** uses `@theme {}` block in `index.css` — no `tailwind.config.js`. The plugin is `@tailwindcss/vite` added to `vite.config.ts`.
2. **RLS:** All tables have RLS enabled, authenticated users have full read/write. No public access — this is a solo app.
3. **SQL migrations:** New migrations go in `supabase/migrations/` and are run via Supabase Dashboard → SQL Editor. Use `apply_migration` MCP tool or run manually.
4. **PostgREST schema cache:** After schema changes, run `NOTIFY pgrst, 'reload schema';` in SQL editor.

---

## Development

```powershell
# Install deps
npm install

# Local dev server
npm run dev

# Type-check
npx tsc --noEmit

# Build
npm run build
```

---

## Roadmap

### MVP (Shipped)

- ✅ Supabase project provisioned (`the-irza`, region `us-east-1`)
- ✅ Database schema: factions, squads, exhibits, anomalies, episodes, lore_templates, drive_sync_log
- ✅ 11 factions seeded from Drive canon
- ✅ 4 lore templates seeded (Exhibit Record, Faction Lore, Anomaly Report, Episode Script)
- ✅ React + Vite + TypeScript scaffold
- ✅ Tailwind v4 with archive aesthetic (dark, institutional, terminal-green accents)
- ✅ Sidebar navigation
- ✅ Dashboard with archive stats
- ✅ Faction Registry — searchable, filterable, expandable rows, inline status editing
- ✅ Squad Registry — list view
- ✅ Exhibit Database — list view
- ✅ Anomaly Registry — list view
- ✅ Episode Tracker — list view with phase counts
- ✅ Lore Generator — template picker + faction context injection + copy-to-clipboard

### Near-term

- [ ] **Supabase Auth** — login gate so the app isn't wide open (magic link or email/password)
- [ ] **Exhibit create/edit form** — full form with faction picker, threat level, lore fields
- [ ] **Faction lore editor** — textarea to write/save full lore text per faction
- [ ] **Drive sync** — pull button that re-reads Drive registry spreadsheets and updates DB
- [ ] **Vercel deployment** — push to main, connect repo in Vercel dashboard

### Phase 2

- [ ] **Episode script workspace** — write scripts with character voice guides embedded
- [ ] **Anomaly create/edit form** — full form matching anomaly classification schema
- [ ] **Squad create/edit form** — faction picker, role selector
- [ ] **Exhibit detail page** — full lore record view (curator/engineer/biologist assessments)
- [ ] **Content format picker** — 37 content formats from canon, tagged by phase availability
- [ ] **Canon search** — global search across all registries

### Phase 3

- [ ] **Drive push** — write finalized lore back to Drive docs
- [ ] **Episode captions generator** — auto-generate post captions from exhibit/episode data
- [ ] **Copycat pipeline tracker** — separate tracking for non-canon content
