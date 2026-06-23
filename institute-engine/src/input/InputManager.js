/**
 * InputManager — input system (#5). Normalises pointer + keyboard + touch into
 * engine events and a smoothed parallax vector. Emits:
 *   'pointerdown'  — any primary press on the canvas
 *   'confirm'      — Enter / Space
 * `parallax` is a damped {x,y} in roughly [-0.5, 0.5] for camera modifiers.
 */
export class InputManager {
  constructor(events) {
    this.events = events;
    this.parallax = { x: 0, y: 0 };
    this.pointer = { x: 0, y: 0 };          // normalized device coords [-1,1] for raycasting
    this._target = { x: 0, y: 0 };
    this._bound = [];
  }

  attach(canvas) {
    const add = (el, type, fn) => { el.addEventListener(type, fn, { passive: true }); this._bound.push([el, type, fn]); };
    add(canvas, 'pointerdown', e => {
      // Record the press location so a tap raycasts where the finger lands (touch parity).
      if (typeof e.clientX === 'number') {
        this.pointer.x = (e.clientX / innerWidth) * 2 - 1;
        this.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
      }
      this.events.emit('pointerdown');
    });
    add(window, 'pointermove', e => {
      this._target.x = (e.clientX / innerWidth) - 0.5;
      this._target.y = (e.clientY / innerHeight) - 0.5;
      this.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    });
    add(window, 'keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const ae = document.activeElement;
        const interactive = ae && (/^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) || ae.getAttribute('role') === 'button');
        if (!interactive) this.events.emit('confirm');   // don't double-fire when a control is focused
      }
    });
  }

  update() {
    this.parallax.x += (this._target.x - this.parallax.x) * 0.05;
    this.parallax.y += (this._target.y - this.parallax.y) * 0.05;
  }

  dispose() { for (const [el, type, fn] of this._bound) el.removeEventListener(type, fn); this._bound.length = 0; }
}
