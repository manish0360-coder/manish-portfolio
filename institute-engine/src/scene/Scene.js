/**
 * Scene — base class every environment extends. Owns its own THREE.Scene graph
 * and a `stateName` for debug/telemetry. The SceneManager calls build() (async,
 * for asset loads) then enter(); the engine loop calls update() each frame.
 */
import * as THREE from 'three';

export class Scene {
  constructor(engine) {
    this.engine = engine;
    this.three = new THREE.Scene();
    this.stateName = 'idle';
  }
  async build() {}          // construct the scene graph
  enter() {}                // activate (camera shots, ui, etc.)
  update(dt, time) {}       // per-frame
  resize(w, h) {}
  dispose() {
    this.three.traverse(o => {
      if (o.geometry && o.geometry.dispose) o.geometry.dispose();
    });
  }
}
