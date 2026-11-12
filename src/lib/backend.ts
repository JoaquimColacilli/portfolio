import { useSyncExternalStore } from 'react';

/** What the 3D world is drawn with. `none` means it could not start and the sheets are flat. */
export type Backend = 'pending' | 'webgpu' | 'webgl2' | 'none';

let current: Backend = 'pending';
const listeners = new Set<() => void>();

export function setBackend(next: Backend): void {
  if (next === current) return;
  current = next;
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useBackend = (): Backend => useSyncExternalStore(subscribe, () => current);
