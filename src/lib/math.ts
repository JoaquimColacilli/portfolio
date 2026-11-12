export const clamp = (x: number, min = 0, max = 1) => Math.min(max, Math.max(min, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, x: number) => (b === a ? 0 : (x - a) / (b - a));
/** Maps x from [a, b] to 0…1, clamped. */
export const ramp = (a: number, b: number, x: number) => clamp(invLerp(a, b, x));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const smoothstep = (a: number, b: number, x: number) => smooth(ramp(a, b, x));
/** Frame-rate independent approach of `current` towards `target`. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
