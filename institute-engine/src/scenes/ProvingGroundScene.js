/**
 * ProvingGroundScene — the validated Phase-1 prototype, rebuilt as a Scene that
 * consumes engine systems. The VISUAL OUTPUT IS IDENTICAL to the frozen
 * prototype; only the implementation is now modular:
 *   - camera arrival      -> CameraRig shots + modifier
 *   - verification peak    -> Timeline tween + PostPipeline bloom control
 *   - glow materials       -> MaterialLibrary
 *   - core light           -> LightingManager
 *   - resolve sweep        -> AudioSystem
 *   - HUD                  -> UIFramework
 *   - input                -> InputManager events
 *
 * All scene-specific constants live here; nothing scene-specific leaks into the
 * engine. This is the template every future wing follows.
 */
import * as THREE from 'three';
import { Scene } from '../scene/Scene.js';
import { easeOutCubic } from '../animation/Easing.js';
import { PROJECTS } from '../content/projects.js';
import { IDENTITY } from '../content/identity.js';

// ---- frozen tuning constants ----
const ARRIVAL_MS = 6800;
const VERIFY_MS  = 2600;
const RING_R = 13, TILT = 0.32;

const COL = {
  dim:     new THREE.Color('#3a4a60'),
  field:   new THREE.Color('#4a586c'),
  core:    new THREE.Color('#EAFBFF'),
  c1:      new THREE.Color('#22D3EE'),  // MiniFlyWire
  c2:      new THREE.Color('#34E0A0'),  // Noetica
  c3:      new THREE.Color('#9B6DFF'),  // Velith
  edgeDim: new THREE.Color('#202b3c'),
};
const TAG_COLORS = ['#22D3EE', '#34E0A0', '#9B6DFF'];

export class ProvingGroundScene extends Scene {
  constructor(engine) {
    super(engine);
    this.stateName = 'booting';
    this.reduced = engine.reducedMotion;
    this.nodes = [];
    this.edges = [];
    this.clusterCenters = [];
    this.verifyProgress = 0;
    this.revealed = false;
    this.focusedCluster = null;
    this.oriented = false;
    this._orientDismissed = false;
    this._lean = new THREE.Vector3();
    this._leanTarget = new THREE.Vector3();
    this._content = PROJECTS;
    this._wing = null;
    this._isolate = null;
    this._hovering = false;
    this._prevState = null;
    this._rng = this._makeRng(1337);
  }

  _makeRng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  _gauss(scale) { return (this._rng() + this._rng() + this._rng() - 1.5) * scale; }
  _smooth(edge, x) { return Math.max(0, Math.min(1, (x - edge + 0.5) / 1.0)); }

