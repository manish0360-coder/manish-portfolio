/**
 * Easing — pure easing functions + a name->fn registry used by the Timeline and
 * CameraRig. Frozen Phase-1 motion uses easeInOutCubic (camera) and easeOutCubic
 * (verification resolve).
 */
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const linear        = t => t;
export const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic   = t => 1 - Math.pow(1 - t, 3);
export const easeOutBack     = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const easeInOutQuart = t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

export const Easing = { linear, easeInOutCubic, easeOutCubic, easeOutBack, easeInOutQuart };
export const resolveEasing = e => (typeof e === 'function' ? e : (Easing[e] || linear));
