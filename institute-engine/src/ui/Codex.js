/**
 * Codex — reusable content-presentation system (E3+). A spatial panel that
 * presents a destination's content (eyebrow, name, essence, facts, "deeper"
 * hint). Reused by Discovery (E3), Understanding (E4), and Evidence (E5) — each
 * passes a richer record. Works headless (guards missing DOM) for testing.
 * Accessible: role="dialog", Esc closes, focus moves to the back control on open.
 * Emits 'codex:open' / 'codex:close'.
 */
export class Codex {
  constructor(doc, events) {
    this.doc = doc;
    this.events = events;
    this.el = doc.getElementById('codex');
    this._open = false;
    this.data = null;
    this._onKey = e => { if (e.key === 'Escape') this.close(); };
    const btn = doc.getElementById('codex-close');
    if (btn) btn.addEventListener('click', () => this.close());
    const deeper = doc.getElementById('codex-deeper');
    if (deeper) deeper.addEventListener('click', () => this.events.emit('codex:deeper', this.data));
    const evidence = doc.getElementById('codex-evidence');
    if (evidence) evidence.addEventListener('click', () => this.events.emit('codex:evidence', this.data));
  }

  get isOpen() { return this._open; }

  open(data) {
    this.data = data;
    this._open = true;
    this._populate(data);
    if (this.el) {
      this.el.style.setProperty('--c', data.color || '#22D3EE');
      this.el.classList.add('show');
      this.doc.addEventListener('keydown', this._onKey);
      const btn = this.doc.getElementById('codex-close');
      if (btn) btn.focus();
    }
    this.events.emit('codex:open', data);
  }

  close() {
    if (!this._open) return;
    this._open = false;
    if (this.el) this.el.classList.remove('show');
    this.doc.removeEventListener('keydown', this._onKey);
    this.events.emit('codex:close', this.data);
  }

  _populate(d) {
    const set = (id, val) => { const el = this.doc.getElementById(id); if (el) el.textContent = val; };
    set('codex-eyebrow', d.eyebrow || '');
    set('codex-name', d.name || '');
    set('codex-essence', d.essence || '');
    set('codex-deeper', d.deeper || '');
    set('codex-evidence', d.evidenceLabel || '');
    const facts = this.doc.getElementById('codex-facts');
    if (facts) {
      facts.innerHTML = (d.facts || []).map(f =>
        `<div class="codex-fact"><span class="l">${f.label}</span><span class="v">${f.value}</span></div>`
      ).join('');
    }
  }
}
