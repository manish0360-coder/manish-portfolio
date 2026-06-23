/**
 * Departure — reusable "synthesis + exit" overlay (E6). The closing movement of
 * the experience: it draws the three flagship systems back into the identity's
 * three threads (Visible · Grounded · Verified), restates the thesis, and offers
 * a considered exit (GitHub · résumé · email). Fully data-driven from the
 * `IDENTITY` model (content/identity.js). Accessible (role="dialog", aria-modal,
 * Esc, focus-to-Back, real Back button, links open at their source), headless-
 * testable (guards missing DOM; `threadCount()` pure). Emits 'departure:open' /
 * 'departure:close'.
 */
export class Departure {
  constructor(doc, events) {
    this.doc = doc;
    this.events = events;
    this.el = doc.getElementById('departure');
    this._open = false;
    this.data = null;
    this._onKey = e => { if (e.key === 'Escape') this.close(); };
    const b = doc.getElementById('departure-close');
    if (b) b.addEventListener('click', () => this.close());
    const trigger = doc.getElementById('conclude');
    if (trigger) trigger.addEventListener('click', () => this.events.emit('conclude'));
  }

  get isOpen() { return this._open; }

  threadCount(data = this.data) { return data && data.threads ? data.threads.length : 0; }

  open(data) {
    this.data = data;
    this._open = true;
    this._build(data);
    if (this.el) {
      this.el.classList.add('show');
      this.doc.addEventListener('keydown', this._onKey);
      const c = this.doc.getElementById('departure-close');
      if (c) c.focus();
    }
    this.events.emit('departure:open', data);
  }

  close() {
    if (!this._open) return;
    this._open = false;
    if (this.el) this.el.classList.remove('show');
    this.doc.removeEventListener('keydown', this._onKey);
    this.events.emit('departure:close', this.data);
  }

  _build(d) {
    if (!this.el) return;
    const set = (id, v) => { const el = this.doc.getElementById(id); if (el) el.textContent = v; };
    set('departure-eyebrow', d.eyebrow || 'Synthesis');
    set('departure-name', d.name || '');
    set('departure-role', d.role || '');
    set('departure-synthesis', d.synthesis || '');
    set('departure-quote', d.close || '');

    const threads = this.doc.getElementById('departure-threads');
    if (threads) {
      threads.innerHTML = (d.threads || []).map(t =>
        `<div class="dp-thread" style="--c:${t.color}">` +
        `<div class="dp-t-head"><span class="dp-t-word">${t.thread}</span>` +
        `<span class="dp-t-sys">${t.system}</span></div>` +
        `<div class="dp-t-line">${t.line}</div></div>`
      ).join('');
    }

    const contacts = this.doc.getElementById('departure-contacts');
    if (contacts) {
      contacts.innerHTML = (d.contacts || []).map(c =>
        `<a class="dp-contact" href="${c.href}"${/^mailto:/.test(c.href) ? '' : ' target="_blank" rel="noopener"'}>` +
        `<span class="dp-c-label">${c.label}</span>` +
        `<span class="dp-c-value">${c.value}</span></a>`
      ).join('');
    }
  }
}
