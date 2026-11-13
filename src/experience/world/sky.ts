import { fieldOfView, type Viewport } from '../Rig';

/** Radius of the moon, in radians. */
export const MOON_RADIUS = 0.034;

/** How far across the screen the moon rests, per kind of sheet: [side by side, stacked]. */
export const MOON_ACROSS = {
  cover: [0.775, 0.8],
  chapter: [0.875, 0.875],
  sky: [0.83, 0.82],
} as const;

/** Pixels per radian at the centre of the frame. */
export const focalLength = (viewport: Viewport): number => viewport.height / 2 / Math.tan((fieldOfView(viewport) * Math.PI) / 360);

/**
 * Where the moon rests on screen for a kind of sheet: tucked under the right side of
 * the header, clear of it by a small gap whatever the size of the window.
 */
export function moonSpot(viewport: Viewport, sheet: keyof typeof MOON_ACROSS): { x: number; y: number; radius: number } {
  const radius = MOON_RADIUS * focalLength(viewport);
  const gap = viewport.stacked ? 8 : viewport.height * 0.022;
  return { x: viewport.width * MOON_ACROSS[sheet][viewport.stacked ? 1 : 0], y: viewport.top + radius + gap, radius };
}
