# The Institute — Engine

Production runtime that powers the *Institute* digital research campus. This is **Milestone E0: the engine skeleton** — the validated Phase‑1 prototype ("Proving Ground") rebuilt as a modular, reusable engine. The visual output is **identical** to the frozen prototype; internally it is now production architecture.

> Design language is frozen (Phase 1). This milestone engineers it correctly — it does **not** redesign it.

## Run

No build step. Serve the folder over HTTP (ES modules + importmap) and open `index.html`:

```bash
cd institute-engine
python3 -m http.server 8080      # or any static server
# open http://localhost:8080/index.html
```

- `?debug` appends a live FPS / state overlay.
- `#proving-ground` is the default route (Navigation System).

## Integration tests

Open `tests/integration.html` over the same static server. It exercises isolated systems (EventBus, Timeline, CameraRig, WorldRegistry) **and** boots the full engine with the real scene, then asserts it renders a lit frame, completes arrival, runs the verification peak to `settled`, and reveals identity. Results render in-page; `window.__testResult = { pass, fail }`.

## Architecture

One **Engine** kernel owns a single instance of every system and runs one render loop. **Scenes** are assembled from those systems — no scene-specific code lives in the engine. Adding a wing = one `registerScene()` + one `defineRoute()`.

```
institute-engine/
├─ index.html                 # runtime shell (HUD DOM + importmap)
├─ tests/integration.html     # in-browser integration + unit harness
└─ src/
   ├─ main.js                 # entry: wire engine, register scenes, boot route
   ├─ core/
   │  ├─ Engine.js            # orchestrator + render loop (the kernel)
   │  ├─ EventBus.js          # #17 event system (instance-scoped, no globals)
   │  ├─ Config.js            # #19 configuration (defaults + overrides)
   │  └─ PluginHost.js        # #20 runtime plugin architecture
   ├─ rendering/
   │  ├─ Renderer.js          # WebGLRenderer + frozen output settings
   │  └─ PostPipeline.js      # #9 post: RenderPass→UnrealBloom→OutputPass
   ├─ camera/CameraRig.js     # #2 camera framework (named shots + modifiers)
   ├─ animation/
   │  ├─ Easing.js            # easing fns + registry
   │  └─ Timeline.js          # #3 tween/animation engine
   ├─ input/InputManager.js   # #5 input system (pointer/key → events, parallax)
   ├─ interaction/InteractionEngine.js  # #4 raycast picking service
   ├─ lighting/LightingManager.js       # #6 lighting helpers
   ├─ materials/MaterialLibrary.js      # #7 shared frozen materials
   ├─ shaders/ShaderLibrary.js          # #8 GLSL registry (ready for future wings)
   ├─ assets/AssetLoader.js             # #10 cached promise-based loaders
   ├─ audio/AudioSystem.js              # #13 resolve-sweep synth (optional)
   ├─ ui/UIFramework.js                 # #14 the only DOM bridge
   ├─ ui/LoadingSequence.js             # E1 arrival loading layer (emits 'loaded')
   ├─ ui/Wayfinder.js                   # E2 orientation/navigation overlay
   ├─ ui/Codex.js                       # E3 content-presentation panel (reused by E4/E5)
   ├─ ui/Resolver.js                    # E4 interactive factor→verdict "understanding" board
   ├─ ui/Evidence.js                    # E5 evidence ledger (repo + metrics + artifacts, all checkable)
   ├─ ui/Departure.js                   # E6 synthesis + exit overlay (owns the #conclude cue)
   ├─ performance/
   │  ├─ PerformanceManager.js          # #15 frame-time/FPS + lowfps signal
   │  └─ QualityManager.js              # #16 device tier → DPR cap + effects
   ├─ debug/DebugTools.js               # #18 debug overlay
   ├─ scene/
   │  ├─ Scene.js             # base class (build/enter/update/dispose)
   │  └─ SceneManager.js      # #1 scene lifecycle + rebind post/interaction
   ├─ world/
   │  ├─ WorldRegistry.js     # #11 name→Scene registry (scene plugins)
   │  └─ NavigationSystem.js  # #12 hash routes → scenes
   └─ scenes/
      ├─ ProvingGroundScene.js  # the ported Phase-1 prototype (data, not engine)
      └─ AtriumScene.js         # E7 second wing — directory (proves: new wing = registerScene + defineRoute)
```

