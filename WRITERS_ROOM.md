# WRITERS_ROOM — Episodes 6–15 Script Development

A central place to track narrative notes, directorial revisions, and ongoing script work.

**Source of truth for all script canon lives here (The IRZA).** Episode dialogue, systemUI text, beats, and purpose notes belong in this project — either in this file or in the `episodes.script_text` field in the Supabase DB. The irza-studio project handles production data only: camera moves, audio cues, render timing.

---

## Episodes 6–15 Arc Overview

**Narrative Structure:** These episodes form the primary story arc tying the Zoo together. They interleave with filler exhibit episodes in release — so the audience experiences something like:

```
Ep 6 (narrative) → [filler exhibits] → Ep 7 (narrative) → [filler exhibits] → Ep 8 → …
```

Each narrative episode must work standalone for viewers who may have missed the filler between them.

---

## Completed Changes

### ✅ Ep 6 — ARCHIVE DESIGNATION
- **Duration extended:** 32s → 44s (1.375× stretch)
- **Rationale:** "Names matter" and DESIGNATION ACCEPTED needed more breathing room. Final MALERUS pullback now 14s instead of 10s.

### ✅ Ep 10 — UNAUTHORIZED SIGNAL
- **Added Muscle reaction:** After System's "CONTAINMENT: NOT APPLICABLE" (18.5–20s)
  ```
  { speaker: 'muscle',  text: 'Wait — not applicable?',  from: 18.5, to: 20 },
  ```
- **Rationale:** The phrase "NOT APPLICABLE" is the Archive admitting it has no protocol. Muscle catching this makes the moment land for the audience.

### ✅ Ep 15 — ARCHIVE EXPANSION
- **Replaced generic Muscle line:** "I liked things better when there were fewer disasters." → "Thousands. Of what, exactly?"
- **Rationale:** By Ep 15, Muscle has learned to ask clarifying questions. This specific reaction shows growth while keeping the fear real. Mirrors Ep 9's "I liked it better when it just said High."

### ✅ Ep 7 — COLLECTIVE OBSERVATION
- **Restructured Curator's thesis:** Split into dialogue exchange instead of back-to-back lecture
  ```
  { speaker: 'curator', text: 'Some things cannot be understood alone.',      from: 21, to: 23 },
  { speaker: 'muscle',  text: 'Like what?',                                   from: 23.5, to: 25 },
  { speaker: 'curator', text: 'Culture rarely exists individually.',           from: 25, to: 27 },
  { speaker: 'muscle',  text: 'Cool.',                                         from: 27, to: 28 },
  { speaker: 'muscle',  text: 'So now the zoo has book clubs.',                from: 28, to: 30 },
  ```
- **Rationale:** Muscle as audience surrogate asking "Like what?" makes Curator's second line land as an answer, not a lecture. "Book clubs" payoff is absurd but grounded in Muscle's voice — shows them understanding the stakes while staying in character.

### ✅ Ep 14 — RECLASSIFICATION EVENT
- **System interrupts Curator mid-sentence:** Curator's second line now ends `'Interpretation and taxonomy are not the same—'`. System fires at 16 (overlapping her delivery), schema update moved from 22→16, overhead record shot swapped to 16–22 to match. Subsequent dialogue shifted ~3s.
- **Rationale:** Curator's whole function is interpretation. System taking the naming right from her mid-sentence undercuts her authority without her conceding anything. The "of—" is the moment.

### ✅ Ep 11 — ARRIVAL: THE ENGINEER
- **Engineer's specific observation:** Replaced "this place is held together badly" with three-line read: "The integrity readings aren't degrading. / They're oscillating. / It's not breaking down — it's deciding something."
- **Curator's 41% response:** Replaced "The archive has functioned adequately" with "I've been told forty-one percent is operational. / I've stopped asking what it was before." — addresses SYSTEM INTEGRITY: 41% visible the whole episode.
- **Rationale:** Engineer names an observable data pattern (oscillation, not degradation) that implies the entity has agency. Curator's line shows she's normalized a broken system; Engineer arriving fresh sees it clearly.

