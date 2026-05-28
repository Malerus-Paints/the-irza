import { useState, useEffect } from 'react'
import { useUpdateFaction } from '../hooks/useData'
import { Button } from './ui'
import type { Faction } from '../types'

interface Props {
  faction: Faction
  onClose: () => void
}

export function FactionLoreEditor({ faction, onClose }: Props) {
  const [loreText, setLoreText] = useState(faction.lore_text ?? '')
  const [savedText, setSavedText] = useState(faction.lore_text ?? '')
  const updateFaction = useUpdateFaction()

  useEffect(() => {
    setLoreText(faction.lore_text ?? '')
    setSavedText(faction.lore_text ?? '')
  }, [faction.id])

  const hasChanges = loreText !== savedText
  const isPending = updateFaction.isPending
  const wordCount = loreText.trim().split(/\s+/).filter(w => w.length > 0).length

  const handleSave = () => {
    updateFaction.mutate(
      { id: faction.id, payload: { lore_text: loreText.trim() || null } },
      {
        onSuccess: () => {
          setSavedText(loreText)
        },
      }
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#0a0c10] border-l border-[#1c1f26] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1f26] shrink-0">
          <div>
            <div className="font-mono text-[10px] text-[#66ff99] tracking-widest mb-0.5">
              LORE EDITOR — {faction.faction_id}
            </div>
            <h2 className="font-display text-xl text-[#dde0e6] tracking-widest">
              {faction.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#3d4352] hover:text-[#8891a4] font-mono text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stats bar */}
        <div className="px-6 py-3 bg-[#111318] border-b border-[#1c1f26] flex items-center justify-between text-[10px]">
          <div className="font-mono text-[#3d4352] tracking-widest">
            {wordCount} WORDS
          </div>
          {hasChanges && (
            <div className="font-mono text-[#e8b84b] tracking-widest">
              UNSAVED CHANGES
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <textarea
            value={loreText}
            onChange={(e) => setLoreText(e.target.value)}
            placeholder="Write the faction's full lore record here. Consider their origin reality, behavioral patterns, historical context, and current status..."
            className="w-full h-full bg-[#111318] border border-[#1c1f26] rounded px-4 py-3 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 focus:ring-1 focus:ring-[#66ff99]/20 resize-none leading-relaxed"
            spellCheck="true"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1c1f26] flex items-center justify-between shrink-0">
          {updateFaction.isError && (
            <span className="font-mono text-[10px] text-[#cc3355] tracking-widest">
              SAVE FAILED — CHECK CONSOLE
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              CLOSE
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || !hasChanges}
            >
              {isPending ? 'SAVING...' : 'SAVE LORE'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
