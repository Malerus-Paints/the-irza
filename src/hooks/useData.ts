import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/api'
import type { Faction, Squad, Exhibit, Anomaly, Episode, Sound } from '../types'

// ─── Factions ─────────────────────────────────────────────────────────────────

export function useFactions() {
  return useQuery({ queryKey: ['factions'], queryFn: api.getFactions })
}

export function useFaction(id: string) {
  return useQuery({ queryKey: ['factions', id], queryFn: () => api.getFaction(id), enabled: !!id })
}

export function useCreateFaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createFaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['factions'] }),
  })
}

export function useUpdateFaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Faction> }) =>
      api.updateFaction(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['factions'] }),
  })
}

export function useDeleteFaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteFaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['factions'] }),
  })
}

// ─── Squads ───────────────────────────────────────────────────────────────────

export function useSquads() {
  return useQuery({ queryKey: ['squads'], queryFn: api.getSquads })
}

export function useCreateSquad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createSquad,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['squads'] }),
  })
}

export function useUpdateSquad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Squad> }) =>
      api.updateSquad(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['squads'] }),
  })
}

export function useDeleteSquad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteSquad,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['squads'] }),
  })
}

// ─── Exhibits ─────────────────────────────────────────────────────────────────

export function useExhibits() {
  return useQuery({ queryKey: ['exhibits'], queryFn: api.getExhibits })
}

export function useExhibit(id: string) {
  return useQuery({ queryKey: ['exhibits', id], queryFn: () => api.getExhibit(id), enabled: !!id })
}

export function useCreateExhibit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createExhibit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exhibits'] }),
  })
}

export function useUpdateExhibit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Exhibit> }) =>
      api.updateExhibit(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exhibits'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteExhibit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteExhibit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exhibits'] }),
  })
}

// ─── Anomalies ────────────────────────────────────────────────────────────────

export function useAnomalies() {
  return useQuery({ queryKey: ['anomalies'], queryFn: api.getAnomalies })
}

export function useCreateAnomaly() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createAnomaly,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anomalies'] }),
  })
}

export function useUpdateAnomaly() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Anomaly> }) =>
      api.updateAnomaly(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anomalies'] }),
  })
}

export function useDeleteAnomaly() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAnomaly,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anomalies'] }),
  })
}

// ─── Episodes ─────────────────────────────────────────────────────────────────

export function useEpisodes() {
  return useQuery({ queryKey: ['episodes'], queryFn: api.getEpisodes })
}

export function useCreateEpisode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createEpisode,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episodes'] }),
  })
}

export function useUpdateEpisode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Episode> }) =>
      api.updateEpisode(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episodes'] }),
  })
}

// ─── Lore Templates ───────────────────────────────────────────────────────────

export function useLoreTemplates() {
  return useQuery({ queryKey: ['lore_templates'], queryFn: api.getLoreTemplates })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useArchiveStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getArchiveStats,
    staleTime: 60_000,
  })
}

// ─── Sound Library ────────────────────────────────────────────────────────────

export function useSounds() {
  return useQuery({ queryKey: ['sounds'], queryFn: api.getSounds })
}

export function useUpdateSound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Sound> }) =>
      api.updateSound(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sounds'] }),
  })
}

export function useFreesoundSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ['freesound', query],
    queryFn: () => api.searchFreesound(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

// ─── Sync ─────────────────────────────────────────────────────────────────

export function useSyncFromPaintingLibrary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => api.syncFromPaintingLibrary(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['factions'] })
      qc.invalidateQueries({ queryKey: ['exhibits'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
