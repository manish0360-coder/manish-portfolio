/**
 * PluginHost — runtime plugin architecture (#20). Any object with
 * { name, init(engine)?, update(dt, engine)?, dispose()? } can extend the
 * engine without modifying it. Scenes use the World Registry; cross-cutting
 * runtime behaviours (e.g. a future analytics or screenshot plugin) use this.
 */
export class PluginHost {
  constructor(engine) { this.engine = engine; this.plugins = []; }
  use(plugin) {
    this.plugins.push(plugin);
    if (plugin.init) plugin.init(this.engine);
    return this;
  }
  update(dt) { for (const p of this.plugins) if (p.update) p.update(dt, this.engine); }
  dispose() { for (const p of this.plugins) if (p.dispose) p.dispose(); this.plugins = []; }
}
