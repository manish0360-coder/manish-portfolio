/**
 * ShaderLibrary — shader library (#8). A registry for reusable GLSL programs and
 * ShaderMaterial factories. The frozen Phase-1 scene uses no custom shaders yet
 * (its glow comes from bright materials + UnrealBloom), but future wings (e.g. a
 * procedural background or a noise->signal resolve shader) register here so they
 * are shared rather than re-authored per scene.
 *
 *   shaders.register('resolve', { vertex, fragment, uniforms: () => ({...}) });
 *   const mat = shaders.material('resolve');
 */
import * as THREE from 'three';

export class ShaderLibrary {
  constructor() { this._defs = new Map(); }
  register(name, def) { this._defs.set(name, def); return this; }
  has(name) { return this._defs.has(name); }
  get(name) { return this._defs.get(name); }
  material(name, overrides = {}) {
    const def = this._defs.get(name);
    if (!def) throw new Error(`[ShaderLibrary] unknown shader "${name}"`);
    return new THREE.ShaderMaterial({
      vertexShader: def.vertex,
      fragmentShader: def.fragment,
      uniforms: def.uniforms ? def.uniforms() : {},
      ...overrides,
    });
  }
}
