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
