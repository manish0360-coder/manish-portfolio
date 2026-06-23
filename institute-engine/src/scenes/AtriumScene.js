/**
 * AtriumScene — the Institute's second wing, and the proof of the engine's
 * central promise: a new environment is added with ONE `registerScene()` + ONE
 * `defineRoute()` and ZERO engine edits. It is assembled entirely from existing
 * engine systems — MaterialLibrary, LightingManager, CameraRig, InteractionEngine,
 * the Codex/Resolver/Evidence content stack, and the PROJECTS data — yet is a
 * distinct experience: a calm, deep-linkable campus directory (route `#atrium`).
 *
 * Where the Proving Ground is a narrative arrival, the Atrium is a reading room:
 * three system markers you can hover and open, no cinematics. Same systems, new
 * scene — which is exactly the architecture the skeleton exists to demonstrate.
 */
import * as THREE from 'three';
import { Scene } from '../scene/Scene.js';
import { PROJECTS } from '../content/projects.js';

const MARKER_COL = ['#22D3EE', '#34E0A0', '#9B6DFF'];
const CORE_COL = new THREE.Color('#EAFBFF');
const DIM = new THREE.Color('#39465a');
const EDGE_DIM = new THREE.Color('#1c2636');

export class AtriumScene extends Scene {
  constructor(engine) {
    super(engine);
    this.stateName = 'atrium';
    this.reduced = engine.reducedMotion;
    this.nodes = [];
    this.edges = [];
    this.markerIndex = [];          // node indices of the three markers
    this._content = PROJECTS;
    this.hovered = null;
    this.focused = null;
    this._rng = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(91037);
    this._g = scale => (this._rng() + this._rng() + this._rng() - 1.5) * scale;
  }

