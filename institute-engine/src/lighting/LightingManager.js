/**
 * LightingManager — lighting system (#6). Helper factory that attaches lights to
 * a given scene and returns them for runtime animation. Keeps light creation out
 * of scene bodies and consistent across wings.
 */
import * as THREE from 'three';

export class LightingManager {
  addPoint(scene, { color = '#ffffff', intensity = 1, distance = 0, decay = 2, position = [0, 0, 0] } = {}) {
    const l = new THREE.PointLight(new THREE.Color(color), intensity, distance, decay);
    l.position.set(...position);
    scene.add(l);
    return l;
  }
  addAmbient(scene, { color = '#ffffff', intensity = 0.4 } = {}) {
    const l = new THREE.AmbientLight(new THREE.Color(color), intensity);
    scene.add(l);
    return l;
  }
  addDirectional(scene, { color = '#ffffff', intensity = 1, position = [1, 1, 1] } = {}) {
    const l = new THREE.DirectionalLight(new THREE.Color(color), intensity);
    l.position.set(...position);
    scene.add(l);
    return l;
  }
}
