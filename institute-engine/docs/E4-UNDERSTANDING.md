# E4 — Understanding

Lets the visitor grasp *how I think* by manipulation, not prose. From inside any wing, the Codex's "deeper →" opens the **Resolver**: a small interactive board of weighted factors that combine into one live signal and resolve a verdict by threshold. Drag the factors, watch the verdict change — the portfolio's thesis (everything is scored/verified, nothing asserted) made tactile.

## Experience
In a wing, click **deeper →** (or its keyboard focus + Enter). A focused modal opens with the project's question, 3–4 factor sliders, a live signal bar, a resolved verdict label (colored by band), and a one-line caption tying it to the real system. `← Back` / `Esc` returns to the Codex; leaving the wing closes everything.

Per project (data-driven):
- **MiniFlyWire** — drives (Reward/Novelty/Energy/Trust) → Rest / Exploit / Explore (60% learned + 40% arbitration).
- **Noetica** — evidence (Answer match/Method/Confidence/Mastery) → Incorrect / Partial / Correct (a typed Verdict).
- **Velith** — Grounding/Verification filter/Retention/Held-out → A1 / A2≈A1 / **A2⟩A1 grounding wins** (truth is exogenous).

## Reusable system
- **`Resolver`** (`src/ui/Resolver.js`) — fully data-driven factor→verdict interactive; accessible range inputs, Esc, focus-to-back, `resolver:open`/`resolver:close`; headless-testable (`signal()`, `verdict()` pure). Reused by every wing via each project's `understanding` model in `content/projects.js`.

## Engine deltas
None to core. New `Resolver` instance on the engine (like Codex/Wayfinder); Codex emits `codex:deeper`. Backward compatible.

## Accessibility
Native range inputs (keyboard-adjustable), labelled; modal `role="dialog"` `aria-modal`; Esc + real Back button; focus moves to Back on open; verdict via aria-updatable text + color (label carries meaning, not color alone). Reduced motion: bar transition disabled.

## Performance
Pure DOM + arithmetic on ≤4 factors; no WebGL or per-frame cost (recompute only on input). 60fps unaffected.

## Tests
deeper opens resolver with correct model; `resolver:open` fires; max factors → top verdict; zero factors → base verdict; close keeps Codex open; exiting wing closes resolver. E0–E3 regression intact.

## State
Within `discovery`: Codex (first layer) → Resolver (understanding) → Back → Codex → Overview.
