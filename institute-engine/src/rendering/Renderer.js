/**
 * Renderer — thin wrapper over THREE.WebGLRenderer applying the frozen
 * Phase-1 output settings (ACES tone mapping, sRGB, exposure) and the pixel
 * ratio cap chosen by the QualityManager.
 */
import * as THREE from 'three';

export class Renderer {
  constructor(canvas, config, quality) {
    this.gl = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: config.get('diagnostics'),
    });
    const cap = config.get('pixelRatioCap') ?? quality.pixelRatioCap;
    this.gl.setPixelRatio(Math.min(devicePixelRatio || 1, cap));
    this.gl.setSize(innerWidth, innerHeight);
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = config.get('toneMappingExposure');
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
  }
  setSize(w, h) { this.gl.setSize(w, h); }
  dispose() { this.gl.dispose(); }
}
