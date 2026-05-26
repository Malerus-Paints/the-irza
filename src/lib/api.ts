import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Faction, Squad, Exhibit, Anomaly, Episode, LoreTemplate, EntryStatus } from '../types'

// ─── Factions ─────────────────────────────────────────────────────────────────

export async function getFactions(): Promise<Faction[]> {
  const { data, error } = await supabase
    .from('factions')
    .select('*')
    .order('faction_id')
  if (error) throw error
  return data ?? []
}

export async function getFaction(id: string): Promise<Faction> {
  const { data, error } = await supabase
    .from('factions')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createFaction(payload: Omit<Faction, 'id' | 'created_at' | 'updated_at'>): Promise<Faction> {
  const { data, error } = await supabase
    .from('factions')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFaction(id: string, payload: Partial<Faction>): Promise<Faction> {
  const { data, error } = await supabase
    .from('factions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFaction(id: string): Promise<void> {
  const { error } = await supabase.from('factions').delete().eq('id', id)
  if (error) throw error
}

// ─── Squads ───────────────────────────────────────────────────────────────────

export async function getSquads(): Promise<Squad[]> {
  const { data, error } = await supabase
    .from('squads')
    .select('*, faction:factions(id, faction_id, name)')
    .order('squad_id')
  if (error) throw error
  return data ?? []
}

export async function createSquad(payload: Omit<Squad, 'id' | 'created_at' | 'updated_at' | 'faction'>): Promise<Squad> {
  const { data, error } = await supabase
    .from('squads')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSquad(id: string, payload: Partial<Squad>): Promise<Squad> {
  const { data, error } = await supabase
    .from('squads')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSquad(id: string): Promise<void> {
  const { error } = await supabase.from('squads').delete().eq('id', id)
  if (error) throw error
}

// ─── Exhibits ─────────────────────────────────────────────────────────────────

export async function getExhibits(): Promise<Exhibit[]> {
  const { data, error } = await supabase
    .from('exhibits')
    .select('*, faction:factions(id, faction_id, name), squad:squads(id, squad_id, name)')
    .order('exhibit_number')
  if (error) throw error
  return data ?? []
}

export async function getExhibit(id: string): Promise<Exhibit> {
  const { data, error } = await supabase
    .from('exhibits')
    .select('*, faction:factions(id, faction_id, name), squad:squads(id, squad_id, name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createExhibit(payload: Omit<Exhibit, 'id' | 'created_at' | 'updated_at' | 'faction' | 'squad'>): Promise<Exhibit> {
  const { data, error } = await supabase
    .from('exhibits')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExhibit(id: string, payload: Partial<Exhibit>): Promise<Exhibit> {
  const { data, error } = await supabase
    .from('exhibits')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExhibit(id: string): Promise<void> {
  const { error } = await supabase.from('exhibits').delete().eq('id', id)
  if (error) throw error
}

// ─── Anomalies ────────────────────────────────────────────────────────────────

export async function getAnomalies(): Promise<Anomaly[]> {
  const { data, error } = await supabase
    .from('anomalies')
    .select('*')
    .order('anomaly_id')
  if (error) throw error
  return data ?? []
}

export async function createAnomaly(payload: Omit<Anomaly, 'id' | 'created_at' | 'updated_at'>): Promise<Anomaly> {
  const { data, error } = await supabase
    .from('anomalies')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAnomaly(id: string, payload: Partial<Anomaly>): Promise<Anomaly> {
  const { data, error } = await supabase
    .from('anomalies')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAnomaly(id: string): Promise<void> {
  const { error } = await supabase.from('anomalies').delete().eq('id', id)
  if (error) throw error
}

// ─── Episodes ─────────────────────────────────────────────────────────────────

export async function getEpisodes(): Promise<Episode[]> {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .order('episode_number', { nullsFirst: false })
  if (error) throw error
  return data ?? []
}

export async function createEpisode(payload: Omit<Episode, 'id' | 'created_at' | 'updated_at'>): Promise<Episode> {
  const { data, error } = await supabase
    .from('episodes')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEpisode(id: string, payload: Partial<Episode>): Promise<Episode> {
  const { data, error } = await supabase
    .from('episodes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Lore Templates ───────────────────────────────────────────────────────────

export async function getLoreTemplates(): Promise<LoreTemplate[]> {
  const { data, error } = await supabase
    .from('lore_templates')
    .select('*')
    .order('template_type')
  if (error) throw error
  return data ?? []
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface ArchiveStats {
  factions: number
  squads: number
  exhibits: number
  anomalies: number
  episodes_posted: number
  needs_lore: number
  canon_locked: number
}

export async function getArchiveStats(): Promise<ArchiveStats> {
  const [factions, squads, exhibits, anomalies, episodes] = await Promise.all([
    supabase.from('factions').select('id, status', { count: 'exact' }),
    supabase.from('squads').select('id', { count: 'exact' }),
    supabase.from('exhibits').select('id', { count: 'exact' }),
    supabase.from('anomalies').select('id', { count: 'exact' }),
    supabase.from('episodes').select('id, status', { count: 'exact' }),
  ])
  const allStatuses = [
    ...(factions.data ?? []),
    ...(exhibits.data ?? []),
    ...(anomalies.data ?? []),
  ]
  return {
    factions: factions.count ?? 0,
    squads: squads.count ?? 0,
    exhibits: exhibits.count ?? 0,
    anomalies: anomalies.count ?? 0,
    episodes_posted: (episodes.data ?? []).filter((e) => e.status === 'posted').length,
    needs_lore: allStatuses.filter((e) => (e as { status: EntryStatus }).status === 'needs-lore').length,
    canon_locked: allStatuses.filter((e) => (e as { status: EntryStatus }).status === 'canon-locked').length,
  }
}

// ─── Painting Library Sync ────────────────────────────────────────────────────────

export interface SyncResult {
  armies_created: number
  figures_created: number
  errors: { army_name?: string; figure_name?: string; error: string }[]
}

export async function syncFromPaintingLibrary(paintingLibraryUserId: string): Promise<SyncResult> {
  const result: SyncResult = {
    armies_created: 0,
    figures_created: 0,
    errors: [],
  }

  // Initialize Painting Library Supabase client
  const paintingLibUrl = import.meta.env.VITE_PAINTING_LIBRARY_URL
  const paintingLibKey = import.meta.env.VITE_PAINTING_LIBRARY_ANON_KEY

  if (!paintingLibUrl || !paintingLibKey) {
    throw new Error('Painting Library credentials not configured')
  }

  const paintingLibSupabase = createClient(paintingLibUrl, paintingLibKey)

  try {
    // Fetch armies owned by the user
    const { data: armies, error: armiesError } = await paintingLibSupabase
      .from('armies')
      .select('id, name, game_system, description')
      .eq('user_id', paintingLibraryUserId)

    if (armiesError) throw armiesError
    if (!armies || armies.length === 0) {
      return result
    }

    // Get next faction_id
    const { data: existingFactions } = await supabase.from('factions').select('faction_id').order('faction_id', { ascending: false }).limit(1)
    let nextFactionNum = 1
    if (existingFactions && existingFactions.length > 0) {
      const lastId = existingFactions[0].faction_id
      const match = lastId.match(/F-(\d+)/)
      if (match) nextFactionNum = parseInt(match[1]) + 1
    }

    // Process each army
    for (const army of armies) {
      try {
        // Check if faction with this name already exists
        const { data: existingFaction } = await supabase
          .from('factions')
          .select('id')
          .eq('name', army.name)
          .limit(1)

        let factionId: string
        if (existingFaction && existingFaction.length > 0) {
          factionId = existingFaction[0].id
        } else {
          // Create new faction
          const factionNum = String(nextFactionNum).padStart(3, '0')
          const newFaction = await createFaction({
            faction_id: `F-${factionNum}`,
            name: army.name,
            domain: null,
            threat_level: null,
            behavioral_classification: null,
            collective_or_individual: null,
            system_status: army.game_system || 'UNCLASSIFIED',
            exhibits_catalogued: 0,
            origin_reality_status: 'unknown',
            lore_text: army.description || null,
            drive_doc_id: `minitrack:${army.id}`,
            drive_doc_url: null,
            notes: null,
            status: 'drafted',
          })

          factionId = newFaction.id
          result.armies_created++
          nextFactionNum++
        }

        // Fetch figures for this army via figure_armies junction
        const { data: figureArmies, error: figureArmiesError } = await paintingLibSupabase
          .from('figure_armies')
          .select('figure_id')
          .eq('army_id', army.id)

        if (figureArmiesError) {
          result.errors.push({
            army_name: army.name,
            error: `Failed to fetch figures: ${figureArmiesError.message}`,
          })
          continue
        }

        if (!figureArmies || figureArmies.length === 0) {
          continue
        }

        // Fetch figure details
        const figureIds = figureArmies.map((fa) => fa.figure_id)
        const { data: figures, error: figuresError } = await paintingLibSupabase
          .from('figures')
          .select('id, name, status, base_size_mm, points_cost, notes, is_group')
          .in('id', figureIds)

        if (figuresError) {
          result.errors.push({
            army_name: army.name,
            error: `Failed to fetch figure details: ${figuresError.message}`,
          })
          continue
        }

        // Create exhibits for each figure
        for (const figure of figures || []) {
          try {
            // Map figure status to exhibit status
            let exhibitStatus: EntryStatus = 'drafted'
            if (figure.status === 'complete' || figure.status === 'display') {
              exhibitStatus = 'needs-lore'
            }

            await createExhibit({
              exhibit_number: null,
              name: figure.name,
              archive_status: 'ACTIVE',
              faction_id: factionId,
              squad_id: null,
              domain: null,
              threat_level: null,
              behavioral_pattern: null,
              miniature_name: figure.name,
              paint_scheme: null,
              base_size: figure.base_size_mm ? `${figure.base_size_mm}mm` : null,
              episode_type: null,
              runtime_class: null,
              preset: null,
              episode_number: null,
              filmed: false,
              posted_date: null,
              platform: null,
              lore_text: figure.notes || null,
              curator_interpretation: null,
              engineer_assessment: null,
              biologist_assessment: null,
              origin_reality_status: 'unknown',
              backlog_release: false,
              drive_doc_id: `minitrack:${figure.id}`,
              drive_doc_url: null,
              status: exhibitStatus,
            })

            result.figures_created++
          } catch (figureErr) {
            const error = figureErr instanceof Error ? figureErr.message : String(figureErr)
            result.errors.push({
              figure_name: figure.name,
              error: `Failed to create exhibit: ${error}`,
            })
          }
        }

        // Update faction's exhibits_catalogued count
        await updateFaction(factionId, {
          exhibits_catalogued: (figures || []).length,
        })
      } catch (armyErr) {
        const error = armyErr instanceof Error ? armyErr.message : String(armyErr)
        result.errors.push({
          army_name: army.name,
          error: `Failed to sync army: ${error}`,
        })
      }
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    throw new Error(`Painting Library sync failed: ${error}`)
  }

  return result
}
