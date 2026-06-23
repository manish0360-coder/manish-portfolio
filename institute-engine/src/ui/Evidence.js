/**
 * Evidence — reusable "evidence ledger" system (E5). Presents the verifiable
 * receipts behind a wing: the repository, real metrics (counts that can be
 * checked), and external artifacts (links to repo / tests / demo / résumé). It
 * makes the portfolio's thesis literal — nothing is asserted, every figure is
 * checkable at its source. Fully data-driven from each project's `evidence`
 * model (content/projects.js), so it is reused across all wings. Accessible
 * (role="dialog", aria-modal, Esc, focus to Back), headless-testable (guards
 * missing DOM; `count()` is pure). Emits 'evidence:open' / 'evidence:close'.
 */
export class Evidence {
  constructor(doc, events) {
    this.doc = doc;
    this.events = events;
    this.el = doc.getElementById('evidence');
    this._open = false;
    this.data = null;
    this._onKey = e => { if (e.key === 'Escape') this.close(); };
    const b = doc.getElementById('evidence-close');
    if (b) b.addEventListener('click', () => this.close());
  }

  get isOpen() { return this._open; }

  /** Total number of checkable items presented (metrics + artifacts). Pure. */
  count(data = this.data) {
    if (!data) return 0;
    return (data.metrics ? data.metrics.length : 0) + (data.artifacts ? data.artifacts.length : 0);
  }

  open(data) {
    this.data = data;
    this._open = true;
    this._build(data);
    if (this.el) {
      this.el.style.setProperty('--c', data.color || '#22D3EE');
      this.el.classList.add('show');
      this.doc.addEventListener('keydown', this._onKey);
      const c = this.doc.getElementById('evidence-close');
      if (c) c.focus();
    }
    this.events.emit('evidence:open', data);
  }

  close() {
    if (!this._open) return;
    this._open = false;
    if (this.el) this.el.classList.remove('show');
    this.doc.removeEventListener('keydown', this._onKey);
    this.events.emit('evidence:close', this.data);
  }

  _build(d) {
    if (!this.el) return;
    const set = (id, v) => { const el = this.doc.getElementById(id); if (el) el.textContent = v; };
    set('evidence-eyebrow', (d.eyebrow || 'Evidence ledger') + ' · ' + (d.name || ''));
    set('evidence-intro', d.intro || '');
    set('evidence-claim', d.claim || '');

    // repository line (the source of truth)
    const repo = this.doc.getElementById('evidence-repo');
    if (repo) {
      const r = d.repo;
      repo.innerHTML = r
        ? `<a href="${r.href}" target="_blank" rel="noopener" class="ev-repo-link">` +
          `<span class="ev-repo-name">${r.label}</span>` +
          `<span class="ev-repo-meta">${[r.lang, r.status].filter(Boolean).join(' · ')}</span></a>`
        : '';
    }

    // verifiable metrics
    const metrics = this.doc.getElementById('evidence-metrics');
    if (metrics) {
      metrics.innerHTML = (d.metrics || []).map(m =>
        `<div class="ev-metric"><div class="ev-m-val">${m.value}</div>` +
        `<div class="ev-m-label">${m.label}</div>` +
        (m.note ? `<div class="ev-m-note">${m.note}</div>` : '') + `</div>`
      ).join('');
    }

    // external artifacts (each opens at its source)
    const arts = this.doc.getElementById('evidence-artifacts');
    if (arts) {
      arts.innerHTML = (d.artifacts || []).map(a =>
        `<a class="ev-art" href="${a.href}" target="_blank" rel="noopener">` +
        `<span class="ev-art-main"><span class="ev-art-label">${a.label}</span>` +
        (a.detail ? `<span class="ev-art-detail">${a.detail}</span>` : '') + `</span>` +
        `<span class="ev-art-go">open \u2197</span></a>`
      ).join('');
    }
  }
}
