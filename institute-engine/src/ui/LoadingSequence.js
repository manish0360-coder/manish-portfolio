/**
 * LoadingSequence — the Arrival loading layer (E1). Owns the #loader overlay and
 * resolves it into the first reveal. Progress is honest: it tracks font readiness
 * and real rendered frames, with a small minimum on-screen time so the sequence
 * reads as intentional rather than a flash. Emits 'loaded' on the EventBus when
 * the world is ready to be entered. Reusable by any future entry experience.
 */
export class LoadingSequence {
  constructor(doc, events) {
    this.doc = doc;
    this.events = events;
    this.el  = doc.getElementById('loader');
    this.bar = doc.getElementById('loader-bar');
    this.pct = doc.getElementById('loader-pct');
    this.progress = 0;
    this._done = false;
  }

  set(p) {
    this.progress = Math.max(this.progress, Math.min(1, p));
    if (this.bar) this.bar.style.transform = `scaleX(${this.progress})`;
    if (this.pct) this.pct.textContent = String(Math.round(this.progress * 100)).padStart(2, '0');
  }

  _frames(n) {
    return new Promise(res => { let i = 0; const t = () => (++i >= n ? res() : requestAnimationFrame(t)); requestAnimationFrame(t); });
  }

  begin() {
    if (this._started) return; this._started = true;
    this._run();
  }

  async _run() {
    const t0 = performance.now();
    this.set(0.12);
    try { if (this.doc.fonts && this.doc.fonts.ready) await this.doc.fonts.ready; } catch (_) {}
    this.set(0.5);
    await this._frames(8); this.set(0.78);
    await this._frames(8); this.set(0.94);
    const minMs = 1100, wait = minMs - (performance.now() - t0);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    this.set(1);
    await this._frames(2);
    this.complete();
  }

  complete() {
    if (this._done) return; this._done = true;
    const el = this.el;
    if (el) {
      el.classList.add('clear');
      // Deterministic teardown: the visible fade is a CSS opacity transition, but a
      // transition can fail to complete (backgrounded/throttled tab, reduced-motion,
      // interrupted compositor) and leave this z-index:7 overlay covering the whole
      // experience. Guarantee removal via transitionend OR a timeout fallback.
      let removed = false;
      const finish = () => {
        if (removed) return; removed = true;
        el.style.display = 'none';
        el.removeEventListener('transitionend', onEnd);
      };
      const onEnd = (e) => {
        if (e.target === el && e.propertyName === 'opacity') finish();
      };
      el.addEventListener('transitionend', onEnd);
      setTimeout(finish, 1500);
    }
    this.events.emit('loaded');
  }
}
