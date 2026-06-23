# E5 — Evidence

Closes the loop on the portfolio's thesis — *nothing asserted, everything verified*. From inside any wing, alongside the Codex's "deeper →" (understanding), an **Examine the evidence →** action opens the **Evidence ledger**: the checkable receipts behind the claims. The repository, real metrics, and external artifacts — each figure links back to its source so the visitor can confirm it themselves.

## Experience
In a wing, the Codex shows two paths now: **deeper →** (how the system thinks — E4 Resolver) and **examine the evidence →** (the proof — E5 Evidence). The ledger presents an eyebrow + intro, a clickable **repository** line (name · language · status), a grid of **verifiable metrics** (value · label · note), a list of **artifacts** that each open at their source in a new tab, and a one-line **claim** tying it to the thesis. `← Back` / `Esc` returns to the Codex; leaving the wing closes everything.

Per project (data-driven, real figures):
- **MiniFlyWire** — 20 neurons · 39 edges · 8 cognitive layers · 40+ modules → the live observatory repo. *"Run it and the numbers render in front of you."*
- **Noetica** — 58 tests passing (0 failed, ~17.5s) · 53 deterministic · 1 LLM call on path · 0 frameworks → repo + ARCHITECTURE.md + suite. *"The state is engineered and tested; the model only judges."*
- **Velith** — 5 experiment arms (A0→A4) · decisive `A2 ⟩ A1` · zero model-gap · external deterministic verifier → harness + pre-registered criterion. *"The hypothesis can lose — and the design says so out loud."*

## Reusable system
- **`Evidence`** (`src/ui/Evidence.js`) — a fully data-driven ledger that presents repo + metrics + artifacts from each project's `evidence` model. Accessible (`role="dialog"`, `aria-modal`, Esc, focus-to-Back, real Back button, links open in new tabs with `rel="noopener"`); headless-testable (`count()` is pure; guards missing DOM). Emits `evidence:open` / `evidence:close`. Reused by every wing.

## Engine deltas
None to core. New `Evidence` instance on the engine (like Codex/Resolver). The **Codex** gains one backward-compatible affordance: a second footer button (`#codex-evidence`) that emits `codex:evidence` and reads each record's `evidenceLabel`. The scene listens and calls `engine.evidence.open(...)`; `_exitWing()` now also closes the ledger. Existing records without an `evidence` block simply show no evidence button.

## Content model
Each project record adds `evidenceLabel` (the Codex button text) and `evidence`:
`{ eyebrow, intro, repo:{label,href,lang,status}, metrics:[{value,label,note}], artifacts:[{label,detail,href}], claim }`. Content stays DATA — the ledger renders from it, so the world grows by editing `content/projects.js`, not the UI.

## Accessibility
Modal `role="dialog"` + `aria-modal`; Esc and a real `← Back` button; focus moves to Back on open; every artifact is a keyboard-focusable `<a>` opening at its source. Reduced motion: `#evidence` transition disabled (added to the reduced-motion rule).

## Performance
Pure DOM render on open (≤4 metrics + ≤3 artifacts per wing); no WebGL or per-frame cost. 60fps unaffected.

## Tests
Engine owns Evidence; `count()` pure; the evidence action opens the ledger; `evidence:open` fires with the correct wing record (repo + metrics); `count()` = metrics + artifacts; each metric renders to the DOM; closing evidence keeps the Codex open; exiting the wing closes any open ledger. **55/55 integration tests pass** — full E0–E4 regression intact.

## State
Within `discovery`: Codex (first layer) → **{ Resolver (understanding) | Evidence (the receipts) }** → Back → Codex → Overview.
