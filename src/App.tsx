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

export default function App() {
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
