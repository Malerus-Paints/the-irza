import { useState, useRef } from 'react'
import { useSounds, useUpdateSound, useFreesoundSearch } from '../hooks/useData'
import type { Sound } from '../types'
import {
  SOUND_CATEGORIES,
  SOUND_STATUS_LABELS,
  SOUND_STATUS_COLORS,
} from '../types'
import type { FreesoundResult } from '../lib/api'

const SEARCH_TERMS: Record<string, string[]> = {
  // FACILITY BED
  'Institutional Hum': ['electrical hum loop', 'industrial drone ambient', 'machine room hum', 'power grid buzz'],
  'Resonant Drone': ['resonant drone loop', 'dark ambient drone', 'metallic resonance', 'deep space drone'],
  'Cyberpunk Ambient Loop': ['cyberpunk ambience loop', 'sci-fi city ambient', 'futuristic hum background', 'neon city drone'],
  'Ritual Drone': ['ritual drone dark ambient', 'ceremonial ominous hum', 'horror drone loop', 'sacred drone low'],
  'Server Room Ambience': ['server room ambient', 'data center hum loop', 'cooling fan background', 'computer room noise'],
  'Distant Machinery Hum': ['distant machinery hum', 'industrial background rumble', 'factory far away', 'mechanical low hum'],
  // SYSTEM UI
  'Scan Initiation Tone': ['radar sweep scan tone', 'interface scan beep sci-fi', 'scanning initiation', 'sonar ping tone'],
  'Scan Completion Tone': ['scan complete success beep', 'confirmation tone UI', 'system scan done beep', 'positive beep sci-fi'],
  'Classification Lock': ['mechanical lock click', 'secure lock beep', 'classify lock sound', 'system lock confirmed'],
  'Classification Update / Reclassify': ['data update notification beep', 'reclassify transition tone', 'system update UI', 'digital chime update'],
  'Data Processing Loop': ['data processing loop', 'computing digital loop', 'CPU processing hum', 'circuit processing sound'],
  'System Alert': ['system alert warning beep', 'sci-fi interface alert', 'warning alarm short', 'critical alert tone'],
  'Instability Alert': ['instability warning alarm', 'error glitch alert', 'system failure warning', 'critical error tone'],
  'UI Element Appear': ['UI appear whoosh', 'interface element popup', 'digital appear sound', 'hologram appear'],
  'UI Element Dismiss': ['UI dismiss close sound', 'interface element disappear', 'popup close sound', 'digital dismiss'],
  'Data Input / Typing': ['mechanical keyboard typing', 'sci-fi data input clicks', 'computer terminal type', 'digital keystrokes loop'],
  // GLITCH / INSTABILITY
  'Signal Flutter': ['signal flutter subtle', 'radio static flutter low', 'digital flutter interference', 'transmission flicker'],
  'Data Corruption Tick': ['data corruption tick', 'digital tick glitch', 'bit error click sound', 'corrupted signal tick'],
  'Short Glitch Burst': ['glitch burst short', 'digital glitch medium', 'corrupted audio burst', 'signal glitch hit'],
  'Audio Dropout': ['audio dropout glitch', 'signal dropout cut', 'transmission dropout', 'audio cut stutter'],
  'Pitch Shift Glitch': ['pitch shift glitch', 'voice pitch distort', 'audio pitch bend glitch', 'digital pitch warp'],
  'Extended Corruption': ['extended audio corruption', 'heavy glitch sustained', 'signal corruption long', 'digital breakdown loop'],
  'System Stutter Loop': ['system stutter loop', 'audio stutter glitch loop', 'digital stammer repeat', 'interface stutter'],
  'Full Signal Collapse': ['signal collapse audio', 'full system failure sound', 'transmission collapse', 'catastrophic glitch'],
  // TRANSITIONS
  'Facility Power-On': ['power on startup machine', 'system boot up sound', 'facility power on', 'machine startup hum'],
  'Hard Cut Whoosh': ['whoosh sharp cinematic', 'hard cut transition whoosh', 'air whoosh fast', 'swipe whoosh hit'],
  'Archive Access Tone': ['access granted tone', 'vault open beep', 'archive access sound', 'clearance granted chime'],
  'Signal Lock': ['signal lock acquired', 'frequency lock beep', 'lock on acquired tone', 'signal locked sound'],
  'Fade to Static': ['static noise fade', 'TV static white noise', 'signal to static noise', 'white noise hiss'],
  'Deep Thud / Impact': ['deep bass thud impact', 'cinematic low hit', 'sub bass impact thump', 'low frequency hit'],
  // CHARACTER SIGNATURES
  'Curator Presence Tone': ['warm resonant chime tone', 'elegant presence bell', 'subtle arrival tone soft', 'glass harmonic tone'],
  'System Activation': ['computer system activation', 'AI terminal boot tone', 'system online beep', 'machine intelligence startup'],
  'Muscle Foley': ['heavy armor footstep', 'muscular movement foley', 'heavy body armor shift', 'soldier movement foley'],
  'Copycat Feed Interrupt': ['signal interrupt glitch', 'transmission hijack static', 'unauthorized signal burst', 'feed cut interrupt'],
  // ANOMALY / THREAT
  'Low Threat Presence': ['low ominous presence', 'subtle horror ambient tone', 'creature distant subtle', 'unsettling low tone'],
  'Medium Threat Vocalization': ['creature vocalization alien', 'alien sound medium', 'monster call medium', 'threat vocalization sci-fi'],
  'High Threat Environmental Response': ['high threat alarm response', 'danger environmental heavy', 'emergency ambient intense', 'threat alarm surge'],
  'Reality Signature Sound': ['dimensional rift sound', 'reality tear effect', 'portal anomaly sound', 'dimensional collapse effect'],
}

