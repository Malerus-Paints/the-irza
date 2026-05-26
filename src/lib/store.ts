import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { EntryStatus } from '../types'

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}))

// ─── Filter Store ─────────────────────────────────────────────────────────────

interface FilterState {
  search: string
  statusFilter: EntryStatus | 'all'
  setSearch: (search: string) => void
  setStatusFilter: (status: EntryStatus | 'all') => void
  reset: () => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      search: '',
      statusFilter: 'all',
      setSearch: (search) => set({ search }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      reset: () => set({ search: '', statusFilter: 'all' }),
    }),
    { name: 'irza-filters' }
  )
)