### ✅ Ep 8 — STRUCTURAL INCONSISTENCY
- **Curator line revised:** "The archive appears to know what it sees. / But not how it functions." → "Taxonomy is not the same as comprehension. / We have named it. We have no idea what made it."
- **Rationale:** Old line restated the UI text in plain English. New line interprets it — Curator's actual function is to make a distinction, not describe what happened.
- **Added Muscle observation:** After System's "REQUEST UNFULFILLED" (28–30s)
  ```
  { speaker: 'muscle',  text: 'This is going to be a continuing problem, isn\'t it?', from: 28, to: 30 },
  ```
- **Rationale:** Shows Muscle understanding the systemic gap, not just reacting to one moment. Sets up why Ep 10–11 are necessary — the Archive is broken structurally.

---

## Remaining Changes (Not Yet Implemented)

### Low Priority

**Ep 9 — CULTURAL MISREAD**
- ✓ Already solid. No changes needed.

**Arc-level threading:**
- **Malerus thread:** ✅ `// MALERUS PROTOCOL: DEPRECATED` planted in Ep 14 systemUI at 17–20s, inside the schema update churn. Nobody reacts. Archive is overwriting old taxonomy and his protocols go with it.
- **System INTEGRITY: 41%:** Appears in Ep 11, never changes. Consider it rising/falling across Ep 11–15 to show structural change as Engineer/Biologist come aboard.

---

## Voice/Craft Notes

### Muscle's Arc (6–15)
- **Ep 6–8:** "I don't understand what's happening" (opening hook position)
- **Ep 9:** "I can notice the detail you're missing" ("I liked it better when it just said High")
- **Ep 10–11:** "I see the gap now" (questions become more specific)
- **Ep 12–13:** "I'm catching on to how this works" (book clubs, asking clarifying questions)
- **Ep 14–15:** "I understand the pattern, and it's scary" (Thousands. Of what, exactly?)

Muscle grows from confused to observant. Lines should reflect learning, not reset to baseline.

### Curator's Arc (6–15)
- **Constant:** Measured, interpretive, never concedes but reframes
- **Development:** Becomes increasingly comfortable deferring to specialists (Engineer, Biologist) while maintaining her authority through language ("Interpretation and taxonomy are not the same discipline")

### System's Arc (6–15)
- **Ep 6:** Silent (UI only)
- **Ep 7:** First spoken line — clipped, fragmented, institutional
- **Ep 8–10:** Assertive but not panicking — processing, identifying gaps
- **Ep 11 onward:** Capability expanding, but also showing uncertainty (41% integrity, REALITY STABILITY: UNKNOWN)

---

## Canon Notes

**Filler episode interleaving:** These narrative episodes anchor the arc. Filler exhibits fill the gaps. Release order matters for pacing — consider how many filler drops between each narrative episode.

**Copycat thread:** The unauthorized signal in Ep 10 is intentionally unresolved for the Zoo cast. The Copycat's story plays out in parallel narrative episodes about painting/copying Zoo creatures. The Zoo never gets the full picture.

**Surface vs. true premise:** Eps 6–15 operate entirely on surface premise (facility discovering/classifying entities from other realities). The true premise (Archive is an ARK, source realities are collapsing) is never stated directly. All dialogue must remain compatible with slow-burn revelation.

---

## Next Session Priorities

1. **Arc:** Consider SYSTEM INTEGRITY value changing across Ep 11–15 as Engineer/Biologist come aboard — currently locked at 41%

---

## Script Data Location

Episode scripts (dialogue, systemUI text, beats, purpose, setup notes, captions) belong in:
- **This file** — for arc-level notes, revision rationale, character craft
- **`episodes.script_text`** — per-episode canonical script stored in Supabase (The IRZA DB)
- **The IRZA app** — episode tracker and (upcoming) script workspace page

Production data (camera moves, shot timing, audio cues, render duration, glitch events) stays in **irza-studio** at `src/data/episodes-6-15/ep-*.ts`.

The `sync-episode` script in irza-studio pushes `episode_photos` and `exhibit_revelations` from the studio data files into Supabase — that sync direction is correct and should stay.
