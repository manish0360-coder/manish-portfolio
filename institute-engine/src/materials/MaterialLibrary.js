/**
 * MaterialLibrary — material library (#7). Returns the shared, frozen Phase-1
 * materials. Cached singletons so every wing draws with the same visual rules.
 *   node()  — emissive-bright points (bloom carries the glow), instanceColor-driven
 *   edge()  — additive line material, vertexColor-driven
 *   star()  — distant field points
 */
import * as THREE from 'three';

export class MaterialLibrary {
  constructor() { this._cache = {}; }
  _get(key, make) { return (this._cache[key] ||= make()); }

  node() { return this._get('node', () => new THREE.MeshBasicMaterial({ toneMapped: true })); }

  edge() {
    return this._get('edge', () => new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  }

  star() {
    return this._get('star', () => new THREE.PointsMaterial({
      color: new THREE.Color('#566276'), size: 0.13, sizeAttenuation: true,
      transparent: true, opacity: 0.7,
    }));
  }
}
