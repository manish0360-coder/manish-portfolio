/**
 * DebugTools — debug layer (#18). When enabled (config.debug or ?debug in the
 * URL) renders a small FPS / state overlay. Inert otherwise. Reads, never
 * mutates, engine state.
 */
export class DebugTools {
  constructor(engine, config) {
    this.engine = engine;
    this.enabled = config.get('debug');
    this.el = document.getElementById('debug');
    if (this.enabled && this.el) this.el.style.display = 'block';
    this._acc = 0;
  }
  update(dt) {
    if (!this.enabled || !this.el) return;
    this._acc += dt;
    if (this._acc < 0.25) return;
    this._acc = 0;
    const s = this.engine.scenes.active;
    this.el.textContent =
      `fps   ${this.engine.performance.fps}\n` +
      `tier  ${this.engine.quality.tier}\n` +
      `scene ${s ? s.constructor.name : '—'}\n` +
      `state ${s ? s.stateName : '—'}\n` +
      `cam   ${this.engine.cameraRig.progress.toFixed(2)}`;
  }
}
