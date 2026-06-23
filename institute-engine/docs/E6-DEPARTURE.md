# E6 — Departure

The closing movement. After the visitor has the full identity (settled overview), a quiet **the synthesis ↓** cue invites a considered exit. It opens the **Departure** overlay, which draws the three flagship systems back into the identity's three threads — *Visible · Grounded · Verified* — restates the thesis, and offers the ways to reach Manish (GitHub · résumé · email). Discovery branches out into three wings; Departure folds them back into one person.

## Experience
In the settled overview the **#conclude** cue fades in at bottom-centre. Click it (or focus + Enter — it is a real button) and the overlay presents: the name + role, a one-line synthesis, the three threads (each a system → thread word + first-person line, colour-coded to its wing), the closing maxim *"What cannot be measured should not be claimed."*, and a contact grid. `← Back` / `Esc` returns to the overview; the state label restores to `verified`. Entering a wing hides the cue; returning to the overview restores it.

The mapping (data-driven):
- **MiniFlyWire → Visible** — cognition made watchable.
- **Noetica → Grounded** — knowledge in the system, not the model.
- **Velith → Verified** — competence earned from a verifier.

## Reusable system
- **`Departure`** (`src/ui/Departure.js`) — a data-driven synthesis/exit overlay rendered from the `IDENTITY` model. It also owns the `#conclude` HUD cue, emitting a `conclude` intent the scene acts on (the system owns its DOM + emits intent; the scene decides — same contract as `LoadingSequence`/`Wayfinder`). Accessible (`role="dialog"`, `aria-modal`, Esc, focus-to-Back, real Back button; email is a `mailto:`, external links open in new tabs with `rel="noopener"`). Headless-testable (`threadCount()` pure; guards missing DOM). Emits `departure:open` / `departure:close`.

## Content model
New `content/identity.js` exports `IDENTITY`: `{ eyebrow, name, role, synthesis, threads:[{system,thread,color,line}], close, contacts:[{label,value,href}] }`. The synthesis stays DATA — the overlay renders from it, so the closing statement is edited in content, not UI.

## Engine deltas
None to core. New `Departure` instance on the engine (like Codex/Resolver/Evidence) and two `UIFramework` helpers (`showConclude`/`hideConclude`). The scene listens for `conclude` → `_enterDeparture()` (guarded to the settled overview) and for `departure:close` → restore the `verified` label; it shows the cue when the identity is revealed (both the verification peak and the reduced-motion path) and toggles it on wing enter/exit. Backward compatible.

## Accessibility
Modal `role="dialog"` + `aria-modal`; Esc and a real `← Back` button; focus moves to Back on open; the cue and every contact are keyboard-focusable. Reduced motion: `#departure` and `#conclude` transitions disabled — and because reduced-motion arrives at `settled` without interaction, the cue is reachable there too.

## Performance
Pure DOM render on open (3 threads + 3 contacts); no WebGL or per-frame cost. 60fps unaffected.

## Tests
Engine owns Departure; `threadCount()` pure; the cue opens departure; `departure:open` fires with the identity model; the three systems map onto `Visible·Grounded·Verified`; threads render to the DOM; three contact channels present; closing returns to the overview; opening is guarded to the overview. **65/65 integration tests pass** — full E0–E5 regression intact.

## State
`settled` overview → **the synthesis ↓** → Departure (synthesis + contact) → Back/Esc → overview. The arc closes where it opened: on the identity.