### System contract

Every system is modular, documented, independently testable, and instance-scoped (no global state). Cross-system messaging goes through the `EventBus`; configuration through `Config`. Systems never reach into each other's internals — the Engine wires them.

### Adding a new wing (future milestones)

```js
class ResearchWingScene extends Scene {
  async build() { /* construct graph using engine.materials / lighting / shaders */ }
  enter()       { /* engine.cameraRig.defineShot(...).play(...) */ }
  update(dt, t) { /* per-frame */ }
}
engine.registerScene('research', ResearchWingScene);
engine.navigation.defineRoute('research', 'research');
```

No engine edits required — that is the point.

## Milestone status

- **E0 — engine skeleton + prototype port — complete.** Prototype looks identical; internally modular, reusable, testable.
- **E1 — Arrival — complete.** Loading sequence → threshold → visitor-initiated reveal → curiosity hook. Built on E0 systems + one new reusable system (`LoadingSequence`). 22/22 integration tests pass incl. performance + accessibility. See `docs/E1-ARRIVAL.md`.
- **E2 — Orientation — complete.** Wayfinder + cluster highlighting + camera lean + orientation cue; keyboard/touch/pointer parity. New reusable `Wayfinder`; first use of `InteractionEngine`. See `docs/E2-ORIENTATION.md`.
- **E3 — Discovery — complete.** Enter a wing (camera fly-in + isolation) and reveal its first layer via the `Codex`. New reusable systems: `Codex`, `content/` data layer, `CameraRig.flyTo`. See `docs/E3-DISCOVERY.md`.
- **E4 — Understanding — complete.** "deeper →" opens the `Resolver`: an interactive factor→verdict board per wing, teaching how each system thinks. New reusable `Resolver` + `understanding` content models. See `docs/E4-UNDERSTANDING.md`.
- **E5 — Evidence — complete.** "examine the evidence →" opens the `Evidence` ledger: the checkable receipts behind each wing (repository, real metrics, external artifacts), every figure linking to its source — the "verified, not asserted" thesis made literal. New reusable `Evidence` + `evidence` content models; one backward-compatible Codex affordance. 55/55 integration tests pass. See `docs/E5-EVIDENCE.md`.
- **E6 — Departure — complete.** "the synthesis ↓" opens the `Departure` overlay: the three systems folded back into the identity's three threads (Visible · Grounded · Verified), the thesis restated, and a considered exit (GitHub · résumé · email). New reusable `Departure` + `content/identity.js`; the closing movement of the experience. 65/65 integration tests pass. See `docs/E6-DEPARTURE.md`.
- **E7 — The Atrium — complete.** A real second wing (route `#atrium`): a calm, deep-linkable campus directory assembled entirely from existing systems (materials, lighting, camera, interaction, the Codex/Resolver/Evidence content stack + `PROJECTS`). Added with one `registerScene()` + one `defineRoute()` and **zero engine edits** — the architecture's headline claim, now proven end-to-end. New `AtriumScene` + additive `UIFramework.resetHUD()`; the top-left HUD breadcrumb is now scene-aware (`setWing`). 78/78 integration tests pass. See `docs/E7-ATRIUM.md`.
- The arc is complete (E1 Arrival → E6 Departure) and the world is proven to scale (E7). Future wings plug in via `registerScene()` + `defineRoute()` with zero engine edits.

## Notes

- `Config.diagnostics = true` enables `preserveDrawingBuffer` so the test harness can sample the framebuffer. Set `false` for maximum production performance once visual capture isn't needed.
- Bloom values in `Config.bloom` are the frozen Phase‑1 constants; the verification peak modulates strength at runtime via `PostPipeline.setBloomStrength()`.
