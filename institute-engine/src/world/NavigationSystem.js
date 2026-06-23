/**
 * NavigationSystem — navigation system (#12). Maps URL hash routes to scene
 * names and drives scene transitions on hashchange, giving every wing a real,
 * shareable, crawlable URL. The skeleton wires one route; adding more is a
 * defineRoute() call per wing.
 */
export class NavigationSystem {
  constructor(engine) {
    this.engine = engine;
    this.routes = {};
    addEventListener('hashchange', () => this._sync());
  }
  defineRoute(hash, sceneName) { this.routes[hash] = sceneName; return this; }
  goTo(sceneName) {
    const hash = Object.keys(this.routes).find(h => this.routes[h] === sceneName);
    if (hash) location.hash = hash; else this.engine.scenes.goTo(sceneName);
  }
  _sync() {
    const h = location.hash.replace('#', '');
    if (this.routes[h]) this.engine.scenes.goTo(this.routes[h]);
  }
}
