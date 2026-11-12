import { clamp, smooth } from './math';

/**
 * A sheet's text is plotted while the stage is this close to it (in sheets). By then the
 * camera has all but arrived and the drawing is nearly complete; on the way out the text
 * is gone before the drawing starts to slide across it.
 */
const LIVE = 0.22;

/**
 * Writes the stage into the DOM, once per frame and only where it changed:
 *   --s on the few elements that follow the scroll continuously (ruler, header, cover)
 *   --p on every sheet: 1 when it is in front of the visitor, 0 when it is half a sheet away
 *   .is-live / .is-past on every sheet, which drive the plotter-style text reveals
 */
export function createBindings(sheets: HTMLElement[], followers: HTMLElement[]) {
  const state = sheets.map(() => ({ live: false, past: false, p: '' }));
  let last = Number.NaN;

  return (s: number): void => {
    if (Math.abs(s - last) < 0.0002) return;
    last = s;

    const value = s.toFixed(4);
    for (const el of followers) el.style.setProperty('--s', value);

    for (let i = 0; i < sheets.length; i++) {
      const el = sheets[i];
      const entry = state[i];
      const distance = s - i;
      const live = Math.abs(distance) < LIVE;
      const past = distance >= LIVE;
      if (live !== entry.live) {
        entry.live = live;
        el.classList.toggle('is-live', live);
      }
      if (past !== entry.past) {
        entry.past = past;
        el.classList.toggle('is-past', past);
      }
      const p = smooth(clamp(1 - Math.abs(distance) / 0.5)).toFixed(3);
      if (p !== entry.p) {
        entry.p = p;
        el.style.setProperty('--p', p);
      }
    }
  };
}
