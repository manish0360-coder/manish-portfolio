# E2 — Orientation

Turns post-arrival curiosity into confident intent. Built on the frozen engine; one new reusable system (`Wayfinder`) and the first real use of `InteractionEngine`.

## Experience
After the arrival reveal, a minimal **wayfinder** (bottom-left) names the three destinations and marks "you are here." Hovering or focusing one **lights its cluster** in the 3D world and floats its label — teaching that each is a place — while the camera leans gently toward it. A single orientation line ("three systems · one thesis · choose a path") states the premise and self-dismisses on first navigation. The visitor learns the map by exploring, never by reading.

## Boundary
E2 makes destinations visible, located, and selectable. **Entering** a wing is E3; `wayfinder:select` emits `orientation:selected` (intent) and highlights — it does not fly in yet.

## Systems
- **New:** `Wayfinder` (`src/ui/Wayfinder.js`) — destinations, focus, keyboard cycling, `wayfinder:focus`/`:select`. Headless-testable; grows as wings register.
- **Reused:** `InteractionEngine` (raycast vs 3 invisible proxy meshes), `CameraRig` (lean modifier), `UIFramework` (orient cue, per-focus label), `InputManager` (pointer NDC), `EventBus`, `NavigationSystem`.

## Engine deltas (additive, non-breaking)
- `InputManager`: added `pointer` (NDC) needed for raycasting, and a guard so `Enter` on a focused control doesn't double-fire `confirm`.
- `UIFramework`: added `showOrient/hideOrient`, `focusTag/clearTags`.
No core system was refactored or had behavior changed for existing callers.

## Accessibility
Full keyboard: Tab to wayfinder buttons, arrow keys cycle, Enter selects; `:focus-visible` outlines. Hover/touch are enhancements, never required. Reduced-motion: no camera lean, instant highlight, orientation reachable with zero interaction. Labels are text + color (never color alone). `role="status"`/`aria-live` on cue.

## Performance
Raycast hits 3 proxy meshes only (not 177 nodes), reused vectors, zero per-frame allocation; no new passes/textures. Budget < 0.3 ms/frame; 60fps target held.

## Tests (`tests/integration.html`)
3 destinations registered; 3 proxy targets; oriented after arrival; focus emits + scene tracks cluster; keyboard cycle advances; raycast picks the destination under pointer; select emits intent; cue dismissed on first focus; reduced-motion orientation available; E0/E1 regression (arrival → verification → settled) intact.

## State
`… await → [oriented]` (wayfinder + cue live). Reduced motion enters orientation at `settled`.
