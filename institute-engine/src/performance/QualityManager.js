/**
 * QualityManager — GPU quality manager (#16). Detects a coarse device tier and
 * derives a pixel-ratio cap and effect toggles. Config can override the cap.
 * Adaptive down-shifting on sustained low FPS is a documented hook for a later
 * milestone (PerformanceManager emits 'perf:lowfps').
 */
export class QualityManager {
  constructor(config) {
    this.config = config;
    this.tier = 'high';
    this.pixelRatioCap = 2;
    this.effects = { bloom: true };
  }

  detect() {
    const dpr = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1;
    const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
    const mobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');

    if (mobile || cores <= 2) this.tier = 'low';
    else if (cores <= 4) this.tier = 'mid';
    else this.tier = 'high';

    this.pixelRatioCap = this.tier === 'low' ? 1 : this.tier === 'mid' ? 1.5 : 2;
    this.effects.bloom = this.tier !== 'low';

    // (a low tier with dpr>2 still benefits from a slightly higher cap)
    if (this.tier === 'low' && dpr >= 2) this.pixelRatioCap = 1.25;
    return this;
  }
}
