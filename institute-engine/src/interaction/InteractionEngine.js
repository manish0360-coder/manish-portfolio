/**
 * InteractionEngine — interaction system (#4). Provides raycasting against a
 * registered set of objects for hover/pick interactions. The Proving Ground
 * uses a global "click to verify" gesture (via InputManager) and does not pick
 * objects, but this service is part of the skeleton for future wings (e.g.
 * hovering a project node to preview it).
 */
import * as THREE from 'three';

export class InteractionEngine {
  constructor(camera) {
    this.camera = camera;
    this.ray = new THREE.Raycaster();
    this.targets = [];
  }
  bind(camera) { this.camera = camera; }
  setTargets(objects) { this.targets = objects; }
  /** ndc: {x,y} in clip space [-1,1]. Returns sorted intersections. */
  pick(ndc) { this.ray.setFromCamera(ndc, this.camera); return this.ray.intersectObjects(this.targets, false); }
}
