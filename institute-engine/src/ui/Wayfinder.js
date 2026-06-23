/**
 * Wayfinder — reusable orientation/navigation system (E2). Owns the #wayfinder
 * overlay, a typed list of destinations, focus state, and keyboard cycling.
 * Emits 'wayfinder:focus' and 'wayfinder:select' on the EventBus; scenes react
 * (highlight, lean, later: enter the wing). Works headless (guards missing DOM),
 * so it is unit-testable. Grows with the world — every future wing registers a
 * destination here.
 */
export class Wayfinder {
  constructor(doc, events) {
    this.doc = doc;
    this.events = events;
    this.el = doc.getElementById('wayfinder');
    this.listEl = doc.getElementById('wayfinder-list');
    this.destinations = [];
    this.focusIndex = -1;
    this._buttons = [];
    this._onKey = this._handleKey.bind(this);
  }

  setDestinations(list) {
    this.destinations = list;
    this._render();
    return this;
  }

  _render() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';
    this._buttons = [];
    this.destinations.forEach((d, i) => {
      const b = this.doc.createElement('button');
      b.className = 'wf-item';
      b.type = 'button';
      b.style.setProperty('--c', d.color);
      b.setAttribute('aria-label', `${d.name} — ${d.meta || ''}`);
      b.innerHTML = `<span class="wf-dot"></span><span class="wf-name">${d.name}</span><span class="wf-meta">${d.meta || ''}</span>`;
      b.addEventListener('pointerenter', () => this.focus(i, 'pointer'));
      b.addEventListener('focus', () => this.focus(i, 'keyboard'));
      b.addEventListener('click', () => this.select(i));
      this.listEl.appendChild(b);
      this._buttons.push(b);
    });
  }

  show() { if (this.el) this.el.classList.add('show'); }
  hide() { if (this.el) this.el.classList.remove('show'); }

  focus(i, source = 'code') {
    if (i < 0 || i >= this.destinations.length) return;
    this.focusIndex = i;
    this._buttons.forEach((b, k) => b.classList.toggle('active', k === i));
    this.events.emit('wayfinder:focus', { index: i, destination: this.destinations[i], source });
  }

  select(i) {
    const idx = i != null ? i : this.focusIndex;
    if (idx < 0 || idx >= this.destinations.length) return;
    this.events.emit('wayfinder:select', { index: idx, destination: this.destinations[idx] });
  }

  cycle(dir) {
    const n = this.destinations.length;
    if (!n) return;
    const i = this.focusIndex < 0 ? (dir > 0 ? 0 : n - 1) : (this.focusIndex + dir + n) % n;
    if (this._buttons[i]) this._buttons[i].focus();
    this.focus(i, 'keyboard');
  }

  enableKeys() { this.doc.addEventListener('keydown', this._onKey); }
  disableKeys() { this.doc.removeEventListener('keydown', this._onKey); }

  _handleKey(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); this.cycle(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); this.cycle(-1); }
  }
}
