# E7 — The Atrium (second wing · navigation proof)

The engine's headline promise is that a new environment costs **one `registerScene()` + one `defineRoute()` and zero engine edits**. E7 makes that real by shipping an actual second wing — **the Atrium** (route `#atrium`) — assembled entirely from existing systems.

Where the Proving Ground is a narrative arrival, the Atrium is a reading room: a calm, deep-linkable campus directory. Three system markers — colour-coded to MiniFlyWire / Noetica / Velith — sit in a shallow arc around the core seed; hover to lift one, click to open it. No loading cinematic, no verification peak. Same systems, different intent.

## What it reuses (nothing new in the engine)
- **MaterialLibrary** (`node` / `edge` / `star`), **LightingManager** (core point light), **CameraRig** (a single framed shot + a gentle parallax modifier), **InteractionEngine** (three invisible raycast proxies), **UIFramework** (the project tags double as marker labels).
- **The full content stack** — `Codex` → `Resolver` → `Evidence` — opens unchanged from a marker, driven by the same `PROJECTS` records. A wing built months apart inherits every content system for free.

## Wiring (the entire cost of a new wing)
```js
engine.registerScene('atrium', AtriumScene);
engine.navigation.defineRoute('atrium', 'atrium');
```
Two lines in `main.js`. `Engine.js` is untouched. The route is a real, shareable URL: open `…/index.html#atrium` to land directly in the Atrium; the `NavigationSystem` already swaps scenes on `hashchange`.

## Engine deltas
None to the kernel. One additive `UIFramework.resetHUD()` helper lets a non-Proving-Ground scene start from a clean DOM HUD (scene swaps share one HUD); the Atrium calls it on enter and dispose. `SceneManager.goTo()` already disposed the previous scene and rebound `PostPipeline` + `InteractionEngine` to the new camera — E7 is the first time that path runs against a genuinely different scene.

## Accessibility
Inherits the reused systems' accessibility (Codex/Resolver/Evidence dialogs, Esc, focus management). Reduced motion: the camera parallax modifier early-returns, so the Atrium holds a still, fully-legible frame with no interaction required.

## Performance
~55 instanced nodes + 3 edges + a 700-point starfield, all on the shared frozen materials; one point light. No per-frame allocation in `update` beyond reused temporaries. 60fps unaffected.

## Tests
A dedicated engine registers **both** wings and proves the swap end-to-end: two scenes in the registry, two routes defined, `goTo` swaps the active scene, `scene:changed` fires, the Atrium builds its graph from shared systems, `PostPipeline` + `InteractionEngine` rebind to the new camera, the Atrium **renders a lit frame**, the Codex and Resolver are reused inside it, and navigation returns to the first wing — all with `Engine.js` unedited. **76/76 integration tests pass** — full E0–E6 regression intact.

## State
`#proving-ground` (the narrative arrival) and `#atrium` (the directory) are peer entry points. Within the Atrium: hover a marker → click → Codex → { Resolver | Evidence } → close. The architecture is now proven to scale to N wings.