const INTENSITY_COLORS: Record<string, string> = {
  Low: 'text-[#7bc47a]',
  Medium: 'text-[#e8b84b]',
  High: 'text-[#e86b3a]',
}

const CHARACTER_COLORS: Record<string, string> = {
  Curator: 'text-[#F2E9DC]',
  'The System': 'text-[#66FF99]',
  'The Muscle': 'text-[#ffffff]',
  'The Copycat': 'text-[#A8B8B0]',
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function SoundRow({
  sound,
  isSelected,
  onSelect,
}: {
  sound: Sound
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
        isSelected
          ? 'bg-[#66ff99]/10 border border-[#66ff99]/30'
          : 'hover:bg-[#1c1f26]/60 border border-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs text-[#dde0e6] truncate">{sound.name}</div>
        {(sound.intensity_level || sound.character) && (
          <div className="font-mono text-[10px] mt-0.5">
            {sound.intensity_level && (
              <span className={INTENSITY_COLORS[sound.intensity_level] ?? 'text-[#5a6175]'}>
                {sound.intensity_level.toUpperCase()}
              </span>
            )}
            {sound.character && (
              <span className={CHARACTER_COLORS[sound.character] ?? 'text-[#5a6175]'}>
                {sound.character.toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
      <span
        className={`font-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded whitespace-nowrap ${SOUND_STATUS_COLORS[sound.status]}`}
      >
        {SOUND_STATUS_LABELS[sound.status]}
      </span>
    </button>
  )
}

function FreesoundResultCard({
  result,
  onLink,
  isLinking,
}: {
  result: FreesoundResult
  onLink: () => void
  isLinking: boolean
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const previewUrl = result.previews?.['preview-hq-mp3'] ?? result.previews?.['preview-lq-mp3']

  function togglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play()
      setPlaying(true)
    }
  }

  return (
    <div className="bg-[#111318] border border-[#1c1f26] rounded-lg p-3 space-y-2">
      <div className="flex items-start gap-2">
        {previewUrl && (
          <>
            <audio
              ref={audioRef}
              src={previewUrl}
              onEnded={() => setPlaying(false)}
              preload="none"
            />
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-7 h-7 rounded bg-[#1c1f26] border border-[#2a2f3a] text-[#66ff99] font-mono text-xs flex items-center justify-center hover:bg-[#66ff99]/10 transition-colors"
              title={playing ? 'Pause' : 'Preview'}
            >
              {playing ? '■' : '▶'}
            </button>
          </>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs text-[#dde0e6] truncate">{result.name}</div>
          <div className="font-mono text-[10px] text-[#5a6175] mt-0.5">
            {formatDuration(result.duration)} · ID {result.id}
          </div>
        </div>
        <button
          onClick={onLink}
          disabled={isLinking}
          className="flex-shrink-0 font-mono text-[10px] tracking-widest px-2 py-1 rounded bg-[#66ff99]/10 text-[#66ff99] border border-[#66ff99]/30 hover:bg-[#66ff99]/20 transition-colors disabled:opacity-40"
        >
          {isLinking ? 'LINKING…' : 'LINK'}
        </button>
      </div>

      {result.description && (
        <p className="text-[#5a6175] text-[10px] font-mono leading-relaxed line-clamp-2">
          {result.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1">
        {result.tags.slice(0, 6).map((tag) => (
          <span
            key={tag}
            className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#1c1f26] text-[#5a6175] tracking-wide"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="font-mono text-[9px] text-[#3d4352] truncate">
        {result.license}
      </div>
    </div>
  )
}

export function SoundLibraryPage() {
  const { data: sounds = [], isLoading } = useSounds()
  const updateSound = useUpdateSound()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [linkingId, setLinkingId] = useState<number | null>(null)

  const selectedSound = sounds.find((s) => s.id === selectedId) ?? null

  const { data: searchResults, isFetching, error: searchError } = useFreesoundSearch(
    activeQuery,
    true
  )

  const hasApiKey = !!import.meta.env.VITE_FREESOUND_API_KEY

  function handleSelectSound(sound: Sound) {
    setSelectedId(sound.id)
    setSearchQuery(sound.name)
    setActiveQuery('')
  }

  function handleSearch(q?: string) {
    const query = (q ?? searchQuery).trim()
    setSearchQuery(query)
    setActiveQuery(query)
  }

  async function handleLink(result: FreesoundResult) {
    if (!selectedSound) return
    setLinkingId(result.id)
    await updateSound.mutateAsync({
      id: selectedSound.id,
      payload: {
        freesound_id: String(result.id),
        freesound_url: `https://freesound.org/s/${result.id}/`,
        license: result.license,
        duration_seconds: result.duration,
        status: 'found',
      },
    })
    setLinkingId(null)
  }

  const grouped = SOUND_CATEGORIES.map((cat) => ({
    category: cat,
    sounds: sounds.filter((s) => s.category === cat),
  }))

  const stats = {
    total: sounds.length,
    found: sounds.filter((s) => s.status !== 'unfound').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-1">
            AUDIO SYSTEM
          </div>
          <h1 className="font-display text-4xl text-[#dde0e6] tracking-widest">SOUND LIBRARY</h1>
        </div>
        <div className="font-mono text-xs text-[#5a6175] tracking-widest">
          {stats.found}/{stats.total} LOCATED
        </div>
      </div>

      {!hasApiKey && (
        <div className="bg-[#e8b84b]/10 border border-[#e8b84b]/30 rounded-lg px-4 py-3">
          <div className="font-mono text-xs text-[#e8b84b] tracking-widest">
            FREESOUND API KEY MISSING
          </div>
          <div className="font-mono text-[11px] text-[#5a6175] mt-1">
            Add <span className="text-[#dde0e6]">VITE_FREESOUND_API_KEY=your_key</span> to .env
            and restart the dev server. Get a key at freesound.org/apiv2/apply.
          </div>
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* Left: Sound list */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {isLoading ? (
            <div className="font-mono text-xs text-[#5a6175] tracking-widest">LOADING…</div>
          ) : (
            grouped.map(({ category, sounds: catSounds }) => (
              <div key={category}>
                <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-1 px-1">
                  {category}
                </div>
                <div className="space-y-0.5">
                  {catSounds.map((s) => (
                    <SoundRow
                      key={s.id}
                      sound={s}
                      isSelected={s.id === selectedId}
                      onSelect={() => handleSelectSound(s)}
                    />
                  ))}
                  {catSounds.length === 0 && (
                    <div className="font-mono text-[10px] text-[#3d4352] px-3 py-1">
                      NO ENTRIES
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Search panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search target indicator */}
          {selectedSound && (
            <div className="bg-[#111318] border border-[#1c1f26] rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#5a6175] tracking-widest flex-shrink-0">
                SEARCHING FOR
              </span>
              <span className="font-mono text-xs text-[#dde0e6] flex-1 truncate">
                {selectedSound.name}
              </span>
              <span
                className={`font-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded whitespace-nowrap ${SOUND_STATUS_COLORS[selectedSound.status]}`}
              >
                {SOUND_STATUS_LABELS[selectedSound.status]}
              </span>
              {selectedSound.freesound_id && (
                <a
                  href={selectedSound.freesound_url ?? `https://freesound.org/s/${selectedSound.freesound_id}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] text-[#66ff99] hover:underline tracking-widest"
                >
                  FS#{selectedSound.freesound_id}
                </a>
              )}
            </div>
          )}

          {/* Search bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="search freesound.org…"
              disabled={!hasApiKey}
              className="flex-1 bg-[#111318] border border-[#1c1f26] rounded-lg px-4 py-2.5 font-mono text-xs text-[#dde0e6] placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 disabled:opacity-40"
            />
            <button
              onClick={() => handleSearch()}
              disabled={!hasApiKey || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-lg bg-[#66ff99]/10 border border-[#66ff99]/30 font-mono text-xs text-[#66ff99] tracking-widest hover:bg-[#66ff99]/20 transition-colors disabled:opacity-40"
            >
              SEARCH
            </button>
          </div>

          {/* Search term suggestions */}
          {selectedSound && SEARCH_TERMS[selectedSound.name] && (
            <div className="flex flex-wrap gap-1.5">
              {SEARCH_TERMS[selectedSound.name].map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  disabled={!hasApiKey}
                  className={`font-mono text-[10px] px-2.5 py-1 rounded border transition-colors disabled:opacity-40 ${
                    activeQuery === term
                      ? 'bg-[#66ff99]/15 border-[#66ff99]/40 text-[#66ff99]'
                      : 'bg-[#111318] border-[#1c1f26] text-[#5a6175] hover:border-[#2a2f3a] hover:text-[#8891a4]'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {isFetching && (
            <div className="font-mono text-xs text-[#5a6175] tracking-widest">
              QUERYING FREESOUND…
            </div>
          )}

          {searchError && (
            <div className="bg-[#cc3355]/10 border border-[#cc3355]/30 rounded-lg px-4 py-3 font-mono text-xs text-[#cc3355]">
              {(searchError as Error).message}
            </div>
          )}

          {searchResults && !isFetching && (
            <>
              <div className="font-mono text-[10px] text-[#5a6175] tracking-widest">
                {searchResults.count} RESULTS — SHOWING {searchResults.results.length}
                <span className="ml-2 text-[#3d4352]">· CC0 · MAX 30S</span>
                {!selectedSound && (
                  <span className="ml-2 text-[#3d4352]">· select a sound on the left to link</span>
                )}
              </div>
              <div className="space-y-2">
                {searchResults.results.map((r) => (
                  <FreesoundResultCard
                    key={r.id}
                    result={r}
                    onLink={() => handleLink(r)}
                    isLinking={linkingId === r.id}
                  />
                ))}
              </div>
            </>
          )}

          {!activeQuery && !selectedSound && (
            <div className="text-center py-16">
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest">
                SELECT A SOUND FROM THE LIST TO BEGIN
              </div>
            </div>
          )}

          {!activeQuery && selectedSound && (
            <div className="text-center py-16">
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest">
                PRESS SEARCH TO QUERY FREESOUND
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
