import Lenis from 'lenis';
import { sheetIndex } from './content/sheets';
import type { Experience } from './experience/Experience';
import { setBackend } from './lib/backend';
import { createBindings } from './lib/bindings';
import { clamp, smooth } from './lib/math';
import { stage } from './lib/stage';
import { ticker } from './lib/ticker';

export interface Runtime {
  /** the page content moved (language, fonts): measure again and re-anchor the line */
  refresh(): void;
  dispose(): void;
}

interface Parts {
  /** element the canvas is mounted in */
  host: HTMLElement;
  /** the cursor after the name, where the line starts */
  origin: HTMLElement | null;
  /** the cursor on the contact sheet, where it ends */
  end: HTMLElement | null;
}

/** Seconds after page load at which the cover's own cursor has appeared (see sheets.css). */
const CURSOR_APPEARS = 1.7;
const INTRO_SECONDS = 2.6;

const easeInOut = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

/**
 * Everything that runs every frame, in one place and one order:
 * smooth scroll → stage → DOM bindings → 3D world.
 */
export function startRuntime({ host, origin, end }: Parts): Runtime {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const debug = params.has('debug') || params.has('offscreen');
  const sheets = [...document.querySelectorAll<HTMLElement>('[data-sheet]')];
  const followers = [...document.querySelectorAll<HTMLElement>('.header, .ruler, .cover')];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let reduced = motionQuery.matches;
  let experience: Experience | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let disposed = false;
  let dirty = true;
  let introStart = Number.POSITIVE_INFINITY;
  let frames = 0;

  stage.setSections(sheets);
  const bind = createBindings(sheets, followers);

  // Smooth wheel scrolling. Touch scrolling stays native, and Lenis turns itself off
  // when the visitor prefers reduced motion.
  const lenis = new Lenis({ autoRaf: false, lerp: 0.115, anchors: false });
  stage.setScroller((y, immediate) => {
    if (immediate) {
      lenis.scrollTo(y, { immediate: true, force: true });
      return;
    }
    // long jumps fly through the sheets in between, so give them time
    const sheetsAway = Math.abs(y - window.scrollY) / Math.max(1, window.innerHeight);
    lenis.scrollTo(y, { duration: clamp(0.9 + sheetsAway * 0.24, 1.1, 3.6), easing: easeInOut, force: true });
  });

  /** Starts the 3D world. Runs again, on WebGL 2, if the WebGPU device is lost. */
  const load = async (forceWebGL: boolean): Promise<void> => {
    const element = document.createElement('canvas');
    host.replaceChildren(element);
    canvas = element;
    try {
      const { Experience: World } = await import('./experience/Experience');
      const world = await World.create(element, {
        reducedMotion: reduced,
        forceWebGL,
        offscreen: params.has('offscreen'),
        onLost: () => {
          if (disposed || experience !== world) return;
          experience = null;
          world.dispose();
          if (forceWebGL) fail(new Error('graphics context lost'));
          else void load(true);
        },
      });
      if (disposed || canvas !== element) {
        world.dispose();
        return;
      }
      world.setAnchors(origin, end);
      world.intro = reduced ? 1 : 0;
      if (reduced) root.classList.add('line-out');
      experience = world;
      dirty = true;
      setBackend(world.backend);
      root.classList.remove('no-3d');
      // let the first frames (and their shader compilation) happen before the reveal
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (disposed || experience !== world) return;
          host.classList.add('is-ready');
          introStart = Math.max(performance.now() / 1000 + 0.3, CURSOR_APPEARS);
        }),
      );
    } catch (error) {
      if (canvas === element) fail(error);
    }
  };

  const fail = (error: unknown): void => {
    console.warn('The 3D world could not start; showing the sheets without it.', error);
    experience = null;
    host.classList.remove('is-ready');
    host.replaceChildren();
    root.classList.add('no-3d');
    setBackend('none');
  };

  const tick = (time: number, delta: number): void => {
    const resized = dirty;
    if (resized) {
      dirty = false;
      stage.measure();
    }
    lenis.raf(time * 1000);
    stage.update(window.scrollY, delta);
    bind(stage.s);

    const world = experience;
    if (!world) return;
    if (world.intro < 1) {
      world.intro = reduced ? 1 : smooth(clamp((time - introStart) / INTRO_SECONDS));
      // the line has left the cursor on the cover: it stops blinking (see sheets.css)
      if (world.intro > 0) root.classList.add('line-out');
    }
    try {
      if (resized) world.resize();
      // with reduced motion the camera cuts from sheet to sheet instead of flying
      world.frame(time, delta, reduced ? stage.index : stage.s);
      frames++;
    } catch (error) {
      // a renderer that throws must not take the page down with it
      fail(error);
      try {
        world.dispose();
      } catch {
        // already beyond saving
      }
    }
  };
  const removeTick = ticker.add(tick);

  const invalidate = (): void => {
    dirty = true;
  };
  const onMotionChange = (): void => {
    reduced = motionQuery.matches;
    experience?.setReducedMotion(reduced);
  };
  const goToHash = (immediate: boolean): void => {
    const index = sheetIndex(decodeURIComponent(location.hash.slice(1)));
    if (index > 0) stage.jump(index, immediate);
  };
  const onHashChange = (): void => goToHash(false);

  window.addEventListener('resize', invalidate);
  window.addEventListener('hashchange', onHashChange);
  motionQuery.addEventListener('change', onMotionChange);
  const observer = new ResizeObserver(invalidate);
  const main = document.querySelector('main');
  if (main) observer.observe(main);
  void document.fonts?.ready.then(invalidate);

  // a link straight to a sheet (…/#work) opens on that sheet
  if (location.hash.length > 1) {
    requestAnimationFrame(() => {
      stage.measure();
      goToHash(true);
    });
  }

  // from here on the stylesheets may rely on the stage (pinned chapters, plotted text)
  root.classList.add('is-staged');
  void load(params.get('gl') === 'webgl');

  if (debug) {
    Object.assign(window, {
      __stage: stage,
      __capture: (width?: number, height?: number) => experience?.capture(width, height),
      __info: () => ({ backend: experience?.backend ?? null, frames, s: stage.s, ready: host.classList.contains('is-ready') }),
    });
  }

  return {
    refresh: invalidate,
    dispose(): void {
      disposed = true;
      root.classList.remove('is-staged', 'line-out');
      removeTick();
      observer.disconnect();
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('hashchange', onHashChange);
      motionQuery.removeEventListener('change', onMotionChange);
      stage.setScroller(null);
      lenis.destroy();
      experience?.dispose();
      experience = null;
      canvas = null;
      host.classList.remove('is-ready');
      host.replaceChildren();
    },
  };
}