  // ---------------------------------------------------------------- build
  async build() {
    const g = this._gauss.bind(this), rng = this._rng;

    // core cluster — lit from the first frame (the opening light)
    for (let i = 0; i < 11; i++) this._mk(new THREE.Vector3(g(1.4), g(1.0), g(1.4)), COL.core, 0, 0.88);

    // three system clusters
    const sysCols = [COL.c1, COL.c2, COL.c3];
    for (let c = 0; c < 3; c++) {
      const a = (Math.PI * 2 / 3) * c - Math.PI / 2;
      const center = new THREE.Vector3(Math.cos(a) * RING_R, Math.sin(a) * RING_R * TILT + 1.5, Math.sin(a) * RING_R * 0.6);
      this.clusterCenters.push(center);
      for (let i = 0; i < 40; i++)
        this._mk(center.clone().add(new THREE.Vector3(g(3.4), g(2.4), g(3.4))), sysCols[c], c + 1, 0.14);
    }

    // field nodes
    for (let i = 0; i < 46; i++) {
      const r = 7 + rng() * 16, a = rng() * Math.PI * 2, h = g(7);
      this._mk(new THREE.Vector3(Math.cos(a) * r, h, Math.sin(a) * r), COL.field, -1, 0.16);
    }

    // instanced nodes
    this.nodeGeo = new THREE.IcosahedronGeometry(0.135, 1);
    this.inst = new THREE.InstancedMesh(this.nodeGeo, this.engine.materials.node(), this.nodes.length);
    this.inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.three.add(this.inst);
    this._dummy = new THREE.Object3D();
    this._tmpC = new THREE.Color();

    // edges
    this._buildEdges(rng);

    // starfield
    const starN = 1100, sPos = new Float32Array(starN * 3);
    for (let i = 0; i < starN; i++) {
      const r = 42 + rng() * 70, t = rng() * Math.PI * 2, p = Math.acos(2 * rng() - 1);
      sPos[i * 3] = r * Math.sin(p) * Math.cos(t); sPos[i * 3 + 1] = r * Math.cos(p); sPos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    this.stars = new THREE.Points(starGeo, this.engine.materials.star());
    this.three.add(this.stars);

    // architectural grid floor (scale cue)
    this.grid = new THREE.GridHelper(120, 60, 0x1a2230, 0x121a26);
    this.grid.material.color = new THREE.Color('#16202e');
    this.grid.material.transparent = true; this.grid.material.opacity = 0.32;
    this.grid.position.y = -7.5;
    this.three.add(this.grid);

    // core glow
    this.coreLight = this.engine.lighting.addPoint(this.three, { color: '#22D3EE', intensity: 4, distance: 30, decay: 2, position: [0, 0, 0] });

    this.maxDist = Math.max(...this.nodes.map(n => n.base.length()));

    // orientation proxies — cheap invisible raycast targets at cluster centers (E2)
    const proxyGeo = new THREE.SphereGeometry(4.2, 8, 6);
    const proxyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    this.proxies = this.clusterCenters.map((center, i) => {
      const p = new THREE.Mesh(proxyGeo, proxyMat);
      p.position.copy(center); p.userData.dest = i; this.three.add(p); return p;
    });
    this.engine.interaction.setTargets(this.proxies);
    this.engine.wayfinder.setDestinations([
      { id: 'miniflywire', name: 'MiniFlyWire', meta: 'visualize', color: '#22D3EE', center: this.clusterCenters[0] },
      { id: 'noetica',     name: 'Noetica',     meta: 'ground',    color: '#34E0A0', center: this.clusterCenters[1] },
      { id: 'velith',      name: 'Velith',      meta: 'verify',    color: '#9B6DFF', center: this.clusterCenters[2] },
    ]);

    // initial state
    this._applyVerify(this.reduced ? 1 : 0);
    this._applyNodes();
  }

  _mk(base, onC, cluster, floor) {
    const noise = base.clone().add(new THREE.Vector3(this._gauss(3.0), this._gauss(3.0), this._gauss(3.0)));
    this.nodes.push({ base, noise, onC, dimC: COL.dim, cluster, pos: noise.clone(), floor: floor || 0, act: 0 });
  }

  _buildEdges(rng) {
    const E = (a, b) => this.edges.push({ a, b });
    const coreHub = 0, clusterHub = [11, 51, 91];
    clusterHub.forEach(h => E(coreHub, h));
    E(clusterHub[0], clusterHub[1]); E(clusterHub[1], clusterHub[2]); E(clusterHub[2], clusterHub[0]);
    for (let c = 0; c < 3; c++) {
      const start = 11 + c * 40, hub = clusterHub[c];
      for (let i = start; i < start + 40; i++) { if (i !== hub) { E(hub, i); if (rng() > 0.55) E(i, start + Math.floor(rng() * 40)); } }
    }
    for (let i = 1; i < 11; i++) E(0, i);

    this._ePos = new Float32Array(this.edges.length * 6);
    this._eCol = new Float32Array(this.edges.length * 6);
    this.edgeGeo = new THREE.BufferGeometry();
    this.edgeGeo.setAttribute('position', new THREE.BufferAttribute(this._ePos, 3));
    this.edgeGeo.setAttribute('color', new THREE.BufferAttribute(this._eCol, 3));
    this.edgeLines = new THREE.LineSegments(this.edgeGeo, this.engine.materials.edge());
    this.three.add(this.edgeLines);
  }

  // ---------------------------------------------------------------- enter (E1 Arrival)
  enter() {
    const rig = this.engine.cameraRig;
    rig.clearModifiers();
    rig.defineShot('start', { position: [0.2, 0.6, 5.5], target: [0, 1.4, 0] });
    rig.defineShot('wide',  { position: [6.0, 8.5, 32.0], target: [0, 1.4, 0] });

    // breathing + pointer parallax, scaled by arrival progress (frozen behaviour)
    rig.addModifier((cam, st) => {
      const cp = st.progress;
      cam.position.x += Math.sin(st.time * 0.06) * 1.4 * cp + st.input.parallax.x * 3.2 * cp;
      cam.position.y += Math.sin(st.time * 0.18) * 0.25 * cp - st.input.parallax.y * 2.0 * cp;
      cam.position.add(this._lean);
    });

    // Hold close on the seed (the single point of light) until the visitor enters.
    rig.cut('start');

    this._offPrimary = this.engine.events.on('pointerdown', () => this._onPrimary());
    this._offConfirm = this.engine.events.on('confirm',     () => this._onPrimary());
    this._offLoaded  = this.engine.events.on('loaded',      () => this._onLoaded());
    this._offWfFocus  = this.engine.events.on('wayfinder:focus',  ({ index }) => this._focusCluster(index));
    this._offWfSelect = this.engine.events.on('wayfinder:select', ({ index }) => this._selectCluster(index));
    this._offCodex    = this.engine.events.on('codex:close',      () => this._exitWing());
    this._offDeeper   = this.engine.events.on('codex:deeper',     () => this._enterUnderstanding());
    this._offEvidence = this.engine.events.on('codex:evidence',   () => this._enterEvidence());
    this._offConclude = this.engine.events.on('conclude',         () => this._enterDeparture());
    this._offDepClose = this.engine.events.on('departure:close',  () => { if (this.stateName === 'settled') this.engine.ui.setState('verified'); });

    this.stateName = 'threshold';
    this.engine.ui.setWing('Proving Ground');
    this.engine.ui.setState('standby');
  }

  /** Loading finished -> reveal the threshold (or, for reduced motion, the settled world). */
  _onLoaded() {
    if (this.reduced) {
      this.engine.cameraRig.cut('wide');
      this._applyVerify(1); this._applyNodes();
      this.revealed = true;
      this.engine.ui.revealIdentity(); this.engine.ui.showTags();
      this.stateName = 'settled'; this.engine.ui.setState('verified');
      this._enterOrientation();
      this.engine.ui.showConclude();
      return;
    }
    this.stateName = 'threshold-ready';
    this.engine.ui.showEnter();
    this.engine.ui.setState('enter the institute');
  }

  /** The visitor's first act. From the threshold it ignites the arrival camera move;
   *  thereafter it initiates verification (the curiosity hook into the next stage). */
  _onPrimary() {
    if (this.stateName === 'threshold-ready') {
      this.engine.ui.hideEnter();
      this.stateName = 'arrival';
      this.engine.ui.setState('arrival');
      this.engine.cameraRig.play('start', 'wide', ARRIVAL_MS, 'easeInOutCubic');
      return;
    }
    if (this.stateName === 'discovery') return;            // inside a wing: back/Esc exits
    if (this.stateName === 'await') { this._startVerify(); return; }   // the one-time curiosity peak
    // settled: tap/click a cluster to enter its wing — raycast at the press point (works for touch + mouse)
    if (this.stateName === 'settled' && this.oriented) {
      const hits = this.engine.interaction.pick(this.engine.input.pointer);
      if (hits.length) { this._enterWing(hits[0].object.userData.dest); return; }
    }
  }

  _startVerify() {
    if (this.stateName !== 'await' && this.stateName !== 'arrival') return;
    if (this.stateName === 'arrival' && this.engine.cameraRig.progress < 0.35) return;
    this.stateName = 'verify';
    this.engine.ui.hidePrompt();
    this.engine.ui.setState('verifying');
    this.engine.audio.resolveTone();

    this.engine.timeline.add({
      duration: VERIFY_MS, easing: 'linear',
      onUpdate: (_e, p) => {
        this.verifyProgress = p;
        this._applyVerify(p); this._applyNodes();
        this.engine.post.setBloomStrength(0.7 + Math.sin(Math.min(1, p) * Math.PI) * 0.9);
      },
      onComplete: () => {
        this.stateName = 'settled';
        this.engine.ui.setState('verified');
        this.engine.post.setBloomStrength(0.92);
        this.revealed = true;
        this.engine.ui.revealIdentity(); this.engine.ui.showTags();
        this.engine.ui.showConclude();
      },
    });
  }

  // ---------------------------------------------------------------- orientation (E2)
  _enterOrientation() {
    if (this.oriented) return;
    this.oriented = true;
    this.engine.wayfinder.show();
    this.engine.wayfinder.enableKeys();
    if (!this.revealed) this.engine.ui.showOrient();
  }

  _focusCluster(index) {
    const next = index >= 0 ? index : null;
    if (next === this.focusedCluster) return;
    this.focusedCluster = next;
    this._applyNodes();
    if (next != null) this.engine.ui.focusTag(next); else if (!this.revealed) this.engine.ui.clearTags();
    if (!this._orientDismissed) { this._orientDismissed = true; this.engine.ui.hideOrient(); }
  }

  _selectCluster(index) {
    if (index < 0) return;
    this.engine.events.emit('orientation:selected', this._content[index]);
    this._enterWing(index);
  }

  // ---------------------------------------------------------------- discovery (E3)
  _wingShot(i) {
    const c = this.clusterCenters[i];
    const pos = c.clone().multiplyScalar(0.45);
    pos.y += 2.6;
    return { position: [pos.x, pos.y, pos.z], target: [c.x, c.y, c.z] };
  }

  _enterWing(i) {
    if (i == null || i < 0) return;
    if (this.stateName === 'discovery' && this._wing === i) return;
    if (this.stateName !== 'discovery') this._prevState = this.stateName;
    this.stateName = 'discovery'; this._wing = i; this.focusedCluster = i; this._isolate = i;
    this.engine.wayfinder.hide(); this.engine.ui.hidePrompt(); this.engine.ui.hideOrient();
    this.engine.ui.hideConclude();
    this.engine.ui.focusTag(i);
    this._applyNodes();
    this.engine.cameraRig.defineShot('wing', this._wingShot(i));
    if (this.reduced) this.engine.cameraRig.cut('wing');
    else this.engine.cameraRig.flyTo('wing', 2600, 'easeInOutCubic');
    this.engine.codex.open(this._content[i]);
    this.engine.ui.setState('discovery · ' + this._content[i].name.toLowerCase());
  }

  _enterUnderstanding() {
    if (this.stateName !== 'discovery' || this._wing == null) return;
    const u = this._content[this._wing].understanding;
    if (!u) return;
    this.engine.resolver.open(u);
    this.engine.ui.setState('understanding · ' + this._content[this._wing].name.toLowerCase());
  }

  _enterEvidence() {
    if (this.stateName !== 'discovery' || this._wing == null) return;
    const p = this._content[this._wing];
    if (!p.evidence) return;
    this.engine.evidence.open({ ...p.evidence, name: p.name, color: p.color });
    this.engine.ui.setState('evidence · ' + p.name.toLowerCase());
  }

  _enterDeparture() {
    if (this.stateName !== 'settled') return;
    this.engine.departure.open(IDENTITY);
    this.engine.ui.setState('synthesis');
  }

  _exitWing() {
    if (this.stateName !== 'discovery') return;
    this.engine.resolver.close();
    this.engine.evidence.close();
    this.engine.codex.close();
    this._isolate = null; this._wing = null;
    this.stateName = this._prevState || 'await';
    this._applyNodes();
    if (this.reduced) this.engine.cameraRig.cut('wide');
    else this.engine.cameraRig.flyTo('wide', 2200, 'easeInOutCubic');
    this.engine.wayfinder.show();
    if (this.stateName === 'await') this.engine.ui.showPrompt();
    if (this.stateName === 'settled') this.engine.ui.showConclude();
    this.engine.ui.setState(this.stateName === 'settled' ? 'verified' : 'oriented');
  }

  // ---------------------------------------------------------------- per-node
  _applyVerify(p) {
    const wave = p * (this.maxDist + 5);
    for (const n of this.nodes) {
      const raw = this.reduced ? 1 : this._smooth(n.base.length(), wave);
      n.act = Math.max(n.floor, raw);
      const posMix = n.cluster === 0 ? 1 : easeOutCubic(raw);
      n.pos.lerpVectors(n.noise, n.base, posMix);
    }
  }

  _applyNodes() {
    const d = this._dummy, c = this._tmpC;
    const focusCl = this.focusedCluster != null ? this.focusedCluster + 1 : -99;
    const iso = this._isolate;
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      let a = n.cluster === focusCl ? Math.min(1, n.act + 0.42) : n.act;   // orientation highlight
      if (iso != null && n.cluster !== iso + 1 && n.cluster !== 0) a *= 0.12;  // wing isolation
      d.position.copy(n.pos);
      const s = (n.cluster === -1 ? 0.62 : 1) * (0.55 + 0.7 * a) * (1 + 0.5 * Math.max(0, a) * (1 - a) * 2.2);
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
      c.copy(COL.edgeDim).lerp(A.onC, A.act * 0.8); c.toArray(this._eCol, e * 6);
      c.copy(COL.edgeDim).lerp(B.onC, B.act * 0.8); c.toArray(this._eCol, e * 6 + 3);
    }
    this.edgeGeo.attributes.position.needsUpdate = true;
    this.edgeGeo.attributes.color.needsUpdate = true;
  }

