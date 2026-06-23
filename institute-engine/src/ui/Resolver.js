/**
 * Resolver — reusable "understanding" interactive (E4). Renders a small set of
 * weighted factors as sliders that combine into one live signal, resolving a
 * verdict by threshold. Teaches each project's mode of thinking by manipulation,
 * not prose. Fully data-driven (see each project's `understanding` model), so it
 * is reused across all wings. Accessible (labelled range inputs, Esc, focus),
 * headless-testable. Emits 'resolver:open' / 'resolver:close'.
 */
export class Resolver {
  constructor(doc, events) {
    this.doc = doc;
    this.events = events;
    this.el = doc.getElementById('resolver');
    this._open = false;
    this.model = null;
    this._onKey = e => { if (e.key === 'Escape') this.close(); };
    const b = doc.getElementById('resolver-close');
    if (b) b.addEventListener('click', () => this.close());
  }

  get isOpen() { return this._open; }

  open(model) {
    this.model = JSON.parse(JSON.stringify(model));   // editable copy
    this._open = true;
    this._build();
    this._recompute();
    if (this.el) {
      this.el.classList.add('show');
      this.doc.addEventListener('keydown', this._onKey);
      const c = this.doc.getElementById('resolver-close');
      if (c) c.focus();
    }
    this.events.emit('resolver:open', this.model);
  }

  close() {
    if (!this._open) return;
    this._open = false;
    if (this.el) this.el.classList.remove('show');
    this.doc.removeEventListener('keydown', this._onKey);
    this.events.emit('resolver:close');
  }

  signal() {
    const f = this.model.factors; let s = 0, w = 0;
    for (const x of f) { s += x.value * x.weight; w += x.weight; }
    return w ? s / w : 0;
  }

  verdict(sig) {
    let r = this.model.thresholds[0];
    for (const b of this.model.thresholds) if (sig >= b.min) r = b;
    return r;
  }

  _build() {
    if (!this.el) return;
    const set = (id, v) => { const el = this.doc.getElementById(id); if (el) el.textContent = v; };
    set('resolver-title', this.model.title);
    set('resolver-intro', this.model.intro);
    set('resolver-caption', this.model.caption);
    const root = this.doc.getElementById('resolver-body');
    if (!root) return;
    root.innerHTML = this.model.factors.map((f, i) =>
      `<label class="rs-factor"><span class="rs-l">${f.label}</span>` +
      `<input type="range" min="0" max="100" value="${f.value}" data-i="${i}" aria-label="${f.label}">` +
      `<span class="rs-v" id="rs-v-${i}">${f.value}</span></label>`
    ).join('');
    root.querySelectorAll('input[type=range]').forEach(inp => {
      inp.addEventListener('input', e => {
        const i = +e.target.dataset.i;
        this.model.factors[i].value = +e.target.value;
        const v = this.doc.getElementById('rs-v-' + i);
        if (v) v.textContent = e.target.value;
        this._recompute();
      });
    });
  }

  _recompute() {
    const sig = this.signal(), vd = this.verdict(sig);
    if (!this.el) return;
    const out = this.doc.getElementById('resolver-outcome');
    const bar = this.doc.getElementById('resolver-bar');
    const sg = this.doc.getElementById('resolver-signal');
    if (out) { out.textContent = vd.label; out.style.color = vd.tone; }
    if (bar) { bar.style.transform = `scaleX(${sig / 100})`; bar.style.background = vd.tone; }
    if (sg) sg.textContent = Math.round(sig);
  }
}
