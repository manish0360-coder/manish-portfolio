/**
 * WorldRegistry — world registry (#11) + scene plugin mechanism. Maps a name to
 * a Scene class. Registering a new wing is a one-liner and requires no engine
 * changes — this is how the world grows for a decade.
 */
export class WorldRegistry {
  constructor() { this._scenes = new Map(); }
  register(name, SceneClass) { this._scenes.set(name, SceneClass); return this; }
  has(name) { return this._scenes.has(name); }
  get(name) { return this._scenes.get(name); }
  list() { return [...this._scenes.keys()]; }
}
