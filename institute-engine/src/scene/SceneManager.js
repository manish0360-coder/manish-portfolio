/**
 * SceneManager — scene management system (#1). Instantiates the active scene,
 * builds it, rebinds the post-processing pipeline and interaction engine to it,
 * disposes the previous scene, and activates the new one. The single place a
 * scene transition happens.
 */
export class SceneManager {
  constructor(engine) { this.engine = engine; this.active = null; }

  async goTo(name) {
    const SceneClass = this.engine.world.get(name);
    if (!SceneClass) throw new Error(`[SceneManager] no scene registered as "${name}"`);

    const next = new SceneClass(this.engine);
    await next.build();

    const prev = this.active;
    this.active = next;

    // rebind render + interaction to the new scene/camera
    this.engine.post.bind(next.three, this.engine.cameraRig.camera);
    this.engine.interaction.bind(this.engine.cameraRig.camera);

    if (prev && prev.dispose) prev.dispose();
    if (next.enter) next.enter();
    this.engine.events.emit('scene:changed', name);
    return next;
  }
}