  // ---------------------------------------------------------------- build
  async build() {
    // core seed (faint, central)
    this._mk(new THREE.Vector3(0, -0.3, 1.4), CORE_COL, 0.5, -1);

    // three system markers in a shallow, legible arc
    this.markerCenters = [
      new THREE.Vector3(-6.4, 0.4, 0),
      new THREE.Vector3(0, 1.5, -1.4),
      new THREE.Vector3(6.4, 0.4, 0),
    ];
    this.markerCenters.forEach((c, i) => {
      this.markerIndex.push(this.nodes.length);
      this._mk(c.clone(), new THREE.Color(MARKER_COL[i]), 0.85, i);
      // a few faint satellites give each marker presence
      for (let k = 0; k < 7; k++)
        this._mk(c.clone().add(new THREE.Vector3(this._g(1.5), this._g(1.1), this._g(1.5))), new THREE.Color(MARKER_COL[i]), 0.12, i);
    });

    // a quiet field for depth
    for (let i = 0; i < 30; i++) {
      const r = 9 + this._rng() * 14, a = this._rng() * Math.PI * 2;
      this._mk(new THREE.Vector3(Math.cos(a) * r, this._g(5), Math.sin(a) * r - 3), DIM, 0.14, -1);
    }

    this.nodeGeo = new THREE.IcosahedronGeometry(0.16, 1);
    this.inst = new THREE.InstancedMesh(this.nodeGeo, this.engine.materials.node(), this.nodes.length);
    this.inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.three.add(this.inst);
    this._dummy = new THREE.Object3D();
    this._tmpC = new THREE.Color();

    // structural edges: core -> each marker
    this.markerIndex.forEach(mi => this.edges.push({ a: 0, b: mi }));
    this._ePos = new Float32Array(this.edges.length * 6);
    this._eCol = new Float32Array(this.edges.length * 6);
    this.edgeGeo = new THREE.BufferGeometry();
    this.edgeGeo.setAttribute('position', new THREE.BufferAttribute(this._ePos, 3));
    this.edgeGeo.setAttribute('color', new THREE.BufferAttribute(this._eCol, 3));
    this.edgeLines = new THREE.LineSegments(this.edgeGeo, this.engine.materials.edge());
    this.three.add(this.edgeLines);

    // starfield (reuse the shared distant-field material)
    const sN = 700, sPos = new Float32Array(sN * 3);
    for (let i = 0; i < sN; i++) {
      const r = 40 + this._rng() * 65, t = this._rng() * Math.PI * 2, p = Math.acos(2 * this._rng() - 1);
      sPos[i * 3] = r * Math.sin(p) * Math.cos(t); sPos[i * 3 + 1] = r * Math.cos(p); sPos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    this.stars = new THREE.Points(sGeo, this.engine.materials.star());
    this.three.add(this.stars);

    // grid floor (scale cue, same vocabulary as the Proving Ground)
    this.grid = new THREE.GridHelper(110, 55, 0x1a2230, 0x121a26);
    this.grid.material.color = new THREE.Color('#16202e');
    this.grid.material.transparent = true; this.grid.material.opacity = 0.28;
    this.grid.position.y = -6.5;
    this.three.add(this.grid);

    // core glow
    this.coreLight = this.engine.lighting.addPoint(this.three, { color: '#22D3EE', intensity: 5, distance: 34, decay: 2, position: [0, 0, 0] });

    // invisible raycast proxies at each marker (hover/click targets)
    const proxyGeo = new THREE.SphereGeometry(2.4, 8, 6);
    const proxyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    this.proxies = this.markerCenters.map((c, i) => {
      const m = new THREE.Mesh(proxyGeo, proxyMat);
      m.position.copy(c); m.userData.dest = i; this.three.add(m); return m;
    });
    this.engine.interaction.setTargets(this.proxies);

    this._applyNodes();
  }

  _mk(pos, onC, floor, marker) {
    this.nodes.push({ pos, onC, dimC: DIM, floor, marker, act: floor });
  }

  // ---------------------------------------------------------------- enter
  enter() {
    this.engine.ui.resetHUD();                 // scenes share one DOM HUD — start clean
    this.engine.ui.setWing('Atrium');
    this.engine.ui.setState('atrium · the index');
    this.engine.post.setBloomStrength(0.95);

    const rig = this.engine.cameraRig;
    rig.clearModifiers();
    rig.defineShot('atrium', { position: [0, 2.4, 13.5], target: [0, 0.7, -0.4] });
    rig.cut('atrium');
    rig.addModifier((cam, st) => {
      if (this.reduced) return;
      cam.position.x += Math.sin(st.time * 0.12) * 0.5 + st.input.parallax.x * 2.2;
      cam.position.y += -st.input.parallax.y * 1.4;
    });

    // reuse the project tags as marker labels
    this.engine.ui.showTags();

    // the full content stack, reused unchanged across scenes
    this._offDown     = this.engine.events.on('pointerdown', () => this._onPrimary());
    this._offConfirm  = this.engine.events.on('confirm',     () => this._onPrimary());
    this._offClose    = this.engine.events.on('codex:close', () => { this.focused = null; this._applyNodes(); });
    this._offDeeper   = this.engine.events.on('codex:deeper', () => { const u = this._sel() && this._sel().understanding; if (u) this.engine.resolver.open(u); });
    this._offEvidence = this.engine.events.on('codex:evidence', () => { const p = this._sel(); if (p && p.evidence) this.engine.evidence.open({ ...p.evidence, name: p.name, color: p.color }); });
  }

  _sel() { return this.focused != null ? this._content[this.focused] : null; }

  _onPrimary() {
    if (this.engine.codex.isOpen) return;      // let the panel's own controls handle it
    let idx = this.hovered;
    if (idx == null) {                          // touch: no hover — raycast at the press point
      const hits = this.engine.interaction.pick(this.engine.input.pointer);
      idx = hits.length ? hits[0].object.userData.dest : null;
    }
    if (idx == null) return;
    this.focused = idx;
    this.engine.ui.focusTag(this.focused);
    this._applyNodes();
    this.engine.codex.open(this._content[this.focused]);
    this.engine.ui.setState('atrium · ' + this._content[this.focused].name.toLowerCase());
  }

  // ---------------------------------------------------------------- per-node
  _applyNodes() {
    const d = this._dummy, c = this._tmpC;
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      let a = n.act;
      const isHot = n.marker != null && n.marker >= 0 && (n.marker === this.hovered || n.marker === this.focused);
      if (isHot) a = Math.min(1, a + 0.4);
      if (this.focused != null && n.marker !== this.focused && n.marker >= 0) a *= 0.4;   // isolate the open one
      d.position.copy(n.pos);
      const s = (0.6 + 0.7 * a) * (isHot ? 1.25 : 1);
      d.scale.setScalar(s); d.updateMatrix();
      this.inst.setMatrixAt(i, d.matrix);
      c.copy(n.dimC).lerp(n.onC, a);
      this.inst.setColorAt(i, c);
    }
    this.inst.instanceMatrix.needsUpdate = true;
    if (this.inst.instanceColor) this.inst.instanceColor.needsUpdate = true;

    for (let e = 0; e < this.edges.length; e++) {
      const A = this.nodes[this.edges[e].a], B = this.nodes[this.edges[e].b];
      this._ePos[e * 6] = A.pos.x; this._ePos[e * 6 + 1] = A.pos.y; this._ePos[e * 6 + 2] = A.pos.z;
      this._ePos[e * 6 + 3] = B.pos.x; this._ePos[e * 6 + 4] = B.pos.y; this._ePos[e * 6 + 5] = B.pos.z;
      c.copy(EDGE_DIM).lerp(B.onC, B.act * 0.7); c.toArray(this._eCol, e * 6);
      c.copy(EDGE_DIM).lerp(B.onC, B.act * 0.7); c.toArray(this._eCol, e * 6 + 3);
    }
    this.edgeGeo.attributes.position.needsUpdate = true;
    this.edgeGeo.attributes.color.needsUpdate = true;
  }

  // ---------------------------------------------------------------- update
  update(dt, time) {
    if (!this.engine.codex.isOpen) {
      const hits = this.engine.interaction.pick(this.engine.input.pointer);
      const h = hits.length ? hits[0].object.userData.dest : null;
      if (h !== this.hovered) { this.hovered = h; this._applyNodes(); }
    }
    this.coreLight.intensity = 4 + Math.sin(time * 1.4) * 0.7;
    this.stars.rotation.y = time * 0.004;

    // project the three marker labels into screen space
    const cam = this.engine.cameraRig.camera, v = new THREE.Vector3();
    for (let i = 0; i < 3; i++) {
      v.copy(this.markerCenters[i]); v.y += 1.7; v.project(cam);
      const x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
      this.engine.ui.positionTag(i, x, y, MARKER_COL[i], v.z < 1);
    }
  }

  dispose() {
    [this._offDown, this._offConfirm, this._offClose, this._offDeeper, this._offEvidence]
      .forEach(off => off && off());
    this.engine.codex.close();
    this.engine.ui.resetHUD();
    super.dispose();
  }
}