  // ---------------------------------------------------------------- update
  update(dt, time) {
    // arrival -> await transition
    if (this.stateName === 'arrival' && !this.reduced && this.engine.cameraRig.progress >= 1) {
      this.stateName = 'await';
      this.engine.ui.setState('awaiting input');
      this.engine.ui.showPrompt();
      this._enterOrientation();
    }

    // orientation: hover-to-focus (raycast) + soft camera lean toward the focus
    if (this.oriented && this.stateName !== 'discovery') {
      const hits = this.engine.interaction.pick(this.engine.input.pointer);
      this._hovering = hits.length > 0;
      if (hits.length) {
        const di = hits[0].object.userData.dest;
        if (di != null && di !== this.focusedCluster) this.engine.wayfinder.focus(di, 'pointer');
      }
    }
    if (this.oriented && !this.reduced) {
      if (this.focusedCluster != null) this._leanTarget.copy(this.clusterCenters[this.focusedCluster]).normalize().multiplyScalar(1.6);
      else this._leanTarget.set(0, 0, 0);
      this._lean.lerp(this._leanTarget, 0.04);
    }

    this.coreLight.intensity = 3 + Math.sin(time * 1.6) * 0.6 +
      (this.stateName === 'verify' ? this.verifyProgress * 6 : (this.stateName === 'settled' ? 5 : 0));
    this.stars.rotation.y = time * 0.005;

    if (this.revealed || this.oriented) this._updateTags();
  }

  _updateTags() {
    const cam = this.engine.cameraRig.camera, v = new THREE.Vector3();
    for (let c = 0; c < 3; c++) {
      v.copy(this.clusterCenters[c]); v.y += 3.4; v.project(cam);
      const x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
      this.engine.ui.positionTag(c, x, y, TAG_COLORS[c], v.z < 1);
    }
  }

  dispose() {
    if (this._offPrimary) this._offPrimary();
    if (this._offConfirm) this._offConfirm();
    if (this._offLoaded) this._offLoaded();
    if (this._offWfFocus) this._offWfFocus();
    if (this._offWfSelect) this._offWfSelect();
    if (this._offCodex) this._offCodex();
    if (this._offDeeper) this._offDeeper();
    if (this._offEvidence) this._offEvidence();
    if (this._offConclude) this._offConclude();
    if (this._offDepClose) this._offDepClose();
    this.engine.wayfinder.disableKeys();
    super.dispose();
  }
}
