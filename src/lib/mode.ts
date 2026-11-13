import { useSyncExternalStore } from 'react';

export type Mode = 'day' | 'night';

const KEY = 'mode';
const listeners = new Set<() => void>();

/** Night falls at seven in the evening and lasts until seven in the morning, on the visitor's own clock. */
function byTheClock(): Mode {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 7 ? 'night' : 'day';
}

/**
 * The clock decides how a visit starts. The switch in the header overrides it for the
 * rest of that visit (session storage), and `?mode=night` or `?mode=day` forces one.
 */
function initial(): Mode {
  const asked = new URLSearchParams(window.location.search).get('mode');
  if (asked === 'day' || asked === 'night') return asked;
  try {
    const chosen = window.sessionStorage.getItem(KEY);
    if (chosen === 'day' || chosen === 'night') return chosen;
  } catch {
    // storage can be unavailable; the clock is a fine answer
  }
  return byTheClock();
}

function apply(mode: Mode): void {
  document.documentElement.classList.toggle('night', mode === 'night');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'night' ? '#010206' : '#04091f');
}

let current: Mode = initial();
apply(current);

export const getMode = (): Mode => current;

export function setMode(next: Mode): void {
  if (next === current) return;
  current = next;
  apply(next);
  try {
    window.sessionStorage.setItem(KEY, next);
  } catch {
    // not remembered, still applied
  }
  listeners.forEach((fn) => fn());
}

/** Calls `fn` whenever the mode changes. Returns a function that stops it. */
export function onMode(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const useMode = (): Mode => useSyncExternalStore(onMode, getMode);
