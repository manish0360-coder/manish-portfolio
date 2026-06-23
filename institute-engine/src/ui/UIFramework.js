/**
 * UIFramework — UI framework (#14). The single bridge between engine/scene state
 * and the DOM HUD. Scenes never touch the DOM directly; they call these methods.
 * All lookups are guarded so the framework also runs in the test harness, which
 * provides only a subset of HUD elements.
 */
export class UIFramework {
  constructor(doc) {
    this.doc = doc;
    this.$ = id => doc.getElementById(id);
    this.tags = [this.$('tag0'), this.$('tag1'), this.$('tag2')];
  }

  setState(s) { const el = this.$('state'); if (el) el.textContent = '— ' + s + ' —'; }

  /** Set the top-left wing breadcrumb (e.g. "Proving Ground", "Atrium"). */
  setWing(name) { const el = this.$('wing'); if (el) el.textContent = name; }

  showPrompt() { const p = this.$('prompt'); if (p) p.classList.add('show'); }
  hidePrompt() { const p = this.$('prompt'); if (p) p.classList.remove('show'); }

  showEnter() { const e = this.$('enter'); if (e) e.classList.add('show'); }
  hideEnter() { const e = this.$('enter'); if (e) e.classList.remove('show'); }

  revealIdentity() { const i = this.$('identity'); if (i) i.classList.add('show'); }

  showTags() { this.tags.forEach(t => t && t.classList.add('show')); }
  focusTag(i) { this.tags.forEach((t, k) => t && t.classList.toggle('show', k === i)); }
  clearTags() { this.tags.forEach(t => t && t.classList.remove('show')); }

  showOrient() { const o = this.$('orient'); if (o) o.classList.add('show'); }
  hideOrient() { const o = this.$('orient'); if (o) o.classList.remove('show'); }

  showConclude() { const c = this.$('conclude'); if (c) c.classList.add('show'); }
  hideConclude() { const c = this.$('conclude'); if (c) c.classList.remove('show'); }

  /** Position a projected cluster tag in screen space; hide when behind camera. */
  positionTag(i, x, y, color, visible) {
    const t = this.tags[i]; if (!t) return;
    t.style.left = x + 'px'; t.style.top = y + 'px';
    t.style.color = color;
    t.style.display = visible ? 'block' : 'none';
  }

  clearFade() { const f = this.$('fade'); if (f) f.classList.add('clear'); }

  /**
   * Reset every HUD overlay/cue to hidden. Additive helper used when a scene
   * other than the Proving Ground takes over (scene swaps share one DOM HUD),
   * so a wing starts from a clean slate. Pure DOM; touches no system state.
   */
  resetHUD() {
    ['identity', 'prompt', 'enter', 'orient', 'conclude', 'wayfinder', 'codex', 'resolver', 'evidence', 'departure']
      .forEach(id => { const el = this.$(id); if (el) el.classList.remove('show'); });
    this.clearTags();
  }
}
