/**
 * AudioSystem — audio system (#13). Lazily creates an AudioContext on first use
 * (post-gesture, per browser policy) and synthesises the frozen Phase-1
 * "resolve" sweep played at the verification peak. Elegant and optional; all
 * calls are safe no-ops if audio is unavailable.
 */
export class AudioSystem {
  constructor() { this.ctx = null; this.muted = false; }

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    return this.ctx;
  }

  /** Frozen Phase-1 verification resolve sweep. */
  resolveTone() {
    if (this.muted) return;
    try {
      const ctx = this._ensure(); if (!ctx) return;
      const t = ctx.currentTime;
      const g = ctx.createGain();
      const o = ctx.createOscillator(), o2 = ctx.createOscillator();
      o.type = 'sine'; o2.type = 'sine';
      o.frequency.setValueAtTime(110, t);  o.frequency.exponentialRampToValueAtTime(330, t + 1.8);
      o2.frequency.setValueAtTime(220, t); o2.frequency.exponentialRampToValueAtTime(660, t + 1.8);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      o.connect(g); o2.connect(g); g.connect(ctx.destination);
      o.start(); o2.start(); o.stop(t + 2.5); o2.stop(t + 2.5);
    } catch (_) { /* audio is optional */ }
  }
}
