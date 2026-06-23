/**
 * AssetLoader — asset loader (#10). Promise-based loading with an in-memory
 * cache so an asset fetched once is reused across wings. Textures are supported
 * directly; GLTF/HDR loaders are imported lazily to keep the initial bundle
 * lean. The Proving Ground ships no external assets, but the pipeline is in
 * place for future wings.
 */
import * as THREE from 'three';

export class AssetLoader {
  constructor() {
    this.cache = new Map();
    this._tex = new THREE.TextureLoader();
  }

  texture(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    const p = new Promise((res, rej) => this._tex.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, rej));
    this.cache.set(url, p);
    return p;
  }

  json(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    const p = fetch(url).then(r => r.json());
    this.cache.set(url, p);
    return p;
  }

  async gltf(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    const p = new Promise((res, rej) => loader.load(url, res, undefined, rej));
    this.cache.set(url, p);
    return p;
  }

  dispose() { this.cache.clear(); }
}
