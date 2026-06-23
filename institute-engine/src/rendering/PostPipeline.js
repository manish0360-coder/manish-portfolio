/**
 * PostPipeline — post-processing pipeline (#9). Owns the EffectComposer and the
 * frozen Phase-1 stack: RenderPass -> UnrealBloom -> OutputPass. Rebound to the
 * active scene/camera on every scene change. Bloom strength is exposed for
 * runtime choreography (e.g. the verification peak).
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class PostPipeline {
  constructor(gl, config, quality) {
    this.gl = gl;
    this.config = config;
    this.bloomEnabled = quality.effects.bloom;
    this.composer = new EffectComposer(gl);
    this.bloomPass = null;
  }

  bind(scene, camera) {
    this.composer.passes.length = 0;
    this.composer.addPass(new RenderPass(scene, camera));
    if (this.bloomEnabled) {
      const b = this.config.get('bloom');
      this.bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), b.strength, b.radius, b.threshold);
      this.composer.addPass(this.bloomPass);
    }
    this.composer.addPass(new OutputPass());
  }

  /** Runtime control of bloom strength (no-op if bloom disabled by quality tier). */
  setBloomStrength(v) { if (this.bloomPass) this.bloomPass.strength = v; }

  setSize(w, h) { this.composer.setSize(w, h); }
  render() { this.composer.render(); }
}
