# E3 — Discovery

Lets the visitor enter a destination and reveals the first layer of the work. Wings are **regions of the one world** (no scene duplication) — the most maintainable choice. Built on the engine; introduces reusable infrastructure that E4/E5 reuse.

## Experience
Selecting a destination (wayfinder click / Enter, or clicking a hovered cluster in 3D) **flies the camera into that cluster** (`CameraRig.flyTo`, 2.6s ease), isolates it (the rest of the lattice dims to 12%), and opens the **Codex** — a content panel with the project's eyebrow, name, essence, key facts, and a "deeper →" hint that seeds Understanding (E4). A persistent `← Overview` control (and `Esc`) flies back and restores the overview. The world stays continuous — you move *within* it, never to a new page.

## Reusable systems built now (used by E4/E5)
- **`Codex`** (`src/ui/Codex.js`) — content-presentation panel; accessible dialog, Esc-close, focus-to-back, `codex:open`/`codex:close`. E4/E5 pass richer records.
- **`content/projects.js`** — typed content data layer (content is data, not markup). The world grows by editing data.
- **`CameraRig.flyTo(shot, dur, ease)`** — fly from the *current* pose into any shot (additive, backward-compatible). Every wing entry/exit and future cinematic uses it.

## Interaction model (non-breaking)
Verification (the signature peak) is unchanged — click empty / Enter with nothing hovered still triggers it. Discovery is additive: click a **hovered** cluster, or select from the wayfinder, to enter its wing. Both coexist; wings are enterable from `await` or `settled`.

## Engine deltas
Only `CameraRig.flyTo` added (additive). `Codex` is a new system instance on the engine (like `Wayfinder`). No core behavior changed.

## Accessibility
Codex is a labelled dialog; `Esc` and a real `← Overview` button exit; focus moves to the back control on open; `:focus-visible` outlines. Reduced motion: wing entry/exit are instant cuts, no fly. Facts are text. Panel readable over the dimmed world (gradient scrim).

## Performance
Reuses existing draw calls; isolation is a per-node multiply already inside `_applyNodes` (no new pass). Camera fly is one tween. No new textures/geometry beyond the 3 proxy meshes from E2. 60fps target held.

## Tests
Select enters discovery; codex opens with the correct record; camera flies in; clusters isolate; wing arrival completes; exit returns to overview and clears isolation; reduced-motion wing entry is an instant cut. E0/E1/E2 regression intact.

## State
`await | settled → discovery → (back) → await | settled`
