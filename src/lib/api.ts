import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Faction, Squad, Exhibit, Anomaly, Episode, LoreTemplate, EntryStatus, Sound, EpisodePhoto, ExhibitRevelation } from '../types'

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
    .select('*, exhibit:exhibits(id, name, miniature_name)')
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

// ─── Episode Photos ───────────────────────────────────────────────────────────

const EPISODE_PHOTO_SELECT = '*, episode:episodes(id, episode_number, title), exhibit:exhibits(id, name, miniature_name)'

export async function getEpisodePhotos(episodeId?: string): Promise<EpisodePhoto[]> {
  let q = supabase.from('episode_photos').select(EPISODE_PHOTO_SELECT).order('created_at')
  if (episodeId) q = q.eq('episode_id', episodeId)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function createEpisodePhoto(
  payload: Omit<EpisodePhoto, 'id' | 'created_at' | 'episode' | 'exhibit'>
): Promise<EpisodePhoto> {
  const { data, error } = await supabase
    .from('episode_photos')
    .insert(payload)
    .select(EPISODE_PHOTO_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function updateEpisodePhoto(id: string, payload: Partial<EpisodePhoto>): Promise<EpisodePhoto> {
  const { data, error } = await supabase
    .from('episode_photos')
    .update(payload)
    .eq('id', id)
    .select(EPISODE_PHOTO_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function deleteEpisodePhoto(id: string): Promise<void> {
  const { error } = await supabase.from('episode_photos').delete().eq('id', id)
  if (error) throw error
}

// ─── Exhibit Revelations ──────────────────────────────────────────────────────

const REVELATION_SELECT = '*, episode:episodes(id, episode_number, title), exhibit:exhibits(id, name), faction:factions(id, faction_id, name)'

export async function getExhibitRevelations(filters?: { episodeId?: string; exhibitId?: string }): Promise<ExhibitRevelation[]> {
  let q = supabase.from('exhibit_revelations').select(REVELATION_SELECT).order('created_at')
  if (filters?.episodeId) q = q.eq('episode_id', filters.episodeId)
  if (filters?.exhibitId) q = q.eq('exhibit_id', filters.exhibitId)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function createExhibitRevelation(
  payload: Omit<ExhibitRevelation, 'id' | 'created_at' | 'episode' | 'exhibit' | 'faction'>
): Promise<ExhibitRevelation> {
  const { data, error } = await supabase
    .from('exhibit_revelations')
    .insert(payload)
    .select(REVELATION_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function updateExhibitRevelation(id: string, payload: Partial<ExhibitRevelation>): Promise<ExhibitRevelation> {
  const { data, error } = await supabase
    .from('exhibit_revelations')
    .update(payload)
    .eq('id', id)
    .select(REVELATION_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function deleteExhibitRevelation(id: string): Promise<void> {
  const { error } = await supabase.from('exhibit_revelations').delete().eq('id', id)
  if (error) throw error
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
    needs_lore: allStatuses.filter((e) => (e as unknown as { status: EntryStatus }).status === 'needs-lore').length,
    canon_locked: allStatuses.filter((e) => (e as unknown as { status: EntryStatus }).status === 'canon-locked').length,
  }
}

// ─── Sound Library ────────────────────────────────────────────────────────────

export async function getSounds(): Promise<Sound[]> {
  const { data, error } = await supabase
    .from('sounds')
    .select('*')
    .order('category')
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function updateSound(id: string, payload: Partial<Sound>): Promise<Sound> {
  const { data, error } = await supabase
    .from('sounds')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Freesound Search ─────────────────────────────────────────────────────────

export interface FreesoundResult {
  id: number
  name: string
  description: string
  tags: string[]
  duration: number
  license: string
  previews: {
    'preview-hq-mp3': string
    'preview-lq-mp3': string
  }
}

export interface FreesoundResponse {
  count: number
  results: FreesoundResult[]
}

export async function searchFreesound(query: string): Promise<FreesoundResponse> {
  const token = import.meta.env.VITE_FREESOUND_API_KEY
  if (!token) throw new Error('VITE_FREESOUND_API_KEY not set')

  const params = new URLSearchParams({
    query,
    token,
    fields: 'id,name,description,tags,duration,license,previews',
    page_size: '12',
    filter: 'license:"Creative Commons 0" AND duration:[0 TO 60]',
  })

  const res = await fetch(`https://freesound.org/apiv2/search/text/?${params}`)
  if (!res.ok) throw new Error(`Freesound API error: ${res.status} ${res.statusText}`)
  return res.json()
}

// ─── Painting Library Sync ────────────────────────────────────────────────────────

export interface SyncResult {
  armies_created: number
  armies_updated: number
  squads_created: number
  squads_updated: number
  figures_created: number
  figures_updated: number
  errors: { army_name?: string; group_name?: string; figure_name?: string; error: string }[]
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>
    if (typeof e.message === 'string') return e.message
    if (typeof e.details === 'string') return e.details
    if (typeof e.hint === 'string') return e.hint
    return JSON.stringify(err)
  }
  return String(err)
}

export async function syncFromPaintingLibrary(paintingLibraryUserId: string): Promise<SyncResult> {
  const result: SyncResult = {
    armies_created: 0,
    armies_updated: 0,
    squads_created: 0,
    squads_updated: 0,
    figures_created: 0,
    figures_updated: 0,
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

    // Get next faction_id and squad_id (before army loop)
    const { data: existingFactions } = await supabase.from('factions').select('faction_id').order('faction_id', { ascending: false }).limit(1)
    let nextFactionNum = 1
    if (existingFactions && existingFactions.length > 0) {
      const lastId = existingFactions[0].faction_id
      const match = lastId.match(/F-(\d+)/)
      if (match) nextFactionNum = parseInt(match[1]) + 1
    }

    const { data: existingSquads } = await supabase.from('squads').select('squad_id').order('squad_id', { ascending: false }).limit(1)
    let nextSquadNum = 1
    if (existingSquads && existingSquads.length > 0) {
      const match = existingSquads[0].squad_id.match(/S-(\d+)/)
      if (match) nextSquadNum = parseInt(match[1]) + 1
    }

    // Process each army
    for (const army of armies) {
      try {
        const armyMinitrackId = `minitrack:${army.id}`

        // Check if faction already exists for this army (by stable minitrack ID)
        const { data: existingFaction } = await supabase
          .from('factions')
          .select('id')
          .eq('drive_doc_id', armyMinitrackId)
          .limit(1)

        const factionPayload = {
          name: army.name,
          system_status: army.game_system || 'UNCLASSIFIED',
          lore_text: army.description || null,
        }

        let factionId: string
        if (existingFaction && existingFaction.length > 0) {
          // Update existing faction with latest data from MiniCodex
          factionId = existingFaction[0].id
          await updateFaction(factionId, factionPayload)
          result.armies_updated++
        } else {
          // Create new faction
          const factionNum = String(nextFactionNum).padStart(3, '0')
          const newFaction = await createFaction({
            faction_id: `F-${factionNum}`,
            ...factionPayload,
            domain: null,
            threat_level: null,
            behavioral_classification: null,
            collective_or_individual: null,
            exhibits_catalogued: 0,
            origin_reality_status: 'unknown',
            drive_doc_id: armyMinitrackId,
            drive_doc_url: null,
            notes: null,
            status: 'drafted',
          })

          factionId = newFaction.id
          result.armies_created++
          nextFactionNum++
        }

        // Fetch all figures for this army via figure_armies junction
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

        // Fetch figure details — is_group splits into squads vs exhibits
        const figureIds = figureArmies.map((fa) => fa.figure_id)
        const { data: figures, error: figuresError } = await paintingLibSupabase
          .from('figures')
          .select('id, name, status, base_size_mm, notes, lore, is_group, scheme_summary')
          .in('id', figureIds)

        // Log for debugging
        if (figures && figures.length > 0) {
          console.log('Sample figure data:', figures[0])
        }

        if (figuresError) {
          result.errors.push({
            army_name: army.name,
            error: `Failed to fetch figure details: ${figuresError.message}`,
          })
          continue
        }

        const allFigures = figures || []
        const groups = allFigures.filter((f) => f.is_group)
        const exhibits = allFigures.filter((f) => !f.is_group)

        // Create or update squads from is_group figures
        for (const group of groups) {
          try {
            const groupMinitrackId = `minitrack:${group.id}`
            const { data: existingSquad } = await supabase
              .from('squads')
              .select('id')
              .eq('drive_doc_id', groupMinitrackId)
              .limit(1)

            const squadPayload = {
              name: group.name,
              faction_id: factionId,
              system_status: 'MONITORING',
              lore_text: group.lore || group.notes || null,
            }

            if (existingSquad && existingSquad.length > 0) {
              // Update existing squad with latest data from MiniCodex
              await updateSquad(existingSquad[0].id, squadPayload)
              result.squads_updated++
            } else {
              // Create new squad
              const squadNum = String(nextSquadNum).padStart(3, '0')
              await createSquad({
                squad_id: `S-${squadNum}`,
                ...squadPayload,
                squad_role: 'UNKNOWN',
                domain: null,
                threat_level: null,
                collective_behavior_type: null,
                drive_doc_id: groupMinitrackId,
                drive_doc_url: null,
                status: 'drafted',
              })
              result.squads_created++
              nextSquadNum++
            }
          } catch (groupErr) {
            result.errors.push({
              group_name: group.name,
              error: `Failed to sync squad: ${extractErrorMessage(groupErr)}`,
            })
          }
        }

        // Create or update exhibits from non-group figures
        for (const figure of exhibits) {
          try {
            const minitrackId = `minitrack:${figure.id}`

            const { data: existing } = await supabase
              .from('exhibits')
              .select('id')
              .eq('drive_doc_id', minitrackId)
              .limit(1)

            let exhibitStatus: EntryStatus = 'drafted'
            if (figure.status === 'complete' || figure.status === 'display') {
              exhibitStatus = 'needs-lore'
            }

            const figureData = figure as any
            const exhibitData = {
              exhibit_number: null as string | null,
              name: figure.name,
              archive_status: 'ACTIVE' as const,
              faction_id: factionId,
              squad_id: null,
              domain: null,
              threat_level: null,
              behavioral_pattern: null,
              miniature_name: figure.name,
              paint_scheme: figureData.scheme_summary ? String(figureData.scheme_summary).trim() : null,
              base_size: figure.base_size_mm ? `${figure.base_size_mm}mm` : null,
              episode_type: null,
              runtime_class: null,
              preset: null,
              episode_number: null,
              filmed: false,
              posted_date: null,
              platform: null,
              lore_text: figure.lore || figure.notes || null,
              curator_interpretation: null,
              engineer_assessment: null,
              biologist_assessment: null,
              origin_reality_status: 'unknown' as const,
              backlog_release: false,
              drive_doc_id: minitrackId,
              drive_doc_url: null,
              status: exhibitStatus,
            }

            if (existing && existing.length > 0) {
              // Update existing exhibit with new data from MiniCodex
              await updateExhibit(existing[0].id, exhibitData)
              result.figures_updated++
            } else {
              // Create new exhibit
              await createExhibit(exhibitData)
              result.figures_created++
            }
          } catch (figureErr) {
            result.errors.push({
              figure_name: figure.name,
              error: `Failed to sync exhibit: ${extractErrorMessage(figureErr)}`,
            })
          }
        }

        // Update faction's exhibits_catalogued count (groups excluded)
        await updateFaction(factionId, {
          exhibits_catalogued: exhibits.length,
        })
      } catch (armyErr) {
        const error = extractErrorMessage(armyErr)
        result.errors.push({
          army_name: army.name,
          error: `Failed to sync army: ${error}`,
        })
      }
    }
  } catch (err) {
    throw new Error(`Painting Library sync failed: ${extractErrorMessage(err)}`)
  }

  return result
}
