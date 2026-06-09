import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { FactionsPage } from './pages/FactionsPage'
import { SquadsPage } from './pages/SquadsPage'
import { ExhibitsPage } from './pages/ExhibitsPage'
import { AnomaliesPage } from './pages/AnomaliesPage'
import { EpisodesPage } from './pages/EpisodesPage'
import { LoreGeneratorPage } from './pages/LoreGeneratorPage'
import { SearchPage } from './pages/SearchPage'
import { ScriptWorkspacePage } from './pages/ScriptWorkspacePage'
import { SoundLibraryPage } from './pages/SoundLibraryPage'
import { LoginPage } from './pages/LoginPage'
import { supabase } from './lib/supabase'
import { useAuthStore } from './lib/store'

export default function App() {
  const { user, setUser } = useAuthStore()
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setBootstrapped(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen bg-[#050608] items-center justify-center">
        <div className="font-mono text-[10px] text-[#3d4352] tracking-widest animate-pulse">
          SYSTEM INITIALIZING...
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#050608]">
        <Sidebar />
        <main className="flex-1 ml-56 p-8 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/factions" element={<FactionsPage />} />
              <Route path="/squads" element={<SquadsPage />} />
              <Route path="/exhibits" element={<ExhibitsPage />} />
              <Route path="/anomalies" element={<AnomaliesPage />} />
              <Route path="/episodes" element={<EpisodesPage />} />
              <Route path="/lore" element={<LoreGeneratorPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/script" element={<ScriptWorkspacePage />} />
              <Route path="/sounds" element={<SoundLibraryPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
