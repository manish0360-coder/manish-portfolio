/**
 * PerformanceManager — performance manager (#15). Measures frame time, exposes a
 * smoothed FPS, and emits 'perf:lowfps' when sustained below threshold so the
 * QualityManager (future milestone) can down-shift. Monitoring only in the
 * skeleton — it never changes output on its own yet.
 */
export class PerformanceManager {
  constructor(events, { threshold = 45, window = 90 } = {}) {
    this.events = events;
    this.fps = 60;
    this._t0 = 0;
    this._ema = 1 / 60;
    this._lowFrames = 0;
    this.threshold = threshold;
    this.windowFrames = window;
  }
  begin() { this._t0 = performance.now(); }
  end() {
    const dt = (performance.now() - this._t0) / 1000 || 1 / 60;
    this._ema = this._ema * 0.9 + dt * 0.1;
    this.fps = Math.round(1 / this._ema);
    if (this.fps < this.threshold) {
      if (++this._lowFrames >= this.windowFrames) { this.events.emit('perf:lowfps', this.fps); this._lowFrames = 0; }
    } else this._lowFrames = 0;
  }
}
