/**
 * CameraRig — camera framework (#2). Owns the perspective camera and plays
 * choreographed "shots" (named pose A -> pose B with easing). Per-frame
 * modifiers (breathing, pointer parallax) are layered on top of the base pose,
 * exactly reproducing the frozen Phase-1 camera behaviour. `progress` (0..1) of
 * the current shot is published so scenes can gate logic on the arrival.
 */
import * as THREE from 'three';
import { resolveEasing } from '../animation/Easing.js';

export class CameraRig {
  constructor(config) {
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    this.shots = {};
    this.from = null; this.to = null;
    this.t = 0; this.dur = 0; this.ease = t => t;
    this.playing = false; this.progress = 0;
    this._curTarget = new THREE.Vector3();
    this.modifiers = [];
  }

  defineShot(name, { position, target }) {
    this.shots[name] = { pos: new THREE.Vector3(...position), target: new THREE.Vector3(...target) };
    return this;
  }

  cut(name) {
    const s = this.shots[name];
    this.from = { pos: s.pos.clone(), target: s.target.clone() };
    this.to = this.from;
    this.progress = 1; this.playing = false;
    this.camera.position.copy(s.pos);
    this._curTarget.copy(s.target);
    this.camera.lookAt(this._curTarget);
  }

  play(fromName, toName, durationMs, easing) {
    this.from = { pos: this.shots[fromName].pos.clone(), target: this.shots[fromName].target.clone() };
    this.to   = { pos: this.shots[toName].pos.clone(),   target: this.shots[toName].target.clone() };
    this.t = 0; this.dur = durationMs / 1000; this.ease = resolveEasing(easing);
    this.progress = 0; this.playing = true;
  }

  /** Fly from the CURRENT camera pose into a named shot (used for wing entry/exit). */
  flyTo(toName, durationMs, easing) {
    this.from = { pos: this.camera.position.clone(), target: this._curTarget.clone() };
    this.to   = { pos: this.shots[toName].pos.clone(), target: this.shots[toName].target.clone() };
    this.t = 0; this.dur = durationMs / 1000; this.ease = resolveEasing(easing);
    this.progress = 0; this.playing = true;
  }

  /** fn(camera, { progress, time, dt, input }) — applied after the base pose, before lookAt. */
  addModifier(fn) { this.modifiers.push(fn); return this; }
  clearModifiers() { this.modifiers.length = 0; }

  setAspect(a) { this.camera.aspect = a; this.camera.updateProjectionMatrix(); }

  update(dt, time, input) {
    if (this.playing) {
      this.t += dt;
      const p = Math.min(1, this.t / this.dur);
      this.progress = this.ease(p);
      if (p >= 1) this.playing = false;
    }
    if (this.from && this.to) {
      this.camera.position.lerpVectors(this.from.pos, this.to.pos, this.progress);
      this._curTarget.lerpVectors(this.from.target, this.to.target, this.progress);
    }
    const st = { progress: this.progress, time, dt, input };
    for (const m of this.modifiers) m(this.camera, st);
    this.camera.lookAt(this._curTarget);
  }
}
