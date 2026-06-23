/**
 * Timeline — the animation engine (#3). A lightweight tween manager driven by
 * the engine loop. Each tween reports eased progress to onUpdate(eased, raw)
 * and fires onComplete. Reusable by any scene or system.
 *
 *   timeline.add({ duration: 2600, easing: 'easeOutCubic',
 *                  onUpdate: (e, p) => {...}, onComplete: () => {...} });
 */
import { resolveEasing } from './Easing.js';

export class Timeline {
  constructor() { this.tweens = []; }

  add({ duration = 1000, easing = 'linear', onUpdate, onComplete, delay = 0 } = {}) {
    const tw = {
      elapsed: -delay / 1000,
      dur: duration / 1000,
      ease: resolveEasing(easing),
      onUpdate, onComplete, done: false,
    };
    this.tweens.push(tw);
    return tw;
  }

  update(dt) {
    if (!this.tweens.length) return;
    for (const tw of this.tweens) {
      if (tw.done) continue;
      tw.elapsed += dt;
      if (tw.elapsed < 0) continue;             // honour delay
      const raw = Math.min(1, tw.elapsed / tw.dur);
      if (tw.onUpdate) tw.onUpdate(tw.ease(raw), raw);
      if (raw >= 1) { tw.done = true; if (tw.onComplete) tw.onComplete(); }
    }
    this.tweens = this.tweens.filter(t => !t.done);
  }

  clear() { this.tweens.length = 0; }
}
