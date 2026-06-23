/**
 * EventBus — minimal pub/sub. The ONLY cross-system messaging channel.
 * Instance-scoped (passed by the Engine); avoids global state.
 */
export class EventBus {
  constructor() { this._map = new Map(); }
  on(type, fn)   { (this._map.get(type) || this._map.set(type, new Set()).get(type)).add(fn); return () => this.off(type, fn); }
  off(type, fn)  { const s = this._map.get(type); if (s) s.delete(fn); }
  once(type, fn) { const o = (...a) => { this.off(type, o); fn(...a); }; this.on(type, o); }
  emit(type, payload) { const s = this._map.get(type); if (s) for (const fn of [...s]) fn(payload); }
  clear() { this._map.clear(); }
}
