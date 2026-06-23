/**
 * Config — immutable-ish configuration container. Merges caller overrides over
 * sensible defaults. Read with get(), override with set(). No globals.
 */
const prefersReduced = typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export const defaultConfig = {
  reducedMotion: prefersReduced,
  diagnostics: true,                 // preserveDrawingBuffer (lets tests sample pixels); set false for max perf in prod
  debug: typeof location !== 'undefined' && /[?&]debug/.test(location.search),
  pixelRatioCap: null,               // null => QualityManager decides
  bloom: { strength: 0.95, radius: 0.7, threshold: 0.1 },  // FROZEN Phase-1 values
  toneMappingExposure: 1.05,
};

export class Config {
  constructor(overrides = {}) {
    this.data = { ...defaultConfig, ...overrides };
    if (overrides.bloom) this.data.bloom = { ...defaultConfig.bloom, ...overrides.bloom };
  }
  get(k) { return this.data[k]; }
  set(k, v) { this.data[k] = v; return this; }
}
