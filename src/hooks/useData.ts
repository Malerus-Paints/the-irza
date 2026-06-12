import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/api'
import type { Faction, Squad, Exhibit, Anomaly, Episode, Sound, EpisodePhoto, ExhibitRevelation } from '../types'

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

// ─── Episode Photos ───────────────────────────────────────────────────────────

export function useEpisodePhotos(episodeId?: string) {
  return useQuery({
    queryKey: ['episode_photos', episodeId ?? 'all'],
    queryFn: () => api.getEpisodePhotos(episodeId),
  })
}

export function useExhibitPhotos(exhibitIds: string[]) {
  const key = [...exhibitIds].sort().join(',')
  return useQuery({
    queryKey: ['exhibit_photos', key],
    queryFn: () => api.getEpisodePhotosByExhibitIds(exhibitIds),
    enabled: exhibitIds.length > 0,
  })
}

export function useCreateEpisodePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createEpisodePhoto,
    onSuccess: (photo) => {
      qc.invalidateQueries({ queryKey: ['episode_photos'] })
      qc.invalidateQueries({ queryKey: ['episodes', photo.episode_id] })
    },
  })
}

export function useUpdateEpisodePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EpisodePhoto> }) =>
      api.updateEpisodePhoto(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episode_photos'] }),
  })
}

export function useDeleteEpisodePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteEpisodePhoto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episode_photos'] }),
  })
}

// ─── Exhibit Revelations ──────────────────────────────────────────────────────

export function useExhibitRevelations(filters?: { episodeId?: string; exhibitId?: string }) {
  return useQuery({
    queryKey: ['exhibit_revelations', filters?.episodeId ?? null, filters?.exhibitId ?? null],
    queryFn: () => api.getExhibitRevelations(filters),
  })
}

export function useCreateExhibitRevelation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createExhibitRevelation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exhibit_revelations'] }),
  })
}

export function useUpdateExhibitRevelation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ExhibitRevelation> }) =>
      api.updateExhibitRevelation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exhibit_revelations'] }),
  })
}

export function useDeleteExhibitRevelation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteExhibitRevelation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exhibit_revelations'] }),
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
