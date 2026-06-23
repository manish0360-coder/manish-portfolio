# E1 — Arrival

**Milestone goal:** make the first sixty seconds unforgettable. Arrival is built entirely on the frozen E0 engine — no engine redesign, no new visual language. It adds the experiential *beats* the prototype lacked, assembled from existing systems plus one new reusable system (`LoadingSequence`).

## The experience, beat by beat

1. **Loading sequence** — a calm initialization (`LoadingSequence`): a single pulsing seed of light, the wordmark, an honest progress bar that tracks font readiness + real rendered frames (min ~1.1s so it reads as intentional). It resolves *into* the first reveal rather than cutting.
2. **First reveal / threshold** — the loader clears to expose the **single point of light** (the lit core), camera held close. Negative space, near-silence. *(compression)*
3. **First interaction → first memory** — a quiet `enter the institute` prompt. The visitor's **first act ignites the world** — this is the hook: agency creates memory. (Keyboard `Enter`/`Space` or click/tap.)
4. **First camera movement / the reveal** — entry plays the arrival dolly (`CameraRig` shot `start → wide`, easeInOutCubic, ~6.8s); the vast lattice emerges from darkness with the grid floor for scale. *(release → awe)*
5. **First curiosity** — arrival settles into the `initiate verification` prompt: the unresolved lattice poses a question that pulls the visitor toward the next stage (Understanding). Arrival ends here, on curiosity.

The verification peak itself remains wired through the same systems (it is the bridge to E4), but E1's job is complete at the curiosity hook.

## Systems used (all pre-existing except one)

| Beat | System |
|---|---|
| Loading | **`LoadingSequence`** (new, `src/ui/LoadingSequence.js`) + `EventBus` (`'loaded'`) |
| Threshold / reveal / camera | `CameraRig` (named shots + modifiers) |
| First interaction | `InputManager` (`'pointerdown'` / `'confirm'`) |
| HUD (loader, enter, prompt, state) | `UIFramework` |
| Reduced-motion path | `Config.reducedMotion` + scene branch |

No engine files were restructured; the only scene change is the arrival **gate** in `ProvingGroundScene.enter()` — additive arrival beats, identical visuals.

## State machine

`booting → threshold → threshold-ready → arrival → await → (verify → settled)`

- `threshold` — loading in progress, input ignored.
- `threshold-ready` — loaded; `enter` prompt shown; first input arms arrival.
- `arrival` — camera reveal playing.
- `await` — reveal complete; curiosity prompt (E1 ends here).
- Reduced motion skips straight to `settled` after `loaded`, no interaction required.

## Validation

Run `tests/integration.html` (20 assertions, all passing):
- **Functional:** lit frame at threshold; holds before entry; loading → threshold-ready; camera waits at the seed; first interaction begins arrival; camera moves during reveal; resolves to curiosity prompt; verification still completes; identity reveals.
- **Performance:** render loop advances and FPS telemetry is computed.
- **Accessibility:** reduced-motion engine reaches `settled` with **no interaction**; the primary interaction is driven via the **keyboard** (`Enter` → `confirm`) path; `#loader`/`#status` carry `role="status"` + `aria-live="polite"`; a `prefers-reduced-motion` CSS block disables animations/transitions.

## Controls

- **Enter / Space / click / tap** — enter the institute, then initiate verification.
- `?debug` — live FPS / state overlay.
