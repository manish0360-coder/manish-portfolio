/**
 * main.js — Runtime entry point.
 * Wires the engine, registers scenes via the World Registry (plugin pattern),
 * and boots the default route. No scene-specific logic lives here.
 */
import { Engine } from './core/Engine.js';
import { ProvingGroundScene } from './scenes/ProvingGroundScene.js';
import { AtriumScene } from './scenes/AtriumScene.js';

const canvas = document.getElementById('c');

let engine;
try {
  // Production runtime: disable preserveDrawingBuffer for maximum GPU perf.
  // (The integration harness uses Config defaults, where diagnostics stays on
  //  so it can sample the framebuffer — see tests/integration.html.)
  engine = new Engine({ canvas, config: { diagnostics: false } });
} catch (err) {
  console.error('[Institute] Engine failed to initialise:', err);
  const fb = document.getElementById('fallback');
  if (fb) fb.style.display = 'flex';
  throw err;
}

// Register every scene as a plugin in the World Registry.
engine.registerScene('proving-ground', ProvingGroundScene);
engine.navigation.defineRoute('proving-ground', 'proving-ground');

// A second wing — added with one registerScene() + one defineRoute(), no engine edits.
engine.registerScene('atrium', AtriumScene);
engine.navigation.defineRoute('atrium', 'atrium');

// Boot. Route from URL hash if present, else the default scene.
const route = location.hash.replace('#', '');
engine.start(engine.navigation.routes[route] || 'proving-ground');

// Expose a single debug handle (not used for app logic).
window.__institute = engine;
