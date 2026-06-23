/**
 * Engine — the orchestrator. Owns one instance of every core system, runs the
 * single render loop, and exposes systems to scenes. Think of this as the
 * engine "kernel": scenes are assembled from the systems hung off `this`.
 *
 * Lifecycle:  new Engine() -> registerScene() -> start(name) -> RAF loop
 */
import * as THREE from 'three';
import { EventBus } from './EventBus.js';
import { Config } from './Config.js';
import { PluginHost } from './PluginHost.js';

import { Renderer } from '../rendering/Renderer.js';
import { PostPipeline } from '../rendering/PostPipeline.js';
import { CameraRig } from '../camera/CameraRig.js';
import { Timeline } from '../animation/Timeline.js';
import { InputManager } from '../input/InputManager.js';
import { InteractionEngine } from '../interaction/InteractionEngine.js';
import { LightingManager } from '../lighting/LightingManager.js';
import { MaterialLibrary } from '../materials/MaterialLibrary.js';
import { ShaderLibrary } from '../shaders/ShaderLibrary.js';
import { AssetLoader } from '../assets/AssetLoader.js';
import { AudioSystem } from '../audio/AudioSystem.js';
import { UIFramework } from '../ui/UIFramework.js';
import { LoadingSequence } from '../ui/LoadingSequence.js';
import { Wayfinder } from '../ui/Wayfinder.js';
import { Codex } from '../ui/Codex.js';
import { Resolver } from '../ui/Resolver.js';
import { Evidence } from '../ui/Evidence.js';
import { Departure } from '../ui/Departure.js';
import { QualityManager } from '../performance/QualityManager.js';
import { PerformanceManager } from '../performance/PerformanceManager.js';
import { DebugTools } from '../debug/DebugTools.js';
import { SceneManager } from '../scene/SceneManager.js';
import { WorldRegistry } from '../world/WorldRegistry.js';
import { NavigationSystem } from '../world/NavigationSystem.js';

export class Engine {
  constructor({ canvas, config = {} } = {}) {
    this.config = new Config(config);
    this.events = new EventBus();
    this.clock  = new THREE.Clock(false);
    this.reducedMotion = this.config.get('reducedMotion');

    // --- rendering ---
    this.quality  = new QualityManager(this.config).detect();
    this.renderer = new Renderer(canvas, this.config, this.quality);
    this.post     = new PostPipeline(this.renderer.gl, this.config, this.quality);

    // --- camera / animation / input ---
    this.cameraRig   = new CameraRig(this.config);
    this.timeline    = new Timeline();
    this.input       = new InputManager(this.events);
    this.input.attach(canvas);
    this.interaction = new InteractionEngine(this.cameraRig.camera);

    // --- world content services ---
    this.lighting  = new LightingManager();
    this.materials = new MaterialLibrary();
    this.shaders   = new ShaderLibrary();
    this.assets    = new AssetLoader();
    this.audio     = new AudioSystem();
    this.ui        = new UIFramework(document);
    this.loader    = new LoadingSequence(document, this.events);
    this.wayfinder = new Wayfinder(document, this.events);
    this.codex     = new Codex(document, this.events);
    this.resolver  = new Resolver(document, this.events);
    this.evidence  = new Evidence(document, this.events);
    this.departure = new Departure(document, this.events);

    // --- meta systems ---
    this.performance = new PerformanceManager(this.events);
    this.debug       = new DebugTools(this, this.config);
    this.world       = new WorldRegistry();
    this.scenes      = new SceneManager(this);
    this.navigation  = new NavigationSystem(this);
    this.plugins     = new PluginHost(this);

    this._onResize = () => this.resize(innerWidth, innerHeight);
    addEventListener('resize', this._onResize);
  }

  registerScene(name, SceneClass) { this.world.register(name, SceneClass); return this; }

  async start(name) {
    await this.scenes.goTo(name);
    this.resize(innerWidth, innerHeight);
    this.clock.start();
    // Clear the boot fade once we have a couple of real frames.
    requestAnimationFrame(() => requestAnimationFrame(() => this.ui.clearFade()));
    this._running = true;
    this._loop();
    // Run the Arrival loading sequence; it emits 'loaded' when the world is ready.
    this.loader.begin();
  }

  resize(w, h) {
    this.renderer.setSize(w, h);
    this.cameraRig.setAspect(w / h);
    this.post.setSize(w, h);
    const a = this.scenes.active;
    if (a && a.resize) a.resize(w, h);
  }

  _loop() {
    if (!this._running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;
    this.performance.begin();

    this.input.update(dt);
    this.timeline.update(dt);
    this.plugins.update(dt);
    const active = this.scenes.active;
    if (active) active.update(dt, time);
    this.cameraRig.update(dt, time, this.input);
    this.post.render();

    this.performance.end();
    this.debug.update(dt);
    requestAnimationFrame(() => this._loop());
  }

  dispose() {
    this._running = false;
    removeEventListener('resize', this._onResize);
    this.input.dispose();
    this.plugins.dispose();
    if (this.scenes.active) this.scenes.active.dispose();
    this.events.clear();
  }
}
